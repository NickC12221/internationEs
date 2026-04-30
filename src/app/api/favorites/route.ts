// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.id },
      include: {
        profile: {
          include: { images: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: favorites.map((f) => ({ ...f.profile, isFavorited: true })),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { profileId } = await req.json()

    const favorite = await prisma.favorite.create({
      data: { userId: session.id, profileId },
    })

    return NextResponse.json({ success: true, data: favorite })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Already favorited' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Failed to favorite' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { profileId } = await req.json()

    await prisma.favorite.delete({
      where: { userId_profileId: { userId: session.id, profileId } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to remove favorite' }, { status: 500 })
  }
}
