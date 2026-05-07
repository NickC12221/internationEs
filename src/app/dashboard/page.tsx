'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, Camera, CheckCircle, Star, MapPin, Clock, Loader2,
  Twitter, Globe, Phone, Edit3, Calendar, MessageSquare,
  Settings, Building2, Lock
} from 'lucide-react'
import Header from '@/components/layout/Header'
import ContactSupportButton from '@/components/support/ContactSupportButton'
import ReportButton from '@/components/support/ReportButton'

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
            <p className="text-sm text-stone-500 mt-0.5">Find escort agencies near you</p>
          </div>
        </Link>

        <Link href="/dashboard/settings"
          className="flex items-start gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-stone-700 transition-colors">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-800">
            <Settings className="h-6 w-6 text-stone-400" />
          </div>
          <div>
            <h3 className="font-medium text-stone-200">Account Settings</h3>
            <p className="text-sm text-stone-500 mt-0.5">Edit your name, email and password</p>
          </div>
        </Link>

        <Link href="/dashboard/notifications"
          className="flex items-start gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-stone-700 transition-colors">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-800">
            <Star className="h-6 w-6 text-stone-400" />
          </div>
          <div>
            <h3 className="font-medium text-stone-200">Notifications</h3>
            <p className="text-sm text-stone-500 mt-0.5">Booking updates and messages</p>
          </div>
        </Link>
      </div>

      <div className="mt-10 flex items-center justify-center gap-3 pb-4">
        <ContactSupportButton />
        <ReportButton />
      </div>
    </div>
  )
}


function VideoUploadTile({ isPremium, videoUrl, onUpdate }: { isPremium: boolean; videoUrl?: string | null; onUpdate: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check duration (max 90s) - we check size as proxy: 90s at ~5Mbps = ~56MB
    if (file.size > 100 * 1024 * 1024) {
      alert('Video must be under 100MB (max 90 seconds)')
      return
    }

    setUploading(true)
    try {
      const res = await fetch('/api/profile/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: file.type })
      })
      const data = await res.json()
      if (!data.success) { alert(data.error); return }

      await fetch(data.data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })

      // Save video URL to profile
      await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: data.data.publicUrl, videoKey: data.data.key })
      })
      onUpdate()
    } catch { alert('Upload failed') }
    setUploading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Remove your profile video?')) return
    setDeleting(true)
    await fetch('/api/profile/video', { method: 'DELETE' })
    onUpdate()
    setDeleting(false)
  }

  if (!isPremium) {
    return (
      <Link href="/dashboard/premium"
        className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-4 hover:border-amber-700 transition-colors">
        <Star className="h-5 w-5 text-stone-600" />
        <div>
          <p className="text-sm font-medium text-stone-400">Profile Video</p>
          <p className="text-xs text-amber-600">Premium feature — upgrade to add a video</p>
        </div>
      </Link>
    )
  }

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Star className="h-5 w-5 text-amber-400 fill-current" />
        <div>
          <p className="text-sm font-medium text-stone-200">Profile Video</p>
          <p className="text-xs text-stone-500">Max 90 seconds, MP4/MOV/WebM</p>
        </div>
      </div>
      {videoUrl ? (
        <div className="space-y-2">
          <video src={videoUrl} className="w-full rounded-lg aspect-video object-cover bg-stone-800" controls />
          <button onClick={handleDelete} disabled={deleting}
            className="w-full rounded-lg bg-stone-800 py-1.5 text-xs text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-50">
            {deleting ? 'Removing...' : 'Remove Video'}
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-700 py-6 cursor-pointer hover:border-amber-700 transition-colors">
          {uploading ? (
            <><Loader2 className="h-6 w-6 text-stone-500 animate-spin mb-1" /><p className="text-xs text-stone-500">Uploading...</p></>
          ) : (
            <><Camera className="h-6 w-6 text-stone-600 mb-1" /><p className="text-xs text-stone-500">Click to upload video</p></>
          )}
          <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  )
}

