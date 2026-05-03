export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const agency = await prisma.agency.findUnique({
      where: { userId: session.id },
      include: {
        models: {
          include: {
            profile: {
              select: {
                id: true, displayName: true, profileImageUrl: true, citySlug: true, slug: true, countryCode: true,
                _count: { select: { bookings: true } }
              }
            }
          }
        }
      }
    })

    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })
    if (!agency.isPremium) return NextResponse.json({ success: false, error: 'Premium required' }, { status: 403 })

    const profileIds = agency.models.map(m => m.profileId)

    // Get booking stats per model
    const bookingStats = await prisma.booking.groupBy({
      by: ['profileId', 'status'],
      where: { profileId: { in: profileIds } },
      _count: { id: true }
    })

    // Get total messages for agency (conversations involving agency user)
    const messageCount = await prisma.conversation.count({
      where: { members: { some: { userId: session.id } } }
    })

    // Get total bookings for agency
    const totalBookings = await prisma.booking.count({ where: { profileId: { in: profileIds } } })
    const pendingBookings = await prisma.booking.count({ where: { profileId: { in: profileIds }, status: 'PENDING' } })
    const acceptedBookings = await prisma.booking.count({ where: { profileId: { in: profileIds }, status: 'ACCEPTED' } })

    // Get review stats
    const reviews = await prisma.review.findMany({
      where: { profileId: { in: profileIds } },
      select: { rating: true, profileId: true }
    })
    const avgRating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

    // Build per-model stats
    const modelStats = agency.models.map(m => {
      const pid = m.profileId
      const mbookings = bookingStats.filter(b => b.profileId === pid)
      const total = mbookings.reduce((s, b) => s + b._count.id, 0)
      const accepted = mbookings.find(b => b.status === 'ACCEPTED')?._count.id || 0
      const pending = mbookings.find(b => b.status === 'PENDING')?._count.id || 0
      const modelReviews = reviews.filter(r => r.profileId === pid)
      const modelAvg = modelReviews.length > 0
        ? modelReviews.reduce((s, r) => s + r.rating, 0) / modelReviews.length
        : 0

      return {
        id: pid,
        displayName: m.profile.displayName,
        profileImageUrl: m.profile.profileImageUrl,
        slug: m.profile.slug,
        countryCode: m.profile.countryCode,
        citySlug: m.profile.citySlug,
        bookings: { total, accepted, pending },
        reviews: { count: modelReviews.length, avg: Math.round(modelAvg * 10) / 10 },
        listingTier: m.profile.listingTier,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        agency: { name: agency.name, isPremium: agency.isPremium },
        overview: {
          totalModels: agency.models.length,
          totalBookings,
          pendingBookings,
          acceptedBookings,
          totalMessages: messageCount,
          totalReviews: reviews.length,
          avgRating: Math.round(avgRating * 10) / 10,
        },
        models: modelStats
      }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
