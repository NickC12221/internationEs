'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Users } from 'lucide-react'

interface PremiumAgency {
  id: string
  name: string
  slug: string
  city: string
  logoUrl: string | null
  bio: string | null
  _count: { models: number }
}

interface Props {
  countryCode: string
  citySlug: string
}

export default function PremiumAgencySidebar({ countryCode, citySlug }: Props) {
  const [agencies, setAgencies] = useState<PremiumAgency[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agencies?countryCode=${countryCode}&citySlug=${citySlug}&premiumOnly=true&pageSize=10`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setAgencies(data.data)
        setLoading(false)
      })
  }, [countryCode, citySlug])

  if (loading || agencies.length === 0) return null

  return (
    <div className="w-56 flex-shrink-0">
      <div className="sticky top-24">
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-current" />
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Featured Agencies
          </span>
        </div>
        <div className="space-y-3">
          {agencies.map(agency => (
            <Link
              key={agency.id}
              href={`/agencies/${agency.slug}`}
              className="block rounded-xl border border-amber-900/40 bg-amber-950/10 p-3 transition-colors hover:border-amber-700"
            >
              <div className="flex items-center gap-2.5">
                {agency.logoUrl ? (
                  <img src={agency.logoUrl} alt={agency.name} className="h-9 w-9 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-stone-800 text-sm font-medium text-amber-500">
                    {agency.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-200 truncate">{agency.name}</p>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <Users className="h-3 w-3" />
                    <span>{agency._count.models} models</span>
                  </div>
                </div>
              </div>
              {agency.bio && (
                <p className="mt-2 text-xs text-stone-500 line-clamp-2">{agency.bio}</p>
              )}
              <p className="mt-2 text-xs text-amber-600">View agency →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
