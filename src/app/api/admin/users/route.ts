export const dynamic = 'force-dynamic' // force-rebuild

// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('search')

  try {
    const where = search
      ? { email: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              displayName: true,
              country: true,
              city: true,
              listingTier: true,
              isVerified: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}
