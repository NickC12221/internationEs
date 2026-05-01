export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const profile = await prisma.profile.findUnique({ where: { userId: session.id }, select: { id: true } })
    if (!profile) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    const image = await prisma.profileImage.findUnique({ where: { id: context.params.id } })
    if (!image || image.profileId !== profile.id) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    await prisma.profileImage.updateMany({ where: { profileId: profile.id }, data: { isMain: false } })
    await prisma.profileImage.update({ where: { id: context.params.id }, data: { isMain: true } })
    await prisma.profile.update({ where: { id: profile.id }, data: { profileImageUrl: image.url } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
