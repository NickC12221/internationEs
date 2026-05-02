export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const { searchParams } = new URL(req.url)
    const profileId = searchParams.get('profileId')
    const userId = searchParams.get('userId') // for model's own reviews page

    if (!profileId && !userId) {
      return NextResponse.json({ success: false, error: 'profileId or userId required' }, { status: 400 })
    }

    const where: any = { isVisible: true }
    if (profileId) where.profileId = profileId
    if (userId) {
      // Get reviews for the model's profile
      const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } })
      if (!profile) return NextResponse.json({ success: true, data: [], averageRating: 0, total: 0 })
      where.profileId = profile.id
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, profile: { select: { displayName: true } } } },
        booking: { select: { date: true, duration: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const avg = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      success: true,
      data: reviews,
      averageRating: Math.round(avg * 10) / 10,
      total: reviews.length
    })
  } catch (err) {
    console.error(err)
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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
        profile: { select: { displayName: true, userId: true } }
      }
    })

    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    if (booking.guestId !== session.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    if (!['ACCEPTED', 'COMPLETED'].includes(booking.status)) {
      return NextResponse.json({ success: false, error: 'Can only review accepted bookings' }, { status: 400 })
    }
    if (booking.review) return NextResponse.json({ success: false, error: 'Already reviewed' }, { status: 409 })

    const review = await prisma.review.create({
      data: {
        profileId: booking.profileId,
        userId: session.id,
        bookingId,
        rating,
        content: content.trim()
      }
    })

    // Notify the model
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
    await prisma.notification.create({
      data: {
        userId: booking.profile.userId,
        type: 'new_review',
        title: 'New review received',
        body: `${stars} — Someone left you a ${rating}-star review`,
        link: `/dashboard/reviews`,
      }
    })

    return NextResponse.json({ success: true, data: review })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
