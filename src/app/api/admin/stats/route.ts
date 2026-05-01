export const dynamic = 'force-dynamic' // force-rebuild

// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { getSessionFromRequest } = await import('@/lib/auth/jwt')
  const { prisma } = await import('@/lib/db/prisma')
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      totalProfiles,
      premiumProfiles,
      verifiedProfiles,
      pendingVerifications,
      newThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count({ where: { isActive: true } }),
      prisma.profile.count({ where: { listingTier: 'PREMIUM', isActive: true } }),
      prisma.profile.count({ where: { isVerified: true } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProfiles,
        premiumProfiles,
        verifiedProfiles,
        pendingVerifications,
        newThisMonth,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
