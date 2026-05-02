export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

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
            user: {
              select: {
                id: true, name: true, email: true,
                profile: { select: { displayName: true, profileImageUrl: true, slug: true } },
                agency: { select: { name: true, slug: true, logoUrl: true } }
              }
            }
          }
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: {
          select: { messages: { where: { isRead: false, senderId: { not: session.id } } } }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // For each conversation that has a profileId, fetch the linked model name
    const enriched = await Promise.all(conversations.map(async (convo) => {
      if (convo.profileId) {
        const profile = await prisma.profile.findUnique({
          where: { id: convo.profileId },
          select: { displayName: true, profileImageUrl: true, slug: true, countryCode: true, citySlug: true }
        })
        return { ...convo, linkedProfile: profile }
      }
      return { ...convo, linkedProfile: null }
    }))

    return NextResponse.json({ success: true, data: enriched })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    let { recipientUserId, profileId, initialMessage } = await req.json()

    if (!recipientUserId || !initialMessage?.trim()) {
      return NextResponse.json({ success: false, error: 'Recipient and message required' }, { status: 400 })
    }
    if (recipientUserId === session.id) {
      return NextResponse.json({ success: false, error: 'Cannot message yourself' }, { status: 400 })
    }

    // If messaging an agency model, route to agency but keep profileId for context
    let finalRecipientId = recipientUserId
    if (profileId) {
      const agencyModel = await prisma.agencyModel.findFirst({
        where: { profileId },
        include: { agency: { select: { userId: true } } }
      })
      if (agencyModel?.agency?.userId) {
        finalRecipientId = agencyModel.agency.userId
      }
    }
    recipientUserId = finalRecipientId

    // Check if conversation already exists (same two users + same profile context)
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
            create: [{ userId: session.id }, { userId: recipientUserId }]
          }
        }
      })
      conversationId = conversation.id
    }

    const message = await prisma.message.create({
      data: { conversationId, senderId: session.id, content: initialMessage.trim() }
    })

    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })

    // Notification
    const sender = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, profile: { select: { displayName: true } }, agency: { select: { name: true } } }
    })
    const senderName = sender?.profile?.displayName || sender?.agency?.name || sender?.name || 'Someone'

    // Get model name for context if applicable
    let modelContext = ''
    if (profileId) {
      const profile = await prisma.profile.findUnique({ where: { id: profileId }, select: { displayName: true } })
      if (profile) modelContext = ` regarding ${profile.displayName}`
    }

    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: 'new_message',
        title: 'New message',
        body: `${senderName} sent you a message${modelContext}`,
        link: `/dashboard/inbox#${conversationId}`,
      }
    })

    return NextResponse.json({ success: true, data: { conversationId, message } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
