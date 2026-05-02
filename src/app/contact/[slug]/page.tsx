'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Send, MapPin, CheckCircle, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import AuthGateModal from '@/components/messaging/AuthGateModal'

export default function ContactPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const [profileRes, userRes] = await Promise.all([
        fetch(`/api/profiles/${slug}`),
        fetch('/api/user')
      ])
      const [profileData, userData] = await Promise.all([profileRes.json(), userRes.json()])
      if (profileData.success) setProfile(profileData.data)
      if (userData.success) setCurrentUser(userData.data)
      setLoading(false)
    }
    init()
  }, [slug])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { setShowAuthModal(true); return }
    if (!message.trim()) return
    setSending(true)
    setError('')

    // The recipient is the profile's user
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientUserId: profile.userId,
        profileId: profile.id,
        initialMessage: message.trim()
      })
    })
    const data = await res.json()
    if (data.success) {
      setSent(true)
      setTimeout(() => router.push(`/dashboard/inbox`), 2000)
    } else {
      setError(data.error || 'Failed to send message')
    }
    setSending(false)
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

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href={profileUrl} className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Contact {profile.displayName}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Message form */}
          <div>
            {sent ? (
              <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900/40">
                  <CheckCircle className="h-7 w-7 text-emerald-400" />
                </div>
                <h2 className="text-xl font-light text-stone-100">Message Sent!</h2>
                <p className="mt-2 text-sm text-stone-400">Redirecting you to your inbox...</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
                <h2 className="mb-1 text-sm font-medium text-stone-300">Send a Message</h2>
                <p className="mb-4 text-xs text-stone-500">Start a conversation with {profile.displayName}</p>

                {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-400">{error}</div>}

                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6}
                  className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none resize-none"
                  placeholder={`Hi ${profile.displayName}, I'd like to get in touch about...`} />

                <button type="submit" disabled={sending || !message.trim()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? 'Sending...' : `Send Message to ${profile.displayName}`}
                </button>

                {!currentUser && (
                  <p className="mt-3 text-center text-xs text-stone-500">You'll need to sign in to send a message</p>
                )}
              </form>
            )}
          </div>

          {/* Profile summary */}
          <div className="sticky top-24">
            <div className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
              <div className="relative aspect-square">
                {profile.profileImageUrl ? (
                  <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-stone-800 text-4xl text-stone-600">{profile.displayName[0]}</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-stone-200">{profile.displayName}</h3>
                {profile.age && <p className="text-xs text-stone-500">Age {profile.age}</p>}
                <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                  <MapPin className="h-3.5 w-3.5" />{profile.city}, {profile.country}
                </div>
                {profile.isVerified && (
                  <div className="flex items-center gap-1 text-xs text-blue-400 mt-2">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified
                  </div>
                )}
                {profile.bio && <p className="mt-2 text-xs text-stone-400 line-clamp-4">{profile.bio}</p>}
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="mt-3 block text-xs text-amber-600 hover:text-amber-400">{profile.phone}</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={`/contact/${slug}`}
        message="Sign in to send a message"
      />
    </div>
  )
}
