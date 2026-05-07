'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Heart, MapPin, CheckCircle, Star } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/favorites')
      .then(r => r.json())
      .then(d => { if (d.success) setFavorites(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const removeFavorite = async (profileId: string) => {
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId })
    })
    setFavorites(prev => prev.filter(f => f.id !== profileId))
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Saved Escorts
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">{favorites.length} saved</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-stone-500">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-800 py-16 text-center">
            <Heart className="mx-auto h-10 w-10 text-stone-700 mb-4" />
            <p className="text-stone-400 font-medium">No saved escorts yet</p>
            <p className="text-stone-600 text-sm mt-1">Click the heart icon on any escort profile to save them here.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-amber-600 hover:text-amber-500">
              Browse escorts →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {favorites.map(profile => (
              <div key={profile.id} className="group relative rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden hover:border-stone-700 transition-colors">
                <Link href={`/${profile.countryCode?.toLowerCase()}/${profile.citySlug}/${profile.slug}`}>
                  <div className="relative aspect-[3/4] bg-stone-800 overflow-hidden">
                    {profile.profileImageUrl ? (
                      <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-stone-700">
                        {profile.displayName?.[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-base font-medium text-white">{profile.displayName}</p>
                        {profile.isVerified && <CheckCircle className="h-3.5 w-3.5 text-blue-400" />}
                        {profile.listingTier === 'PREMIUM' && <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-stone-300">
                        <MapPin className="h-3 w-3" />
                        <span>{profile.city}, {profile.country}</span>
                        {profile.age && <span>· {profile.age}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
                <button onClick={() => removeFavorite(profile.id)}
                  className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-stone-950/70 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950/50 transition-colors backdrop-blur-sm">
                  <Heart className="h-3.5 w-3.5 fill-current" /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
