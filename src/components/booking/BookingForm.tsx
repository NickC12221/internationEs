'use client'
import { useState } from 'react'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react'

interface Props {
  profileId: string
  modelName: string
  pricing: Record<string, number> | null
}

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 12, 24]

export default function BookingForm({ profileId, modelName, pricing }: Props) {
  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '',
    date: '', duration: '2', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const availableDurations = pricing
    ? DURATION_OPTIONS.filter(h => pricing[`${h}h`] !== undefined)
    : DURATION_OPTIONS

  const selectedPrice = pricing?.[`${form.duration}h`]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, ...form, duration: parseInt(form.duration) }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to submit booking')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-6 text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-3" />
        <p className="font-medium text-stone-200">Booking Request Sent!</p>
        <p className="mt-1 text-sm text-stone-400">
          The agency will confirm your booking for {modelName} shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">Request Booking</h3>
      {error && <div className="mb-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
            <Calendar className="h-3.5 w-3.5" /> Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
            <Clock className="h-3.5 w-3.5" /> Duration
          </label>
          <select
            value={form.duration}
            onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
          >
            {(availableDurations.length > 0 ? availableDurations : DURATION_OPTIONS).map(h => (
              <option key={h} value={h}>
                {h} hour{h > 1 ? 's' : ''}
                {pricing?.[`${h}h`] ? ` — $${pricing[`${h}h`]}` : ''}
              </option>
            ))}
          </select>
          {selectedPrice && (
            <p className="mt-1 text-xs text-amber-500">Total: ${selectedPrice}</p>
          )}
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
            <User className="h-3.5 w-3.5" /> Your Name
          </label>
          <input
            type="text"
            value={form.clientName}
            onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
            <Mail className="h-3.5 w-3.5" /> Email
          </label>
          <input
            type="email"
            value={form.clientEmail}
            onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))}
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
            <Phone className="h-3.5 w-3.5" /> Phone
          </label>
          <input
            type="tel"
            value={form.clientPhone}
            onChange={e => setForm(p => ({ ...p, clientPhone: e.target.value }))}
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
            placeholder="+1 234 567 890"
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
            <MessageSquare className="h-3.5 w-3.5" /> Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={2}
            className="w-full resize-none rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
            placeholder="Any special requirements..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Request Booking'}
        </button>
      </form>
    </div>
  )
}
