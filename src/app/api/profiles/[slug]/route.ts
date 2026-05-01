export const dynamic = 'force-dynamic'

// src/app/api/profiles/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getSessionFromRequest(req)

    const profile = await prisma.profile.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    let isFavorited = false
    if (session) {
      const favorite = await prisma.favorite.findUnique({
        where: { userId_profileId: { userId: session.id, profileId: profile.id } },
      })
      isFavorited = !!favorite
    }

    return NextResponse.json({ success: true, data: { ...profile, isFavorited } })
  } catch (error) {
    console.error('Profile slug error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 })
  }
}
