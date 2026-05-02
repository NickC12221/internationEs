export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { status, adminNotes } = await req.json()

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { profile: { select: { userId: true, displayName: true } } }
    })
    if (!booking) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Only profile owner or admin can update status
    if (booking.profile.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status, adminNotes: adminNotes || null, respondedAt: new Date() }
    })

    // Notify the guest
    const notifType = status === 'ACCEPTED' ? 'booking_accepted' : status === 'REJECTED' ? 'booking_rejected' : 'booking_update'
    const notifBody = status === 'ACCEPTED'
      ? `Your booking for ${booking.profile.displayName} has been accepted!`
      : status === 'REJECTED'
      ? `Your booking for ${booking.profile.displayName} was not accepted.`
      : `Your booking status has been updated to ${status}`

    await prisma.notification.create({
      data: {
        userId: booking.guestId,
        type: notifType,
        title: `Booking ${status.toLowerCase()}`,
        body: notifBody,
        link: `/dashboard/bookings`,
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
