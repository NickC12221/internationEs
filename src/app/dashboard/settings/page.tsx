'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, Lock, Check, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password form
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (!d.success) { router.push('/login'); return }
      setUser(d.data)
      setProfileForm({ name: d.data.name || '', email: d.data.email || '' })
    }).finally(() => setLoading(false))
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileError('')
    setProfileMsg('')
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profileForm.name, email: profileForm.email })
    })
    const data = await res.json()
    if (data.success) {
      setProfileMsg('Details updated successfully!')
      setTimeout(() => setProfileMsg(''), 3000)
    } else {
      setProfileError(data.error || 'Failed to update')
    }
    setSavingProfile(false)
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMsg('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setSavingPassword(true)
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
    })
    const data = await res.json()
    if (data.success) {
      setPasswordMsg('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordMsg(''), 3000)
    } else {
      setPasswordError(data.error || 'Failed to change password')
    }
    setSavingPassword(false)
  }

  const backUrl = user?.role === 'AGENCY' ? '/agency-dashboard' : '/dashboard'

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href={backUrl} className="text-stone-500 hover:text-stone-300"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Account Settings</h1>
        </div>

        {/* Profile details */}
        <div className="mb-4 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">Personal Details</h2>
          {profileMsg && <div className="mb-3 rounded-lg bg-emerald-950/30 border border-emerald-900 px-3 py-2 text-sm text-emerald-400 flex items-center gap-2"><Check className="h-4 w-4" />{profileMsg}</div>}
          {profileError && <div className="mb-3 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-400">{profileError}</div>}
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {user?.role === 'GUEST' ? 'Full Name' : 'Display Name'}
              </label>
              <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
              {user?.role === 'GUEST' && <p className="mt-1 text-xs text-stone-600">Your name appears on reviews you submit</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </label>
              <input type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
            </div>
            <button type="submit" disabled={savingProfile}
              className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
              {savingProfile ? 'Saving...' : 'Save Details'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">Change Password</h2>
          {passwordMsg && <div className="mb-3 rounded-lg bg-emerald-950/30 border border-emerald-900 px-3 py-2 text-sm text-emerald-400 flex items-center gap-2"><Check className="h-4 w-4" />{passwordMsg}</div>}
          {passwordError && <div className="mb-3 rounded-lg bg-red-950 border border-red-900 px-3 py-2 text-sm text-red-400">{passwordError}</div>}
          <form onSubmit={savePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Current Password
              </label>
              <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                placeholder="Your current password" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={8}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400">Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} required minLength={8}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                placeholder="Repeat new password" />
            </div>
            <button type="submit" disabled={savingPassword}
              className="w-full rounded-lg bg-stone-700 py-2.5 text-sm font-medium text-stone-200 hover:bg-stone-600 disabled:opacity-60">
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-stone-600">
            Forgot your password? <Link href="/forgot-password" className="text-amber-600 hover:text-amber-400">Reset it here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
