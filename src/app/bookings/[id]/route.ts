export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })

    const booking = await prisma.booking.findUnique({ where: { id: params.id } })
    if (!booking || booking.agencyId !== agency.id) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    const { status } = await req.json()
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status, updatedAt: new Date() }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
