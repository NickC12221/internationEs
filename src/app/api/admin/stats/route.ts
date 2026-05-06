export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const days = parseInt(new URL(req.url).searchParams.get('days') || '30')
    const startDate = new Date(Date.now() - days * 86400000)

    const [users, premiumProfiles, premiumAgencies] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: startDate }, role: { not: 'ADMIN' } },
        select: { createdAt: true, role: true }
      }),
      prisma.profile.findMany({
        where: { updatedAt: { gte: startDate }, listingTier: 'PREMIUM', premiumExpiresAt: { not: null } },
        select: { updatedAt: true, listingTier: true }
      }),
      prisma.agency.findMany({
        where: { updatedAt: { gte: startDate }, isPremium: true },
        select: { updatedAt: true, subscriptionExpiresAt: true }
      })
    ])

    // Build daily buckets
    const buckets: Record<string, { date: string; signups: number; purchases: number; revenue: number }> = {}
    
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000)
      const key = d.toISOString().split('T')[0]
      buckets[key] = { date: key, signups: 0, purchases: 0, revenue: 0 }
    }

    // Signups per day
    for (const u of users) {
      const key = new Date(u.createdAt).toISOString().split('T')[0]
      if (buckets[key]) buckets[key].signups++
    }

    // Premium purchases (model = $29 base, agency = $49 base)
    for (const p of premiumProfiles) {
      const key = new Date(p.updatedAt).toISOString().split('T')[0]
      if (buckets[key]) { buckets[key].purchases++; buckets[key].revenue += 29 }
    }
    for (const a of premiumAgencies) {
      const key = new Date(a.updatedAt).toISOString().split('T')[0]
      if (buckets[key]) { buckets[key].purchases++; buckets[key].revenue += 49 }
    }

    return NextResponse.json({ success: true, data: Object.values(buckets) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
