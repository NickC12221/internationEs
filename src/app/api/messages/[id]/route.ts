export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// Get messages in a conversation
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Verify user is a member
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: params.id, userId: session.id } }
    })
    if (!member) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const [messages, conversation] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: params.id },
        include: {
          sender: {
            select: {
              id: true, name: true,
              profile: { select: { displayName: true, profileImageUrl: true } },
              agency: { select: { name: true, logoUrl: true } }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.conversation.findUnique({
        where: { id: params.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true, name: true, role: true,
                  profile: { select: { displayName: true, profileImageUrl: true, slug: true, countryCode: true, citySlug: true } },
                  agency: { select: { name: true, logoUrl: true, slug: true } }
                }
              }
            }
          }
        }
      })
    ])

    // Mark messages as read
    await prisma.message.updateMany({
      where: { conversationId: params.id, senderId: { not: session.id }, isRead: false },
      data: { isRead: true }
    })

    // Update last read
    await prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId: params.id, userId: session.id } },
      data: { lastReadAt: new Date() }
    })

    return NextResponse.json({ success: true, data: { messages, conversation } })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Send a message in a conversation
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: params.id, userId: session.id } }
    })
    if (!member) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ success: false, error: 'Message content required' }, { status: 400 })

    const message = await prisma.message.create({
      data: { conversationId: params.id, senderId: session.id, content: content.trim() },
      include: {
        sender: {
          select: {
            id: true, name: true,
            profile: { select: { displayName: true, profileImageUrl: true } },
            agency: { select: { name: true, logoUrl: true } }
          }
        }
      }
    })

    await prisma.conversation.update({ where: { id: params.id }, data: { updatedAt: new Date() } })

    // Notify other members
    const otherMembers = await prisma.conversationMember.findMany({
      where: { conversationId: params.id, userId: { not: session.id } }
    })

    const sender = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, profile: { select: { displayName: true } }, agency: { select: { name: true } } }
    })
    const senderName = sender?.profile?.displayName || sender?.agency?.name || sender?.name || 'Someone'

    await prisma.notification.createMany({
      data: otherMembers.map(m => ({
        userId: m.userId,
        type: 'new_message',
        title: 'New message',
        body: `${senderName}: ${content.trim().substring(0, 60)}${content.length > 60 ? '...' : ''}`,
        link: `/dashboard/inbox/${params.id}`,
      }))
    })

    return NextResponse.json({ success: true, data: message })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
