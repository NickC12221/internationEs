export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const conversations = await prisma.conversation.findMany({
      where: { members: { some: { userId: session.id } } },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, profile: { select: { displayName: true } }, agency: { select: { name: true } } } }
          }
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: { where: { isRead: false, senderId: { not: session.id } } } } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: conversations })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
