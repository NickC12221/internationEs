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

  const fetchProfiles = useCallback(
    async (currentPage = 1, availabilityFilter = availability) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (initialFilters.countryCode) params.set('countryCode', initialFilters.countryCode)
        if (initialFilters.citySlug) params.set('citySlug', initialFilters.citySlug)
        if (initialFilters.search) params.set('search', initialFilters.search)
        if (availabilityFilter) params.set('availability', availabilityFilter)
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
    [initialFilters, availability]
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

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-400 hover:border-stone-700 hover:text-stone-100 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:block">
              {availability ? AVAILABILITY_OPTIONS.find((o) => o.value === availability)?.label : 'Filter'}
            </span>
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-stone-800 bg-stone-900 py-1 shadow-xl z-10">
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-stone-500">
                Availability
              </p>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAvailabilityChange(opt.value)}
                  className={`flex w-full items-center px-3 py-2 text-sm transition-colors ${
                    availability === opt.value
                      ? 'text-amber-400'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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
