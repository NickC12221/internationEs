'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ConversationRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    router.replace(`/dashboard/inbox#${params.conversationId}`)
  }, [])

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <p className="text-stone-500 text-sm">Opening conversation...</p>
    </div>
  )
}
