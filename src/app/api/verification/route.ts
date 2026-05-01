export const dynamic = 'force-dynamic' // force-rebuild

// src/app/api/verification/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { idImageKey, videoKey } = await req.json()

    if (!idImageKey) {
      return NextResponse.json(
        { success: false, error: 'ID image is required' },
        { status: 400 }
      )
    }

    // Check if already has a pending or approved request
    const existing = await prisma.verificationRequest.findUnique({
      where: { userId: session.id },
    })

    if (existing?.status === 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Your account is already verified' },
        { status: 400 }
      )
    }

    if (existing?.status === 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'You already have a pending verification request' },
        { status: 400 }
      )
    }

    const verification = await prisma.verificationRequest.upsert({
      where: { userId: session.id },
      update: {
        idImageKey,
        videoKey: videoKey || null,
        status: 'PENDING',
        adminNotes: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      create: {
        userId: session.id,
        idImageKey,
        videoKey: videoKey || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, data: verification })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit verification' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const verification = await prisma.verificationRequest.findUnique({
      where: { userId: session.id },
      select: {
        status: true,
        adminNotes: true,
        createdAt: true,
        reviewedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: verification })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch verification status' }, { status: 500 })
  }
}
