'use client'
import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

interface Props {
  profileId: string
}

export default function ProfileRating({ profileId }: Props) {
  const [avgRating, setAvgRating] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetch(`/api/model-reviews?profileId=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setAvgRating(d.averageRating)
          setTotal(d.total)
        }
      })
  }, [profileId])

  if (total === 0) return null

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className="flex">
        {[1,2,3,4,5].map(s => (
          <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />
        ))}
      </div>
      <span className="text-xs text-stone-400">{avgRating.toFixed(1)}</span>
      <span className="text-xs text-stone-600">({total})</span>
    </div>
  )
}
