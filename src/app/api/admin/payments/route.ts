export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const [premiumProfiles, premiumAgencies] = await Promise.all([
      prisma.profile.findMany({
        where: { listingTier: 'PREMIUM' },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { premiumExpiresAt: 'asc' }
      }),
      prisma.agency.findMany({
        where: { isPremium: true },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { premiumExpiresAt: 'asc' }
      })
    ])

    return NextResponse.json({ success: true, data: { profiles: premiumProfiles, agencies: premiumAgencies } })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
