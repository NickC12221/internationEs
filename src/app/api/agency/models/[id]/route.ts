export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')

    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const slugify = (t: string) => t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })

    const agencyModel = await prisma.agencyModel.findFirst({ where: { agencyId: agency.id, profileId: params.id } })
    if (!agencyModel) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    const body = await req.json()
    const updates: any = {}

    // Basic fields
    if (body.displayName) updates.displayName = body.displayName
    if (body.bio !== undefined) updates.bio = body.bio
    if (body.age !== undefined) updates.age = body.age ? parseInt(body.age) : null
    if (body.availability) updates.availability = body.availability
    if (body.phone !== undefined) updates.phone = body.phone || null
    if (body.profileImageUrl !== undefined) updates.profileImageUrl = body.profileImageUrl || null

    if (body.city) {
      updates.city = body.city
      updates.citySlug = slugify(body.city)
      updates.country = agency.country
      updates.countryCode = agency.countryCode
    }

    if (body.listingTier) {
      updates.listingTier = body.listingTier
      if (body.premiumDays) {
        const base = agencyModel.createdAt > new Date(Date.now() - 1000) ? new Date() : new Date()
        updates.premiumExpiresAt = new Date(Date.now() + body.premiumDays * 86400000)
      }
    }

    // Services & extras
    if (body.services !== undefined) updates.services = body.services
    if (body.incall !== undefined) updates.incall = body.incall
    if (body.outcall !== undefined) updates.outcall = body.outcall
    if (body.travel !== undefined) updates.travel = body.travel
    if (body.height !== undefined) updates.height = body.height || null
    if (body.build !== undefined) updates.build = body.build || null
    if (body.hairColor !== undefined) updates.hairColor = body.hairColor || null
    if (body.eyeColor !== undefined) updates.eyeColor = body.eyeColor || null
    if (body.ethnicity !== undefined) updates.ethnicity = body.ethnicity || null
    if (body.nationality !== undefined) updates.nationality = body.nationality || null
    if (body.languages !== undefined) updates.languages = body.languages
    if (body.smoker !== undefined) updates.smoker = body.smoker

    // Rates
    if (body.rate1hr !== undefined) updates.rate1hr = body.rate1hr || null
    if (body.rate2hr !== undefined) updates.rate2hr = body.rate2hr || null
    if (body.rate3hr !== undefined) updates.rate3hr = body.rate3hr || null
    if (body.rate4hr !== undefined) updates.rate4hr = body.rate4hr || null
    if (body.rateHalf !== undefined) updates.rateHalf = body.rateHalf || null
    if (body.rateFull !== undefined) updates.rateFull = body.rateFull || null
    if (body.rateDinner !== undefined) updates.rateDinner = body.rateDinner || null
    if (body.rateOvernight !== undefined) updates.rateOvernight = body.rateOvernight || null

    updates.updatedAt = new Date()

    const profile = await prisma.profile.update({
      where: { id: params.id },
      data: updates,
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
    if (!session || session.role !== 'AGENCY') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })

    const agencyModel = await prisma.agencyModel.findFirst({ where: { agencyId: agency.id, profileId: params.id } })
    if (!agencyModel) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    await prisma.agencyModel.delete({ where: { id: agencyModel.id } })
    await prisma.profile.update({ where: { id: params.id }, data: { isActive: false } })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
