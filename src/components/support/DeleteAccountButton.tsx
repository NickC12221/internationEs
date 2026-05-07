'use client'
import { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeleteAccountButton() {
  const [step, setStep] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (res.ok) {
        router.push('/')
      }
    } catch {}
    setDeleting(false)
  }

  return (
    <>
      <button onClick={() => setStep(1)}
        className="flex items-center gap-1.5 rounded-xl border border-red-900/40 px-4 py-2 text-sm text-red-500 hover:bg-red-950/20 hover:border-red-800 transition-colors">
        <Trash2 className="h-4 w-4" /> Delete Account
      </button>

      {step === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-medium text-stone-200">Delete Account?</h2>
              <button onClick={() => setStep(0)} className="text-stone-500 hover:text-stone-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-stone-400 mb-5">
              Are you sure you want to delete your account? Your profile will be deactivated and hidden from the directory. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)}
                className="flex-1 rounded-lg border border-stone-700 py-2 text-sm text-stone-400 hover:border-stone-500 transition-colors">
                Cancel
              </button>
              <button onClick={() => setStep(2)}
                className="flex-1 rounded-lg bg-red-950/40 border border-red-900 py-2 text-sm text-red-400 hover:bg-red-950/60 transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-900/50 bg-stone-900 p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-medium text-red-400">⚠ Final Confirmation</h2>
              <button onClick={() => setStep(0)} className="text-stone-500 hover:text-stone-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-stone-400 mb-5">
              This is your final warning. Your account and all associated data will be permanently deactivated. Are you absolutely sure?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)}
                className="flex-1 rounded-lg border border-stone-700 py-2 text-sm text-stone-400 hover:border-stone-500 transition-colors">
                Keep Account
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 rounded-lg bg-red-900/50 border border-red-800 py-2 text-sm text-red-300 hover:bg-red-900/70 disabled:opacity-60 transition-colors">
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
