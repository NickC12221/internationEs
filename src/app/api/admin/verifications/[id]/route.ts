export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const action = body.action || body.status
    const adminNotes = body.adminNotes

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    const verification = await prisma.verificationRequest.update({
      where: { id: params.id },
      data: { status: action, adminNotes: adminNotes || null, reviewedAt: new Date(), reviewedBy: session.id }
    })

    if (action === 'APPROVED') {
      await prisma.profile.updateMany({
        where: { userId: verification.userId },
        data: { isVerified: true, isActive: true }
      })
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'VERIFICATION_APPROVED',
          title: '✓ Identity Verified!',
          body: 'Your verification has been approved. Your profile now displays the verified badge.',
        }
      }).catch(() => {})
    }

    if (action === 'REJECTED') {
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'VERIFICATION_REJECTED',
          title: 'Verification Not Approved',
          body: adminNotes ? `Your verification was not approved: ${adminNotes}` : 'Your documents could not be verified. Please resubmit with clearer photos.',
        }
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
