export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    const { title, body, targetRole, link } = await req.json()
    if (!title || !body) return NextResponse.json({ success: false, error: 'Title and body required' }, { status: 400 })
    const where = targetRole === 'ALL' ? {} : { role: targetRole as any }
    const users = await prisma.user.findMany({ where, select: { id: true } })
    await prisma.notification.createMany({
      data: users.map(u => ({ userId: u.id, type: 'admin_broadcast', title, body, link: link || null, isRead: false }))
    })
    return NextResponse.json({ success: true, data: { sent: users.length } })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
