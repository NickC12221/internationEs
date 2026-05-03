export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Login required' }, { status: 401 })
    const { message } = await req.json()
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } })
    if (!admin) return NextResponse.json({ success: false, error: 'Support unavailable' }, { status: 503 })
    if (session.id === admin.id) return NextResponse.json({ success: false, error: 'You are the admin' }, { status: 400 })

    const existing = await prisma.conversation.findFirst({
      where: { subject: 'support', AND: [{ members: { some: { userId: session.id } } }, { members: { some: { userId: admin.id } } }] }
    })

    let conversationId: string
    if (existing) {
      conversationId = existing.id
    } else {
      const convo = await prisma.conversation.create({
        data: { subject: 'support', members: { create: [{ userId: session.id }, { userId: admin.id }] } }
      })
      conversationId = convo.id
    }

    await prisma.message.create({ data: { conversationId, senderId: session.id, content: message || 'Hello, I need support.' } })
    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })

    const sender = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true, profile: { select: { displayName: true } }, agency: { select: { name: true } } }
    })
    const senderName = sender?.profile?.displayName || sender?.agency?.name || sender?.name || sender?.email || 'User'

    await prisma.notification.create({
      data: { userId: admin.id, type: 'new_message', title: 'Support request', body: `${senderName} needs support`, link: `/dashboard/inbox#${conversationId}`, isRead: false }
    })

    return NextResponse.json({ success: true, data: { conversationId } })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
