'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import AuthGateModal from './AuthGateModal'

interface Props {
  agencySlug: string
  agencyUserId: string
  agencyName: string
}

export default function AgencyContactButton({ agencySlug, agencyUserId, agencyName }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (d.success) setCurrentUser(d.data)
    })
  }, [])

  // Don't show to the agency itself
  if (currentUser?.id === agencyUserId) return null

  const handleContact = () => {
    if (!currentUser) {
      setShowAuth(true)
    } else {
      router.push(`/contact/agency/${agencySlug}`)
    }
  }

  return (
    <>
      <button onClick={handleContact}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
        <MessageSquare className="h-4 w-4" />
        Contact {agencyName}
      </button>
      <AuthGateModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        redirectTo={`/contact/agency/${agencySlug}`}
        message={`Sign in to contact ${agencyName}`}
      />
    </>
  )
}
