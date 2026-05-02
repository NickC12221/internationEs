export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const FREE_PLAN_LIMIT = 5
const PREMIUM_PLAN_LIMIT = 20

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

    const limit = agency.plan === 'PREMIUM' ? PREMIUM_PLAN_LIMIT : FREE_PLAN_LIMIT
    if (agency._count.models >= limit) {
      return NextResponse.json({
        success: false,
        error: `Model limit reached (${limit}/${limit}). ${agency.plan === 'FREE' ? 'Upgrade to Premium for up to 20 models.' : ''}`
      }, { status: 400 })
    }

    const slugify = (t: string) => t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

    const { displayName, city, email, bio, age, availability, profileImageUrl, pricing } = await req.json()

    if (!displayName || !city) {
      return NextResponse.json({ success: false, error: 'Display name and city are required' }, { status: 400 })
    }

    const citySlug = slugify(city)
    let slug = `${slugify(displayName)}-${citySlug}`
    const existing = await prisma.profile.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now().toString(36)}`

    const modelEmail = email || `model-${Date.now()}@agency-${agency.id}.internal`
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
            age: age ? parseInt(age) : null,
            country: agency.country,
            countryCode: agency.countryCode,
            city,
            citySlug,
            email: email || null,
            availability: availability || 'AVAILABLE',
            profileImageUrl: profileImageUrl || null,
            pricing: pricing || null,
          }
        }
      },
      include: { profile: { include: { images: { take: 1, orderBy: { order: 'asc' } } } } }
    })

    // If a profile image URL is provided, also save it as a ProfileImage record
    if (profileImageUrl && user.profile) {
      await prisma.profileImage.create({
        data: {
          profileId: user.profile.id,
          url: profileImageUrl,
          key: profileImageUrl,
          order: 0,
          isMain: true,
        }
      })
    }

    await prisma.agencyModel.create({
      data: { agencyId: agency.id, profileId: user.profile!.id }
    })

    return NextResponse.json({ success: true, data: user.profile })
  } catch (err: any) {
    console.error(err)
    if (err.code === 'P2002') return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
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
          include: { images: { take: 3, orderBy: { order: 'asc' } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: models.map(m => m.profile),
      total: models.length,
      plan: agency.plan,
      limit: agency.plan === 'PREMIUM' ? PREMIUM_PLAN_LIMIT : FREE_PLAN_LIMIT,
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
