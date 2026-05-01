export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// Update a model
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const { slugify } = await import('@/lib/utils')

    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })

    // Verify model belongs to this agency
    const agencyModel = await prisma.agencyModel.findFirst({
      where: { agencyId: agency.id, profileId: params.id }
    })
    if (!agencyModel) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    const body = await req.json()
    const updates: any = {}

    if (body.displayName) updates.displayName = body.displayName
    if (body.bio !== undefined) updates.bio = body.bio
    if (body.age !== undefined) updates.age = body.age
    if (body.availability) updates.availability = body.availability
    if (body.email !== undefined) updates.email = body.email
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.instagram !== undefined) updates.instagram = body.instagram

    // City update — must be same country as agency
    if (body.city) {
      updates.city = body.city
      updates.citySlug = slugify(body.city)
      // country stays locked to agency country
      updates.country = agency.country
      updates.countryCode = agency.countryCode
    }

    // Agency can upgrade model to premium
    if (body.listingTier) {
      updates.listingTier = body.listingTier
      if (body.listingTier === 'PREMIUM') {
        updates.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }

    updates.updatedAt = new Date()

    const profile = await prisma.profile.update({
      where: { id: params.id },
      data: updates,
      include: { images: { take: 1, orderBy: { order: 'asc' } } }
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Remove a model from agency
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

    // Remove agency link and deactivate profile
    await prisma.agencyModel.delete({ where: { id: agencyModel.id } })
    await prisma.profile.update({ where: { id: params.id }, data: { isActive: false } })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
