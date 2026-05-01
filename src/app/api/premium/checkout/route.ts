export const dynamic = 'force-dynamic' // force-rebuild

// src/app/api/premium/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'

const PLANS = {
  '30': { price: 2900, label: '1 Month' },
  '90': { price: 6900, label: '3 Months' },
  '180': { price: 11900, label: '6 Months' },
}

export async function POST(req: NextRequest) {
  const { getSessionFromRequest } = await import('@/lib/auth/jwt')
  const { prisma } = await import('@/lib/db/prisma')
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { durationDays } = await req.json()
    const plan = PLANS[durationDays as keyof typeof PLANS]

    if (!plan) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    // Create a pending order record
    const order = await prisma.premiumOrder.create({
      data: {
        profileId: profile.id,
        amount: plan.price,
        currency: 'USD',
        status: 'pending',
        durationDays: parseInt(durationDays),
      },
    })

    // ─────────────────────────────────────────────────────────
    // STRIPE INTEGRATION POINT
    // When ready, replace the block below with:
    //
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: plan.price,
    //   currency: 'usd',
    //   metadata: { orderId: order.id, profileId: profile.id },
    // })
    //
    // await prisma.premiumOrder.update({
    //   where: { id: order.id },
    //   data: { stripePaymentIntentId: paymentIntent.id }
    // })
    //
    // return NextResponse.json({
    //   success: true,
    //   data: { clientSecret: paymentIntent.client_secret }
    // })
    // ─────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        message: 'Payment processing coming soon. Order created.',
      },
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}
