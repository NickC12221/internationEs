export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Login required to book' }, { status: 401 })

    const { profileId, date, duration, message, contactName, contactEmail, contactPhone } = await req.json()

    if (!profileId || !date || !duration || !contactName || !contactEmail || !contactPhone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId, isActive: true },
      select: {
        id: true,
        displayName: true,
        userId: true,
        agencyModel: { select: { agency: { select: { id: true, userId: true, name: true } } } }
      }
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

    const notifData = {
      type: 'new_booking',
      title: 'New booking request',
      body: `${contactName} wants to book ${profile.displayName} on ${new Date(date).toLocaleDateString()}`,
      link: `/dashboard/bookings`,
    }

    // Notify model owner
    await prisma.notification.create({ data: { userId: profile.userId, ...notifData } })

    // If agency model, also notify the agency
    const agencyUserId = profile.agencyModel?.agency?.userId
    if (agencyUserId && agencyUserId !== profile.userId) {
      await prisma.notification.create({
        data: {
          userId: agencyUserId,
          type: 'new_booking',
          title: 'New booking request',
          body: `${contactName} wants to book ${profile.displayName} (your model)`,
          link: `/agency-dashboard`,
        }
      })
    }

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
    const role = searchParams.get('role')

    let bookings

    if (role === 'model') {
      const profile = await prisma.profile.findUnique({ where: { userId: session.id }, select: { id: true } })
      if (!profile) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
      bookings = await prisma.booking.findMany({
        where: { profileId: profile.id },
        include: { guest: { select: { id: true, name: true, email: true } }, review: { select: { rating: true } } },
        orderBy: { createdAt: 'desc' }
      })
    } else if (role === 'agency') {
      // Get all bookings for all models managed by this agency
      const agency = await prisma.agency.findUnique({ where: { userId: session.id }, select: { id: true } })
      if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })
      const agencyModels = await prisma.agencyModel.findMany({
        where: { agencyId: agency.id },
        select: { profileId: true }
      })
      const profileIds = agencyModels.map(m => m.profileId)
      bookings = await prisma.booking.findMany({
        where: { profileId: { in: profileIds } },
        include: {
          guest: { select: { id: true, name: true, email: true } },
          profile: { select: { displayName: true, profileImageUrl: true } },
          review: { select: { rating: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Guest viewing their own bookings
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
