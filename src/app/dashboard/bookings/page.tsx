'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, Star, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

interface Booking {
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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'text-amber-400 bg-amber-900/30', icon: AlertCircle },
  ACCEPTED: { label: 'Accepted', color: 'text-emerald-400 bg-emerald-900/30', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'text-red-400 bg-red-900/30', icon: XCircle },
  COMPLETED: { label: 'Completed', color: 'text-blue-400 bg-blue-900/30', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-stone-400 bg-stone-800', icon: XCircle },
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    fetch('/api/bookings?role=guest')
      .then(r => r.json())
      .then(d => { if (d.success) setBookings(d.data) })
      .finally(() => setLoading(false))
  }, [])

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
      // Refresh bookings
      const res2 = await fetch('/api/bookings?role=guest')
      const data2 = await res2.json()
      if (data2.success) setBookings(data2.data)
    } else {
      setReviewError(data.error)
    }
    setSubmittingReview(false)
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>My Bookings</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
        ) : bookings.length === 0 ? (
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
                      {booking.profile.profileImageUrl ? (
                        <Image src={booking.profile.profileImageUrl} alt={booking.profile.displayName} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg text-stone-600">{booking.profile.displayName[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
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
                      <div className="mt-3 flex items-center gap-3">
                        <p className="text-xs text-stone-600">Requested {new Date(booking.createdAt).toLocaleDateString()}</p>
                        {booking.review ? (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-current" /> Review submitted
                          </span>
                        ) : canReview && (
                          <button onClick={() => setReviewingBooking(booking)}
                            className="text-xs text-amber-500 hover:text-amber-400 underline underline-offset-2">
                            Leave a review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

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
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-amber-400' : 'text-stone-700'}`}>
                      ★
                    </button>
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
    </div>
  )
}
