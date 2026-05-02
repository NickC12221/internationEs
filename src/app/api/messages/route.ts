export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// Get all conversations for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const conversations = await prisma.conversation.findMany({
      where: { members: { some: { userId: session.id } } },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, profile: { select: { displayName: true, profileImageUrl: true, slug: true } }, agency: { select: { name: true, slug: true, logoUrl: true } } } }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: { where: { isRead: false, senderId: { not: session.id } } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: conversations })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Start or get a conversation with a profile/agency owner
export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { recipientUserId, profileId, initialMessage } = await req.json()

    if (!recipientUserId || !initialMessage?.trim()) {
      return NextResponse.json({ success: false, error: 'Recipient and message required' }, { status: 400 })
    }

    if (recipientUserId === session.id) {
      return NextResponse.json({ success: false, error: 'Cannot message yourself' }, { status: 400 })
    }

    // Check if conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { userId: session.id } } },
          { members: { some: { userId: recipientUserId } } },
          { profileId: profileId || null },
        ]
      }
    })

    let conversationId: string

    if (existing) {
      conversationId = existing.id
    } else {
      const conversation = await prisma.conversation.create({
        data: {
          profileId: profileId || null,
          members: {
            create: [
              { userId: session.id },
              { userId: recipientUserId },
            ]
          }
        }
      })
      conversationId = conversation.id
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.id,
        content: initialMessage.trim(),
      }
    })

    // Update conversation timestamp
    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })

    // Create notification for recipient
    const sender = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, profile: { select: { displayName: true } }, agency: { select: { name: true } } }
    })
    const senderName = sender?.profile?.displayName || sender?.agency?.name || sender?.name || 'Someone'

    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: 'new_message',
        title: 'New message',
        body: `${senderName} sent you a message`,
        link: `/dashboard/inbox/${conversationId}`,
      }
    })

    return NextResponse.json({ success: true, data: { conversationId, message } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
