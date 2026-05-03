export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        profile: { select: { displayName: true, slug: true } },
        user: { select: { name: true, email: true } },
        booking: { select: { date: true } }
      }
    })
    return NextResponse.json({ success: true, data: reviews })
  } catch (err) { return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { id, isVisible } = await req.json()
    const review = await prisma.review.update({ where: { id }, data: { isVisible } })
    return NextResponse.json({ success: true, data: review })
  } catch (err) { return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 }) }
}
