'use client'
// src/components/model/ModelGrid.tsx
import { useState, useEffect, useCallback } from 'react'
import { Filter, SlidersHorizontal } from 'lucide-react'
import ModelCard from './ModelCard'
import type { PublicProfile, ProfileFilters } from '@/types'

interface ModelGridProps {
  initialFilters?: ProfileFilters
  title?: string
  pageSize?: number
}

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'TRAVELING', label: 'Traveling' },
  { value: 'BUSY', label: 'Busy' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
]

export default function ModelGrid({ initialFilters = {}, title, pageSize = 32 }: ModelGridProps) {
  const [profiles, setProfiles] = useState<PublicProfile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availability, setAvailability] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [ethnicity, setEthnicity] = useState('')
  const [nationality, setNationality] = useState('')
  const [build, setBuild] = useState('')
  const [incall, setIncall] = useState(false)
  const [outcall, setOutcall] = useState(false)
  const [travel, setTravel] = useState(false)
  const [height, setHeight] = useState('')
  const [hairColor, setHairColor] = useState('')
  const [eyeColor, setEyeColor] = useState('')

  const fetchProfiles = useCallback(
    async (currentPage = 1, availabilityFilter = availability) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (initialFilters.countryCode) params.set('countryCode', initialFilters.countryCode)
        if (initialFilters.citySlug) params.set('citySlug', initialFilters.citySlug)
        if (initialFilters.search) params.set('search', initialFilters.search)
        if (availabilityFilter) params.set('availability', availabilityFilter)
        if (ethnicity) params.set('ethnicity', ethnicity)
        if (nationality) params.set('nationality', nationality)
        if (build) params.set('build', build)
        if (incall) params.set('incall', 'true')
        if (outcall) params.set('outcall', 'true')
        if (travel) params.set('travel', 'true')
        params.set('page', currentPage.toString())
        params.set('pageSize', pageSize.toString())

        const res = await fetch(`/api/profiles?${params}`)
        const data = await res.json()

        if (data.success) {
          if (currentPage === 1) {
            setProfiles(data.data)
          } else {
            setProfiles(prev => [...prev, ...data.data])
          }
          setTotal(data.total)
          setTotalPages(data.totalPages)
          setPage(currentPage)
        }
      } catch {
      } finally {
        setLoading(false)
      }
    },
    [initialFilters, availability, ethnicity, nationality, build, incall, outcall, travel]
  )

  useEffect(() => {
    fetchProfiles(1, availability)
  }, [initialFilters.countryCode, initialFilters.citySlug, initialFilters.search])

  const handleAvailabilityChange = (value: string) => {
    setAvailability(value)
    fetchProfiles(1, value)
    setFilterOpen(false)
  }

  const skeletonCards = [...Array(12)].map((_, i) => (
    <div key={i} className="aspect-portrait rounded-xl bg-stone-900 animate-pulse" />
  ))

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {title && (
            <h1
              className="text-2xl font-light text-stone-100"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {title}
            </h1>
          )}
          {!loading && (
            <p className="mt-1 text-sm text-stone-500">
              {total} {total === 1 ? 'model' : 'models'} found
            </p>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
            filterOpen || ethnicity || build || nationality || incall || outcall || travel || availability
              ? 'border-amber-700 bg-amber-950/20 text-amber-400'
              : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:block">Filters{(ethnicity || build || nationality || incall || outcall || travel || availability) ? ' •' : ''}</span>
        </button>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="mb-6 rounded-xl border border-stone-800 bg-stone-900 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Availability status */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Status</label>
              <select value={availability} onChange={e => { setAvailability(e.target.value); fetchProfiles(1); }}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                <option value="">Any status</option>
                {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Ethnicity */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Ethnicity</label>
              <select value={ethnicity} onChange={e => { setEthnicity(e.target.value); fetchProfiles(1); }}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                <option value="">Any ethnicity</option>
                {['Caucasian','Latin','Asian','African','Middle Eastern','Mixed','Other'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Build */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Build</label>
              <select value={build} onChange={e => { setBuild(e.target.value); fetchProfiles(1); }}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                <option value="">Any build</option>
                {['Slim','Athletic','Average','Curvy','BBW','Petite','Tall'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Eye colour */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Eye Colour</label>
              <select value={eyeColor} onChange={e => { setEyeColor(e.target.value); fetchProfiles(1); }}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                <option value="">Any eyes</option>
                {['Blue','Green','Brown','Hazel','Grey','Other'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Nationality */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Nationality</label>
              <input value={nationality} onChange={e => setNationality(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchProfiles(1)}
                onBlur={() => fetchProfiles(1)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                placeholder="e.g. Brazilian, Russian..." />
            </div>

            {/* Service type */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Service Type</label>
              <div className="flex flex-wrap gap-2">
                {[['incall', 'Incall', incall, setIncall], ['outcall', 'Outcall', outcall, setOutcall], ['travel', 'Travel Available', travel, setTravel]].map(([key, label, val, setter]: any) => (
                  <button key={key} type="button"
                    onClick={() => { setter(!val); fetchProfiles(1); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${val ? 'border-amber-700 bg-amber-900/30 text-amber-400' : 'border-stone-700 text-stone-400 hover:border-stone-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear filters */}
          {(ethnicity || build || nationality || incall || outcall || travel || availability) && (
            <div className="mt-4 border-t border-stone-800 pt-4">
              <button onClick={() => {
                setAvailability(''); setEthnicity(''); setBuild(''); setNationality('');
                setIncall(false); setOutcall(false); setTravel(false);
                fetchProfiles(1);
              }} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">
                ✕ Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {skeletonCards}
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p
            className="text-4xl font-light text-stone-600"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            No models found
          </p>
          <p className="mt-2 text-sm text-stone-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {profiles.map((profile) => (
            <ModelCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => fetchProfiles(page - 1)}
            disabled={page === 1}
            className="rounded-lg border border-stone-800 bg-stone-900 px-4 py-2 text-sm text-stone-400 disabled:opacity-40 hover:border-stone-700 hover:text-stone-100 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-stone-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchProfiles(page + 1)}
            disabled={page === totalPages}
            className="rounded-lg border border-stone-800 bg-stone-900 px-4 py-2 text-sm text-stone-400 disabled:opacity-40 hover:border-stone-700 hover:text-stone-100 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
