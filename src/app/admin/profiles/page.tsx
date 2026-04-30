'use client'
// src/app/admin/profiles/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, Star, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import Header from '@/components/layout/Header'

interface ProfileAdmin {
  id: string
  displayName: string
  slug: string
  country: string
  city: string
  listingTier: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  profileImageUrl: string | null
  images: { url: string }[]
  user: { email: string }
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileAdmin[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProfiles = useCallback(
    async (p = page, s = search) => {
      setLoading(true)
      const params = new URLSearchParams({ page: String(p), pageSize: '20' })
      if (s) params.set('search', s)

      const res = await fetch(`/api/admin/profiles?${params}`)
      const data = await res.json()
      if (data.success) {
        setProfiles(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setPage(p)
      }
      setLoading(false)
    },
    [page, search]
  )

  useEffect(() => {
    fetchProfiles(1)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProfiles(1, search)
  }

  const updateProfile = async (profileId: string, updates: Record<string, unknown>) => {
    const res = await fetch('/api/admin/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, updates }),
    })
    const data = await res.json()
    if (data.success) {
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, ...updates } : p)))
    }
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" className="text-stone-500 hover:text-stone-300">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1
            className="text-2xl font-light text-stone-100"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Manage Profiles
          </h1>
          <span className="ml-auto text-sm text-stone-500">{total} total</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-stone-800 bg-stone-900 py-2 pl-9 pr-4 text-sm text-stone-200 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
            />
          </div>
        </form>

        {/* Table */}
        <div className="rounded-xl border border-stone-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-800 bg-stone-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Model</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Location</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-stone-500">Tier</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-stone-500">Verified</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-stone-500">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 bg-stone-950">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-8 rounded bg-stone-900 animate-pulse" />
                      </td>
                    </tr>
                  ))
                : profiles.map((p) => {
                    const img = p.profileImageUrl || p.images[0]?.url
                    return (
                      <tr key={p.id} className="hover:bg-stone-900/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                              {img && (
                                <Image src={img} alt={p.displayName} width={36} height={36} className="object-cover h-full w-full" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-stone-200">{p.displayName}</p>
                              <p className="text-xs text-stone-500">{p.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone-400">
                          {p.city}, {p.country}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              updateProfile(p.id, {
                                listingTier: p.listingTier === 'PREMIUM' ? 'FREE' : 'PREMIUM',
                                premiumExpiresAt: p.listingTier === 'FREE'
                                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                                  : null,
                              })
                            }
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                              p.listingTier === 'PREMIUM'
                                ? 'bg-amber-900/50 text-amber-400 hover:bg-amber-900'
                                : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                            }`}
                          >
                            <Star className="h-3 w-3" />
                            {p.listingTier}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => updateProfile(p.id, { isVerified: !p.isVerified })}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                              p.isVerified
                                ? 'bg-blue-900/50 text-blue-400 hover:bg-blue-900'
                                : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                            }`}
                          >
                            <CheckCircle className="h-3 w-3" />
                            {p.isVerified ? 'Yes' : 'No'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => updateProfile(p.id, { isActive: !p.isActive })}
                            className={p.isActive ? 'text-emerald-400' : 'text-red-400'}
                          >
                            {p.isActive
                              ? <ToggleRight className="h-5 w-5" />
                              : <ToggleLeft className="h-5 w-5" />
                            }
                          </button>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => fetchProfiles(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-stone-800 px-4 py-2 text-sm text-stone-400 disabled:opacity-40 hover:border-stone-600"
            >
              Previous
            </button>
            <span className="text-sm text-stone-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => fetchProfiles(page + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-stone-800 px-4 py-2 text-sm text-stone-400 disabled:opacity-40 hover:border-stone-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
