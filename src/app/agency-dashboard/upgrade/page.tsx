'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, X, Star, Building2, Users, MessageSquare, Phone, Globe, TrendingUp } from 'lucide-react'
import Header from '@/components/layout/Header'

interface Agency {
  isPremium: boolean
  subscriptionStatus: string
  premiumExpiresAt: string | null
  name: string
}

const FREE_FEATURES = [
  { icon: Users, text: 'Up to 5 models', included: true },
  { icon: MessageSquare, text: 'Full booking & messaging system', included: true },
  { icon: Phone, text: 'Visible contact details', included: true },
  { icon: Globe, text: 'Public agency profile page', included: true },
  { icon: Star, text: 'Featured in city sidebar', included: false },
  { icon: TrendingUp, text: 'Up to 20 models', included: false },
  { icon: TrendingUp, text: 'Premium badge on agency listing', included: false },
  { icon: TrendingUp, text: 'Priority placement in agency directory', included: false },
  { icon: Globe, text: 'Website link on profile', included: false },
]

const PREMIUM_FEATURES = [
  { icon: Users, text: 'Up to 20 models', included: true },
  { icon: MessageSquare, text: 'Full booking & messaging system', included: true },
  { icon: Phone, text: 'Visible contact details', included: true },
  { icon: Globe, text: 'Public agency profile page', included: true },
  { icon: Star, text: 'Featured in city sidebar', included: true },
  { icon: TrendingUp, text: 'Premium badge on agency listing', included: true },
  { icon: TrendingUp, text: 'Priority placement in agency directory', included: true },
  { icon: Globe, text: 'Website link on profile', included: true },
]

const PLANS = [
  { label: '1 Month', price: 49, duration: 30, popular: false },
  { label: '3 Months', price: 129, duration: 90, popular: true, saving: 'Save 12%' },
  { label: '6 Months', price: 239, duration: 180, popular: false, saving: 'Save 19%' },
]

export default function AgencyUpgradePage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [selectedPlan, setSelectedPlan] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agency')
      .then(r => r.json())
      .then(data => {
        if (data.success) setAgency(data.data)
        setLoading(false)
      })
  }, [])

  const handleUpgrade = () => {
    alert('Stripe integration coming soon! Your order has been noted.')
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex items-center justify-center py-24 text-stone-500">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

        <div className="mb-8 flex items-center gap-3">
          <Link href="/agency-dashboard" className="text-stone-500 hover:text-stone-300">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Agency Plans
          </h1>
        </div>

        {agency?.isPremium && (
          <div className="mb-8 rounded-2xl border border-amber-800/50 bg-amber-950/20 p-5 flex items-center gap-4">
            <Star className="h-8 w-8 text-amber-400 fill-current flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-300">You're on Premium!</p>
              <p className="text-sm text-stone-400 mt-0.5">
                Your premium plan is active
                {agency.premiumExpiresAt && ` until ${new Date(agency.premiumExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}.
              </p>
            </div>
          </div>
        )}

        {/* Plan comparison */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2">

          {/* Free */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-stone-400" />
                <h2 className="text-lg font-medium text-stone-200">Standard</h2>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-light text-stone-100">Free</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">Get started with the basics</p>
            </div>

            <div className="space-y-3 mb-6">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${f.included ? 'bg-emerald-900/40' : 'bg-stone-800'}`}>
                    {f.included
                      ? <Check className="h-3 w-3 text-emerald-400" />
                      : <X className="h-3 w-3 text-stone-600" />
                    }
                  </div>
                  <span className={`text-sm ${f.included ? 'text-stone-300' : 'text-stone-600'}`}>{f.text}</span>
                </div>
              ))}
            </div>

            <div className={`rounded-lg py-2.5 text-center text-sm font-medium ${agency?.isPremium ? 'border border-stone-700 text-stone-500' : 'bg-stone-800 text-stone-300'}`}>
              {agency?.isPremium ? 'Downgrade' : 'Current Plan'}
            </div>
          </div>

          {/* Premium */}
          <div className="rounded-2xl border border-amber-800/60 bg-gradient-to-b from-amber-950/30 to-stone-900 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-700 text-white text-xs font-medium px-3 py-1 rounded-bl-xl">
              RECOMMENDED
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-5 w-5 text-amber-400 fill-current" />
                <h2 className="text-lg font-medium text-amber-300">Premium</h2>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-light text-stone-100">$49</span>
                <span className="text-stone-400 mb-1">/month</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">Everything you need to grow</p>
            </div>

            <div className="space-y-3 mb-6">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-900/40">
                    <Check className="h-3 w-3 text-amber-400" />
                  </div>
                  <span className="text-sm text-stone-300">{f.text}</span>
                </div>
              ))}
            </div>

            {!agency?.isPremium && (
              <div className="space-y-2">
                {/* Plan duration selector */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {PLANS.map((plan, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPlan(i)}
                      className={`relative rounded-lg p-2 text-center text-xs transition-all ${selectedPlan === i ? 'border border-amber-600 bg-amber-900/30 text-amber-300' : 'border border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'}`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-700 px-1.5 py-0.5 text-[9px] text-white whitespace-nowrap">Best value</span>
                      )}
                      <div className="font-medium">{plan.label}</div>
                      <div className="text-stone-500">${plan.price}</div>
                      {plan.saving && <div className="text-amber-500 text-[10px]">{plan.saving}</div>}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleUpgrade}
                  className="w-full rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                >
                  Upgrade to Premium — ${PLANS[selectedPlan].price}
                </button>
                <p className="text-center text-xs text-stone-600">Secure payment via Stripe · Cancel anytime</p>
              </div>
            )}

            {agency?.isPremium && (
              <div className="rounded-lg bg-amber-900/20 py-2.5 text-center text-sm font-medium text-amber-400">
                ✓ Active Plan
              </div>
            )}
          </div>
        </div>

        {/* Feature breakdown table */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-800">
            <h3 className="font-medium text-stone-200">Full Feature Comparison</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500 w-1/2">Feature</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-stone-500">Standard</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-amber-500">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {[
                { feature: 'Model slots', free: '5 models', premium: '20 models' },
                { feature: 'Agency profile page', free: true, premium: true },
                { feature: 'Contact details visible', free: true, premium: true },
                { feature: 'Booking & messaging', free: true, premium: true },
                { feature: 'Website link on profile', free: false, premium: true },
                { feature: 'Featured in city sidebar', free: false, premium: true },
                { feature: 'Premium badge', free: false, premium: true },
                { feature: 'Priority in directory', free: false, premium: true },
                { feature: 'Upgrade models to premium', free: true, premium: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-stone-800/50 transition-colors">
                  <td className="px-6 py-3 text-stone-300">{row.feature}</td>
                  <td className="px-6 py-3 text-center">
                    {typeof row.free === 'boolean'
                      ? row.free ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-stone-600 mx-auto" />
                      : <span className="text-stone-400">{row.free}</span>
                    }
                  </td>
                  <td className="px-6 py-3 text-center">
                    {typeof row.premium === 'boolean'
                      ? row.premium ? <Check className="h-4 w-4 text-amber-400 mx-auto" /> : <X className="h-4 w-4 text-stone-600 mx-auto" />
                      : <span className="text-amber-400 font-medium">{row.premium}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-stone-600">
          Questions? Contact us at support@femmedirectory.com
        </p>
      </div>
    </div>
  )
}
