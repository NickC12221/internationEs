export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      totalUsers, totalModels, totalAgencies, totalGuests,
      totalBookings, pendingBookings, acceptedBookings,
      totalReviews, avgRatingData,
      totalMessages, totalConversations,
      premiumModels, premiumAgencies,
      pendingVerifications,
      newUsersThisMonth, newUsersLastMonth,
      newBookingsThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MODEL' } }),
      prisma.user.count({ where: { role: 'AGENCY' } }),
      prisma.user.count({ where: { role: 'GUEST' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'ACCEPTED' } }),
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.message.count(),
      prisma.conversation.count(),
      prisma.profile.count({ where: { listingTier: 'PREMIUM' } }),
      prisma.agency.count({ where: { isPremium: true } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } }),
      prisma.booking.count({ where: { createdAt: { gte: thisMonth } } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: { total: totalUsers, models: totalModels, agencies: totalAgencies, guests: totalGuests, newThisMonth: newUsersThisMonth, newLastMonth: newUsersLastMonth },
        bookings: { total: totalBookings, pending: pendingBookings, accepted: acceptedBookings, thisMonth: newBookingsThisMonth },
        reviews: { total: totalReviews, avgRating: Math.round((avgRatingData._avg.rating || 0) * 10) / 10 },
        messages: { total: totalMessages, conversations: totalConversations },
        premium: { models: premiumModels, agencies: premiumAgencies },
        verifications: { pending: pendingVerifications },
      }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
