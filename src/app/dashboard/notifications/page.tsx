'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, MessageSquare, Calendar, Star, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  new_message:      { icon: MessageSquare, color: 'text-blue-400',    bg: 'bg-blue-900/20' },
  new_booking:      { icon: Calendar,      color: 'text-amber-400',   bg: 'bg-amber-900/20' },
  booking_accepted: { icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
  booking_rejected: { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-900/20' },
  booking_update:   { icon: Calendar,      color: 'text-stone-400',   bg: 'bg-stone-800' },
  new_review:       { icon: Star,          color: 'text-amber-400',   bg: 'bg-amber-900/20' },
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => { if (!d.success) router.push('/login') })
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { if (d.success) setNotifications(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    setMarkingRead(true)
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setMarkingRead(false)
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const grouped: Record<string, Notification[]> = {}
  notifications.forEach(n => {
    const date = new Date(n.createdAt)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    const key = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(n)
  })

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-stone-500 hover:text-stone-300">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-amber-700 px-2 py-0.5 text-xs font-medium text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingRead}
              className="text-xs text-amber-500 hover:text-amber-400 transition-colors disabled:opacity-50">
              {markingRead ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 text-stone-600 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-700 py-20 text-center">
            <Bell className="mx-auto h-10 w-10 text-stone-700 mb-3" />
            <p className="text-stone-400">No notifications yet</p>
            <p className="text-stone-600 text-sm mt-1">Booking requests and messages will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-600">{date}</p>
                <div className="space-y-2">
                  {items.map(notif => {
                    const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.booking_update
                    const Icon = cfg.icon
                    const inner = (
                      <div className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                        !notif.isRead ? 'border-stone-700 bg-stone-900' : 'border-stone-800/50 bg-stone-900/40'
                      } ${notif.link ? 'hover:border-stone-600' : ''}`}>
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                          <Icon className={`h-5 w-5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${!notif.isRead ? 'text-stone-100' : 'text-stone-300'}`}>
                              {notif.title}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-stone-600">{timeAgo(notif.createdAt)}</span>
                              {!notif.isRead && <div className="h-2 w-2 rounded-full bg-amber-500" />}
                            </div>
                          </div>
                          <p className="text-sm text-stone-400 mt-0.5 leading-relaxed">{notif.body}</p>
                          {notif.link && (
                            <p className="text-xs text-amber-600 mt-1.5">
                              {notif.type === 'new_message' ? 'Open inbox →' :
                               notif.type === 'new_booking' ? 'View booking request →' :
                               notif.type.includes('booking') ? 'View booking →' : 'View →'}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                    return notif.link
                      ? <Link key={notif.id} href={notif.link}>{inner}</Link>
                      : <div key={notif.id}>{inner}</div>
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
