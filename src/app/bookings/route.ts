export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const body = await req.json()
    const { profileId, clientName, clientEmail, clientPhone, date, duration, notes } = body

    if (!profileId || !clientName || !clientEmail || !clientPhone || !date || !duration) {
      return NextResponse.json({ success: false, error: 'All required fields must be filled' }, { status: 400 })
    }

    // Get profile with pricing and agency info
    const profile = await prisma.profile.findUnique({
      where: { id: profileId, isActive: true },
      include: { agencyModel: { include: { agency: true } } }
    })

    if (!profile) return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })

    // Calculate price
    const pricing = profile.pricing as Record<string, number> | null
    const priceKey = `${duration}h`
    const totalPrice = pricing?.[priceKey] || null

    const booking = await prisma.booking.create({
      data: {
        profileId,
        agencyId: profile.agencyModel?.agencyId || null,
        clientName,
        clientEmail,
        clientPhone,
        date: new Date(date),
        duration: parseInt(duration),
        totalPrice,
        notes: notes || null,
        status: 'PENDING',
      }
    })

    // Create in-app notification for agency
    if (profile.agencyModel?.agencyId) {
      await prisma.notification.create({
        data: {
          agencyId: profile.agencyModel.agencyId,
          title: 'New Booking Request',
          message: `${clientName} has requested to book ${profile.displayName} on ${new Date(date).toLocaleDateString()} for ${duration} hour${duration > 1 ? 's' : ''}.`,
          type: 'booking',
          link: '/agency-dashboard/bookings',
        }
      })
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'AGENCY') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const agency = await prisma.agency.findUnique({ where: { userId: session.id } })
    if (!agency) return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const profileId = searchParams.get('profileId')

    const where: any = { agencyId: agency.id }
    if (profileId) where.profileId = profileId

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        profile: { select: { displayName: true, slug: true, profileImageUrl: true } }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ success: true, data: bookings })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
