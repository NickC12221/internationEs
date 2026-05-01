export const dynamic = 'force-dynamic'

// src/app/api/profile-images/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'
import { deleteFile } from '@/lib/storage/s3'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
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

    // Delete from S3
    await deleteFile(image.key, false)

    // Delete from database
    await prisma.profileImage.delete({ where: { id: params.id } })

    // If this was the main image, update profile
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
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete image' }, { status: 500 })
  }
}
