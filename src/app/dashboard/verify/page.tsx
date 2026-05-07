'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, Upload, Shield } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function VerifyPage() {
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/verification')
      .then(r => r.json())
      .then(data => { if (data.success) setVerification(data.data) })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idFile) { setError('Please upload your verification photo'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: idFile.type, folder: 'gallery', isPrivate: false }),
      })
      const { data } = await res.json()
      await fetch(data.uploadUrl, { method: 'PUT', body: idFile, headers: { 'Content-Type': idFile.type } })

      const submitRes = await fetch('/api/verification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idImageKey: data.key, idImageUrl: data.publicUrl }),
      })
      const submitData = await submitRes.json()
      if (submitData.success) {
        setSuccess(true)
      } else {
        setError(submitData.error || 'Submission failed')
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="py-24 text-center text-stone-500">Loading...</div>

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-500 hover:text-stone-300">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Get Verified
          </h1>
        </div>

        {verification?.status === 'APPROVED' && (
          <StatusCard icon={<CheckCircle className="h-8 w-8 text-blue-400" />} title="You're Verified!" desc="Your verified badge is live on your profile." color="blue" />
        )}

        {verification?.status === 'PENDING' && (
          <StatusCard icon={<Clock className="h-8 w-8 text-amber-400" />} title="Under Review" desc="We're reviewing your submission. This typically takes 1-2 business days." color="amber" />
        )}

        {verification?.status === 'REJECTED' && (
          <>
            <StatusCard icon={<XCircle className="h-8 w-8 text-red-400" />} title="Verification Rejected"
              desc={verification.adminNotes || 'Your photo did not meet our requirements. Please resubmit with a clearer image.'} color="red" />
            <SubmitForm idFile={idFile} setIdFile={setIdFile} onSubmit={handleSubmit} submitting={submitting} error={error} success={success} />
          </>
        )}

        {(!verification || !['APPROVED', 'PENDING', 'REJECTED'].includes(verification?.status)) && (
          <>
            <div className="mb-6 rounded-xl border border-stone-800 bg-stone-900 p-5">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 flex-shrink-0 text-stone-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-200 mb-2">How to get verified</p>
                  <p className="text-xs text-stone-400 leading-relaxed mb-3">
                    Take a single photo showing all three of the following clearly:
                  </p>
                  <ul className="space-y-1.5 text-xs text-stone-400">
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">①</span> Your face (clearly visible, no sunglasses)</li>
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">②</span> Your passport or government-issued photo ID (open to the photo page)</li>
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">③</span> A handwritten note saying <strong className="text-stone-300">International Escorts</strong> and today's date</li>
                  </ul>
                  <p className="mt-3 text-xs text-stone-500">Our team reviews within 1-2 business days. Approved profiles receive a verified badge visible to all clients.</p>
                </div>
              </div>
            </div>

            <SubmitForm idFile={idFile} setIdFile={setIdFile} onSubmit={handleSubmit} submitting={submitting} error={error} success={success} />
          </>
        )}
      </div>
    </div>
  )
}

function StatusCard({ icon, title, desc, color }: any) {
  const colors: Record<string, string> = {
    blue: 'border-blue-900/50 bg-blue-950/20',
    amber: 'border-amber-900/50 bg-amber-950/20',
    red: 'border-red-900/50 bg-red-950/20',
  }
  return (
    <div className={`mb-6 rounded-2xl border p-6 text-center ${colors[color]}`}>
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="font-medium text-stone-200">{title}</p>
      <p className="mt-1 text-sm text-stone-400">{desc}</p>
    </div>
  )
}

function SubmitForm({ idFile, setIdFile, onSubmit, submitting, error, success }: any) {
  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-6 text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-3" />
        <p className="font-medium text-stone-200">Submitted successfully!</p>
        <p className="mt-1 text-sm text-stone-400">We'll review your photo within 1-2 business days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-500">
          Verification Photo *
        </label>
        <div className="relative">
          <input type="file" accept="image/*" required onChange={e => setIdFile(e.target.files?.[0] || null)} className="hidden" id="file-id" />
          <label htmlFor="file-id"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-400 hover:border-amber-700 hover:text-stone-200 transition-colors">
            <Upload className="h-4 w-4 flex-shrink-0" />
            {idFile ? <span className="text-stone-200 truncate">{idFile.name}</span> : <span>Upload photo (JPEG or PNG)</span>}
          </label>
        </div>
        <p className="mt-2 text-xs text-stone-600">Photo must clearly show your face, passport and the handwritten note.</p>
      </div>

      <p className="mt-4 text-xs text-stone-600">🔒 Your photo is kept strictly private and never shown publicly.</p>

      <button type="submit" disabled={submitting || !idFile}
        className="mt-5 w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-60">
        {submitting ? 'Uploading... (this may take a moment for large videos)' : 'Submit for Verification'}
      </button>
    </form>
  )
}
