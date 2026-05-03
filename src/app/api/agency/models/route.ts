export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const MODEL_LIMIT_FREE = 5
const MODEL_LIMIT_PREMIUM = 20

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const bcrypt = await import('bcryptjs')

    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: session.id },
      include: { _count: { select: { models: true } } }
    })

    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })
    if (agency.subscriptionStatus !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Agency subscription is not active' }, { status: 403 })
    }
    const limit = agency.isPremium ? MODEL_LIMIT_PREMIUM : MODEL_LIMIT_FREE
    if (agency._count.models >= limit) {
      const msg = agency.isPremium
        ? `Model limit reached (${limit}/${limit})`
        : `Free agencies can add up to ${MODEL_LIMIT_FREE} models. Upgrade to Premium for up to ${MODEL_LIMIT_PREMIUM} models.`
      return NextResponse.json({ success: false, error: msg }, { status: 400 })
    }

    const slugify = (t: string) => t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

    const { displayName, city, bio, age, availability } = await req.json()

    if (!displayName || !city) {
      return NextResponse.json({ success: false, error: 'Display name and city are required' }, { status: 400 })
    }

    const citySlug = slugify(city)
    let slug = `${slugify(displayName)}-${citySlug}`
    const existing = await prisma.profile.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now().toString(36)}`

    const modelEmail = `model-${Date.now()}@agency-${agency.id}.internal`
    const tempPassword = await bcrypt.hash(Math.random().toString(36), 10)

    const user = await prisma.user.create({
      data: {
        email: modelEmail,
        password: tempPassword,
        role: 'MODEL',
        profile: {
          create: {
            displayName,
            slug,
            bio: bio || null,
            age: age || null,
            country: agency.country,
            countryCode: agency.countryCode,
            city,
            citySlug,
            availability: availability || 'AVAILABLE',
          }
        }
      },
      include: { profile: { include: { images: { orderBy: { order: 'asc' } } } } }
    })

    await prisma.agencyModel.create({
      data: { agencyId: agency.id, profileId: user.profile!.id }
    })

    return NextResponse.json({ success: true, data: user.profile })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to add model' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })

    const models = await prisma.agencyModel.findMany({
      where: { agencyId: agency.id },
      include: {
        profile: {
          include: { images: { orderBy: { order: 'asc' } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: models.map(m => m.profile),
      total: models.length,
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
