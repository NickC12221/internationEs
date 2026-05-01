'use client'
// src/app/dashboard/premium/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Check, ArrowLeft, CreditCard } from 'lucide-react'
import Header from '@/components/layout/Header'

const PREMIUM_FEATURES = [
  'Appear at the top of all city listings',
  'Gold "Premium" badge on your profile',
  'Priority placement in search results',
  'Up to 20 photo uploads (vs 5 free)',
  'Analytics on profile views',
  'Featured in monthly newsletter',
]

const PLANS = [
  { duration: '1 Month', price: 29, days: 30, popular: false },
  { duration: '3 Months', price: 69, days: 90, popular: true, saving: 'Save 21%' },
  { duration: '6 Months', price: 119, days: 180, popular: false, saving: 'Save 32%' },
]

export default function PremiumPage() {
  const [profile, setProfile] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState(1) // Index of selected plan
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProfile(data.data.profile)
      })
      .finally(() => setLoading(false))
  }, [])

  const isPremium = profile?.listingTier === 'PREMIUM'

  const handleUpgrade = async () => {
    // Placeholder: In production, this would create a Stripe checkout session
    alert('Stripe integration coming soon! The payment infrastructure is ready to plug in.')
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1
            className="text-2xl font-light text-stone-100"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Premium Listing
          </h1>
        </div>

        {isPremium ? (
          <div className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-8 text-center">
            <Star className="mx-auto h-10 w-10 text-amber-400 fill-current mb-4" />
            <h2
              className="text-2xl font-light text-amber-300"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              You're Premium!
            </h2>
            <p className="mt-2 text-stone-400">
              Your premium listing is active
              {profile?.premiumExpiresAt && (
                <> until {new Date(profile.premiumExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
              )}.
            </p>
          </div>
        ) : (
          <>
            {/* Features */}
            <div className="mb-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
              <h2
                className="mb-4 text-xl font-light text-stone-100"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                What's Included
              </h2>
              <div className="space-y-3">
                {PREMIUM_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check className="h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span className="text-sm text-stone-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plans */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {PLANS.map((plan, i) => (
                <button
                  key={plan.duration}
                  onClick={() => setSelectedPlan(i)}
                  className={`relative rounded-xl border p-4 text-left transition-all ${
                    selectedPlan === i
                      ? 'border-amber-700 bg-amber-950/20'
                      : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-700 px-2.5 py-0.5 text-xs font-medium text-white">
                      Popular
                    </span>
                  )}
                  <p className="font-medium text-stone-200">{plan.duration}</p>
                  <p className="text-2xl font-light text-stone-100 mt-1">
                    ${plan.price}
                  </p>
                  {plan.saving && (
                    <p className="text-xs text-amber-500 mt-0.5">{plan.saving}</p>
                  )}
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3.5 text-base font-medium text-white transition-colors hover:bg-amber-600"
            >
              <CreditCard className="h-5 w-5" />
              Upgrade to Premium — ${PLANS[selectedPlan].price}
            </button>

            <p className="mt-3 text-center text-xs text-stone-600">
              Secure payment via Stripe. Cancel anytime. No auto-renewal.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
