export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')

    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          include: { images: { orderBy: { order: 'asc' } } },
        },
        verificationRequest: {
          select: { status: true, createdAt: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 })
  }
}