function ModelDashboard({ user }: { user: any }) {
  const [editing, setEditing] = useState(!user?.profile?.bio && (!user?.profile?.services || user?.profile?.services?.length === 0))
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    setForm({
      displayName: user.profile?.displayName || '',
      bio: user.profile?.bio || '',
      age: user.profile?.age || '',
      phone: user.profile?.phone || '',
      twitter: user.profile?.twitter || '',
      website: user.profile?.website || '',
      availability: user.profile?.availability || 'AVAILABLE',
      // Preserve extras so Save Changes doesn't wipe them
      services: user.profile?.services || [],
      incall: user.profile?.incall || false,
      outcall: user.profile?.outcall || false,
      travel: user.profile?.travel || false,
      height: user.profile?.height || null,
      build: user.profile?.build || null,
      hairColor: user.profile?.hairColor || null,
      eyeColor: user.profile?.eyeColor || null,
      ethnicity: user.profile?.ethnicity || null,
      nationality: user.profile?.nationality || null,
      languages: user.profile?.languages || [],
      smoker: user.profile?.smoker ?? null,
      rate1hr: user.profile?.rate1hr || null,
      rate2hr: user.profile?.rate2hr || null,
      rate3hr: user.profile?.rate3hr || null,
      rate4hr: user.profile?.rate4hr || null,
      rateHalf: user.profile?.rateHalf || null,
      rateFull: user.profile?.rateFull || null,
      rateDinner: user.profile?.rateDinner || null,
      rateOvernight: user.profile?.rateOvernight || null,
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: form.age ? parseInt(form.age) : null,
          rate1hr: form.rate1hr ? parseInt(form.rate1hr) : null,
          rate2hr: form.rate2hr ? parseInt(form.rate2hr) : null,
          rate3hr: form.rate3hr ? parseInt(form.rate3hr) : null,
          rate4hr: form.rate4hr ? parseInt(form.rate4hr) : null,
          rateHalf: form.rateHalf ? parseInt(form.rateHalf) : null,
          rateFull: form.rateFull ? parseInt(form.rateFull) : null,
          rateDinner: form.rateDinner ? parseInt(form.rateDinner) : null,
          rateOvernight: form.rateOvernight ? parseInt(form.rateOvernight) : null,
        }),
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

      {/* Rejected notification */}
      {(profile as any)?.approvalStatus === 'REJECTED' && (
        <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
          <p className="text-sm font-medium text-red-400 mb-1">⚠ Profile Not Approved</p>
          <p className="text-xs text-stone-400">Your profile did not meet our guidelines. Please update your profile and contact support if you need help. Once updated, contact us to request a re-review.</p>
          <a href="/contact" className="mt-2 inline-block text-xs text-amber-500 hover:text-amber-400">Contact Support →</a>
        </div>
      )}

      {/* Premium expiry bar */}
      {isPremium && (() => {
        const expiresAt = profile?.premiumExpiresAt
        const days = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000) : null
        const expired = days !== null && days < 0
        return (
          <div className={`mb-4 rounded-xl border px-4 py-3 flex items-center justify-between gap-3 flex-wrap ${
            expired ? 'border-red-900/50 bg-red-950/10'
            : days !== null && days <= 14 ? 'border-amber-900/50 bg-amber-950/10'
            : 'border-stone-800 bg-stone-900/60'
          }`}>
            <div className="flex items-center gap-3">
              <Star className={`h-4 w-4 flex-shrink-0 fill-current ${expired ? 'text-red-400' : 'text-amber-400'}`} />
              <div>
                <p className={`text-sm font-medium ${expired ? 'text-red-400' : 'text-stone-200'}`}>
                  {expired ? 'Premium Listing Expired' : days !== null ? `Premium Listing — ${days} day${days !== 1 ? 's' : ''} remaining` : 'Premium Listing Active'}
                </p>
                <p className="text-xs text-stone-500">
                  {expiresAt && `${expired ? 'Expired' : 'Expires'} ${new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                </p>
              </div>
            </div>
            <Link href="/dashboard/premium"
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                expired ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'border border-amber-800 text-amber-400 hover:bg-amber-900/20'
              }`}>
              <Star className="h-3.5 w-3.5" />
              {expired ? 'Renew Now' : 'Extend'}
            </Link>
          </div>
        )
      })()}

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
          profile?.isVerified || (profile as any)?.approvalStatus === 'APPROVED' ? (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
              className="ml-auto text-xs text-amber-600 hover:text-amber-400">View public profile →</a>
          ) : (
            <Link href="/info"
              className="ml-auto text-xs text-amber-700 hover:text-amber-600">⏳ Awaiting approval →</Link>
          )
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

        {/* Auto-open if new escort (no services set) */}
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
                <div className="flex gap-1.5">
                  <select value={(form as any).phoneCode || '+44'} onChange={e => setForm((p: any) => ({...p, phoneCode: e.target.value}))}
                    className="w-20 rounded-lg border border-stone-700 bg-stone-800 px-1.5 py-2 text-xs text-stone-100 focus:border-amber-700 focus:outline-none">
                    {['+1','+7','+27','+33','+34','+39','+40','+41','+43','+44','+45','+46','+47','+48','+49','+51','+52','+54','+55','+57','+60','+61','+62','+63','+64','+65','+66','+81','+82','+84','+86','+90','+91','+92','+98','+212','+234','+254','+351','+352','+353','+354','+371','+372','+373','+374','+380','+381','+385','+386','+420','+421','+852','+880','+886','+960','+961','+962','+963','+964','+965','+966','+967','+968','+971','+972','+973','+974','+977','+994','+995','+998'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={form.phone} onChange={e => setForm((p: any) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Twitter/X</label>
                <input value={form.twitter} onChange={e => setForm((p: any) => ({ ...p, twitter: e.target.value }))}
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
            <div className="border-t border-stone-800 pt-5 mt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-4">Services & Profile Details</p>

              {/* Services */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-stone-500">Services Offered</label>
                <div className="flex flex-wrap gap-1.5">
                  {['GFE (Girlfriend Experience)','PSE','Dinner Date','Overnight Stay','Travel Companion','Webcam / Virtual','Duo Available','Couples Welcome','Massage','Tantric','Domination','Submissive','Role Play','Fetish Friendly','BDSM','Striptease'].map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm((p: any) => ({ ...p, services: (p.services||[]).includes(s) ? (p.services||[]).filter((x: string) => x !== s) : [...(p.services||[]), s] }))}
                      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${(form as any).services?.includes(s) ? 'border-amber-700 bg-amber-900/30 text-amber-400' : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-stone-500">Availability Type</label>
                <div className="flex gap-2 flex-wrap">
                  {[['incall','Incall'],['outcall','Outcall'],['travel','Travel Available']].map(([key, label]) => (
                    <button key={key} type="button"
                      onClick={() => setForm((p: any) => ({ ...p, [key]: !p[key] }))}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${(form as any)[key] ? 'border-amber-700 bg-amber-900/30 text-amber-400' : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-stone-500">Physical Details</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['height','Height','4ft10,4ft11,5ft0,5ft1,5ft2,5ft3,5ft4,5ft5,5ft6,5ft7,5ft8,5ft9,5ft10,5ft11,6ft0,6ft1,6ft2'],['build','Build','Slim,Athletic,Average,Curvy,BBW,Petite,Tall'],['hairColor','Hair','Blonde,Brunette,Black,Red,Auburn,Grey,Other'],['eyeColor','Eyes','Blue,Green,Brown,Hazel,Grey,Other'],['ethnicity','Ethnicity','Caucasian,Latin,Asian,African,Middle Eastern,Mixed,Other'],['nationality','Nationality','']] as [string,string,string][]).map(([key, label, opts]) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs text-stone-600">{label}</label>
                      {opts ? (
                        <select value={(form as any)[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                          className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-xs text-stone-100 focus:border-amber-700 focus:outline-none">
                          <option value="">Select...</option>
                          {opts.split(',').map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={(form as any)[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                          className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-xs text-stone-100 focus:border-amber-700 focus:outline-none" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-stone-500">Languages Spoken</label>
                <div className="flex flex-wrap gap-1.5">
                  {['English','French','Spanish','Arabic','Russian','Italian','German','Portuguese','Mandarin','Japanese','Korean','Other'].map(l => (
                    <button key={l} type="button"
                      onClick={() => setForm((p: any) => ({ ...p, languages: (p.languages||[]).includes(l) ? (p.languages||[]).filter((x: string) => x !== l) : [...(p.languages||[]), l] }))}
                      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${(form as any).languages?.includes(l) ? 'border-amber-700 bg-amber-900/30 text-amber-400' : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rates */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-stone-500">Rates (USD) — Optional</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['rate1hr','1 Hour'],['rate2hr','2 Hours'],['rate3hr','3 Hours'],['rate4hr','4 Hours'],['rateHalf','Half Day (6hrs)'],['rateFull','Full Day (12hrs)'],['rateDinner','Dinner Date'],['rateOvernight','Overnight']].map(([key, label]) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs text-stone-600">{label}</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">$</span>
                        <input type="number" value={(form as any)[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                          className="w-full rounded-lg border border-stone-700 bg-stone-800 pl-5 pr-2 py-1.5 text-xs text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="0" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-stone-600">Leave blank to show "Contact for rates"</p>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-stone-400">
            {profile?.bio && <p className="leading-relaxed">{profile.bio}</p>}
            {profile?.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{profile.phone}</p>}
            {profile?.twitter && <p className="flex items-center gap-2"><Twitter className="h-3.5 w-3.5" />{profile.twitter}</p>}
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
        <Link href="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-4 hover:border-stone-700 transition-colors">
          <Settings className="h-5 w-5 text-stone-400" />
          <div>
            <p className="text-sm font-medium text-stone-200">Account Settings</p>
            <p className="text-xs text-stone-500">Email, password & security</p>
          </div>
        </Link>

        <VideoUploadTile isPremium={isPremium} videoUrl={user.profile?.videoUrl} onUpdate={() => window.location.reload()} />
      </div>

      <div className="mt-10 flex items-center justify-center gap-3 pb-4">
        <ContactSupportButton />
        <ReportButton />
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
