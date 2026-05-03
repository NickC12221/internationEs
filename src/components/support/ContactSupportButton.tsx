'use client'
import { useState } from 'react'
import { MessageCircle, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ContactSupportButton({ className = '' }: { className?: string }) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setMessage('')
        router.push(`/dashboard/inbox#${data.data.conversationId}`)
      } else {
        setError(data.error || 'Could not open support chat')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors ${className}`}>
        <MessageCircle className="h-4 w-4" />
        Contact Support
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-stone-200">Contact Support</h2>
                <p className="text-xs text-stone-500 mt-0.5">Describe your issue and we'll get back to you</p>
              </div>
              <button onClick={() => { setShowModal(false); setMessage(''); setError('') }}
                className="text-stone-500 hover:text-stone-300 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-400">How can we help?</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="Describe your issue, question, or feedback..."
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading || !message.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><MessageCircle className="h-4 w-4" /> Send Message</>}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setMessage(''); setError('') }}
                  className="rounded-lg border border-stone-700 px-4 py-2.5 text-sm text-stone-400 hover:border-stone-600 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
