'use client'
// src/components/model/ModelCard.tsx
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, CheckCircle, Star, MapPin } from 'lucide-react'
import { cn, getAvailabilityColor, getAvailabilityLabel } from '@/lib/utils'
import type { PublicProfile } from '@/types'

interface ModelCardProps {
  profile: PublicProfile
  onFavoriteToggle?: (profileId: string, isFavorited: boolean) => void
}

export default function ModelCard({ profile, onFavoriteToggle }: ModelCardProps) {
  const [isFavorited, setIsFavorited] = useState(profile.isFavorited || false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const profileUrl = `/${profile.countryCode.toLowerCase()}/${profile.citySlug}/${profile.slug}`
  const mainImage = profile.images.find((img) => img.isMain) || profile.images[0]
  const imageUrl = profile.profileImageUrl || mainImage?.url

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (favoriteLoading) return
    setFavoriteLoading(true)

    try {
      const method = isFavorited ? 'DELETE' : 'POST'
      const res = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id }),
      })

      if (res.ok) {
        const newFavorited = !isFavorited
        setIsFavorited(newFavorited)
        onFavoriteToggle?.(profile.id, newFavorited)
      } else if (res.status === 401) {
        window.location.href = '/login'
      }
    } catch {
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <Link href={profileUrl} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-stone-900 transition-transform duration-300 group-hover:-translate-y-1">
        {/* Image */}
        <div className="aspect-portrait relative overflow-hidden bg-stone-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={profile.displayName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-stone-700">
                <div className="text-4xl font-display">{profile.displayName[0]}</div>
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="card-gradient absolute inset-x-0 bottom-0 h-2/3" />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {profile.listingTier === 'PREMIUM' && (
              <span className="flex items-center gap-1 rounded-full bg-amber-900/90 px-2 py-0.5 text-xs font-medium text-amber-300 backdrop-blur-sm">
                <Star className="h-3 w-3 fill-current" />
                Premium
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className={cn(
              'absolute right-2 top-2 rounded-full p-1.5 backdrop-blur-sm transition-colors',
              isFavorited
                ? 'bg-red-900/80 text-red-400'
                : 'bg-stone-900/60 text-stone-400 hover:bg-stone-900/80 hover:text-red-400'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorited && 'fill-current')} />
          </button>

          {/* Info overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="flex items-end justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-sm font-medium text-stone-100">
                    {profile.displayName}
                  </h3>
                  {profile.isVerified && (
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-400">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.city}</span>
                  {profile.age && <span>· {profile.age}</span>}
                </div>
              </div>
              <div
                className={cn(
                  'flex-shrink-0 rounded-full px-2 py-0.5 text-xs',
                  profile.availability === 'AVAILABLE' && 'bg-emerald-900/50 text-emerald-400',
                  profile.availability === 'UNAVAILABLE' && 'bg-red-900/50 text-red-400',
                  profile.availability === 'TRAVELING' && 'bg-amber-900/50 text-amber-400',
                  profile.availability === 'BUSY' && 'bg-orange-900/50 text-orange-400',
                )}
              >
                {getAvailabilityLabel(profile.availability)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
