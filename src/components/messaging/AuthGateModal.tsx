'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Mail, Lock, User } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
  message?: string
}

export default function AuthGateModal({ isOpen, onClose, redirectTo, message }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/signin' : '/api/auth/guest-signup'
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()

      if (data.success) {
        onClose()
        if (redirectTo) router.push(redirectTo)
        else router.refresh()
      } else {
        setError(data.error || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-stone-200">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            {message && <p className="text-xs text-stone-500 mt-0.5">{message}</p>}
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300"><X className="h-5 w-5" /></button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs text-stone-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 py-2.5 pl-9 pr-3 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                  placeholder="Your name" />
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-stone-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 py-2.5 pl-9 pr-3 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 py-2.5 pl-9 pr-3 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-amber-500 hover:text-amber-400">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
