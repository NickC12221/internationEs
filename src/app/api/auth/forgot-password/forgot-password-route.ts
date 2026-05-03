export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const { email } = await req.json()
    if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } })

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true })

    // Generate a reset token (6-digit code stored in a simple way)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store code in user's password field temporarily with a prefix
    // In production you'd use a dedicated PasswordResetToken table
    // For now we store it as a JSON string in a notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'password_reset',
        title: 'Password Reset Code',
        body: `Your reset code: ${code}`,
        link: `/reset-password?email=${encodeURIComponent(email)}&code=${code}&expires=${expires.getTime()}`,
        isRead: false,
      }
    })

    // In production: send email via SendGrid/Resend/etc
    // For now: return the code in the response (development mode)
    console.log(`Password reset code for ${email}: ${code}`)

    return NextResponse.json({
      success: true,
      // Remove this in production - only for development:
      debug_code: process.env.NODE_ENV !== 'production' ? code : undefined
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
