export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')

    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const slugify = (t: string) => t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })

    const agencyModel = await prisma.agencyModel.findFirst({
      where: { agencyId: agency.id, profileId: params.id }
    })
    if (!agencyModel) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    const body = await req.json()
    const updates: any = {}

    if (body.displayName) updates.displayName = body.displayName
    if (body.bio !== undefined) updates.bio = body.bio
    if (body.age !== undefined) updates.age = body.age ? parseInt(body.age) : null
    if (body.availability) updates.availability = body.availability
    if (body.email !== undefined) updates.email = body.email || null
    if (body.phone !== undefined) updates.phone = body.phone || null
    if (body.instagram !== undefined) updates.instagram = body.instagram || null
    if (body.profileImageUrl !== undefined) updates.profileImageUrl = body.profileImageUrl || null
    if (body.pricing !== undefined) updates.pricing = body.pricing

    if (body.city) {
      updates.city = body.city
      updates.citySlug = slugify(body.city)
      updates.country = agency.country
      updates.countryCode = agency.countryCode
    }

    if (body.listingTier) {
      updates.listingTier = body.listingTier
      if (body.listingTier === 'PREMIUM') {
        updates.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      } else {
        updates.premiumExpiresAt = null
      }
    }

    updates.updatedAt = new Date()

    const profile = await prisma.profile.update({
      where: { id: params.id },
      data: updates,
      include: { images: { take: 3, orderBy: { order: 'asc' } } }
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')

    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })

    const agencyModel = await prisma.agencyModel.findFirst({
      where: { agencyId: agency.id, profileId: params.id }
    })
    if (!agencyModel) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    await prisma.agencyModel.delete({ where: { id: agencyModel.id } })
    await prisma.profile.update({ where: { id: params.id }, data: { isActive: false } })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
