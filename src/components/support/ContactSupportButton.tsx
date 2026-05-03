'use client'
import { useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ContactSupportButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello, I need support.' })
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/dashboard/inbox#${data.data.conversationId}`)
      } else {
        alert(data.error || 'Could not open support chat')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className={`flex items-center gap-2 rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors disabled:opacity-50 ${className}`}>
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <MessageCircle className="h-4 w-4" />
      }
      Contact Support
    </button>
  )
}
