'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, Star, Loader2, Phone, Globe, MessageSquare } from 'lucide-react'
import Header from '@/components/layout/Header'
import AuthGateModal from '@/components/messaging/AuthGateModal'

const TIME_OPTIONS = [
  '7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM',
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM',
  '1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM',
  '4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM',
  '7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM','9:30 PM',
  '10:00 PM','10:30 PM','11:00 PM',
]

const DURATION_OPTIONS = [
  { label: '1 Hour', value: '1hr', hours: 1 },
  { label: '2 Hours', value: '2hr', hours: 2 },
  { label: '3 Hours', value: '3hr', hours: 3 },
  { label: '4 Hours', value: '4hr', hours: 4 },
  { label: 'Half Day (6hrs)', value: 'half', hours: 6 },
  { label: 'Full Day (12hrs)', value: 'full', hours: 12 },
  { label: 'Dinner Date', value: 'dinner', hours: null },
  { label: 'Overnight', value: 'overnight', hours: null },
]

export default function BookPage() {
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    date: '', time: '', duration: '2hr', message: '',
    contactName: '', contactEmail: '', contactPhone: '', phoneCode: '+44',
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
    const selectedDuration = DURATION_OPTIONS.find(d => d.value === form.duration)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: profile.id,
        ...form,
        duration: selectedDuration?.hours || 1,
        durationLabel: selectedDuration?.label,
      })
    })
    const data = await res.json()
    if (data.success) setSubmitted(true)
    else setError(data.error || 'Failed to submit booking')
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

  const profileUrl = `/${profile.countryCode?.toLowerCase()}/${profile.citySlug}/${profile.slug}`
  const selectedDuration = DURATION_OPTIONS.find(d => d.value === form.duration)

  if (submitted) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="rounded-full bg-emerald-900/30 p-4 mb-4"><CheckCircle className="h-10 w-10 text-emerald-400" /></div>
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
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-400">
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-400">
                    <Clock className="h-3.5 w-3.5" /> Start Time
                  </label>
                  <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                    <option value="">Select start time...</option>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-stone-400">
                    <Clock className="h-3.5 w-3.5" /> Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                    placeholder="Any special requests or requirements..." />
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
                  <div className="flex gap-2">
                    <select value={form.phoneCode || '+44'} onChange={e => setForm(p => ({ ...p, phoneCode: e.target.value }))}
                      className="w-24 rounded-lg border border-stone-700 bg-stone-800 px-2 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                      {['+1','+7','+27','+33','+34','+39','+40','+41','+43','+44','+45','+46','+47','+48','+49','+51','+52','+54','+55','+57','+60','+61','+62','+63','+64','+65','+66','+81','+82','+84','+86','+90','+91','+92','+98','+212','+234','+254','+351','+352','+353','+354','+371','+372','+373','+374','+380','+381','+385','+386','+420','+421','+852','+880','+886','+960','+961','+962','+963','+964','+965','+966','+967','+968','+971','+972','+973','+974','+977','+994','+995','+998'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="tel" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} required
                      className="flex-1 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                      placeholder="7911123456" />
                  </div>
                  <p className="mt-1 text-xs text-stone-600">So the escort can contact you directly to confirm</p>
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

          {/* Profile sidebar */}
          <div>
            <div className="sticky top-24 space-y-3">
              <div className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
                <div className="relative aspect-[4/3]">
                  {profile.profileImageUrl
                    ? <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" />
                    : <div className="flex h-full items-center justify-center bg-stone-800 text-4xl text-stone-600">{profile.displayName[0]}</div>
                  }
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{profile.displayName}</h3>
                  {profile.age && <p className="text-xs text-stone-500 mt-0.5">Age {profile.age}</p>}
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                    <MapPin className="h-3.5 w-3.5" />{profile.city}, {profile.country}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {profile.isVerified && <span className="flex items-center gap-1 text-xs text-blue-400"><CheckCircle className="h-3.5 w-3.5" /> Verified</span>}
                    {profile.listingTier === 'PREMIUM' && <span className="flex items-center gap-1 text-xs text-amber-400"><Star className="h-3.5 w-3.5 fill-current" /> Premium</span>}
                  </div>
                </div>
              </div>

              {/* Rates */}
              <div className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">Rates</p>
                {(profile.rateHourly || profile.rateDinner || profile.rateOvernight) ? (
                  <div className="space-y-2">
                    {profile.rateHourly && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Per hour</span>
                        <span className={`font-medium ${selectedDuration?.hours === 1 ? 'text-amber-400' : 'text-stone-300'}`}>${profile.rateHourly.toLocaleString()}</span>
                      </div>
                    )}
                    {profile.rateHourly && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">2 hours</span>
                        <span className={`font-medium ${selectedDuration?.hours === 2 ? 'text-amber-400' : 'text-stone-300'}`}>${(profile.rateHourly * 2).toLocaleString()}</span>
                      </div>
                    )}
                    {profile.rateHourly && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">3 hours</span>
                        <span className={`font-medium ${selectedDuration?.hours === 3 ? 'text-amber-400' : 'text-stone-300'}`}>${(profile.rateHourly * 3).toLocaleString()}</span>
                      </div>
                    )}
                    {profile.rateHourly && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">4 hours</span>
                        <span className={`font-medium ${selectedDuration?.hours === 4 ? 'text-amber-400' : 'text-stone-300'}`}>${(profile.rateHourly * 4).toLocaleString()}</span>
                      </div>
                    )}
                    {profile.rateDinner && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Dinner date</span>
                        <span className={`font-medium ${form.duration === 'dinner' ? 'text-amber-400' : 'text-stone-300'}`}>${profile.rateDinner.toLocaleString()}</span>
                      </div>
                    )}
                    {profile.rateOvernight && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Overnight</span>
                        <span className={`font-medium ${form.duration === 'overnight' ? 'text-amber-400' : 'text-stone-300'}`}>${profile.rateOvernight.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedDuration && (
                      <div className="mt-3 border-t border-stone-800 pt-3 flex justify-between text-sm font-medium">
                        <span className="text-stone-400">Selected: {selectedDuration.label}</span>
                        <span className="text-amber-400">
                          {form.duration === 'dinner' && profile.rateDinner ? `$${profile.rateDinner.toLocaleString()}`
                           : form.duration === 'overnight' && profile.rateOvernight ? `$${profile.rateOvernight.toLocaleString()}`
                           : selectedDuration.hours && profile.rateHourly ? `$${(profile.rateHourly * selectedDuration.hours).toLocaleString()}`
                           : 'Contact for rate'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500 italic">Contact for rates</p>
                )}
              </div>

              {/* Contact */}
              {(profile.phone || profile.twitter || profile.website) && (
                <div className="rounded-xl border border-stone-800 bg-stone-900 p-4 space-y-2.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Contact</p>
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <Phone className="h-4 w-4 flex-shrink-0" />{profile.phone}
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={`https://twitter.com/${profile.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <span className="text-stone-400 font-bold text-xs">𝕏</span>{profile.twitter}
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

              <Link href={`/contact/${profile.slug}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 py-3 text-sm font-medium text-stone-300 hover:border-amber-700 hover:text-amber-400 transition-colors">
                <MessageSquare className="h-4 w-4" /> Message instead
              </Link>
              <p className="text-center text-xs text-stone-600">
                View <Link href={profileUrl} className="text-amber-700 hover:text-amber-500">full profile</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthGateModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}
        redirectTo={`/book/${slug}`} message="Sign in to send your booking request" />
    </div>
  )
}
