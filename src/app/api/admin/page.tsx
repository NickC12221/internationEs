'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield, Users, Calendar, Star, MessageSquare, Bell,
  CheckCircle, Eye, EyeOff, Loader2, Check, X,
  Send, CreditCard, ChevronRight, Flag, Headphones, AlertTriangle
} from 'lucide-react'
import Header from '@/components/layout/Header'

const TABS = ['Overview', 'Verifications', 'Bookings', 'Reviews', 'Inbox', 'Payments', 'Broadcast', 'Users']

function StatCard({ label, value, sub, color = 'text-stone-100', icon: Icon, onClick }: any) {
  return (
    <div onClick={onClick} className={`rounded-xl border border-stone-800 bg-stone-900 p-5 ${onClick ? 'cursor-pointer hover:border-stone-700 transition-colors' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-stone-600" />}
      </div>
      <p className={`text-3xl font-light ${color}`}>{value}</p>
      {sub && <p className="text-xs text-stone-600 mt-1">{sub}</p>}
    </div>
  )
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [analytics, setAnalytics] = useState<any>(null)
  const [verifications, setVerifications] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [payments, setPayments] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adminId, setAdminId] = useState<string>('')
  const router = useRouter()

  // Inbox state
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [inboxFilter, setInboxFilter] = useState<'all' | 'support' | 'report'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Broadcast state
  const [broadcast, setBroadcast] = useState({ title: '', body: '', targetRole: 'ALL', link: '' })
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (!d.success || d.data.role !== 'ADMIN') { router.push('/login'); return }
      setAdminId(d.data.id)
    })
    const load = async () => {
      setLoading(true)
      const [analyticsRes, verificationsRes, usersRes] = await Promise.all([
        fetch('/api/admin/analytics').then(r => r.json()),
        fetch('/api/admin/verifications').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
      ])
      if (analyticsRes.success) setAnalytics(analyticsRes.data)
      if (verificationsRes.success) setVerifications(verificationsRes.data)
      if (usersRes.success) setUsers(usersRes.data)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (tab === 'Bookings' && bookings.length === 0) fetch('/api/admin/bookings').then(r => r.json()).then(d => { if (d.success) setBookings(d.data) })
    if (tab === 'Reviews' && reviews.length === 0) fetch('/api/admin/reviews').then(r => r.json()).then(d => { if (d.success) setReviews(d.data) })
    if (tab === 'Inbox') fetch('/api/admin/messages').then(r => r.json()).then(d => { if (d.success) setConversations(d.data) })
    if (tab === 'Payments' && !payments) fetch('/api/admin/payments').then(r => r.json()).then(d => { if (d.success) setPayments(d.data) })
  }, [tab])

  const openConvo = async (id: string) => {
    setSelectedConvo(id)
    const res = await fetch(`/api/messages/${id}`)
    const data = await res.json()
    if (data.success) setMessages(data.data.messages)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    // Refresh conversations to clear unread
    fetch('/api/admin/messages').then(r => r.json()).then(d => { if (d.success) setConversations(d.data) })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConvo) return
    setSending(true)
    const res = await fetch(`/api/messages/${selectedConvo}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage.trim() })
    })
    const data = await res.json()
    if (data.success) { setMessages(prev => [...prev, data.data]); setNewMessage('') }
    setSending(false)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const handleVerification = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await fetch(`/api/admin/verifications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status } : v))
  }

  const toggleReview = async (id: string, isVisible: boolean) => {
    await fetch('/api/admin/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isVisible }) })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isVisible } : r))
  }

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setBroadcasting(true); setBroadcastMsg('')
    const res = await fetch('/api/admin/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(broadcast) })
    const data = await res.json()
    setBroadcastMsg(data.success ? `✓ Sent to ${data.data.sent} users` : `Error: ${data.error}`)
    if (data.success) setBroadcast({ title: '', body: '', targetRole: 'ALL', link: '' })
    setBroadcasting(false)
  }

  const messageUser = async (userId: string) => {
    const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientUserId: userId, initialMessage: 'Hi, this is Femme Directory admin.' }) })
    const data = await res.json()
    if (data.success) { setTab('Inbox'); setTimeout(() => openConvo(data.data.conversationId), 300) }
  }

  const STATUS_COLOR: Record<string, string> = {
    PENDING: 'text-amber-400 bg-amber-900/30',
    APPROVED: 'text-emerald-400 bg-emerald-900/30',
    REJECTED: 'text-red-400 bg-red-900/30',
    ACCEPTED: 'text-emerald-400 bg-emerald-900/30',
    CANCELLED: 'text-stone-400 bg-stone-800',
  }

  const filteredConvos = conversations.filter(c => {
    if (inboxFilter === 'support') return c.subject === 'support'
    if (inboxFilter === 'report') return c.subject === 'report'
    return true
  })

  const selectedConvoData = conversations.find(c => c.id === selectedConvo)
  const otherMember = selectedConvoData?.members.find((m: any) => m.userId !== adminId)?.user
  const getDisplayName = (user: any) => user?.profile?.displayName || user?.agency?.name || user?.name || user?.email || 'Unknown'

  const totalUnread = conversations.reduce((s: number, c: any) => s + (c._count?.messages || 0), 0)
  const supportUnread = conversations.filter(c => c.subject === 'support').reduce((s: number, c: any) => s + (c._count?.messages || 0), 0)
  const reportUnread = conversations.filter(c => c.subject === 'report').reduce((s: number, c: any) => s + (c._count?.messages || 0), 0)

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-stone-800 bg-stone-900 p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-stone-800 text-stone-100' : 'text-stone-500 hover:text-stone-300'}`}>
              {t}
              {t === 'Verifications' && analytics?.verifications?.pending > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-700 px-1.5 py-0.5 text-xs text-white">{analytics.verifications.pending}</span>
              )}
              {t === 'Inbox' && totalUnread > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-700 px-1.5 py-0.5 text-xs text-white">{totalUnread}</span>
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
                  <StatCard label="Total Users" value={analytics.users.total} icon={Users} sub={`+${analytics.users.newThisMonth} this month`} onClick={() => setTab('Users')} />
                  <StatCard label="Total Bookings" value={analytics.bookings.total} icon={Calendar} sub={`${analytics.bookings.pending} pending`} color="text-amber-400" onClick={() => setTab('Bookings')} />
                  <StatCard label="Reviews" value={analytics.reviews.total} icon={Star} sub={`${analytics.reviews.avgRating} avg rating`} color="text-amber-400" onClick={() => setTab('Reviews')} />
                  <StatCard label="Messages" value={analytics.messages.total} icon={MessageSquare} onClick={() => setTab('Inbox')} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Models" value={analytics.users.models} sub={`${analytics.premium.models} premium`} />
                  <StatCard label="Agencies" value={analytics.users.agencies} sub={`${analytics.premium.agencies} premium`} />
                  <StatCard label="Guests / Clients" value={analytics.users.guests} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-stone-500 mb-3">Booking Breakdown</h3>
                    {[
                      { label: 'Pending', value: analytics.bookings.pending, color: 'bg-amber-600' },
                      { label: 'Accepted', value: analytics.bookings.accepted, color: 'bg-emerald-600' },
                      { label: 'Other', value: analytics.bookings.total - analytics.bookings.pending - analytics.bookings.accepted, color: 'bg-stone-600' },
                    ].map(item => (
                      <div key={item.label} className="mb-2">
                        <div className="flex justify-between text-xs text-stone-500 mb-1"><span>{item.label}</span><span>{item.value}</span></div>
                        <div className="h-1.5 rounded-full bg-stone-800">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${analytics.bookings.total > 0 ? (item.value / analytics.bookings.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-stone-500 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Pending Verifications', value: analytics.verifications.pending, tab: 'Verifications', color: 'text-amber-400' },
                        { label: 'Pending Bookings', value: analytics.bookings.pending, tab: 'Bookings', color: 'text-amber-400' },
                        { label: 'Unread Messages', value: totalUnread, tab: 'Inbox', color: 'text-blue-400' },
                        { label: 'Premium Subscriptions', value: (analytics.premium.models || 0) + (analytics.premium.agencies || 0), tab: 'Payments', color: 'text-amber-400' },
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
                  All new model profiles require admin approval. Users are notified their profile is under review (2–24 hours).
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-200">{v.profile?.displayName || v.user?.email}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[v.status] || 'text-stone-400 bg-stone-800'}`}>{v.status}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{v.user?.email}</p>
                        {v.documentUrl && <a href={v.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-amber-500 hover:text-amber-400">View document →</a>}
                        <p className="text-xs text-stone-600 mt-1">Submitted {new Date(v.createdAt).toLocaleDateString()}</p>
                      </div>
                      {v.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleVerification(v.id, 'APPROVED')} className="flex items-center gap-1.5 rounded-lg bg-emerald-900/30 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-900/50"><Check className="h-4 w-4" /> Approve</button>
                          <button onClick={() => handleVerification(v.id, 'REJECTED')} className="flex items-center gap-1.5 rounded-lg bg-red-900/20 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/40"><X className="h-4 w-4" /> Reject</button>
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
                <p className="text-xs text-stone-600 mb-2">{bookings.length} total bookings</p>
                {bookings.map(b => (
                  <div key={b.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-200">{b.contactName}</p>
                          <span className="text-stone-600">→</span>
                          <p className="text-stone-300">{b.profile?.displayName}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[b.status] || 'text-stone-400 bg-stone-800'}`}>{b.status}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 flex-wrap">
                          <span>{new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {b.startTime && <span>at {b.startTime}</span>}
                          <span>{b.duration}h</span>
                          <span>{b.contactEmail}</span>
                          {b.contactPhone && <span>{b.contactPhone}</span>}
                        </div>
                        {b.message && <p className="mt-1 text-xs text-stone-500 italic">"{b.message}"</p>}
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
                          <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />)}</div>
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

            {/* INBOX */}
            {tab === 'Inbox' && (
              <div className="flex gap-0 rounded-2xl border border-stone-800 overflow-hidden" style={{ height: '72vh' }}>
                {/* Left - conversation list */}
                <div className="w-72 flex-shrink-0 border-r border-stone-800 bg-stone-900 flex flex-col">
                  {/* Filter tabs */}
                  <div className="flex border-b border-stone-800">
                    {([['all', 'All', totalUnread], ['support', 'Support', supportUnread], ['report', 'Reports', reportUnread]] as [string, string, number][]).map(([key, label, count]) => (
                      <button key={key} onClick={() => setInboxFilter(key as any)}
                        className={`flex-1 py-2.5 text-xs font-medium transition-colors ${inboxFilter === key ? 'bg-stone-800 text-stone-100' : 'text-stone-500 hover:text-stone-300'}`}>
                        {label}
                        {count > 0 && <span className="ml-1 rounded-full bg-red-700 px-1.5 py-0.5 text-white">{count}</span>}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredConvos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-stone-600">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p className="text-sm">No messages</p>
                      </div>
                    ) : filteredConvos.map(convo => {
                      const other = convo.members.find((m: any) => m.userId !== adminId)?.user
                      const hasUnread = convo._count?.messages > 0
                      const isReport = convo.subject === 'report'
                      return (
                        <button key={convo.id} onClick={() => openConvo(convo.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 border-b border-stone-800/50 text-left transition-colors ${selectedConvo === convo.id ? 'bg-stone-800' : 'hover:bg-stone-800/50'}`}>
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${isReport ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                            {isReport ? <Flag className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-stone-100' : 'text-stone-300'}`}>{getDisplayName(other)}</p>
                              {hasUnread && <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-stone-600 truncate">{isReport ? '🚨 Report' : '💬 Support'}</p>
                            {convo.messages[0] && <p className="text-xs text-stone-500 truncate mt-0.5">{convo.messages[0].content}</p>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Right - chat */}
                <div className="flex-1 flex flex-col bg-stone-950 min-w-0">
                  {!selectedConvo ? (
                    <div className="flex flex-col items-center justify-center h-full text-stone-600">
                      <MessageSquare className="h-12 w-12 mb-3" />
                      <p>Select a conversation</p>
                    </div>
                  ) : (
                    <>
                      <div className="px-5 py-3 border-b border-stone-800 bg-stone-900">
                        {otherMember && (
                          <div>
                            <p className="text-sm font-medium text-stone-200">{getDisplayName(otherMember)}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-stone-500">{otherMember.email}</p>
                              <span className="text-xs text-stone-600">· {otherMember.role}</span>
                              {selectedConvoData?.subject === 'report' && <span className="text-xs text-red-400 bg-red-950/30 rounded px-1.5 py-0.5">🚨 Report</span>}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        {messages.map(msg => {
                          const isAdmin = msg.senderId === adminId
                          return (
                            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${isAdmin ? 'bg-amber-700 text-white rounded-br-sm' : 'bg-stone-800 text-stone-200 rounded-bl-sm'}`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isAdmin ? 'text-amber-200' : 'text-stone-500'}`}>{timeAgo(msg.createdAt)}</p>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                      <form onSubmit={sendMessage} className="px-4 py-3 border-t border-stone-800 flex gap-2">
                        <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                          className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                          placeholder="Reply as Admin Support..." />
                        <button type="submit" disabled={sending || !newMessage.trim()}
                          className="flex items-center justify-center rounded-xl bg-amber-700 px-4 py-2.5 text-white hover:bg-amber-600 disabled:opacity-50">
                          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* PAYMENTS */}
            {tab === 'Payments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-stone-500">Premium Models ({payments?.profiles?.length || 0})</h2>
                  <div className="space-y-2">
                    {(!payments?.profiles || payments.profiles.length === 0) ? (
                      <p className="text-stone-600 text-sm">No premium models</p>
                    ) : payments.profiles.map((p: any) => {
                      const expired = p.premiumExpiresAt && new Date(p.premiumExpiresAt) < new Date()
                      return (
                        <div key={p.id} className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-stone-200">{p.displayName}</p>
                              <span className="text-xs text-amber-400">★ Premium</span>
                              {expired && <span className="text-xs text-red-400 bg-red-950/30 rounded px-1.5 py-0.5">Expired</span>}
                            </div>
                            <p className="text-xs text-stone-500">{p.user?.email}</p>
                            {p.premiumExpiresAt && (
                              <p className={`text-xs mt-0.5 ${expired ? 'text-red-400' : 'text-stone-500'}`}>
                                {expired ? 'Expired' : 'Expires'}: {new Date(p.premiumExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <button onClick={() => messageUser(p.user?.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors">
                            <MessageSquare className="h-3.5 w-3.5" /> Message
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-stone-500">Premium Agencies ({payments?.agencies?.length || 0})</h2>
                  <div className="space-y-2">
                    {(!payments?.agencies || payments.agencies.length === 0) ? (
                      <p className="text-stone-600 text-sm">No premium agencies</p>
                    ) : payments.agencies.map((a: any) => {
                      const expired = a.premiumExpiresAt && new Date(a.premiumExpiresAt) < new Date()
                      return (
                        <div key={a.id} className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-stone-200">{a.name}</p>
                              <span className="text-xs text-amber-400">★ Premium Agency</span>
                              {expired && <span className="text-xs text-red-400 bg-red-950/30 rounded px-1.5 py-0.5">Expired</span>}
                            </div>
                            <p className="text-xs text-stone-500">{a.user?.email}</p>
                            {a.premiumExpiresAt && (
                              <p className={`text-xs mt-0.5 ${expired ? 'text-red-400' : 'text-stone-500'}`}>
                                {expired ? 'Expired' : 'Expires'}: {new Date(a.premiumExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <button onClick={() => messageUser(a.user?.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors">
                            <MessageSquare className="h-3.5 w-3.5" /> Message
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* BROADCAST */}
            {tab === 'Broadcast' && (
              <div className="max-w-xl">
                <div className="mb-4 rounded-xl border border-stone-800 bg-stone-900/50 px-4 py-3 text-sm text-stone-400">
                  Send a custom notification to users. It will appear in their notification bell.
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
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="e.g. New Feature Available" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400">Message</label>
                    <textarea value={broadcast.body} onChange={e => setBroadcast(p => ({ ...p, body: e.target.value }))} required rows={4}
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none" placeholder="Your message..." />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400">Link (optional)</label>
                    <input value={broadcast.link} onChange={e => setBroadcast(p => ({ ...p, link: e.target.value }))}
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="/dashboard or https://..." />
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
                {users.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-stone-200">
                        {u.profile?.displayName || u.agency?.name || u.name || u.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-stone-500">{u.email}</p>
                      {u.profile?.city && <p className="text-xs text-stone-600">{u.profile.city}, {u.profile.country}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-red-900/30 text-red-400' :
                        u.role === 'MODEL' ? 'bg-blue-900/30 text-blue-400' :
                        u.role === 'AGENCY' ? 'bg-amber-900/30 text-amber-400' : 'bg-stone-800 text-stone-400'
                      }`}>{u.role}</span>
                      <button onClick={() => messageUser(u.id)}
                        className="rounded-lg border border-stone-700 px-2 py-1 text-xs text-stone-500 hover:border-amber-700 hover:text-amber-400 transition-colors">
                        Message
                      </button>
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
