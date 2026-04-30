'use client'
// src/app/admin/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, Star, CheckCircle, Clock, TrendingUp, Shield,
  ChevronRight, AlertTriangle
} from 'lucide-react'
import Header from '@/components/layout/Header'

interface Stats {
  totalUsers: number
  totalProfiles: number
  premiumProfiles: number
  verifiedProfiles: number
  pendingVerifications: number
  newThisMonth: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-6 w-6 text-amber-500" />
          <h1
            className="text-2xl font-light text-stone-100"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Admin Dashboard
          </h1>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers}
            icon={<Users className="h-5 w-5" />}
            loading={loading}
          />
          <StatCard
            label="Active Profiles"
            value={stats?.totalProfiles}
            icon={<Users className="h-5 w-5" />}
            loading={loading}
          />
          <StatCard
            label="Premium Listings"
            value={stats?.premiumProfiles}
            icon={<Star className="h-5 w-5" />}
            loading={loading}
            accent="amber"
          />
          <StatCard
            label="Verified Profiles"
            value={stats?.verifiedProfiles}
            icon={<CheckCircle className="h-5 w-5" />}
            loading={loading}
            accent="blue"
          />
          <StatCard
            label="Pending Verifications"
            value={stats?.pendingVerifications}
            icon={<Clock className="h-5 w-5" />}
            loading={loading}
            accent={stats?.pendingVerifications ? 'red' : undefined}
          />
          <StatCard
            label="New This Month"
            value={stats?.newThisMonth}
            icon={<TrendingUp className="h-5 w-5" />}
            loading={loading}
            accent="green"
          />
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">
            Management
          </h2>
          <div className="space-y-2">
            <AdminLink
              href="/admin/verifications"
              icon={<CheckCircle className="h-4 w-4" />}
              label="Review Verifications"
              desc={stats?.pendingVerifications ? `${stats.pendingVerifications} pending` : 'No pending requests'}
              alert={!!stats?.pendingVerifications}
            />
            <AdminLink
              href="/admin/profiles"
              icon={<Users className="h-4 w-4" />}
              label="Manage Profiles"
              desc="View, edit, upgrade or deactivate profiles"
            />
            <AdminLink
              href="/admin/users"
              icon={<Shield className="h-4 w-4" />}
              label="User Accounts"
              desc="Manage all registered users"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, loading, accent,
}: {
  label: string; value?: number; icon: React.ReactNode
  loading: boolean; accent?: 'amber' | 'blue' | 'green' | 'red'
}) {
  const accentColors = {
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
  }
  const color = accent ? accentColors[accent] : 'text-stone-300'

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
      <div className={`mb-3 ${color}`}>{icon}</div>
      <div className={`text-3xl font-light ${color}`}>
        {loading ? '—' : value?.toLocaleString()}
      </div>
      <div className="mt-1 text-xs text-stone-500">{label}</div>
    </div>
  )
}

function AdminLink({
  href, icon, label, desc, alert = false,
}: {
  href: string; icon: React.ReactNode; label: string; desc: string; alert?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-stone-800 bg-stone-900 px-4 py-3 transition-colors hover:border-amber-800 hover:bg-stone-800"
    >
      <span className={alert ? 'text-amber-400' : 'text-stone-500'}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-200">{label}</p>
        <p className={`text-xs ${alert ? 'text-amber-500' : 'text-stone-500'}`}>{desc}</p>
      </div>
      {alert && <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />}
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-600" />
    </Link>
  )
}
