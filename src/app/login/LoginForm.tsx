'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Sign in failed')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-4xl font-light tracking-widest text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              FEMME
            </span>
          </Link>
          <p className="mt-2 text-sm text-stone-500">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
          {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-4 py-3 text-sm text-red-400">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 py-2.5 px-4 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 py-2.5 px-4 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="mt-6 w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="mt-4 text-center text-sm text-stone-500">
            No account? <Link href="/signup" className="text-amber-500 hover:text-amber-400">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
