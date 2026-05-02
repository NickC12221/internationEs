export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const { searchParams } = new URL(req.url)
    const countryCode = searchParams.get('countryCode')
    const citySlug = searchParams.get('citySlug')
    const premiumOnly = searchParams.get('premiumOnly') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: any = {
      isActive: true,
      subscriptionStatus: 'ACTIVE',
    }
    if (countryCode) where.countryCode = countryCode.toUpperCase()
    if (citySlug) where.citySlug = citySlug
    if (premiumOnly) where.isPremium = true

    const [total, agencies] = await Promise.all([
      prisma.agency.count({ where }),
      prisma.agency.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          country: true,
          countryCode: true,
          city: true,
          citySlug: true,
          logoUrl: true,
          isPremium: true,
          website: true,
          instagram: true,
          email: true,
          phone: true,
          userId: true,
          createdAt: true,
          _count: { select: { models: true } },
        },
        orderBy: [{ isPremium: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: agencies,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to fetch agencies' }, { status: 500 })
  }
}
