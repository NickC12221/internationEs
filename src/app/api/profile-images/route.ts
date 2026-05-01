export const dynamic = 'force-dynamic' // force-rebuild

// src/app/api/profile-images/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

// Save image metadata after S3 upload
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { key, url, order, isMain } = await req.json()

    const profile = await prisma.profile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    // Check image limit (free: 5, premium not enforced here but check tier in production)
    const count = await prisma.profileImage.count({ where: { profileId: profile.id } })
    if (count >= 20) {
      return NextResponse.json({ success: false, error: 'Maximum 20 images allowed' }, { status: 400 })
    }

    // If setting as main, update profile image URL
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
