'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, Calendar, RefreshCw, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'

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

export default function AgencyUpgradesPage() {
  const [agency, setAgency] = useState<any>(null)
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
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

        {/* Agency premium status */}
        <div className={`mb-6 rounded-2xl border p-6 ${agency?.isPremium ? 'border-amber-900/40 bg-amber-950/10' : 'border-stone-800 bg-stone-900'}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className={`h-5 w-5 ${agency?.isPremium ? 'text-amber-400 fill-current' : 'text-stone-600'}`} />
                <h2 className="text-lg font-medium text-stone-200">Agency Premium</h2>
                {agency?.isPremium && <span className="rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-400">Active</span>}
              </div>
              {agency?.isPremium ? (
                <div className="space-y-1">
                  {agency.subscriptionExpiresAt && (
                    <p className="text-sm text-stone-400">
                      Expires {new Date(agency.subscriptionExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <CountdownBadge days={agencyDays} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Upgrade your agency for priority placement, city sidebar, analytics and more.</p>
              )}
            </div>
            <Link href="/agency-dashboard/upgrade-agency"
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                agency?.isPremium
                  ? 'border border-amber-800 text-amber-400 hover:bg-amber-900/20'
                  : 'bg-amber-700 text-white hover:bg-amber-600'
              }`}>
              <RefreshCw className="h-4 w-4" />
              {agency?.isPremium ? 'Extend / Renew' : 'Upgrade to Premium — $49/mo'}
            </Link>
          </div>

          {/* Expiry progress bar */}
          {agency?.isPremium && agency?.subscriptionExpiresAt && agencyDays !== null && agencyDays > 0 && (
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-stone-800 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${agencyDays <= 7 ? 'bg-red-500' : agencyDays <= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (agencyDays / 90) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Premium models */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone-500">
              Premium Models ({premiumModels.length})
            </h2>
          </div>
          {premiumModels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-700 py-8 text-center">
              <p className="text-stone-500 text-sm">No premium models yet</p>
              <p className="text-stone-600 text-xs mt-1">Upgrade individual models from the Models tab</p>
            </div>
          ) : (
            <div className="space-y-3">
              {premiumModels.map(model => {
                const days = daysUntil(model.premiumExpiresAt)
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-200">{model.displayName}</p>
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{model.city}</p>
                        {model.premiumExpiresAt && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            Expires {new Date(model.premiumExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-2">
                          <CountdownBadge days={days} />
                        </div>
                      </div>
                      <Link href={`/agency-dashboard/upgrade/${model.id}`}
                        className="flex items-center gap-1.5 rounded-lg border border-amber-800 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-900/20 transition-colors flex-shrink-0">
                        <RefreshCw className="h-3.5 w-3.5" /> Extend
                      </Link>
                    </div>
                    {/* Days bar */}
                    {days !== null && days > 0 && (
                      <div className="mt-3 h-1 w-full rounded-full bg-stone-800 overflow-hidden">
                        <div className={`h-full rounded-full ${days <= 7 ? 'bg-red-500' : days <= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (days / 90) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Non-premium models */}
        {freeModels.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-stone-500">
              Standard Models ({freeModels.length})
            </h2>
            <div className="space-y-2">
              {freeModels.map(model => (
                <div key={model.id} className="flex items-center gap-4 rounded-xl border border-stone-800 bg-stone-900 p-4">
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
                    className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-stone-400 hover:bg-amber-900/20 hover:text-amber-400 transition-colors flex-shrink-0">
                    <Star className="h-3.5 w-3.5" /> Upgrade
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
