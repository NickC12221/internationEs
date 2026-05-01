export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')

    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { key, url, order, isMain } = await req.json()

    const profile = await prisma.profile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    const count = await prisma.profileImage.count({ where: { profileId: profile.id } })
    if (count >= 20) {
      return NextResponse.json({ success: false, error: 'Maximum 20 images allowed' }, { status: 400 })
    }

    if (isMain) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { profileImageUrl: url },
      })
    }

    const image = await prisma.profileImage.create({
      data: {
        profileId: profile.id,
        url,
        key,
        order: order ?? count,
        isMain: isMain ?? count === 0,
      },
    })

    return NextResponse.json({ success: true, data: image })
  } catch (error) {
    console.error('Save image error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save image' }, { status: 500 })
  }
}
