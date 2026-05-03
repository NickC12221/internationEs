export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const bcrypt = await import('bcryptjs')
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (!user) return NextResponse.json({ success: false, error: 'Invalid reset request' }, { status: 400 })

    // Find the reset notification
    const notification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'password_reset',
        isRead: false,
        link: { contains: `code=${code}` },
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!notification) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset code' }, { status: 400 })
    }

    // Check expiry from link
    const url = new URL(`https://x.com${notification.link}`)
    const expires = parseInt(url.searchParams.get('expires') || '0')
    if (Date.now() > expires) {
      return NextResponse.json({ success: false, error: 'Reset code has expired. Please request a new one.' }, { status: 400 })
    }

    // Update password and mark notification as read
    const hashed = await bcrypt.hash(newPassword, 12)
    await Promise.all([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } })
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
