export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { action, premiumDays } = await req.json()
    const userId = params.id

    if (action === 'deactivate_profile') {
      await prisma.profile.updateMany({ where: { userId }, data: { isActive: false } })
    } else if (action === 'activate_profile') {
      await prisma.profile.updateMany({ where: { userId }, data: { isActive: true } })
    } else if (action === 'grant_premium_model') {
      const expires = new Date(Date.now() + (premiumDays || 30) * 86400000)
      await prisma.profile.updateMany({ where: { userId }, data: { listingTier: 'PREMIUM', premiumExpiresAt: expires } })
    } else if (action === 'revoke_premium_model') {
      await prisma.profile.updateMany({ where: { userId }, data: { listingTier: 'FREE', premiumExpiresAt: null } })
    } else if (action === 'grant_premium_agency') {
      const expires = new Date(Date.now() + (premiumDays || 30) * 86400000)
      await prisma.agency.updateMany({ where: { userId }, data: { isPremium: true, subscriptionStatus: 'ACTIVE', subscriptionExpiresAt: expires, premiumExpiresAt: expires } })
    } else if (action === 'revoke_premium_agency') {
      await prisma.agency.updateMany({ where: { userId }, data: { isPremium: false, subscriptionStatus: 'EXPIRED' } })
    } else if (action === 'deactivate_agency') {
      await prisma.agency.updateMany({ where: { userId }, data: { isActive: false } })
    } else if (action === 'activate_agency') {
      await prisma.agency.updateMany({ where: { userId }, data: { isActive: true } })
    } else {
      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
