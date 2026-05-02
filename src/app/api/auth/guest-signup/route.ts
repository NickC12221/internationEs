export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const { signToken } = await import('@/lib/auth/jwt')
    const bcrypt = await import('bcryptjs')

    const { name, email, password } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'GUEST' }
    })

    const token = await signToken({ sub: user.id, email: user.email, role: user.role })
    const response = NextResponse.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } })
    response.cookies.set('femme_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
    return response
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
