'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, MapPin, Star, Users, Globe, ChevronDown, ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'

interface Agency {
  id: string
  name: string
  slug: string
  city: string
  country: string
  countryCode: string
  citySlug: string
  logoUrl: string | null
  isPremium: boolean
  bio: string | null
  website: string | null
  email: string | null
  _count: { models: number }
}

interface LocationGroup {
  country: string
  countryCode: string
  cities: { city: string; citySlug: string }[]
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [locations, setLocations] = useState<LocationGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load locations from agencies
    fetch('/api/agencies?pageSize=100')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAgencies(data.data)
          // Build location groups
          const map = new Map<string, LocationGroup>()
          for (const a of data.data) {
            if (!map.has(a.countryCode)) {
              map.set(a.countryCode, { country: a.country, countryCode: a.countryCode, cities: [] })
            }
            const entry = map.get(a.countryCode)!
            if (!entry.cities.find(c => c.citySlug === a.citySlug)) {
              entry.cities.push({ city: a.city, citySlug: a.citySlug })
            }
          }
          setLocations(Array.from(map.values()))
        }
        setLoading(false)
      })
  }, [])

  const filteredAgencies = agencies.filter(a => {
    if (selectedCountry && a.countryCode !== selectedCountry) return false
    if (selectedCity && a.citySlug !== selectedCity) return false
    return true
  })

  const toggleCountry = (code: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      {/* Hero */}
      <div className="border-b border-stone-900 bg-stone-950 px-4 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-amber-500" />
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-600">Agency Directory</p>
        </div>
        <h1 className="text-4xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Talent Agencies
        </h1>
        <p className="mt-2 text-sm text-stone-400">Discover professional model agencies worldwide</p>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-stone-500" />
                <span className="text-xs font-medium uppercase tracking-widest text-stone-500">Filter by Location</span>
              </div>

              <button
                onClick={() => { setSelectedCountry(''); setSelectedCity('') }}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${!selectedCountry ? 'bg-amber-900/30 text-amber-400' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100'}`}
              >
                All Countries
              </button>

              <div className="mt-2 space-y-0.5">
                {locations.map(loc => (
                  <div key={loc.countryCode}>
                    <button
                      onClick={() => { toggleCountry(loc.countryCode); setSelectedCountry(loc.countryCode); setSelectedCity('') }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${selectedCountry === loc.countryCode ? 'bg-amber-900/20 text-amber-300' : 'text-stone-300 hover:bg-stone-900'}`}
                    >
                      <span>{loc.country}</span>
                      {expanded.has(loc.countryCode) ? <ChevronDown className="h-3.5 w-3.5 text-stone-500" /> : <ChevronRight className="h-3.5 w-3.5 text-stone-500" />}
                    </button>
                    {expanded.has(loc.countryCode) && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l border-stone-800 pl-3">
                        {loc.cities.map(city => (
                          <button
                            key={city.citySlug}
                            onClick={() => { setSelectedCity(city.citySlug); setSelectedCountry(loc.countryCode) }}
                            className={`w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors ${selectedCity === city.citySlug ? 'bg-amber-900/30 text-amber-400' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'}`}
                          >
                            {city.city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Agency grid */}
          <div className="flex-1 min-w-0">
            <p className="mb-6 text-sm text-stone-500">{filteredAgencies.length} {filteredAgencies.length === 1 ? 'agency' : 'agencies'} found</p>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-stone-900 animate-pulse" />)}
              </div>
            ) : filteredAgencies.length === 0 ? (
              <div className="py-20 text-center text-stone-500">No agencies found in this location</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredAgencies.map(agency => (
                  <div key={agency.id} className={`rounded-xl border p-5 transition-all hover:-translate-y-0.5 ${agency.isPremium ? 'border-amber-900/50 bg-amber-950/10' : 'border-stone-800 bg-stone-900'}`}>
                    <div className="flex items-start gap-4">
                      {agency.logoUrl ? (
                        <img src={agency.logoUrl} alt={agency.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-stone-800 text-xl font-light text-stone-400">
                          {agency.name[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-stone-200 truncate">{agency.name}</h3>
                          {agency.isPremium && <Star className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 fill-current" />}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{agency.city}, {agency.country}</span>
                        </div>
                        {agency.bio && <p className="mt-2 text-xs text-stone-400 line-clamp-2">{agency.bio}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-stone-500">
                            <Users className="h-3.5 w-3.5" />
                            {agency._count.models} models
                          </span>
                          {agency.website && (
                            <a href={agency.website} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-amber-600 hover:text-amber-400">
                              Visit website →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
