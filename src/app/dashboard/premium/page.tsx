'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, Check, CreditCard, RefreshCw, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

const PREMIUM_FEATURES = [
  'Appear at the top of all city listings',
  'Gold "Premium" badge on your profile',
  'Priority placement in search results',
  'Upload up to 15 photos',
  'Analytics on profile views',
  'Featured in monthly newsletter',
]

const PLANS = [
  { duration: '1 Month', price: 29, days: 30, popular: false },
  { duration: '3 Months', price: 69, days: 90, popular: true, saving: 'Save 21%' },
  { duration: '6 Months', price: 119, days: 180, popular: false, saving: 'Save 32%' },
]

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function CountdownBadge({ days }: { days: number | null }) {
  if (days === null) return null
  if (days < 0) return <span className="rounded-full bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-400">Expired</span>
  if (days <= 7) return <span className="rounded-full bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-400">{days}d left — Renew soon!</span>
  if (days <= 30) return <span className="rounded-full bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-400">{days} days left</span>
  return <span className="rounded-full bg-emerald-900/30 px-2.5 py-1 text-xs font-medium text-emerald-400">{days} days left</span>
}

export default function PremiumPage() {
  const [profile, setProfile] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState(1)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(data => {
      if (!data.success) { router.push('/login'); return }
      setProfile(data.data.profile)
    }).finally(() => setLoading(false))
  }, [])

  const handleUpgrade = async () => {
    setUpgrading(true)
    setError('')
    const res = await fetch('/api/premium/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: PLANS[selectedPlan].days })
    })
    const data = await res.json()
    if (data.success) {
      setSuccessMsg(`Premium ${isPremium ? 'extended' : 'activated'}! ${PLANS[selectedPlan].duration} added.`)
      // Refresh profile
      const userRes = await fetch('/api/user').then(r => r.json())
      if (userRes.success) setProfile(userRes.data.profile)
    } else {
      setError(data.error || 'Upgrade failed')
    }
    setUpgrading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
    </div>
  )

  const isPremium = profile?.listingTier === 'PREMIUM'
  const days = daysUntil(profile?.premiumExpiresAt)
  const expired = days !== null && days < 0

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Premium Listing
          </h1>
        </div>

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-900 bg-emerald-950/20 px-4 py-3 flex items-center gap-2 text-sm text-emerald-400">
            <Check className="h-4 w-4" /> {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-900 bg-red-950/20 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {/* Current status if premium */}
        {isPremium && (
          <div className={`mb-6 rounded-2xl border p-5 ${expired ? 'border-red-900/40 bg-red-950/10' : 'border-amber-900/40 bg-amber-950/10'}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className={`h-5 w-5 fill-current ${expired ? 'text-red-400' : 'text-amber-400'}`} />
                  <h2 className="text-lg font-medium text-stone-200">
                    {expired ? 'Premium Expired' : 'Premium Active'}
                  </h2>
                </div>
                {profile?.premiumExpiresAt && (
                  <p className="text-sm text-stone-400">
                    {expired ? 'Expired' : 'Expires'} {new Date(profile.premiumExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                <div className="mt-2"><CountdownBadge days={days} /></div>
              </div>
            </div>
            {/* Progress bar */}
            {!expired && days !== null && days > 0 && (
              <div className="mt-4 h-1.5 w-full rounded-full bg-stone-800 overflow-hidden">
                <div className={`h-full rounded-full ${days <= 7 ? 'bg-red-500' : days <= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (days / 90) * 100)}%` }} />
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="mb-4 text-lg font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            What's Included
          </h2>
          <div className="space-y-3">
            {PREMIUM_FEATURES.map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <Check className="h-4 w-4 flex-shrink-0 text-amber-500" />
                <span className="text-sm text-stone-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan selector */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-stone-400">
            {isPremium ? 'Select plan to extend — time added from current expiry date' : 'Select a plan'}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PLANS.map((plan, i) => (
              <button key={plan.duration} onClick={() => setSelectedPlan(i)}
                className={`relative rounded-xl border p-4 text-left transition-all ${selectedPlan === i ? 'border-amber-700 bg-amber-950/20' : 'border-stone-800 bg-stone-900 hover:border-stone-700'}`}>
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-700 px-2.5 py-0.5 text-xs font-medium text-white">Popular</span>
                )}
                <p className="font-medium text-stone-200">{plan.duration}</p>
                <p className="text-2xl font-light text-stone-100 mt-1">${plan.price}</p>
                {plan.saving && <p className="text-xs text-amber-500 mt-0.5">{plan.saving}</p>}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleUpgrade} disabled={upgrading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3.5 text-base font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
          {upgrading
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
            : isPremium
              ? <><RefreshCw className="h-5 w-5" /> Extend Premium — ${PLANS[selectedPlan].price}</>
              : <><CreditCard className="h-5 w-5" /> Upgrade to Premium — ${PLANS[selectedPlan].price}</>
          }
        </button>
        <p className="mt-3 text-center text-xs text-stone-600">Secure payment via Stripe. No auto-renewal.</p>
      </div>
    </div>
  )
}
