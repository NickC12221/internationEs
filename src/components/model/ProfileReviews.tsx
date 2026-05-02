'use client'
import { useState, useEffect } from 'react'
import { Star, CheckCircle } from 'lucide-react'

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
  user: { name: string | null; profile: { displayName: string } | null }
}

interface Props {
  profileId: string
}

export default function ProfileReviews({ profileId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reviews?profileId=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setReviews(d.data)
          setAvgRating(d.averageRating)
        }
      })
      .finally(() => setLoading(false))
  }, [profileId])

  if (loading || reviews.length === 0) return null

  return (
    <div className="mt-10 border-t border-stone-800 pt-8">
      {/* Rating summary */}
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Reviews
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />
            ))}
          </div>
          <span className="text-sm text-stone-400">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-sm text-stone-600">
            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map(review => {
          const name = review.user.profile?.displayName || review.user.name || 'Verified Client'
          return (
            <div key={review.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-xs font-medium text-stone-400 flex-shrink-0">
                    {name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-300">{name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />
                        ))}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="h-3 w-3" /> Verified Booking
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-600 flex-shrink-0">
                  {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <p className="mt-3 text-sm text-stone-400 leading-relaxed">{review.content}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
