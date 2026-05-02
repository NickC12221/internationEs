'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Star, Check, CreditCard, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

const PREMIUM_FEATURES = [
  'Appear at the top of all city listings',
  'Gold "Premium" badge on profile',
  'Priority placement in search results',
  'Featured above non-premium models',
  'Increased booking enquiries',
  'Verified premium status on profile page',
]

const PLANS = [
  { duration: '1 Month', price: 29, days: 30, popular: false },
  { duration: '3 Months', price: 69, days: 90, popular: true, saving: 'Save 21%' },
  { duration: '6 Months', price: 119, days: 180, popular: false, saving: 'Save 32%' },
]

export default function AgencyModelUpgradePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.profileId as string

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(1)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    // Verify agency session and fetch model profile
    const init = async () => {
      const [userRes, modelsRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/agency/models'),
      ])
      const [userData, modelsData] = await Promise.all([userRes.json(), modelsRes.json()])

      if (!userData.success || userData.data.role !== 'AGENCY') {
        router.push('/login')
        return
      }

      if (modelsData.success) {
        const model = modelsData.data.find((m: any) => m.id === profileId)
        if (!model) { router.push('/agency-dashboard'); return }
        setProfile(model)
      }
      setLoading(false)
    }
    init()
  }, [profileId])

  const handleUpgrade = async () => {
    setUpgrading(true)
    // For now — directly upgrade (Stripe to be integrated)
    const res = await fetch(`/api/agency/models/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingTier: 'PREMIUM',
        premiumDays: PLANS[selectedPlan].days,
      }),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/agency-dashboard?upgraded=1')
    } else {
      alert(data.error || 'Upgrade failed')
      setUpgrading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
    </div>
  )

  const isPremium = profile?.listingTier === 'PREMIUM'

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/agency-dashboard" className="text-stone-500 hover:text-stone-300">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Premium Listing
            </h1>
            {profile && (
              <p className="text-sm text-stone-500 mt-0.5">Upgrading: {profile.displayName}</p>
            )}
          </div>
        </div>

        {/* Model preview */}
        {profile && (
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-stone-800 bg-stone-900 p-4">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
              {profile.profileImageUrl
                ? <img src={profile.profileImageUrl} alt={profile.displayName} className="h-full w-full object-cover" />
                : <div className="flex h-full items-center justify-center text-stone-600 text-xl">{profile.displayName[0]}</div>
              }
            </div>
            <div>
              <p className="font-medium text-stone-200">{profile.displayName}</p>
              <p className="text-xs text-stone-500">{profile.city}, {profile.country}</p>
              {isPremium ? (
                <span className="flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                  <Star className="h-3 w-3 fill-current" /> Currently Premium
                </span>
              ) : (
                <span className="text-xs text-stone-600 mt-0.5">Standard listing</span>
              )}
            </div>
          </div>
        )}

        {isPremium ? (
          <div className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-8 text-center">
            <Star className="mx-auto h-10 w-10 text-amber-400 fill-current mb-4" />
            <h2 className="text-2xl font-light text-amber-300" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Already Premium!
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              {profile?.displayName} already has an active premium listing.
            </p>
            {profile?.premiumExpiresAt && (
              <p className="mt-1 text-xs text-stone-500">
                Expires {new Date(profile.premiumExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            <Link href="/agency-dashboard"
              className="mt-4 inline-block rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-400 hover:border-stone-600 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
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
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {PLANS.map((plan, i) => (
                <button key={plan.duration} onClick={() => setSelectedPlan(i)}
                  className={`relative rounded-xl border p-4 text-left transition-all ${
                    selectedPlan === i
                      ? 'border-amber-700 bg-amber-950/20'
                      : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                  }`}>
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-700 px-2.5 py-0.5 text-xs font-medium text-white">
                      Popular
                    </span>
                  )}
                  <p className="font-medium text-stone-200">{plan.duration}</p>
                  <p className="text-2xl font-light text-stone-100 mt-1">${plan.price}</p>
                  {plan.saving && <p className="text-xs text-amber-500 mt-0.5">{plan.saving}</p>}
                </button>
              ))}
            </div>

            {/* Upgrade button */}
            <button onClick={handleUpgrade} disabled={upgrading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3.5 text-base font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
              {upgrading
                ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                : <><CreditCard className="h-5 w-5" /> Upgrade {profile?.displayName} — ${PLANS[selectedPlan].price}</>
              }
            </button>
            <p className="mt-3 text-center text-xs text-stone-600">Secure payment via Stripe. No auto-renewal.</p>
          </>
        )}
      </div>
    </div>
  )
}
