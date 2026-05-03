export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const { verifyToken } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const cookieStore = cookies()
    const token = cookieStore.get('femme_session')?.value
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, email: true, role: true, name: true, createdAt: true,
        profile: { include: { images: { orderBy: { order: 'asc' } } } },
        agency: { select: { name: true, slug: true } },
        verificationRequest: { select: { status: true, createdAt: true } },
      },
    })
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { verifyToken } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const bcrypt = await import('bcryptjs')
    const cookieStore = cookies()
    const token = cookieStore.get('femme_session')?.value
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })

    const { name, email, phone, currentPassword, newPassword } = await req.json()
    const updates: any = {}

    if (name) updates.name = name
    if (email) {
      const existing = await prisma.user.findFirst({ where: { email, id: { not: payload.sub } } })
      if (existing) return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 })
      updates.email = email
    }

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ success: false, error: 'Current password required' }, { status: 400 })
      const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { password: true } })
      const valid = await bcrypt.compare(currentPassword, user!.password)
      if (!valid) return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
      updates.password = await bcrypt.hash(newPassword, 12)
    }

    const updated = await prisma.user.update({ where: { id: payload.sub }, data: updates })
    return NextResponse.json({ success: true, data: { id: updated.id, email: updated.email, name: updated.name } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
