export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Login required' }, { status: 401 })

    const { message, type } = await req.json()
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } })
    if (!admin) return NextResponse.json({ success: false, error: 'Unavailable' }, { status: 503 })

    const existing = await prisma.conversation.findFirst({
      where: {
        subject: 'report',
        AND: [{ members: { some: { userId: session.id } } }, { members: { some: { userId: admin.id } } }]
      }
    })

    let conversationId: string
    if (existing) {
      conversationId = existing.id
    } else {
      const convo = await prisma.conversation.create({
        data: { subject: 'report', members: { create: [{ userId: session.id }, { userId: admin.id }] } }
      })
      conversationId = convo.id
    }

    await prisma.message.create({ data: { conversationId, senderId: session.id, content: `[REPORT] ${message}` } })
    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })

    const sender = await prisma.user.findUnique({ where: { id: session.id }, select: { name: true, email: true, profile: { select: { displayName: true } } } })
    const senderName = sender?.profile?.displayName || sender?.name || sender?.email || 'User'

    await prisma.notification.create({
      data: { userId: admin.id, type: 'report', title: '🚨 New Report', body: `${senderName} submitted a report`, link: `/admin/messages#${conversationId}`, isRead: false }
    })

    return NextResponse.json({ success: true, data: { conversationId } })
  } catch (err) { return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 }) }
}
