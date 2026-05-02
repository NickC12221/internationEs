export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const { signToken } = await import('@/lib/auth/jwt')
    const { slugify } = await import('@/lib/utils')
    const bcrypt = await import('bcryptjs')

    const { name, email, password, country, countryCode, city, plan } = await req.json()

    if (!name || !email || !password || !country || !countryCode || !city) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const citySlug = slugify(city)
    let slug = slugify(name)
    const existingSlug = await prisma.agency.findUnique({ where: { slug } })
    if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'AGENCY',
        agency: {
          create: {
            name,
            slug,
            country,
            countryCode: countryCode.toUpperCase(),
            city,
            citySlug,
            email,
            plan: plan === 'PREMIUM' ? 'PREMIUM' : 'FREE',
            isPremium: plan === 'PREMIUM',
            subscriptionStatus: 'ACTIVE',
            subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        }
      },
      include: { agency: true }
    })

    const token = await signToken({ sub: user.id, email: user.email, role: user.role })

    const response = NextResponse.json({ success: true, data: { id: user.id, email: user.email, role: user.role, agency: user.agency } })
    response.cookies.set('femme_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to create agency' }, { status: 500 })
  }
}
