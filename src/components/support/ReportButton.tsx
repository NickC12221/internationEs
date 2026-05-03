'use client'
import { useState } from 'react'
import { Flag, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ReportButton({ className = '' }: { className?: string }) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        setTimeout(() => { setShowModal(false); setSent(false); setMessage('') }, 2000)
      } else {
        setError(data.error || 'Failed to submit report')
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
        className={`flex items-center gap-2 rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-400 hover:border-red-700 hover:text-red-400 transition-colors ${className}`}>
        <Flag className="h-4 w-4" />
        Report
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-stone-200">Submit a Report</h2>
                <p className="text-xs text-stone-500 mt-0.5">Report a user, content, or issue to our team</p>
              </div>
              <button onClick={() => { setShowModal(false); setMessage(''); setError('') }}
                className="text-stone-500 hover:text-stone-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            {sent ? (
              <div className="py-6 text-center">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-sm text-emerald-400">Report submitted. Our team will review it shortly.</p>
              </div>
            ) : (
              <>
                {error && <div className="mb-3 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-400">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400">What are you reporting?</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5}
                      placeholder="Describe the issue, include any relevant usernames or profile links..."
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-red-700 focus:outline-none resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading || !message.trim()}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-900 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60 transition-colors">
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Flag className="h-4 w-4" /> Submit Report</>}
                    </button>
                    <button type="button" onClick={() => { setShowModal(false); setMessage(''); setError('') }}
                      className="rounded-lg border border-stone-700 px-4 py-2.5 text-sm text-stone-400 hover:border-stone-600">
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
