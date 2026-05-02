export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const agency = session.role === 'AGENCY'
      ? await prisma.agency.findUnique({ where: { userId: session.id }, select: { id: true } })
      : null

    const notifications = await prisma.notification.findMany({
      where: agency ? { agencyId: agency.id } : { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ success: true, data: notifications })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const agency = session.role === 'AGENCY'
      ? await prisma.agency.findUnique({ where: { userId: session.id }, select: { id: true } })
      : null

    await prisma.notification.updateMany({
      where: agency ? { agencyId: agency.id } : { userId: session.id },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
