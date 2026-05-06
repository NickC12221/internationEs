'use client'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import { Mail, MessageSquare, Loader2, Check } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch('https://formsubmit.co/ajax/support@internationalescorts.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, _subject: `[IE Contact] ${form.subject}`, _captcha: 'false' })
      })
      const data = await res.json()
      if (data.success === 'true' || data.success === true) {
        setSent(true)
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setError('Failed to send. Please email us directly.')
      }
    } catch {
      setError('Failed to send. Please email us directly at support@internationalescorts.com')
    }
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Contact Us</h1>
          <p className="text-stone-400">Get in touch with the International Escorts team</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <Mail className="h-6 w-6 text-amber-500 mb-3" />
            <h3 className="font-medium text-stone-200 mb-1">Email Support</h3>
            <a href="mailto:support@internationalescorts.com" className="text-sm text-amber-500 hover:text-amber-400">
              support@internationalescorts.com
            </a>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <MessageSquare className="h-6 w-6 text-amber-500 mb-3" />
            <h3 className="font-medium text-stone-200 mb-1">Response Time</h3>
            <p className="text-sm text-stone-400">We aim to respond within 24 hours on business days.</p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-emerald-900 bg-emerald-950/20 p-8 text-center">
            <Check className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
            <h2 className="text-xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Message Sent!</h2>
            <p className="text-stone-400">Thank you for getting in touch. We'll respond within 24 hours.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
            <h2 className="text-xl font-light text-stone-100 mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Send a Message</h2>
            {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-4 py-3 text-sm text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">Your Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                    placeholder="John Smith" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                    placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-400">Subject</label>
                <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                  <option value="">Select a topic...</option>
                  <option>General Enquiry</option>
                  <option>Account Support</option>
                  <option>Billing & Payments</option>
                  <option>Report a Profile</option>
                  <option>Advertising & Partnership</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-400">Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required rows={5}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none"
                  placeholder="How can we help?" />
              </div>
              <button type="submit" disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <>Send Message</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
