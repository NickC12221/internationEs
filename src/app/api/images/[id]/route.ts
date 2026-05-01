export const dynamic = 'force-dynamic' // force-rebuild

import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const { deleteFile } = await import('@/lib/storage/s3')

    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    const image = await prisma.profileImage.findUnique({
      where: { id: params.id },
    })

    if (!image || image.profileId !== profile.id) {
      return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 })
    }

    await deleteFile(image.key, false)
    await prisma.profileImage.delete({ where: { id: params.id } })

    if (image.isMain) {
      const nextImage = await prisma.profileImage.findFirst({
        where: { profileId: profile.id },
        orderBy: { order: 'asc' },
      })
      await prisma.profile.update({
        where: { id: profile.id },
        data: { profileImageUrl: nextImage?.url || null },
      })
      if (nextImage) {
        await prisma.profileImage.update({
          where: { id: nextImage.id },
          data: { isMain: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
