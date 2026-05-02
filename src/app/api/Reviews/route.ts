export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const { searchParams } = new URL(req.url)
    const profileId = searchParams.get('profileId')
    if (!profileId) return NextResponse.json({ success: false, error: 'profileId required' }, { status: 400 })

    const reviews = await prisma.review.findMany({
      where: { profileId, isVisible: true },
      include: {
        user: { select: { name: true, profile: { select: { displayName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const avg = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({ success: true, data: reviews, averageRating: Math.round(avg * 10) / 10, total: reviews.length })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Login required' }, { status: 401 })

    const { bookingId, rating, content } = await req.json()

    if (!bookingId || !rating || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be 1-5' }, { status: 400 })
    }

    // Verify booking belongs to this user and is accepted/completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { guestId: true, profileId: true, status: true, review: true }
    })
    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    if (booking.guestId !== session.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    if (!['ACCEPTED', 'COMPLETED'].includes(booking.status)) {
      return NextResponse.json({ success: false, error: 'Can only review accepted bookings' }, { status: 400 })
    }
    if (booking.review) return NextResponse.json({ success: false, error: 'Already reviewed' }, { status: 409 })

    const review = await prisma.review.create({
      data: { profileId: booking.profileId, userId: session.id, bookingId, rating, content: content.trim() }
    })

    return NextResponse.json({ success: true, data: review })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
