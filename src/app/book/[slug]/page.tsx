'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, Star, Loader2, Phone, Instagram, Globe, MessageSquare } from 'lucide-react'
import Header from '@/components/layout/Header'
import AuthGateModal from '@/components/messaging/AuthGateModal'


const TIME_OPTIONS = [
  '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
  '10:00 PM', '10:30 PM', '11:00 PM',
]

const DURATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '2 hours', value: 2 },
  { label: '3 hours', value: 3 },
  { label: '4 hours', value: 4 },
  { label: 'Half day (6h)', value: 6 },
  { label: 'Full day (10h)', value: 10 },
]

export default function BookPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    date: '',
    time: '',
    duration: 2,
    message: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  })

  useEffect(() => {
    const init = async () => {
      const [profileRes, userRes] = await Promise.all([
        fetch(`/api/profiles/${slug}`),
        fetch('/api/user')
      ])
      const [profileData, userData] = await Promise.all([profileRes.json(), userRes.json()])

      if (profileData.success) setProfile(profileData.data)
      if (userData.success) {
        setCurrentUser(userData.data)
        setForm(p => ({
          ...p,
          contactName: userData.data.name || userData.data.profile?.displayName || '',
          contactEmail: userData.data.email || '',
          contactPhone: userData.data.phone || '',
        }))
      }
      setLoading(false)
    }
    init()
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { setShowAuthModal(true); return }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: profile.id, ...form })
    })
    const data = await res.json()
    if (data.success) {
      setSubmitted(true)
    } else {
      setError(data.error || 'Failed to submit booking')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex items-center justify-center py-24 text-stone-500">Profile not found</div>
    </div>
  )

  const profileUrl = `/${profile.countryCode.toLowerCase()}/${profile.citySlug}/${profile.slug}`

  if (submitted) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="rounded-full bg-emerald-900/30 p-4 mb-4">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Booking Request Sent!</h1>
        <p className="text-stone-400 max-w-sm">{profile.displayName} will respond to your request. Check your dashboard for updates.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/dashboard/bookings" className="rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600">View Bookings</Link>
          <Link href={profileUrl} className="rounded-lg border border-stone-700 px-4 py-2.5 text-sm text-stone-400 hover:border-stone-600">Back to Profile</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href={profileUrl} className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Book {profile.displayName}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="rounded-lg bg-red-950 border border-red-900 px-4 py-3 text-sm text-red-400">{error}</div>}

            <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
              <h2 className="mb-4 text-sm font-medium text-stone-300">Booking Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Start Time *
                  </label>
                  <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                    <option value="">Select start time...</option>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" onClick={() => setForm(p => ({ ...p, duration: opt.value }))}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${form.duration === opt.value ? 'border-amber-700 bg-amber-950/30 text-amber-400' : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">Message (optional)</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={3}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none resize-none"
                    placeholder="Tell them about your project, shoot type, requirements..." />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
              <h2 className="mb-4 text-sm font-medium text-stone-300">Your Contact Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-400">Full Name *</label>
                  <input value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-400">Email *</label>
                  <input type="email" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-400">Phone Number *</label>
                  <input type="tel" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                    placeholder="+1 234 567 890" />
                  <p className="mt-1 text-xs text-stone-600">So the model can contact you directly to confirm</p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-amber-700 py-3.5 text-base font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
              {submitting ? 'Sending request...' : `Send Booking Request to ${profile.displayName}`}
            </button>
            {!currentUser && (
              <p className="text-center text-xs text-stone-500">You'll need to sign in to complete your booking</p>
            )}
          </form>

          {/* Profile summary */}
          <div>
            <div className="sticky top-24 space-y-3">
              <div className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
                <div className="relative aspect-[4/3]">
                  {profile.profileImageUrl ? (
                    <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-800 text-4xl text-stone-600">{profile.displayName[0]}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{profile.displayName}</h3>
                  {profile.age && <p className="text-xs text-stone-500 mt-0.5">Age {profile.age}</p>}
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                    <MapPin className="h-3.5 w-3.5" />{profile.city}, {profile.country}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {profile.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-blue-400">
                        <CheckCircle className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                    {profile.listingTier === 'PREMIUM' && (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-current" /> Premium
                      </span>
                    )}
                  </div>
                  {profile.bio && <p className="mt-2 text-xs text-stone-400 line-clamp-3">{profile.bio}</p>}
                </div>
              </div>

              {/* Contact & socials */}
              {(profile.phone || profile.instagram || profile.website) && (
                <div className="rounded-xl border border-stone-800 bg-stone-900 p-4 space-y-2.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Contact</p>
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <Phone className="h-4 w-4 flex-shrink-0" />{profile.phone}
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={`https://instagram.com/${profile.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <Instagram className="h-4 w-4 flex-shrink-0" />{profile.instagram}
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <Globe className="h-4 w-4 flex-shrink-0" /><span className="truncate">{profile.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Message button */}
              <Link href={`/contact/${profile.slug}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 py-3 text-sm font-medium text-stone-300 hover:border-amber-700 hover:text-amber-400 transition-colors">
                <MessageSquare className="h-4 w-4" /> Message {profile.displayName.split(' ')[0]} instead
              </Link>

              <p className="text-center text-xs text-stone-600">View <Link href={`/${profile.countryCode.toLowerCase()}/${profile.citySlug}/${profile.slug}`} className="text-amber-700 hover:text-amber-500">full profile</Link></p>
            </div>
          </div>
        </div>
      </div>

      <AuthGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={`/book/${slug}`}
        message="Sign in to send your booking request"
      />
    </div>
  )
}
