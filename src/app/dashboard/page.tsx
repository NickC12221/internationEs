'use client'
// src/app/dashboard/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User, Camera, CheckCircle, Star, Clock, MapPin,
  Instagram, Globe, Phone, Mail, Edit3, Upload
} from 'lucide-react'
import Header from '@/components/layout/Header'
import { getAvailabilityLabel } from '@/lib/utils'

const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available', color: 'text-emerald-400' },
  { value: 'TRAVELING', label: 'Traveling', color: 'text-amber-400' },
  { value: 'BUSY', label: 'Busy', color: 'text-orange-400' },
  { value: 'UNAVAILABLE', label: 'Unavailable', color: 'text-red-400' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data)
          setForm({
            displayName: data.data.profile?.displayName || '',
            bio: data.data.profile?.bio || '',
            age: data.data.profile?.age || '',
            email: data.data.profile?.email || '',
            phone: data.data.profile?.phone || '',
            instagram: data.data.profile?.instagram || '',
            twitter: data.data.profile?.twitter || '',
            website: data.data.profile?.website || '',
            availability: data.data.profile?.availability || 'AVAILABLE',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

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
        setUser((prev: any) => ({ ...prev, profile: data.data }))
        setEditing(false)
        setSaveMsg('Profile saved!')
        setTimeout(() => setSaveMsg(''), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="text-stone-500">Loading...</div>
        </div>
      </div>
    )
  }

  const profile = user?.profile
  const verification = user?.verificationRequest
  const isPremium = profile?.listingTier === 'PREMIUM'
  const profileUrl = profile
    ? `/${profile.countryCode.toLowerCase()}/${profile.citySlug}/${profile.slug}`
    : null

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Status bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {isPremium && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" /> Premium Listing
            </span>
          )}
          {profile?.isVerified && (
            <span className="flex items-center gap-1.5 rounded-full bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-400">
              <CheckCircle className="h-3.5 w-3.5" /> Verified
            </span>
          )}
          {verification?.status === 'PENDING' && (
            <span className="flex items-center gap-1.5 rounded-full bg-yellow-900/30 px-3 py-1 text-xs font-medium text-yellow-400">
              <Clock className="h-3.5 w-3.5" /> Verification Pending
            </span>
          )}
          {saveMsg && (
            <span className="rounded-full bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-400">
              ✓ {saveMsg}
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1
                className="text-2xl font-light text-stone-100"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {profile?.displayName || 'Your Profile'}
              </h1>
              <p className="text-sm text-stone-500">{user?.email}</p>
              {profileUrl && (
                <Link
                  href={profileUrl}
                  target="_blank"
                  className="mt-1 text-xs text-amber-600 hover:text-amber-500"
                >
                  View public profile →
                </Link>
              )}
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Display Name" editing={editing}>
              {editing ? (
                <input
                  value={form.displayName}
                  onChange={(e) => setForm((p: any) => ({ ...p, displayName: e.target.value }))}
                  className="input-field"
                />
              ) : (
                <span>{profile?.displayName}</span>
              )}
            </Field>

            <Field label="Age" editing={editing}>
              {editing ? (
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm((p: any) => ({ ...p, age: parseInt(e.target.value) || '' }))}
                  min="18"
                  max="100"
                  className="input-field"
                />
              ) : (
                <span>{profile?.age || '—'}</span>
              )}
            </Field>

            <Field label="Availability" editing={editing} className="sm:col-span-2">
              {editing ? (
                <select
                  value={form.availability}
                  onChange={(e) => setForm((p: any) => ({ ...p, availability: e.target.value }))}
                  className="input-field"
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <span className={
                  profile?.availability === 'AVAILABLE' ? 'text-emerald-400' :
                  profile?.availability === 'TRAVELING' ? 'text-amber-400' :
                  profile?.availability === 'BUSY' ? 'text-orange-400' : 'text-red-400'
                }>
                  {getAvailabilityLabel(profile?.availability || 'AVAILABLE')}
                </span>
              )}
            </Field>

            <Field label="Bio" editing={editing} className="sm:col-span-2">
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((p: any) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  maxLength={1000}
                  className="input-field resize-none"
                />
              ) : (
                <p className="text-stone-300 text-sm leading-relaxed">
                  {profile?.bio || 'No bio yet. Click Edit to add one.'}
                </p>
              )}
            </Field>

            <div className="sm:col-span-2">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
                Contact & Social
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ContactField
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                  value={form.email}
                  editing={editing}
                  onChange={(v) => setForm((p: any) => ({ ...p, email: v }))}
                  placeholder="contact@example.com"
                />
                <ContactField
                  label="Phone"
                  icon={<Phone className="h-4 w-4" />}
                  value={form.phone}
                  editing={editing}
                  onChange={(v) => setForm((p: any) => ({ ...p, phone: v }))}
                  placeholder="+1 234 567 890"
                />
                <ContactField
                  label="Instagram"
                  icon={<Instagram className="h-4 w-4" />}
                  value={form.instagram}
                  editing={editing}
                  onChange={(v) => setForm((p: any) => ({ ...p, instagram: v }))}
                  placeholder="@username"
                />
                <ContactField
                  label="Website"
                  icon={<Globe className="h-4 w-4" />}
                  value={form.website}
                  editing={editing}
                  onChange={(v) => setForm((p: any) => ({ ...p, website: v }))}
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-amber-700 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-stone-700 px-5 py-2 text-sm text-stone-400 hover:border-stone-600 hover:text-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ActionCard
            href="/dashboard/images"
            icon={<Camera className="h-5 w-5" />}
            title="Manage Photos"
            desc="Upload and organize your gallery"
          />
          <ActionCard
            href="/dashboard/verify"
            icon={<CheckCircle className="h-5 w-5" />}
            title="Get Verified"
            desc={
              verification?.status === 'APPROVED'
                ? 'You are verified ✓'
                : verification?.status === 'PENDING'
                ? 'Review in progress'
                : 'Submit verification'
            }
            highlight={!profile?.isVerified}
          />
          <ActionCard
            href="/dashboard/premium"
            icon={<Star className="h-5 w-5" />}
            title="Go Premium"
            desc={isPremium ? 'Active premium listing' : 'Boost your visibility'}
            highlight={!isPremium}
          />
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(68 64 60);
          background-color: rgb(28 25 23);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(231 229 228);
        }
        .input-field:focus {
          border-color: rgb(180 83 9);
          outline: none;
        }
      `}</style>
    </div>
  )
}

function Field({
  label, editing, children, className = '',
}: {
  label: string; editing: boolean; children: React.ReactNode; className?: string
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
      <div className="text-sm text-stone-200">{children}</div>
    </div>
  )
}

function ContactField({
  label, icon, value, editing, onChange, placeholder,
}: {
  label: string; icon: React.ReactNode; value: string; editing: boolean
  onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-stone-600">{label}</p>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
        />
      ) : (
        <div className="flex items-center gap-2 text-sm text-stone-400">
          {icon}
          <span>{value || '—'}</span>
        </div>
      )}
    </div>
  )
}

function ActionCard({
  href, icon, title, desc, highlight = false,
}: {
  href: string; icon: React.ReactNode; title: string; desc: string; highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-4 transition-colors hover:border-amber-800 ${
        highlight
          ? 'border-amber-900/50 bg-amber-950/20'
          : 'border-stone-800 bg-stone-900 hover:bg-stone-800'
      }`}
    >
      <div className={`mb-2 ${highlight ? 'text-amber-500' : 'text-stone-500'}`}>{icon}</div>
      <p className="font-medium text-stone-200">{title}</p>
      <p className="mt-0.5 text-xs text-stone-500">{desc}</p>
    </Link>
  )
}
