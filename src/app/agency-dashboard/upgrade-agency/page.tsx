'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, Check, CreditCard, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

const FEATURES = [
  { icon: '📍', text: 'City Page Sidebar — featured on your city\'s model listing page' },
  { icon: '⭐', text: 'Premium Badge — gold "Premium Agency" badge builds instant trust' },
  { icon: '🔝', text: 'Priority Placement — top of agency directory above standard listings' },
  { icon: '📊', text: 'Profile Analytics — see views on your agency profile and models' },
  { icon: '✉️', text: 'Newsletter Feature — included in our monthly featured agency newsletter' },
  { icon: '🌟', text: 'Discounted Model Premium — upgrade models at a reduced rate' },
  { icon: '👥', text: 'Up to 20 models — free accounts limited to 5 models' },
]

const PLANS = [
  { duration: '1 Month', price: 49, days: 30, popular: false },
  { duration: '3 Months', price: 119, days: 90, popular: true, saving: 'Save 19%' },
  { duration: '6 Months', price: 199, days: 180, popular: false, saving: 'Save 32%' },
]

export default function AgencyUpgradePage() {
  const [agency, setAgency] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(1)
  const [upgrading, setUpgrading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/agency').then(r => r.json()).then(d => {
      if (!d.success) { router.push('/login'); return }
      setAgency(d.data)
      setLoading(false)
    })
  }, [])

  const handleUpgrade = async () => {
    setUpgrading(true)
    const res = await fetch('/api/agency', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPremium: true, premiumDays: PLANS[selectedPlan].days })
    })
    const data = await res.json()
    if (data.success) {
      router.push('/agency-dashboard/upgrades?upgraded=1')
    } else {
      alert(data.error || 'Upgrade failed')
      setUpgrading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/agency-dashboard/upgrades" className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            {agency?.isPremium ? 'Extend Agency Premium' : 'Upgrade to Premium Agency'}
          </h1>
        </div>

        {agency?.isPremium && agency?.subscriptionExpiresAt && (
          <div className="mb-6 rounded-xl border border-amber-900/30 bg-amber-950/10 px-4 py-3 flex items-center gap-3">
            <Star className="h-4 w-4 text-amber-400 fill-current flex-shrink-0" />
            <p className="text-sm text-stone-300">
              Currently active — expires <span className="text-amber-400">{new Date(agency.subscriptionExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>. Extending will add time from expiry date.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="mb-4 text-lg font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>What's Included</h2>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-start gap-3">
                <span className="flex-shrink-0 text-base">{f.icon}</span>
                <span className="text-sm text-stone-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan selector */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
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

        <button onClick={handleUpgrade} disabled={upgrading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3.5 text-base font-medium text-white hover:bg-amber-600 disabled:opacity-60">
          {upgrading
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
            : <><CreditCard className="h-5 w-5" /> {agency?.isPremium ? 'Extend' : 'Upgrade'} — ${PLANS[selectedPlan].price}</>
          }
        </button>
        <p className="mt-3 text-center text-xs text-stone-600">Secure payment via Stripe. No auto-renewal.</p>
      </div>
    </div>
  )
}
