export const dynamic = 'force-dynamic'

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

    // If approved, update profile verified status
    if (action === 'APPROVED') {
      await prisma.profile.update({
        where: { userId: verification.userId },
        data: { isVerified: true },
      })
    }

    return NextResponse.json({ success: true, data: verification })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to review verification' }, { status: 500 })
  }
}
