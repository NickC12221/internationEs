export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const verification = await prisma.verificationRequest.findUnique({
      where: { userId: session.id }
    })

    return NextResponse.json({ success: true, data: verification })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { idImageKey, idImageUrl, videoKey, videoUrl, profileId } = await req.json()

    // For agency escorts
    const userId = profileId
      ? (await prisma.profile.findUnique({ where: { id: profileId }, select: { userId: true } }))?.userId || session.id
      : session.id

    const existing = await prisma.verificationRequest.findUnique({ where: { userId } })

    // Block resubmission if already approved
    if (existing?.status === 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Already verified' }, { status: 400 })
    }

    if (existing) {
      await prisma.verificationRequest.update({
        where: { userId },
        data: { 
          type: 'IDENTITY', 
          idImageKey, 
          idImageUrl: idImageUrl || null,
          videoKey: videoKey || null,
          videoUrl: videoUrl || null,
          status: 'PENDING', 
          reviewedAt: null,
          reviewedBy: null,
          adminNotes: null,
        }
      })
    } else {
      await prisma.verificationRequest.create({
        data: { userId, type: 'IDENTITY', idImageKey, idImageUrl, videoKey, videoUrl, status: 'PENDING' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
