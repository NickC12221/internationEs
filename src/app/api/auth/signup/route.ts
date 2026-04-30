// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { signToken, setSessionCookie } from '@/lib/auth/jwt'
import { signUpSchema } from '@/lib/utils/validation'
import { generateProfileSlug, slugify } from '@/lib/utils'
import { rateLimit, getClientIp, createRateLimitResponse } from '@/lib/utils/rateLimit'

export async function POST(req: NextRequest) {
  // Rate limit: 10 signups per 15 minutes per IP
  const ip = getClientIp(req)
  if (!rateLimit(`signup:${ip}`, 'auth')) {
    return createRateLimitResponse()
  }

  try {
    const body = await req.json()
    const parsed = signUpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, displayName, country, countryCode, city } = parsed.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const citySlug = slugify(city)
    let slug = generateProfileSlug(displayName, city)

    // Ensure slug uniqueness
    const existingSlug = await prisma.profile.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            displayName,
            slug,
            country,
            countryCode: countryCode.toUpperCase(),
            city,
            citySlug,
          },
        },
      },
      include: { profile: true },
    })

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    })

    // Set cookie on the response
    response.cookies.set('femme_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
