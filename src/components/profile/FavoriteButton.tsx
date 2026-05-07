'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'

export default function FavoriteButton({ profileId, initialFavorited = false }: { profileId: string; initialFavorited?: boolean }) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: favorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      })
      if (res.status === 401) { window.location.href = '/login'; return }
      if (res.ok) setFavorited(!favorited)
    } catch {}
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
        favorited
          ? 'border-red-800 bg-red-950/30 text-red-400 hover:bg-red-950/50'
          : 'border-stone-700 bg-stone-900 text-stone-400 hover:border-red-800 hover:text-red-400'
      }`}>
      <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
      {favorited ? 'Saved' : 'Save'}
    </button>
  )
}
