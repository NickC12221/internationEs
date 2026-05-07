export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const session = await getSessionFromRequest(req)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '32')
    const countryCode = searchParams.get('countryCode')?.toUpperCase()
    const citySlug = searchParams.get('citySlug')
    const availability = searchParams.get('availability')
    const search = searchParams.get('search')
    const ethnicity = searchParams.get('ethnicity')
    const nationality = searchParams.get('nationality')
    const build = searchParams.get('build')
    const incall = searchParams.get('incall')
    const outcall = searchParams.get('outcall')
    const travel = searchParams.get('travel')
    const height = searchParams.get('height')
    const hairColor = searchParams.get('hairColor')
    const eyeColor = searchParams.get('eyeColor')

    const where: any = { isActive: true, approvalStatus: 'APPROVED' }
    if (countryCode) where.countryCode = countryCode
    if (citySlug) where.citySlug = citySlug
    if (availability) where.availability = availability
    if (ethnicity) where.ethnicity = { equals: ethnicity, mode: 'insensitive' }
    if (nationality) where.nationality = { contains: nationality, mode: 'insensitive' }
    if (build) where.build = { equals: build, mode: 'insensitive' }
    if (incall === 'true') where.incall = true
    if (outcall === 'true') where.outcall = true
    if (travel === 'true') where.travel = true
    if (height) where.height = { equals: height, mode: 'insensitive' }
    if (hairColor) where.hairColor = { equals: hairColor, mode: 'insensitive' }
    if (eyeColor) where.eyeColor = { equals: eyeColor, mode: 'insensitive' }
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { nationality: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: [{ listingTier: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, displayName: true, slug: true, city: true, country: true,
          countryCode: true, citySlug: true, age: true, availability: true,
          listingTier: true, profileImageUrl: true, isVerified: true,
          nationality: true, ethnicity: true, build: true, services: true,
          incall: true, outcall: true, languages: true,
        }
      }),
      prisma.profile.count({ where })
    ])

    // Add isFavorited flag if user is logged in
    let favoriteIds = new Set<string>()
    if (session) {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.id },
        select: { profileId: true }
      })
      favoriteIds = new Set(favorites.map(f => f.profileId))
    }

    const profilesWithFav = profiles.map(p => ({ ...p, isFavorited: favoriteIds.has(p.id) }))
    return NextResponse.json({ success: true, data: profilesWithFav, total, totalPages: Math.ceil(total / pageSize), page })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const data = await req.json()
    const profile = await prisma.profile.update({ where: { userId: session.id }, data })
    return NextResponse.json({ success: true, data: profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
