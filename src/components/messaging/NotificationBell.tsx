'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetch_notifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data)
        setUnread(data.unreadCount)
      }
    } catch {}
  }

  useEffect(() => {
    fetch_notifications()
    const interval = setInterval(fetch_notifications, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const typeIcon: Record<string, string> = {
    new_message: '💬',
    new_booking: '📅',
    booking_accepted: '✅',
    booking_rejected: '❌',
    booking_update: '📋',
    new_review: '⭐',
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead() }}
        className="relative flex items-center justify-center rounded-full p-2 text-stone-400 hover:text-stone-100 transition-colors">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-stone-800 bg-stone-900 shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
            <h3 className="text-sm font-medium text-stone-200">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-amber-500 hover:text-amber-400">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-stone-600">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-stone-800/50 last:border-0 ${!n.isRead ? 'bg-stone-800/40' : ''}`}>
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon[n.type] || '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-stone-200">{n.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.body}</p>
                    {n.link && (
                      <Link href={n.link} className="text-xs text-amber-600 hover:text-amber-400 mt-1 block" onClick={() => setOpen(false)}>
                        View →
                      </Link>
                    )}
                  </div>
                  {!n.isRead && <div className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0 mt-1" />}
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-stone-800">
            <Link href="/dashboard/inbox" className="block text-center text-xs text-stone-500 hover:text-stone-300" onClick={() => setOpen(false)}>
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
