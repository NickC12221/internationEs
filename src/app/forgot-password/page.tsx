'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [debugCode, setDebugCode] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (data.success) {
      setSent(true)
      if (data.debug_code) setDebugCode(data.debug_code)
    } else {
      setError(data.error || 'Failed to send code')
    }
    setLoading(false)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    })
    const data = await res.json()
    if (data.success) {
      setSuccess(true)
    } else {
      setError(data.error || 'Reset failed')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-4xl font-light tracking-widest text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>FEMME</span>
          </Link>
          <p className="mt-2 text-sm text-stone-500">Reset your password</p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900/30">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-lg font-medium text-stone-200 mb-2">Password Reset!</h2>
              <p className="text-sm text-stone-400 mb-4">Your password has been updated successfully.</p>
              <Link href="/login" className="block w-full rounded-lg bg-amber-700 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-600">
                Sign In
              </Link>
            </div>
          ) : !sent ? (
            <>
              <div className="mb-5 flex items-center gap-2">
                <Link href="/login" className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
                <h2 className="text-lg font-medium text-stone-200">Forgot Password</h2>
              </div>
              <p className="mb-4 text-sm text-stone-400">Enter your email and we'll send you a reset code.</p>
              {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-400">{error}</div>}
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 py-2.5 pl-9 pr-3 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                      placeholder="you@example.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-medium text-stone-200">Enter Reset Code</h2>
                <p className="text-sm text-stone-400 mt-1">We sent a 6-digit code to <span className="text-stone-300">{email}</span></p>
                {debugCode && (
                  <div className="mt-2 rounded-lg bg-amber-950/30 border border-amber-900/50 px-3 py-2 text-xs text-amber-400">
                    Dev mode — your code is: <span className="font-bold text-amber-300">{debugCode}</span>
                  </div>
                )}
              </div>
              {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-400">{error}</div>}
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">Reset Code</label>
                  <input value={code} onChange={e => setCode(e.target.value)} required maxLength={6} placeholder="6-digit code"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none text-center tracking-widest text-lg" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                    placeholder="Min 8 characters" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                    placeholder="Repeat new password" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => { setSent(false); setDebugCode('') }}
                  className="w-full text-center text-xs text-stone-500 hover:text-stone-300">
                  ← Use a different email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
