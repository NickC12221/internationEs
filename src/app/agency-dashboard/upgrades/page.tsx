'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, RefreshCw, Loader2, Check, CreditCard } from 'lucide-react'
import Header from '@/components/layout/Header'

const AGENCY_PLANS = [
  { duration: '1 Month', price: 49, days: 30, popular: false },
  { duration: '3 Months', price: 119, days: 90, popular: true, saving: 'Save 19%' },
  { duration: '6 Months', price: 199, days: 180, popular: false, saving: 'Save 32%' },
]

const MODEL_PLANS = [
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

function PlanSelector({ plans, selectedPlan, onSelect, onConfirm, loading, label }: any) {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Select plan to extend</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map((plan: any, i: number) => (
          <button key={plan.duration} onClick={() => onSelect(i)}
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
      <button onClick={onConfirm} disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><CreditCard className="h-4 w-4" /> {label} — ${plans[selectedPlan]?.price}</>}
      </button>
      <p className="text-center text-xs text-stone-600">Secure payment via Stripe. No auto-renewal.</p>
    </div>
  )
}

export default function AgencyUpgradesPage() {
  const [agency, setAgency] = useState<any>(null)
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [agencyPlan, setAgencyPlan] = useState(1)
  const [modelPlans, setModelPlans] = useState<Record<string, number>>({})
  const [processing, setProcessing] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const router = useRouter()
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('upgraded')) setSuccessMsg('Premium extended successfully!')
    const load = async () => {
      const [agencyRes, modelsRes] = await Promise.all([
        fetch('/api/agency').then(r => r.json()),
        fetch('/api/agency/models').then(r => r.json()),
      ])
      if (!agencyRes.success) { router.push('/login'); return }
      setAgency(agencyRes.data)
      if (modelsRes.success) setModels(modelsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const extendAgency = async () => {
    setProcessing('agency')
    const res = await fetch('/api/agency', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPremium: true, premiumDays: AGENCY_PLANS[agencyPlan].days })
    })
    const data = await res.json()
    if (data.success) {
      setSuccessMsg('Agency premium extended!')
      setExpandedSection(null)
      const agencyRes = await fetch('/api/agency').then(r => r.json())
      if (agencyRes.success) setAgency(agencyRes.data)
    }
    setProcessing(null)
  }

  const extendModel = async (profileId: string) => {
    const planIdx = modelPlans[profileId] ?? 1
    setProcessing(profileId)
    const res = await fetch(`/api/agency/models/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingTier: 'PREMIUM', premiumDays: MODEL_PLANS[planIdx].days })
    })
    const data = await res.json()
    if (data.success) {
      setSuccessMsg('Model premium extended!')
      setExpandedSection(null)
      const modelsRes = await fetch('/api/agency/models').then(r => r.json())
      if (modelsRes.success) setModels(modelsRes.data)
    }
    setProcessing(null)
  }

  const premiumModels = models.filter(m => m.listingTier === 'PREMIUM')
  const freeModels = models.filter(m => m.listingTier !== 'PREMIUM')
  const agencyDays = daysUntil(agency?.subscriptionExpiresAt)

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/agency-dashboard" className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Premium & Upgrades
          </h1>
        </div>

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-900 bg-emerald-950/20 px-4 py-3 flex items-center gap-2 text-sm text-emerald-400">
            <Check className="h-4 w-4" /> {successMsg}
          </div>
        )}

        {/* Agency premium */}
        <div className={`mb-4 rounded-2xl border p-5 ${agency?.isPremium ? 'border-amber-900/40 bg-amber-950/10' : 'border-stone-800 bg-stone-900'}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className={`h-5 w-5 ${agency?.isPremium ? 'text-amber-400 fill-current' : 'text-stone-600'}`} />
                <h2 className="text-lg font-medium text-stone-200">Agency Premium</h2>
                {agency?.isPremium && <span className="rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-400">Active</span>}
              </div>
              {agency?.isPremium ? (
                <div>
                  {agency.subscriptionExpiresAt && (
                    <p className="text-sm text-stone-400">Expires {new Date(agency.subscriptionExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  )}
                  <div className="mt-1"><CountdownBadge days={agencyDays} /></div>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Upgrade for priority placement, city sidebar, analytics and more.</p>
              )}
            </div>
            <button onClick={() => setExpandedSection(expandedSection === 'agency' ? null : 'agency')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                agency?.isPremium ? 'border border-amber-800 text-amber-400 hover:bg-amber-900/20' : 'bg-amber-700 text-white hover:bg-amber-600'
              }`}>
              <RefreshCw className="h-4 w-4" />
              {agency?.isPremium ? 'Extend / Renew' : 'Upgrade — $49/mo'}
            </button>
          </div>

          {/* Progress bar */}
          {agency?.isPremium && agencyDays !== null && agencyDays > 0 && (
            <div className="mt-3 h-1.5 w-full rounded-full bg-stone-800 overflow-hidden">
              <div className={`h-full rounded-full ${agencyDays <= 7 ? 'bg-red-500' : agencyDays <= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (agencyDays / 90) * 100)}%` }} />
            </div>
          )}

          {expandedSection === 'agency' && (
            <PlanSelector
              plans={AGENCY_PLANS}
              selectedPlan={agencyPlan}
              onSelect={setAgencyPlan}
              onConfirm={extendAgency}
              loading={processing === 'agency'}
              label={agency?.isPremium ? 'Extend Agency' : 'Upgrade Agency'}
            />
          )}
        </div>

        {/* Premium models */}
        {premiumModels.length > 0 && (
          <div className="mb-4">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-stone-500">Premium Models ({premiumModels.length})</h2>
            <div className="space-y-3">
              {premiumModels.map(model => {
                const days = daysUntil(model.premiumExpiresAt)
                const isExpanded = expandedSection === model.id
                return (
                  <div key={model.id} className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                        {model.profileImageUrl
                          ? <img src={model.profileImageUrl} alt={model.displayName} className="h-full w-full object-cover" />
                          : <div className="flex h-full items-center justify-center text-stone-600">{model.displayName[0]}</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><p className="font-medium text-stone-200">{model.displayName}</p><Star className="h-3.5 w-3.5 text-amber-400 fill-current" /></div>
                        <p className="text-xs text-stone-500">{model.city}</p>
                        {model.premiumExpiresAt && <p className="text-xs text-stone-500">Expires {new Date(model.premiumExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                        <div className="mt-1"><CountdownBadge days={days} /></div>
                      </div>
                      <button onClick={() => setExpandedSection(isExpanded ? null : model.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-amber-800 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-900/20 transition-colors flex-shrink-0">
                        <RefreshCw className="h-3.5 w-3.5" /> Extend
                      </button>
                    </div>
                    {days !== null && days > 0 && (
                      <div className="mt-3 h-1 w-full rounded-full bg-stone-800 overflow-hidden">
                        <div className={`h-full rounded-full ${days <= 7 ? 'bg-red-500' : days <= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (days / 90) * 100)}%` }} />
                      </div>
                    )}
                    {isExpanded && (
                      <PlanSelector
                        plans={MODEL_PLANS}
                        selectedPlan={modelPlans[model.id] ?? 1}
                        onSelect={(i: number) => setModelPlans(p => ({ ...p, [model.id]: i }))}
                        onConfirm={() => extendModel(model.id)}
                        loading={processing === model.id}
                        label={`Extend ${model.displayName}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Standard models */}
        {freeModels.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-stone-500">Standard Models ({freeModels.length})</h2>
            <div className="space-y-2">
              {freeModels.map(model => (
                <div key={model.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                      {model.profileImageUrl
                        ? <img src={model.profileImageUrl} alt={model.displayName} className="h-full w-full object-cover" />
                        : <div className="flex h-full items-center justify-center text-stone-600 text-sm">{model.displayName[0]}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-200">{model.displayName}</p>
                      <p className="text-xs text-stone-500">{model.city} · Standard listing</p>
                    </div>
                    <Link href={`/agency-dashboard/upgrade/${model.id}`}
                      className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-stone-400 hover:bg-amber-900/20 hover:text-amber-400 transition-colors">
                      <Star className="h-3.5 w-3.5" /> Upgrade
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
