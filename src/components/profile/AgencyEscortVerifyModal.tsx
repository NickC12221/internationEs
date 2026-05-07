'use client'
import { useState } from 'react'
import { X, Upload, CheckCircle, Clock, XCircle, Shield, Loader2 } from 'lucide-react'

interface Props {
  profileId: string
  displayName: string
  isVerified: boolean
  verificationStatus?: string | null
  adminNotes?: string | null
  onClose: () => void
}

export default function AgencyEscortVerifyModal({ profileId, displayName, isVerified, verificationStatus, adminNotes, onClose }: Props) {
  const [idFile, setIdFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!idFile) { setError('Please upload a verification photo'); return }
    setUploading(true)
    setError('')
    try {
      const res = await fetch('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: idFile.type, folder: 'gallery', isPrivate: false })
      })
      const { data } = await res.json()
      await fetch(data.uploadUrl, { method: 'PUT', body: idFile, headers: { 'Content-Type': idFile.type } })

      const submitRes = await fetch('/api/verification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idImageKey: data.key, idImageUrl: data.publicUrl, profileId })
      })
      const result = await submitRes.json()
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || 'Submission failed')
      }
    } catch {
      setError('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4">
          <div>
            <h2 className="font-medium text-stone-200">Verify Escort</h2>
            <p className="text-xs text-stone-500 mt-0.5">{displayName}</p>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Already verified */}
          {isVerified && (
            <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-5 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-blue-400 mb-2" />
              <p className="font-medium text-stone-200">Verified</p>
              <p className="text-sm text-stone-400 mt-1">This escort has been verified and displays the verified badge.</p>
            </div>
          )}

          {/* Pending */}
          {!isVerified && verificationStatus === 'PENDING' && (
            <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-5 text-center">
              <Clock className="mx-auto h-8 w-8 text-amber-400 mb-2" />
              <p className="font-medium text-stone-200">Under Review</p>
              <p className="text-sm text-stone-400 mt-1">Verification is being reviewed. This typically takes 1-2 business days.</p>
            </div>
          )}

          {/* Rejected */}
          {!isVerified && verificationStatus === 'REJECTED' && (
            <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">Verification Rejected</p>
                  <p className="text-xs text-stone-400 mt-1">{adminNotes || 'Please resubmit with a clearer photo.'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submitted success */}
          {submitted && (
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
              <p className="font-medium text-stone-200">Submitted!</p>
              <p className="text-sm text-stone-400 mt-1">We'll review within 1-2 business days.</p>
            </div>
          )}

          {/* Upload form */}
          {!isVerified && verificationStatus !== 'PENDING' && !submitted && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-800 bg-stone-800/50 p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Shield className="h-4 w-4 text-stone-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-stone-300">Photo must show all three:</p>
                </div>
                <ul className="space-y-1.5 text-xs text-stone-400">
                  <li className="flex items-start gap-2"><span className="text-amber-500">①</span> Escort's face clearly visible</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500">②</span> Passport or government-issued photo ID</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500">③</span> Handwritten note: <strong className="text-stone-300">International Escorts</strong> + today's date</li>
                </ul>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-500">Verification Photo *</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-stone-700 bg-stone-800 px-4 py-3 text-sm text-stone-400 hover:border-amber-700 transition-colors">
                  <Upload className="h-4 w-4 flex-shrink-0" />
                  {idFile ? <span className="text-stone-200 truncate">{idFile.name}</span> : <span>Upload photo (JPEG or PNG)</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setIdFile(e.target.files?.[0] || null)} />
                </label>
                <p className="mt-1 text-xs text-stone-600">🔒 Kept strictly private, never shown publicly.</p>
              </div>

              <button onClick={handleSubmit} disabled={uploading || !idFile}
                className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : 'Submit for Verification'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
