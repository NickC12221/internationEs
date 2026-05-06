'use client'
import { useState } from 'react'
import { Loader2, CheckCircle, Upload } from 'lucide-react'

interface Props {
  profileId?: string
  isVerified?: boolean
}

export default function VerificationUpload({ profileId, isVerified }: Props) {
  const [idFile, setIdFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!idFile || !videoFile) { setError('Please upload both an ID photo and a video selfie'); return }
    setUploading(true)
    setError('')
    try {
      // Upload ID
      const idRes = await fetch('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: idFile.type, folder: 'verification', isPrivate: true })
      })
      const idData = await idRes.json()
      await fetch(idData.data.uploadUrl, { method: 'PUT', body: idFile, headers: { 'Content-Type': idFile.type } })

      // Upload video
      const vidRes = await fetch('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: videoFile.type, folder: 'gallery', isPrivate: false })
      })
      const vidData = await vidRes.json()
      await fetch(vidData.data.uploadUrl, { method: 'PUT', body: videoFile, headers: { 'Content-Type': videoFile.type } })

      // Submit verification
      await fetch('/api/verification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idImageKey: idData.data.key,
          idImageUrl: idData.data.publicUrl,
          videoKey: vidData.data.key,
          videoUrl: vidData.data.publicUrl,
          profileId,
        })
      })

      setSubmitted(true)
    } catch (e) {
      setError('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  if (isVerified) return (
    <div className="flex items-center gap-2 text-sm text-blue-400">
      <CheckCircle className="h-4 w-4" /> This profile is verified
    </div>
  )

  if (submitted) return (
    <div className="flex items-center gap-2 text-sm text-amber-400">
      <CheckCircle className="h-4 w-4" /> Verification submitted — awaiting review
    </div>
  )

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div>
        <label className="mb-1 block text-xs text-stone-500">Government ID (passport, driving licence)</label>
        <label className="flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 cursor-pointer hover:border-amber-700 transition-colors">
          <Upload className="h-4 w-4 text-stone-500" />
          <span className="text-xs text-stone-400">{idFile ? idFile.name : 'Upload ID photo'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => setIdFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      <div>
        <label className="mb-1 block text-xs text-stone-500">Video selfie (hold ID, say your name)</label>
        <label className="flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 cursor-pointer hover:border-amber-700 transition-colors">
          <Upload className="h-4 w-4 text-stone-500" />
          <span className="text-xs text-stone-400">{videoFile ? videoFile.name : 'Upload video selfie'}</span>
          <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      <button onClick={handleSubmit} disabled={uploading || !idFile || !videoFile}
        className="flex items-center gap-2 rounded-lg bg-blue-900/30 border border-blue-800 px-4 py-2 text-xs text-blue-400 hover:bg-blue-900/50 disabled:opacity-50 transition-colors">
        {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</> : 'Submit Verification'}
      </button>
    </div>
  )
}
