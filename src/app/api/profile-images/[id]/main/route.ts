// src/app/api/profile-images/[id]/main/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(
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

    // Unset all main flags for this profile
    await prisma.profileImage.updateMany({
      where: { profileId: profile.id },
      data: { isMain: false },
    })

    // Set new main
    await prisma.profileImage.update({
      where: { id: params.id },
      data: { isMain: true },
    })

    // Update profile's main image URL
    await prisma.profile.update({
      where: { id: profile.id },
      data: { profileImageUrl: image.url },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Set main image error:', error)
    return NextResponse.json({ success: false, error: 'Failed to set main image' }, { status: 500 })
  }
}
