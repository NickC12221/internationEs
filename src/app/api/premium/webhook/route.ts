export const dynamic = 'force-dynamic' // force-rebuild

// src/app/api/premium/webhook/route.ts
// Stripe webhook handler
// When Stripe is integrated, this endpoint receives payment confirmations
// and upgrades the model's listing tier automatically.

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  // ─────────────────────────────────────────────────────────────
  // STRIPE WEBHOOK INTEGRATION POINT
  //
  // 1. Install: npm install stripe
  //
  // 2. Uncomment and implement:
  //
  // import Stripe from 'stripe'
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  //
  // let event: Stripe.Event
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     body,
  //     sig!,
  //     process.env.STRIPE_WEBHOOK_SECRET!
  //   )
  // } catch (err) {
  //   return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  // }
  //
  // if (event.type === 'payment_intent.succeeded') {
  //   const intent = event.data.object as Stripe.PaymentIntent
  //   const orderId = intent.metadata.orderId
  //   const profileId = intent.metadata.profileId
  //
  //   // Get the order
  //   const order = await prisma.premiumOrder.findUnique({ where: { id: orderId } })
  //   if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  //
  //   // Activate premium
  //   const expiresAt = new Date()
  //   expiresAt.setDate(expiresAt.getDate() + order.durationDays)
  //
  //   await prisma.profile.update({
  //     where: { id: profileId },
  //     data: {
  //       listingTier: 'PREMIUM',
  //       premiumExpiresAt: expiresAt,
  //     },
  //   })
  //
  //   await prisma.premiumOrder.update({
  //     where: { id: orderId },
  //     data: {
  //       status: 'paid',
  //       stripePaymentIntentId: intent.id,
  //     },
  //   })
  // }
  // ─────────────────────────────────────────────────────────────

  return NextResponse.json({ received: true })
}
