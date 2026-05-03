export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const days = body.days || body.durationDays

    if (!days || ![30, 90, 180].includes(parseInt(days))) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.id },
      select: { id: true, premiumExpiresAt: true }
    })

    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })

    // Extend from current expiry if still active, otherwise from now
    const base = profile.premiumExpiresAt && new Date(profile.premiumExpiresAt) > new Date()
      ? new Date(profile.premiumExpiresAt)
      : new Date()
    const newExpiry = new Date(base.getTime() + parseInt(days) * 86400000)

    await prisma.profile.update({
      where: { id: profile.id },
      data: { listingTier: 'PREMIUM', premiumExpiresAt: newExpiry }
    })

    return NextResponse.json({ success: true, data: { premiumExpiresAt: newExpiry } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
