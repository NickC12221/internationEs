'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
  user: { name: string | null; profile: { displayName: string } | null }
  booking: { date: string; duration: number }
}

export default function ModelReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        // Get user first
        const userRes = await fetch('/api/user')
        const userData = await userRes.json()

        if (!userData.success) {
          setError('Not logged in')
          setLoading(false)
          return
        }

        const profileId = userData.data?.profile?.id

        if (!profileId) {
          setError('No profile found')
          setLoading(false)
          return
        }

        // Fetch reviews for this profile
        const reviewRes = await fetch(`/api/reviews?profileId=${profileId}`)
        const reviewData = await reviewRes.json()

        if (reviewData.success) {
          setReviews(reviewData.data || [])
          setAverageRating(reviewData.averageRating || 0)
        } else {
          setError(reviewData.error || 'Failed to load reviews')
        }
      } catch (e) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            My Reviews
          </h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-900 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 text-stone-600 animate-spin" />
          </div>
        ) : reviews.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-stone-700 py-20 text-center">
            <Star className="mx-auto h-10 w-10 text-stone-700 mb-3" />
            <p className="text-stone-400">No reviews yet</p>
            <p className="text-stone-600 text-sm mt-1">Reviews appear after clients complete verified bookings</p>
          </div>
        ) : reviews.length > 0 ? (
          <>
            {/* Summary */}
            <div className="mb-6 rounded-xl border border-stone-800 bg-stone-900 p-5 flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-light text-amber-400">{averageRating.toFixed(1)}</p>
                <div className="flex mt-1 justify-center">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />
                  ))}
                </div>
              </div>
              <div className="border-l border-stone-700 pl-6">
                <p className="text-2xl font-light text-stone-100">{reviews.length}</p>
                <p className="text-sm text-stone-500">{reviews.length === 1 ? 'review' : 'reviews'} received</p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map(review => {
                const name = review.user?.profile?.displayName || review.user?.name || 'Verified Client'
                return (
                  <div key={review.id} className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 text-sm font-medium text-stone-400 flex-shrink-0">
                          {name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-200">{name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />
                              ))}
                            </div>
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle className="h-3 w-3" /> Verified Booking
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-stone-600">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {review.booking && (
                          <p className="text-xs text-stone-600 mt-0.5">
                            {new Date(review.booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {review.booking.duration}h
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-stone-300 leading-relaxed">{review.content}</p>
                  </div>
                )
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
