export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// Get images for a specific model
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Verify model belongs to agency
    const agencyModel = await prisma.agencyModel.findFirst({
      where: { agencyId: agency.id, profileId: params.id }
    })
    if (!agencyModel) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    const images = await prisma.profileImage.findMany({
      where: { profileId: params.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, data: images })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Add image to model
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const agencyModel = await prisma.agencyModel.findFirst({
      where: { agencyId: agency.id, profileId: params.id }
    })
    if (!agencyModel) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    const count = await prisma.profileImage.count({ where: { profileId: params.id } })
    if (count >= 15) return NextResponse.json({ success: false, error: 'Maximum 15 images allowed' }, { status: 400 })

    const { key, url, isMain } = await req.json()

    if (isMain || count === 0) {
      await prisma.profile.update({ where: { id: params.id }, data: { profileImageUrl: url } })
      await prisma.profileImage.updateMany({ where: { profileId: params.id }, data: { isMain: false } })
    }

    const image = await prisma.profileImage.create({
      data: { profileId: params.id, url, key, order: count, isMain: isMain || count === 0 }
    })

    return NextResponse.json({ success: true, data: image })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Delete image from model
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const agencyModel = await prisma.agencyModel.findFirst({
      where: { agencyId: agency.id, profileId: params.id }
    })
    if (!agencyModel) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    const { imageId } = await req.json()
    const image = await prisma.profileImage.findUnique({ where: { id: imageId } })
    if (!image || image.profileId !== params.id) {
      return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 })
    }

    await prisma.profileImage.delete({ where: { id: imageId } })

    if (image.isMain) {
      const next = await prisma.profileImage.findFirst({ where: { profileId: params.id }, orderBy: { order: 'asc' } })
      await prisma.profile.update({ where: { id: params.id }, data: { profileImageUrl: next?.url || null } })
      if (next) await prisma.profileImage.update({ where: { id: next.id }, data: { isMain: true } })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
