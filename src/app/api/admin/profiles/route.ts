export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { getSessionFromRequest } = await import('@/lib/auth/jwt')
  const { prisma } = await import('@/lib/db/prisma')
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search')
    const where = search ? {
      OR: [
        { displayName: { contains: search, mode: 'insensitive' as const } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
      ],
    } : {}
    const [total, profiles] = await Promise.all([
      prisma.profile.count({ where }),
      prisma.profile.findMany({
        where,
        include: { user: { select: { email: true } }, images: { take: 1, orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    return NextResponse.json({ success: true, data: profiles, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { getSessionFromRequest } = await import('@/lib/auth/jwt')
  const { prisma } = await import('@/lib/db/prisma')
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const { profileId, updates } = await req.json()
    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: { ...updates, updatedAt: new Date() },
    })
    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}
