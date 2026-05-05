export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const { getPresignedUploadUrl } = await import('@/lib/storage/s3')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { userId: session.id }, select: { listingTier: true } })
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    if (profile.listingTier !== 'PREMIUM') return NextResponse.json({ success: false, error: 'Video upload is a Premium feature' }, { status: 403 })

    const { mimeType } = await req.json()
    const allowed = ['video/mp4', 'video/quicktime', 'video/webm']
    if (!allowed.includes(mimeType)) return NextResponse.json({ success: false, error: 'Invalid video format. Use MP4, MOV or WebM.' }, { status: 400 })

    const { uploadUrl, key, publicUrl } = await getPresignedUploadUrl('gallery', mimeType, false)
    return NextResponse.json({ success: true, data: { uploadUrl, key, publicUrl } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    await prisma.profile.update({ where: { userId: session.id }, data: { videoUrl: null, videoKey: null } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
