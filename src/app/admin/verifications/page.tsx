'use client'
// src/app/admin/verifications/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import Header from '@/components/layout/Header'

interface Verification {
  id: string
  status: string
  idImageKey: string | null
  videoKey: string | null
  adminNotes: string | null
  createdAt: string
  user: {
    email: string
    profile: {
      displayName: string
      slug: string
      country: string
      city: string
    } | null
  }
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('PENDING')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const fetchVerifications = () => {
    setLoading(true)
    fetch(`/api/admin/verifications?status=${status}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setVerifications(data.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVerifications()
  }, [status])

  const handleReview = async (verificationId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, action, adminNotes: notes }),
      })
      const data = await res.json()
      if (data.success) {
        setReviewingId(null)
        setNotes('')
        fetchVerifications()
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" className="text-stone-500 hover:text-stone-300">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1
            className="text-2xl font-light text-stone-100"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Verification Requests
          </h1>
        </div>

        {/* Status tabs */}
        <div className="mb-6 flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                status === s
                  ? 'bg-amber-700 text-white'
                  : 'border border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-100'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500">Loading...</div>
        ) : verifications.length === 0 ? (
          <div className="py-12 text-center text-stone-500">No {status.toLowerCase()} requests</div>
        ) : (
          <div className="space-y-4">
            {verifications.map((v) => (
              <div key={v.id} className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-200">
                      {v.user.profile?.displayName || 'Unknown'}
                    </p>
                    <p className="text-sm text-stone-500">{v.user.email}</p>
                    {v.user.profile && (
                      <p className="text-xs text-stone-600">
                        {v.user.profile.city}, {v.user.profile.country}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-stone-600">
                      Submitted {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {v.user.profile && (
                      <Link
                        href={`/ae/dubai/${v.user.profile.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-400"
                      >
                        View Profile <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}

                    {v.idImageKey && (
                      <span className="text-xs text-stone-500">📄 ID document uploaded</span>
                    )}
                    {v.videoKey && (
                      <span className="text-xs text-stone-500">🎥 Video uploaded</span>
                    )}
                  </div>
                </div>

                {v.adminNotes && (
                  <div className="mt-3 rounded-lg bg-stone-800 p-3 text-xs text-stone-400">
                    <strong>Admin note:</strong> {v.adminNotes}
                  </div>
                )}

                {status === 'PENDING' && (
                  <div className="mt-4">
                    {reviewingId === v.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add a note (optional, shown to model if rejected)"
                          rows={2}
                          className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(v.id, 'APPROVED')}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleReview(v.id, 'REJECTED')}
                            className="flex items-center gap-1.5 rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-800 transition-colors"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                          <button
                            onClick={() => { setReviewingId(null); setNotes('') }}
                            className="px-4 py-2 text-sm text-stone-500 hover:text-stone-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingId(v.id)}
                        className="rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-400 hover:border-amber-700 hover:text-stone-100 transition-colors"
                      >
                        Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
