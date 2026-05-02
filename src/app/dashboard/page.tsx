'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, Camera, CheckCircle, Star, MapPin,
  Instagram, Globe, Phone, Edit3, Calendar, MessageSquare,
  Settings, Building2
} from 'lucide-react'
import Header from '@/components/layout/Header'

const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available', color: 'text-emerald-400' },
  { value: 'TRAVELING', label: 'Traveling', color: 'text-amber-400' },
  { value: 'BUSY', label: 'Busy', color: 'text-orange-400' },
  { value: 'UNAVAILABLE', label: 'Unavailable', color: 'text-red-400' },
]

// ─── Guest Dashboard ────────────────────────────────────────────────────────

function GuestDashboard({ user }: { user: any }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Welcome{user.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/bookings"
          className="flex items-start gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-stone-700 transition-colors">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-900/30">
            <Calendar className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-medium text-stone-200">My Bookings</h3>
            <p className="text-sm text-stone-500 mt-0.5">View booking requests and their status</p>
          </div>
        </Link>

        <Link href="/dashboard/inbox"
          className="flex items-start gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-stone-700 transition-colors">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-800">
            <MessageSquare className="h-6 w-6 text-stone-400" />
          </div>
          <div>
            <h3 className="font-medium text-stone-200">Messages</h3>
            <p className="text-sm text-stone-500 mt-0.5">Chat with models and agencies</p>
          </div>
        </Link>

        <Link href="/"
          className="flex items-start gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-stone-700 transition-colors">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-800">
            <User className="h-6 w-6 text-stone-400" />
          </div>
          <div>
            <h3 className="font-medium text-stone-200">Browse Models</h3>
            <p className="text-sm text-stone-500 mt-0.5">Discover and book talent worldwide</p>
          </div>
        </Link>

        <Link href="/agencies"
          className="flex items-start gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-stone-700 transition-colors">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-800">
            <Building2 className="h-6 w-6 text-stone-400" />
          </div>
          <div>
            <h3 className="font-medium text-stone-200">Browse Agencies</h3>
            <p className="text-sm text-stone-500 mt-0.5">Find talent agencies near you</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

// ─── Model Dashboard ─────────────────────────────────────────────────────────

function ModelDashboard({ user }: { user: any }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    setForm({
      displayName: user.profile?.displayName || '',
      bio: user.profile?.bio || '',
      age: user.profile?.age || '',
      phone: user.profile?.phone || '',
      instagram: user.profile?.instagram || '',
      twitter: user.profile?.twitter || '',
      website: user.profile?.website || '',
      availability: user.profile?.availability || 'AVAILABLE',
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setEditing(false)
        setSaveMsg('Profile saved!')
        setTimeout(() => setSaveMsg(''), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const profile = user.profile
  const verification = user.verificationRequest
  const isPremium = profile?.listingTier === 'PREMIUM'
  const profileUrl = profile ? `/${profile.countryCode.toLowerCase()}/${profile.citySlug}/${profile.slug}` : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Status badges */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {isPremium && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" /> Premium Listing
          </span>
        )}
        {profile?.isVerified && (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-400">
            <CheckCircle className="h-3.5 w-3.5" /> Verified Model
          </span>
        )}
        {profileUrl && (
          <a href={profileUrl} target="_blank" rel="noopener noreferrer"
            className="ml-auto text-xs text-amber-600 hover:text-amber-400">View public profile →</a>
        )}
      </div>

      {/* Profile card */}
      <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-stone-800 flex items-center justify-center text-2xl text-stone-500">
              {profile?.profileImageUrl
                ? <img src={profile.profileImageUrl} className="h-full w-full object-cover" alt="" />
                : (profile?.displayName?.[0] || '?')}
            </div>
            <div>
              <h1 className="text-xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {profile?.displayName || user.email}
              </h1>
              {profile && (
                <div className="flex items-center gap-1 text-sm text-stone-500 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />{profile.city}, {profile.country}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-amber-700 hover:text-stone-200 transition-colors">
            <Edit3 className="h-3.5 w-3.5" /> {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {saveMsg && <div className="mb-3 rounded-lg bg-emerald-950 px-3 py-2 text-sm text-emerald-400">{saveMsg}</div>}

        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-stone-500">Display Name</label>
                <input value={form.displayName} onChange={e => setForm((p: any) => ({ ...p, displayName: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Age</label>
                <input type="number" value={form.age} onChange={e => setForm((p: any) => ({ ...p, age: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-stone-500">Bio</label>
              <textarea value={form.bio} onChange={e => setForm((p: any) => ({ ...p, bio: e.target.value }))} rows={3}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-stone-500">Phone</label>
                <input value={form.phone} onChange={e => setForm((p: any) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Instagram</label>
                <input value={form.instagram} onChange={e => setForm((p: any) => ({ ...p, instagram: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="@handle" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Website</label>
                <input value={form.website} onChange={e => setForm((p: any) => ({ ...p, website: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Availability</label>
                <select value={form.availability} onChange={e => setForm((p: any) => ({ ...p, availability: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                  {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-stone-400">
            {profile?.bio && <p className="leading-relaxed">{profile.bio}</p>}
            {profile?.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{profile.phone}</p>}
            {profile?.instagram && <p className="flex items-center gap-2"><Instagram className="h-3.5 w-3.5" />{profile.instagram}</p>}
            {profile?.website && <p className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" />{profile.website}</p>}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/images"
          className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-4 hover:border-stone-700 transition-colors">
          <Camera className="h-5 w-5 text-stone-400" />
          <div>
            <p className="text-sm font-medium text-stone-200">Photo Gallery</p>
            <p className="text-xs text-stone-500">{profile?.images?.length || 0} / 15 photos</p>
          </div>
        </Link>
        <Link href="/dashboard/bookings"
          className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-4 hover:border-stone-700 transition-colors">
          <Calendar className="h-5 w-5 text-stone-400" />
          <div>
            <p className="text-sm font-medium text-stone-200">Booking Requests</p>
            <p className="text-xs text-stone-500">View and manage bookings</p>
          </div>
        </Link>
        <Link href="/dashboard/inbox"
          className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-4 hover:border-stone-700 transition-colors">
          <MessageSquare className="h-5 w-5 text-stone-400" />
          <div>
            <p className="text-sm font-medium text-stone-200">Inbox</p>
            <p className="text-xs text-stone-500">Messages from clients</p>
          </div>
        </Link>
        <Link href="/dashboard/premium"
          className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-4 hover:border-stone-700 transition-colors">
          <Star className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-stone-200">Premium Listing</p>
            <p className="text-xs text-stone-500">{isPremium ? 'Active' : 'Upgrade to stand out'}</p>
          </div>
        </Link>
        <Link href="/dashboard/verify"
          className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-4 hover:border-stone-700 transition-colors">
          <CheckCircle className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm font-medium text-stone-200">Verification</p>
            <p className="text-xs text-stone-500">
              {verification?.status === 'APPROVED' ? 'Verified ✓' : verification?.status === 'PENDING' ? 'Under review' : 'Get verified'}
            </p>
          </div>
        </Link>
        <Link href="/dashboard/reviews"
          className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-4 hover:border-stone-700 transition-colors">
          <Star className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-stone-200">My Reviews</p>
            <p className="text-xs text-stone-500">Reviews from verified bookings</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        if (!data.success) { router.push('/login'); return }
        if (data.data.role === 'AGENCY') { router.push('/agency-dashboard'); return }
        setUser(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex items-center justify-center py-24 text-stone-500">Loading...</div>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      {user.role === 'GUEST' ? <GuestDashboard user={user} /> : <ModelDashboard user={user} />}
    </div>
  )
}
