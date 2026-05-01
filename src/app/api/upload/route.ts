export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { getPresignedUploadUrl } = await import('@/lib/storage/s3')
    const { rateLimit, getClientIp, createRateLimitResponse } = await import('@/lib/utils/rateLimit')

    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!rateLimit(`upload:${session.id}`, 'upload')) {
      return createRateLimitResponse()
    }

    const body = await req.json()
    const { mimeType, folder, isPrivate } = body

    if (!mimeType || !folder) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const allowedTypes = folder === 'verification'
      ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
      : ALLOWED_IMAGE_TYPES

    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    const shouldBePrivate = folder === 'verification' || isPrivate
    const { uploadUrl, key, publicUrl } = await getPresignedUploadUrl(folder, mimeType, shouldBePrivate)

    return NextResponse.json({ success: true, data: { uploadUrl, key, publicUrl } })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
