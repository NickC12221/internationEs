export const dynamic = 'force-dynamic'

// src/app/api/profiles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getSessionFromRequest } from '@/lib/auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const country = searchParams.get('country')
    const countryCode = searchParams.get('countryCode')
    const citySlug = searchParams.get('citySlug')
    const availability = searchParams.get('availability')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '24'), 48)

    const session = await getSessionFromRequest(req)

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (countryCode) where.countryCode = countryCode.toUpperCase()
    else if (country) where.country = { contains: country, mode: 'insensitive' }

    if (citySlug) where.citySlug = citySlug
    if (availability) where.availability = availability
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, profiles] = await Promise.all([
      prisma.profile.count({ where }),
      prisma.profile.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 5,
          },
        },
        orderBy: [
          { listingTier: 'desc' },  // PREMIUM sorts first alphabetically since P > F
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    // If user is logged in, get their favorites
    let favoriteIds: Set<string> = new Set()
    if (session) {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.id },
        select: { profileId: true },
      })
      favoriteIds = new Set(favorites.map((f) => f.profileId))
    }

    const data = profiles.map((p) => ({
      ...p,
      isFavorited: favoriteIds.has(p.id),
    }))

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Profiles error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

// Update current user's profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const profile = await prisma.profile.update({
      where: { userId: session.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: { images: true },
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}
