'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, Calendar, MessageSquare, Users, TrendingUp, CheckCircle, Clock, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

interface ModelStat {
  id: string
  displayName: string
  profileImageUrl: string | null
  slug: string
  countryCode: string
  citySlug: string
  listingTier: string
  bookings: { total: number; accepted: number; pending: number }
  reviews: { count: number; avg: number }
}

interface Analytics {
  agency: { name: string; isPremium: boolean }
  overview: {
    totalModels: number
    totalBookings: number
    pendingBookings: number
    acceptedBookings: number
    totalMessages: number
    totalReviews: number
    avgRating: number
  }
  models: ModelStat[]
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-stone-400' }: any) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
      <div className={`flex items-center gap-2 mb-2 text-xs font-medium uppercase tracking-wider ${color}`}>
        <Icon className="h-4 w-4" />{label}
      </div>
      <p className="text-3xl font-light text-stone-100">{value}</p>
      {sub && <p className="text-xs text-stone-600 mt-1">{sub}</p>}
    </div>
  )
}

export default function AgencyAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/agency/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.success) setAnalytics(d.data)
        else setError(d.error || 'Failed to load')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/agency-dashboard" className="text-stone-500 hover:text-stone-300">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Agency Analytics
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              <Star className="h-3 w-3 fill-current" /> Premium
            </span>
          </div>
          <p className="text-xs text-stone-600">All-time data</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/20 p-8 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            {error === 'Premium required' && (
              <p className="text-sm text-stone-500">Analytics are available for Premium agencies only.
                <Link href="/agency-dashboard" className="text-amber-500 ml-1">Upgrade from your dashboard</Link>
              </p>
            )}
          </div>
        ) : analytics && (
          <>
            {/* Overview stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard icon={Users} label="Models" value={analytics.overview.totalModels} color="text-blue-400" />
              <StatCard icon={Calendar} label="Total Bookings" value={analytics.overview.totalBookings}
                sub={`${analytics.overview.pendingBookings} pending · ${analytics.overview.acceptedBookings} accepted`} color="text-amber-400" />
              <StatCard icon={MessageSquare} label="Conversations" value={analytics.overview.totalMessages} color="text-stone-400" />
              <StatCard icon={Star} label="Reviews" value={analytics.overview.totalReviews}
                sub={analytics.overview.avgRating > 0 ? `${analytics.overview.avgRating.toFixed(1)} avg rating` : 'No reviews yet'} color="text-amber-400" />
            </div>

            {/* Booking funnel */}
            <div className="mb-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">Booking Overview</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <p className="text-3xl font-light text-stone-100">{analytics.overview.totalBookings}</p>
                  <p className="text-xs text-stone-500 mt-1">Total requests</p>
                </div>
                <div className="text-center border-x border-stone-800">
                  <p className="text-3xl font-light text-amber-400">{analytics.overview.pendingBookings}</p>
                  <p className="text-xs text-stone-500 mt-1">Awaiting response</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-light text-emerald-400">{analytics.overview.acceptedBookings}</p>
                  <p className="text-xs text-stone-500 mt-1">Accepted</p>
                </div>
              </div>
              {analytics.overview.totalBookings > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                    <span>Acceptance rate</span>
                    <span>{Math.round((analytics.overview.acceptedBookings / analytics.overview.totalBookings) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${(analytics.overview.acceptedBookings / analytics.overview.totalBookings) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Per-model breakdown */}
            <div>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">Model Breakdown</h2>
              <div className="space-y-3">
                {analytics.models.sort((a, b) => b.bookings.total - a.bookings.total).map(model => (
                  <div key={model.id} className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                        {model.profileImageUrl
                          ? <img src={model.profileImageUrl} alt={model.displayName} className="h-full w-full object-cover" />
                          : <div className="flex h-full items-center justify-center text-stone-600 text-lg">{model.displayName[0]}</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/${model.countryCode.toLowerCase()}/${model.citySlug}/${model.slug}`}
                            className="font-medium text-stone-200 hover:text-amber-400 transition-colors">
                            {model.displayName}
                          </Link>
                          {model.listingTier === 'PREMIUM' && (
                            <span className="text-xs text-amber-400 flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-current" /> Premium
                            </span>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-lg bg-stone-800 px-3 py-2 text-center">
                            <p className="text-lg font-light text-stone-100">{model.bookings.total}</p>
                            <p className="text-xs text-stone-500">Bookings</p>
                          </div>
                          <div className="rounded-lg bg-stone-800 px-3 py-2 text-center">
                            <p className="text-lg font-light text-amber-400">{model.bookings.pending}</p>
                            <p className="text-xs text-stone-500">Pending</p>
                          </div>
                          <div className="rounded-lg bg-stone-800 px-3 py-2 text-center">
                            <p className="text-lg font-light text-emerald-400">{model.bookings.accepted}</p>
                            <p className="text-xs text-stone-500">Accepted</p>
                          </div>
                          <div className="rounded-lg bg-stone-800 px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <p className="text-lg font-light text-stone-100">{model.reviews.count}</p>
                              {model.reviews.avg > 0 && (
                                <span className="text-xs text-amber-400">★{model.reviews.avg.toFixed(1)}</span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500">Reviews</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
