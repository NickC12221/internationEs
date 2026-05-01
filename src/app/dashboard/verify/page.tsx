export const dynamic = 'force-dynamic'

'use client'
// src/app/dashboard/verify/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, Upload, Shield } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function VerifyPage() {
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/verification')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setVerification(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const uploadFile = async (file: File, folder: string): Promise<{ key: string }> => {
    // Get presigned URL
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mimeType: file.type, folder, isPrivate: true }),
    })
    const { data } = await res.json()

    // Upload directly to S3
    await fetch(data.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    return { key: data.key }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idFile) { setError('Please upload your ID document'); return }

    setSubmitting(true)
    setError('')

    try {
      const { key: idImageKey } = await uploadFile(idFile, 'verification')
      let videoKey = null
      if (videoFile) {
        const result = await uploadFile(videoFile, 'verification')
        videoKey = result.key
      }

      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idImageKey, videoKey }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setVerification(data.data)
      } else {
        setError(data.error || 'Submission failed')
      }
    } catch (err) {
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
          <h1
            className="text-2xl font-light text-stone-100"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Get Verified
          </h1>
        </div>

        {/* Status display */}
        {verification?.status === 'APPROVED' && (
          <StatusCard
            icon={<CheckCircle className="h-8 w-8 text-blue-400" />}
            title="You're Verified!"
            desc="Your verification badge is live on your profile."
            color="blue"
          />
        )}

        {verification?.status === 'PENDING' && (
          <StatusCard
            icon={<Clock className="h-8 w-8 text-amber-400" />}
            title="Under Review"
            desc="We're reviewing your documents. This typically takes 1-2 business days."
            color="amber"
          />
        )}

        {verification?.status === 'REJECTED' && (
          <>
            <StatusCard
              icon={<XCircle className="h-8 w-8 text-red-400" />}
              title="Verification Rejected"
              desc={verification.adminNotes || 'Please resubmit with clearer documents.'}
              color="red"
            />
            <SubmitForm
              idFile={idFile}
              videoFile={videoFile}
              setIdFile={setIdFile}
              setVideoFile={setVideoFile}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
              success={success}
            />
          </>
        )}

        {(!verification || !['APPROVED', 'PENDING', 'REJECTED'].includes(verification.status)) && (
          <>
            {/* Info */}
            <div className="mb-6 rounded-xl border border-stone-800 bg-stone-900 p-5">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 flex-shrink-0 text-stone-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-200">How verification works</p>
                  <ul className="mt-2 space-y-1 text-xs text-stone-400">
                    <li>• Upload a government-issued photo ID</li>
                    <li>• Optionally upload a short selfie video</li>
                    <li>• Documents are kept strictly private</li>
                    <li>• Our team reviews within 1-2 business days</li>
                    <li>• Approved profiles get a verified badge</li>
                  </ul>
                </div>
              </div>
            </div>

            <SubmitForm
              idFile={idFile}
              videoFile={videoFile}
              setIdFile={setIdFile}
              setVideoFile={setVideoFile}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
              success={success}
            />
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

function SubmitForm({ idFile, videoFile, setIdFile, setVideoFile, onSubmit, submitting, error, success }: any) {
  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-6 text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-3" />
        <p className="font-medium text-stone-200">Submitted successfully!</p>
        <p className="mt-1 text-sm text-stone-400">We'll review your documents shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <FileUpload
          label="ID Document *"
          desc="Passport, driving license, or national ID (JPEG/PNG)"
          accept="image/*"
          file={idFile}
          onChange={setIdFile}
          required
        />

        <FileUpload
          label="Verification Video (optional)"
          desc="Short selfie video holding your ID (MP4, MOV)"
          accept="video/*"
          file={videoFile}
          onChange={setVideoFile}
        />
      </div>

      <p className="mt-4 text-xs text-stone-600">
        🔒 Your documents are encrypted and never made public.
      </p>

      <button
        type="submit"
        disabled={submitting || !idFile}
        className="mt-5 w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
      >
        {submitting ? 'Uploading...' : 'Submit for Verification'}
      </button>
    </form>
  )
}

function FileUpload({ label, desc, accept, file, onChange, required }: any) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-500">
        {label}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          required={required}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
          id={`file-${label}`}
        />
        <label
          htmlFor={`file-${label}`}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-400 hover:border-amber-700 hover:text-stone-200 transition-colors"
        >
          <Upload className="h-4 w-4 flex-shrink-0" />
          {file ? (
            <span className="text-stone-200 truncate">{file.name}</span>
          ) : (
            <span>{desc}</span>
          )}
        </label>
      </div>
    </div>
  )
}
