export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        profile: { select: { displayName: true, slug: true, countryCode: true, citySlug: true } },
        guest: { select: { name: true, email: true } },
        review: { select: { rating: true } }
      }
    })
    return NextResponse.json({ success: true, data: bookings })
  } catch (err) { return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 }) }
}
