export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// Get current agency profile
export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const agency = await prisma.agency.findUnique({
      where: { userId: session.id },
      include: {
        models: {
          include: {
            profile: {
              include: { images: { take: 1, orderBy: { order: 'asc' } } }
            }
          }
        }
      }
    })
    return NextResponse.json({ success: true, data: agency })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Update agency profile
export async function PATCH(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const allowed = ['bio', 'website', 'instagram', 'phone', 'email', 'logoUrl']
    const updates: any = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }
    const agency = await prisma.agency.update({
      where: { userId: session.id },
      data: { ...updates, updatedAt: new Date() },
    })
    return NextResponse.json({ success: true, data: agency })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
