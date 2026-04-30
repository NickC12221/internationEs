'use client'
// src/app/admin/users/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Shield } from 'lucide-react'
import Header from '@/components/layout/Header'

interface UserAdmin {
  id: string
  email: string
  role: string
  createdAt: string
  profile: {
    displayName: string
    country: string
    city: string
    listingTier: string
    isVerified: boolean
    isActive: boolean
  } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = async (p = 1, s = search) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), pageSize: '20' })
    if (s) params.set('search', s)
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    if (data.success) {
      setUsers(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(p)
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(1, search)
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
            User Accounts
          </h1>
          <span className="ml-auto text-sm text-stone-500">{total} total</span>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full rounded-lg border border-stone-800 bg-stone-900 py-2 pl-9 pr-4 text-sm text-stone-200 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
            />
          </div>
        </form>

        <div className="rounded-xl border border-stone-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-800 bg-stone-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Profile</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-stone-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 bg-stone-950">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-8 rounded bg-stone-900 animate-pulse" />
                      </td>
                    </tr>
                  ))
                : users.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-stone-300">{u.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.profile ? (
                          <div>
                            <p className="text-stone-200">{u.profile.displayName}</p>
                            <p className="text-xs text-stone-500">{u.profile.city}, {u.profile.country}</p>
                          </div>
                        ) : (
                          <span className="text-stone-600">No profile</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-900/50 text-amber-400'
                            : 'bg-stone-800 text-stone-400'
                        }`}>
                          {u.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => fetchUsers(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-stone-800 px-4 py-2 text-sm text-stone-400 disabled:opacity-40 hover:border-stone-600"
            >
              Previous
            </button>
            <span className="text-sm text-stone-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => fetchUsers(page + 1)}
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
