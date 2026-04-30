'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const COUNTRIES = [
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Italy', code: 'IT' },
  { name: 'Spain', code: 'ES' },
  { name: 'Australia', code: 'AU' },
  { name: 'Canada', code: 'CA' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Mexico', code: 'MX' },
  { name: 'Philippines', code: 'PH' },
].sort((a, b) => a.name.localeCompare(b.name))

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', displayName: '', country: '', countryCode: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCountryChange = (e) => {
    const selected = COUNTRIES.find((c) => c.code === e.target.value)
    setForm((p) => ({ ...p, country: selected?.name || '', countryCode: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) { router.push('/dashboard'); router.refresh() }
      else setError(data.error || 'Signup failed')
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/"><span className="text-4xl font-light tracking-widest text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>FEMME</span></Link>
          <p className="mt-2 text-sm text-stone-500">Create your model profile</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
          {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-4 py-3 text-sm text-red-400">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Display Name</label>
              <input type="text" value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} required className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none" placeholder="Your professional name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none" placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Country</label>
              <select value={form.countryCode} onChange={handleCountryChange} required className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                <option value="">Select country...</option>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">City</label>
              <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none" placeholder="Your city" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">{loading ? 'Creating account...' : 'Create Profile'}</button>
          <p className="mt-4 text-center text-sm text-stone-500">Already have an account? <Link href="/login" className="text-amber-500 hover:text-amber-400">Sign in</Link></p>
        </form>
      </div>
    </div>
  )
}
