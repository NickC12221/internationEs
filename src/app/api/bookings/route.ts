export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Login required to book' }, { status: 401 })

    const { profileId, date, duration, message, contactName, contactEmail, contactPhone } = await req.json()

    if (!profileId || !date || !duration || !contactName || !contactEmail) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId, isActive: true },
      select: { id: true, displayName: true, userId: true }
    })
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })

    const booking = await prisma.booking.create({
      data: {
        profileId,
        guestId: session.id,
        date: new Date(date),
        duration: parseInt(duration),
        message: message || null,
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        status: 'PENDING',
      }
    })

    // Notify model/profile owner
    await prisma.notification.create({
      data: {
        userId: profile.userId,
        type: 'new_booking',
        title: 'New booking request',
        body: `${contactName} wants to book ${profile.displayName} on ${new Date(date).toLocaleDateString()}`,
        link: `/dashboard/bookings`,
      }
    })

    return NextResponse.json({ success: true, data: booking })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') // 'guest' or 'model'

    let bookings
    if (role === 'model') {
      // Model/Agency viewing their received bookings
      const profile = await prisma.profile.findUnique({ where: { userId: session.id }, select: { id: true } })
      if (!profile) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
      bookings = await prisma.booking.findMany({
        where: { profileId: profile.id },
        include: {
          guest: { select: { name: true, email: true } },
          review: { select: { rating: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Guest viewing their sent bookings
      bookings = await prisma.booking.findMany({
        where: { guestId: session.id },
        include: {
          profile: { select: { displayName: true, profileImageUrl: true, slug: true, countryCode: true, citySlug: true } },
          review: { select: { id: true, rating: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ success: true, data: bookings })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
