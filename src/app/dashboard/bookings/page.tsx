'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, Star, CheckCircle, XCircle, AlertCircle, Loader2, Mail, Phone, MessageSquare } from 'lucide-react'
import Header from '@/components/layout/Header'

interface GuestBooking {
  id: string
  date: string
  duration: number
  message: string | null
  contactName: string
  status: string
  createdAt: string
  profile: { displayName: string; profileImageUrl: string | null; slug: string; countryCode: string; citySlug: string }
  review: { id: string; rating: number } | null
}

interface ModelBooking {
  id: string
  date: string
  duration: number
  message: string | null
  contactName: string
  contactEmail: string
  contactPhone: string | null
  status: string
  createdAt: string
  guest: { name: string | null; email: string }
  review: { rating: number } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending review', color: 'text-amber-400 bg-amber-900/30', icon: AlertCircle },
  ACCEPTED: { label: 'Accepted', color: 'text-emerald-400 bg-emerald-900/30', icon: CheckCircle },
  REJECTED: { label: 'Declined', color: 'text-red-400 bg-red-900/30', icon: XCircle },
  COMPLETED: { label: 'Completed', color: 'text-blue-400 bg-blue-900/30', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-stone-400 bg-stone-800', icon: XCircle },
}

// ─── Model / Agency view ──────────────────────────────────────────────────────

function ModelBookingsView() {
  const [bookings, setBookings] = useState<ModelBooking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = () => {
    fetch('/api/bookings?role=model')
      .then(r => r.json())
      .then(d => { if (d.success) setBookings(d.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  const updateStatus = async (bookingId: string, status: string) => {
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>

  const pending = bookings.filter(b => b.status === 'PENDING')
  const others = bookings.filter(b => b.status !== 'PENDING')

  return (
    <div className="space-y-8">
      {/* Info note */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/50 px-4 py-3 flex items-start gap-3">
        <Star className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-400">
          Only bookings you <span className="text-emerald-400 font-medium">Accept</span> are eligible for verified client reviews on your profile.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-700 py-20 text-center">
          <Calendar className="mx-auto h-10 w-10 text-stone-700 mb-3" />
          <p className="text-stone-400">No booking requests yet</p>
          <p className="text-stone-600 text-sm mt-1">Requests from clients will appear here</p>
        </div>
      ) : (
        <>
          {/* Pending requests */}
          {pending.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-stone-500">
                Pending Requests ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(booking => (
                  <div key={booking.id} className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-200">{booking.contactName}</p>
                          <span className="flex items-center gap-1 rounded-full bg-amber-900/30 px-2.5 py-0.5 text-xs text-amber-400">
                            <AlertCircle className="h-3 w-3" /> Pending
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-stone-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />{booking.duration} hour{booking.duration !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {booking.message && (
                          <p className="mt-2 text-sm text-stone-400 leading-relaxed">{booking.message}</p>
                        )}
                        <div className="mt-3 space-y-1.5">
                          {booking.contactPhone && (
                            <a href={`tel:${booking.contactPhone}`} className="flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
                              <Phone className="h-4 w-4" />{booking.contactPhone}
                            </a>
                          )}
                          <a href={`mailto:${booking.contactEmail}`} className="flex items-center gap-2 text-xs text-stone-500 hover:text-amber-400 transition-colors">
                            <Mail className="h-3.5 w-3.5" />{booking.contactEmail}
                          </a>
                        </div>
                        <p className="mt-1 text-xs text-stone-600">Received {new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => updateStatus(booking.id, 'ACCEPTED')}
                          className="rounded-lg bg-emerald-900/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-900/50 transition-colors">
                          ✓ Accept
                        </button>
                        <button onClick={() => updateStatus(booking.id, 'REJECTED')}
                          className="rounded-lg bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 transition-colors">
                          ✗ Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past bookings */}
          {others.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-stone-500">
                Past Bookings ({others.length})
              </h2>
              <div className="space-y-3">
                {others.map(booking => {
                  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
                  const Icon = cfg.icon
                  return (
                    <div key={booking.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-stone-200">{booking.contactName}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>{booking.duration}h</span>
                            {booking.contactPhone && (
                              <a href={`tel:${booking.contactPhone}`} className="flex items-center gap-1 text-amber-500 hover:text-amber-400">
                                <Phone className="h-3.5 w-3.5" />{booking.contactPhone}
                              </a>
                            )}
                            <a href={`mailto:${booking.contactEmail}`} className="hover:text-amber-400">{booking.contactEmail}</a>
                          </div>
                          {booking.review && (
                            <div className="mt-1 flex items-center gap-1">
                              {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= booking.review!.rating ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />)}
                              <span className="text-xs text-stone-500 ml-1">Review left</span>
                            </div>
                          )}
                        </div>
                        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                          <Icon className="h-3.5 w-3.5" />{cfg.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Guest view ───────────────────────────────────────────────────────────────

function GuestBookingsView() {
  const [bookings, setBookings] = useState<GuestBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingBooking, setReviewingBooking] = useState<GuestBooking | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const fetchBookings = () => {
    fetch('/api/bookings?role=guest')
      .then(r => r.json())
      .then(d => { if (d.success) setBookings(d.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingBooking) return
    setSubmittingReview(true)
    setReviewError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: reviewingBooking.id, rating: reviewForm.rating, content: reviewForm.content })
    })
    const data = await res.json()
    if (data.success) {
      setReviewingBooking(null)
      setReviewForm({ rating: 5, content: '' })
      fetchBookings()
    } else {
      setReviewError(data.error)
    }
    setSubmittingReview(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>

  return (
    <>
      <div className="mb-4 rounded-xl border border-stone-800 bg-stone-900/50 px-4 py-3 flex items-start gap-3">
        <Star className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-400">
          You can leave a review for bookings that have been <span className="text-emerald-400 font-medium">accepted</span> by the model.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-700 py-20 text-center">
          <Calendar className="mx-auto h-10 w-10 text-stone-700 mb-3" />
          <p className="text-stone-400">No bookings yet</p>
          <p className="text-stone-600 text-sm mt-1">Browse models and click "Book" to make a booking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
            const Icon = cfg.icon
            const canReview = ['ACCEPTED', 'COMPLETED'].includes(booking.status) && !booking.review
            const profileUrl = `/${booking.profile.countryCode.toLowerCase()}/${booking.profile.citySlug}/${booking.profile.slug}`
            return (
              <div key={booking.id} className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                    {booking.profile.profileImageUrl
                      ? <Image src={booking.profile.profileImageUrl} alt={booking.profile.displayName} fill className="object-cover" />
                      : <div className="flex h-full items-center justify-center text-lg text-stone-600">{booking.profile.displayName[0]}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <Link href={profileUrl} className="font-medium text-stone-200 hover:text-amber-400 transition-colors">
                          {booking.profile.displayName}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{booking.duration}h</span>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                        <Icon className="h-3.5 w-3.5" />{cfg.label}
                      </span>
                    </div>
                    {booking.message && <p className="mt-2 text-xs text-stone-500 line-clamp-2">{booking.message}</p>}
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <p className="text-stone-600">Requested {new Date(booking.createdAt).toLocaleDateString()}</p>
                      {booking.review ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-current" /> Review submitted
                        </span>
                      ) : canReview ? (
                        <button onClick={() => setReviewingBooking(booking)}
                          className="text-amber-500 hover:text-amber-400 underline underline-offset-2">
                          Leave a review
                        </button>
                      ) : booking.status === 'PENDING' ? (
                        <span className="text-stone-600">Waiting for model to respond</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="mb-1 text-lg font-medium text-stone-200">Leave a Review</h2>
            <p className="mb-4 text-xs text-stone-500">Reviewing your booking with {reviewingBooking.profile.displayName}</p>
            {reviewError && <div className="mb-3 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{reviewError}</div>}
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-stone-400">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-amber-400' : 'text-stone-700'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-400">Your Review</label>
                <textarea value={reviewForm.content} onChange={e => setReviewForm(p => ({ ...p, content: e.target.value }))} required rows={4} minLength={20}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none"
                  placeholder="Share your experience..." />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submittingReview}
                  className="flex-1 rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => setReviewingBooking(null)}
                  className="flex-1 rounded-lg border border-stone-700 py-2.5 text-sm text-stone-400 hover:border-stone-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (d.success) setUserRole(d.data.role)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
    </div>
  )

  const isModel = userRole === 'MODEL'

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            {isModel ? 'Booking Requests' : 'My Bookings'}
          </h1>
        </div>
        {isModel ? <ModelBookingsView /> : <GuestBookingsView />}
      </div>
    </div>
  )
}
