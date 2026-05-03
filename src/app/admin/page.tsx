'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Shield, Users, Calendar, Star, MessageSquare, TrendingUp,
  CheckCircle, Clock, Eye, EyeOff, Bell, AlertTriangle,
  ChevronRight, Loader2, Check, X
} from 'lucide-react'
import Header from '@/components/layout/Header'

const TABS = ['Overview', 'Verifications', 'Bookings', 'Reviews', 'Broadcast', 'Users']

function StatCard({ label, value, sub, color = 'text-stone-100', icon: Icon }: any) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-stone-600" />}
      </div>
      <p className={`text-3xl font-light ${color}`}>{value}</p>
      {sub && <p className="text-xs text-stone-600 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [analytics, setAnalytics] = useState<any>(null)
  const [verifications, setVerifications] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Broadcast form
  const [broadcast, setBroadcast] = useState({ title: '', body: '', targetRole: 'ALL', link: '' })
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [analyticsRes, verificationsRes, usersRes] = await Promise.all([
          fetch('/api/admin/analytics').then(r => r.json()),
          fetch('/api/admin/verifications').then(r => r.json()),
          fetch('/api/admin/users').then(r => r.json()),
        ])
        if (analyticsRes.success) setAnalytics(analyticsRes.data)
        if (verificationsRes.success) setVerifications(verificationsRes.data)
        if (usersRes.success) setUsers(usersRes.data)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const loadBookings = async () => {
    const res = await fetch('/api/admin/bookings').then(r => r.json())
    if (res.success) setBookings(res.data)
  }

  const loadReviews = async () => {
    const res = await fetch('/api/admin/reviews').then(r => r.json())
    if (res.success) setReviews(res.data)
  }

  useEffect(() => {
    if (tab === 'Bookings' && bookings.length === 0) loadBookings()
    if (tab === 'Reviews' && reviews.length === 0) loadReviews()
  }, [tab])

  const handleVerification = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await fetch(`/api/admin/verifications/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    })
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status } : v))
  }

  const toggleReview = async (id: string, isVisible: boolean) => {
    await fetch('/api/admin/reviews', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isVisible })
    })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isVisible } : r))
  }

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setBroadcasting(true)
    setBroadcastMsg('')
    const res = await fetch('/api/admin/notifications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(broadcast)
    })
    const data = await res.json()
    if (data.success) {
      setBroadcastMsg(`✓ Sent to ${data.data.sent} users`)
      setBroadcast({ title: '', body: '', targetRole: 'ALL', link: '' })
    } else {
      setBroadcastMsg(`Error: ${data.error}`)
    }
    setBroadcasting(false)
  }

  const STATUS_COLOR: Record<string, string> = {
    PENDING: 'text-amber-400 bg-amber-900/30',
    APPROVED: 'text-emerald-400 bg-emerald-900/30',
    REJECTED: 'text-red-400 bg-red-900/30',
    ACCEPTED: 'text-emerald-400 bg-emerald-900/30',
    CANCELLED: 'text-stone-400 bg-stone-800',
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-stone-800 bg-stone-900 p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-stone-800 text-stone-100' : 'text-stone-500 hover:text-stone-300'}`}>
              {t}
              {t === 'Verifications' && analytics?.verifications?.pending > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-700 px-1.5 py-0.5 text-xs text-white">{analytics.verifications.pending}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'Overview' && analytics && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Total Users" value={analytics.users.total} icon={Users}
                    sub={`+${analytics.users.newThisMonth} this month`} />
                  <StatCard label="Total Bookings" value={analytics.bookings.total} icon={Calendar}
                    sub={`${analytics.bookings.pending} pending`} color="text-amber-400" />
                  <StatCard label="Reviews" value={analytics.reviews.total} icon={Star}
                    sub={`${analytics.reviews.avgRating} avg rating`} color="text-amber-400" />
                  <StatCard label="Messages Sent" value={analytics.messages.total} icon={MessageSquare} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Models" value={analytics.users.models}
                    sub={`${analytics.premium.models} premium`} />
                  <StatCard label="Agencies" value={analytics.users.agencies}
                    sub={`${analytics.premium.agencies} premium`} />
                  <StatCard label="Guests / Clients" value={analytics.users.guests} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-stone-500 mb-3">Booking Breakdown</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Pending', value: analytics.bookings.pending, color: 'bg-amber-600' },
                        { label: 'Accepted', value: analytics.bookings.accepted, color: 'bg-emerald-600' },
                        { label: 'Other', value: analytics.bookings.total - analytics.bookings.pending - analytics.bookings.accepted, color: 'bg-stone-600' },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs text-stone-500 mb-1">
                            <span>{item.label}</span><span>{item.value}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-stone-800">
                            <div className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${analytics.bookings.total > 0 ? (item.value / analytics.bookings.total) * 100 : 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-stone-500 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Pending Verifications', value: analytics.verifications.pending, tab: 'Verifications', color: 'text-amber-400' },
                        { label: 'Pending Bookings', value: analytics.bookings.pending, tab: 'Bookings', color: 'text-amber-400' },
                        { label: 'Total Reviews', value: analytics.reviews.total, tab: 'Reviews', color: 'text-stone-400' },
                      ].map(item => (
                        <button key={item.label} onClick={() => setTab(item.tab)}
                          className="flex w-full items-center justify-between rounded-lg border border-stone-800 px-3 py-2 text-sm hover:border-stone-700 transition-colors">
                          <span className="text-stone-400">{item.label}</span>
                          <span className={`font-medium ${item.color}`}>{item.value} <ChevronRight className="inline h-3 w-3" /></span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VERIFICATIONS */}
            {tab === 'Verifications' && (
              <div className="space-y-3">
                <div className="mb-4 rounded-xl border border-amber-900/30 bg-amber-950/10 px-4 py-3 text-sm text-amber-400">
                  New model profiles require admin approval. Users are notified their profile is pending review (2–24 hours).
                </div>
                {verifications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-700 py-16 text-center">
                    <CheckCircle className="mx-auto h-10 w-10 text-stone-700 mb-3" />
                    <p className="text-stone-400">No pending verifications</p>
                  </div>
                ) : verifications.map(v => (
                  <div key={v.id} className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-stone-200">{v.profile?.displayName || v.user?.email}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[v.status] || 'text-stone-400 bg-stone-800'}`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{v.user?.email}</p>
                        {v.documentUrl && (
                          <a href={v.documentUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-amber-500 hover:text-amber-400">View document →</a>
                        )}
                        <p className="text-xs text-stone-600 mt-1">Submitted {new Date(v.createdAt).toLocaleDateString()}</p>
                      </div>
                      {v.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleVerification(v.id, 'APPROVED')}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-900/30 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-900/50">
                            <Check className="h-4 w-4" /> Approve
                          </button>
                          <button onClick={() => handleVerification(v.id, 'REJECTED')}
                            className="flex items-center gap-1.5 rounded-lg bg-red-900/20 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/40">
                            <X className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BOOKINGS */}
            {tab === 'Bookings' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-600 mb-2">{bookings.length} total bookings sitewide</p>
                {bookings.map(b => (
                  <div key={b.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-200">{b.contactName}</p>
                          <span className="text-stone-600">→</span>
                          <p className="text-stone-300">{b.profile?.displayName}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[b.status] || 'text-stone-400 bg-stone-800'}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                          <span>{new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {b.startTime && <span>at {b.startTime}</span>}
                          <span>{b.duration}h</span>
                          <span>{b.contactEmail}</span>
                          {b.contactPhone && <span>{b.contactPhone}</span>}
                        </div>
                        {b.message && <p className="mt-1 text-xs text-stone-500 italic">"{b.message}"</p>}
                        <p className="text-xs text-stone-700 mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                      </div>
                      {b.review && (
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= b.review.rating ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* REVIEWS */}
            {tab === 'Reviews' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-600 mb-2">{reviews.length} total reviews</p>
                {reviews.map(r => (
                  <div key={r.id} className={`rounded-xl border p-4 ${r.isVisible ? 'border-stone-800 bg-stone-900' : 'border-stone-800/50 bg-stone-900/40 opacity-60'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-stone-200">{r.user?.name || r.user?.email}</p>
                          <span className="text-stone-600">→</span>
                          <p className="text-sm text-stone-300">{r.profile?.displayName}</p>
                          <div className="flex">
                            {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />)}
                          </div>
                          {!r.isVisible && <span className="text-xs text-red-400 bg-red-950/30 rounded px-1.5 py-0.5">Hidden</span>}
                        </div>
                        <p className="mt-1 text-sm text-stone-400">{r.content}</p>
                        <p className="text-xs text-stone-600 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => toggleReview(r.id, !r.isVisible)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${r.isVisible ? 'bg-stone-800 text-stone-400 hover:bg-red-950/30 hover:text-red-400' : 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50'}`}>
                        {r.isVisible ? <><EyeOff className="h-3.5 w-3.5" /> Hide</> : <><Eye className="h-3.5 w-3.5" /> Show</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BROADCAST */}
            {tab === 'Broadcast' && (
              <div className="max-w-xl">
                <div className="mb-4 rounded-xl border border-stone-800 bg-stone-900/50 px-4 py-3 text-sm text-stone-400">
                  Send a custom notification to all users or a specific group. This will appear in their notification bell.
                </div>
                {broadcastMsg && (
                  <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${broadcastMsg.startsWith('✓') ? 'bg-emerald-950/30 border border-emerald-900 text-emerald-400' : 'bg-red-950 border border-red-900 text-red-400'}`}>
                    {broadcastMsg}
                  </div>
                )}
                <form onSubmit={sendBroadcast} className="space-y-4 rounded-2xl border border-stone-800 bg-stone-900 p-6">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400">Send To</label>
                    <select value={broadcast.targetRole} onChange={e => setBroadcast(p => ({ ...p, targetRole: e.target.value }))}
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                      <option value="ALL">All Users</option>
                      <option value="MODEL">Models Only</option>
                      <option value="AGENCY">Agencies Only</option>
                      <option value="GUEST">Guests / Clients Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400">Notification Title</label>
                    <input value={broadcast.title} onChange={e => setBroadcast(p => ({ ...p, title: e.target.value }))} required
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                      placeholder="e.g. New Feature Available" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400">Message</label>
                    <textarea value={broadcast.body} onChange={e => setBroadcast(p => ({ ...p, body: e.target.value }))} required rows={4}
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none"
                      placeholder="Your message to users..." />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400">Link (optional)</label>
                    <input value={broadcast.link} onChange={e => setBroadcast(p => ({ ...p, link: e.target.value }))}
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                      placeholder="/dashboard or https://..." />
                  </div>
                  <button type="submit" disabled={broadcasting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                    {broadcasting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Bell className="h-4 w-4" /> Send Notification</>}
                  </button>
                </form>
              </div>
            )}

            {/* USERS */}
            {tab === 'Users' && (
              <div className="space-y-2">
                <p className="text-xs text-stone-600 mb-3">{users.length} total users</p>
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-stone-200">{u.name || u.profile?.displayName || u.agency?.name || '—'}</p>
                      <p className="text-xs text-stone-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-red-900/30 text-red-400' :
                        u.role === 'MODEL' ? 'bg-blue-900/30 text-blue-400' :
                        u.role === 'AGENCY' ? 'bg-amber-900/30 text-amber-400' :
                        'bg-stone-800 text-stone-400'
                      }`}>{u.role}</span>
                      <span className="text-xs text-stone-600">{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
