export const dynamic = 'force-dynamic' // force-rebuild

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const { verifyToken } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const cookieStore = cookies()
    const token = cookieStore.get('femme_session')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: { include: { images: { orderBy: { order: 'asc' } } } },
        verificationRequest: { select: { status: true, createdAt: true } },
      },
    })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
