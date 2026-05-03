export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        // Filter out internal agency model accounts
        NOT: { email: { contains: '@agency-' } }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: { select: { displayName: true, city: true, country: true, listingTier: true, isVerified: true } },
        agency: { select: { name: true, isPremium: true } },
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: users, total: users.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
