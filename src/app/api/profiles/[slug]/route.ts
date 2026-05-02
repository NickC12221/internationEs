export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const profile = await prisma.profile.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        agencyModel: { include: { agency: { select: { name: true, slug: true } } } }
      }
    })
    if (!profile) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: profile })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
