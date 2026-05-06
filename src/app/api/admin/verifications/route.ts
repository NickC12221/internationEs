// src/app/api/admin/verifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'
import { getPrivateSignedUrl } from '@/lib/storage/s3'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'PENDING'

  try {
    const verifications = await prisma.verificationRequest.findMany({
      where: { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: { displayName: true, slug: true, country: true, city: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: verifications })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch verifications' }, { status: 500 })
  }
}

// Review a verification request
export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { verificationId, action, adminNotes } = await req.json()

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    const verification = await prisma.verificationRequest.update({
      where: { id: verificationId },
      data: {
        status: action,
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
        reviewedBy: session.id,
      },
    })

    // If approved, set profile as verified and active (goes live)
    if (action === 'APPROVED') {
      await prisma.profile.update({
        where: { userId: verification.userId },
        data: { isVerified: true, isActive: true },
      })
      // Send notification
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'VERIFICATION_APPROVED',
          title: 'Profile Approved!',
          body: 'Your profile has been verified and is now live on the directory.',
        }
      }).catch(() => {})
    }
    if (action === 'REJECTED') {
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'VERIFICATION_REJECTED',
          title: 'Profile Review Update',
          body: adminNotes ? `Your profile was not approved: ${adminNotes}` : 'Your profile requires changes before it can go live. Please contact support.',
        }
      }).catch(() => {})
    }
    // If rejected, ensure profile stays inactive
    if (action === 'REJECTED') {
      await prisma.profile.updateMany({
        where: { userId: verification.userId },
        data: { isActive: false },
      })
    }

    return NextResponse.json({ success: true, data: verification })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to review verification' }, { status: 500 })
  }
}
