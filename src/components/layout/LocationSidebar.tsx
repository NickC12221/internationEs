'use client'
// src/components/layout/LocationSidebar.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, MapPin, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CityEntry {
  city: string
  citySlug: string
  count: number
}

interface LocationGroup {
  country: string
  countryCode: string
  cities: CityEntry[]
  totalCount: number
}

export default function LocationSidebar() {
  const [locations, setLocations] = useState<LocationGroup[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setLocations(data.data)
          // Auto-expand country from current URL
          const parts = pathname.split('/').filter(Boolean)
          if (parts[0]) {
            setExpanded(new Set([parts[0].toUpperCase()]))
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleCountry = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  if (loading) {
    return (
      <aside className="w-56 flex-shrink-0 space-y-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-stone-900 animate-pulse" />
        ))}
      </aside>
    )
  }

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="h-4 w-4 text-stone-500" />
        <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
          Browse by Location
        </span>
      </div>

      {/* All models link */}
      <Link
        href="/"
        className={cn(
          'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
          pathname === '/'
            ? 'bg-amber-900/30 text-amber-400'
            : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100'
        )}
      >
        <span>All Countries</span>
      </Link>

      <div className="mt-2 space-y-0.5">
        {locations.map((loc) => {
          const isExpanded = expanded.has(loc.countryCode)
          const countryPath = `/${loc.countryCode.toLowerCase()}`
          const isCurrentCountry = pathname.startsWith(countryPath)

          return (
            <div key={loc.countryCode}>
              <button
                onClick={() => toggleCountry(loc.countryCode)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  isCurrentCountry
                    ? 'bg-amber-900/20 text-amber-300'
                    : 'text-stone-300 hover:bg-stone-900 hover:text-stone-100'
                )}
              >
                <span className="flex items-center gap-2 text-left">
                  <span className="font-medium">{loc.country}</span>
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs text-stone-500">{loc.totalCount}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-stone-500" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-stone-500" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-stone-800 pl-3">
                  {loc.cities.map((city) => {
                    const cityPath = `/${loc.countryCode.toLowerCase()}/${city.citySlug}`
                    const isCurrentCity = pathname === cityPath

                    return (
                      <Link
                        key={city.citySlug}
                        href={cityPath}
                        className={cn(
                          'flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors',
                          isCurrentCity
                            ? 'bg-amber-900/30 text-amber-400'
                            : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-stone-600" />
                          {city.city}
                        </span>
                        <span className="text-xs text-stone-600">{city.count}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
