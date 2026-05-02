'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Send, MapPin, Star, Loader2, CheckCircle, Users } from 'lucide-react'
import Header from '@/components/layout/Header'
import AuthGateModal from '@/components/messaging/AuthGateModal'

export default function ContactAgencyPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [agency, setAgency] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const [agencyRes, userRes] = await Promise.all([
        fetch(`/api/agencies?slug=${slug}&pageSize=1`),
        fetch('/api/user')
      ])
      const [agencyData, userData] = await Promise.all([agencyRes.json(), userRes.json()])
      if (agencyData.success && agencyData.data.length > 0) setAgency(agencyData.data[0])
      if (userData.success) setCurrentUser(userData.data)
      setLoading(false)
    }
    init()
  }, [slug])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { setShowAuthModal(true); return }
    if (!message.trim() || !agency) return
    setSending(true)
    setError('')

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientUserId: agency.userId,
        initialMessage: message.trim()
      })
    })
    const data = await res.json()
    if (data.success) {
      setSent(true)
      setTimeout(() => router.push('/dashboard/inbox'), 2000)
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

  // Fallback: fetch by slug from the agencies list
  if (!agency) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex items-center justify-center py-24 text-stone-500">Agency not found</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href={`/agencies/${slug}`} className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Contact {agency.name}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            {sent ? (
              <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-8 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
                <h2 className="text-xl font-light text-stone-100">Message Sent!</h2>
                <p className="mt-2 text-sm text-stone-400">Redirecting to your inbox...</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
                <h2 className="mb-1 text-sm font-medium text-stone-300">Send a Message</h2>
                <p className="mb-4 text-xs text-stone-500">Start a conversation with {agency.name}</p>
                {error && <div className="mb-3 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{error}</div>}
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6}
                  className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none resize-none"
                  placeholder={`Hi ${agency.name}, I'd like to enquire about...`} />
                <button type="submit" disabled={sending || !message.trim()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? 'Sending...' : `Send Message`}
                </button>
                {!currentUser && <p className="mt-3 text-center text-xs text-stone-500">You'll need to sign in to send a message</p>}
              </form>
            )}
          </div>

          {/* Agency summary */}
          <div className="sticky top-24 rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
            {agency.logoUrl ? (
              <div className="relative h-28"><img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-cover" /></div>
            ) : (
              <div className="flex h-20 items-center justify-center bg-stone-800 text-3xl text-stone-600">{agency.name[0]}</div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-stone-200">{agency.name}</h3>
                {agency.isPremium && <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />}
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                <MapPin className="h-3 w-3" />{agency.city}, {agency.country}
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                <Users className="h-3 w-3" />{agency._count?.models || 0} models
              </div>
              {agency.bio && <p className="mt-2 text-xs text-stone-400 line-clamp-4">{agency.bio}</p>}
            </div>
          </div>
        </div>
      </div>

      <AuthGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={`/contact/agency/${slug}`}
        message={`Sign in to contact ${agency.name}`}
      />
    </div>
  )
}
