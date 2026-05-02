'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MessageSquare } from 'lucide-react'
import AuthGateModal from '@/components/messaging/AuthGateModal'

interface Props {
  profileSlug: string
  profileName: string
  profileUserId: string
}

export default function BookContactButtons({ profileSlug, profileName, profileUserId }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authRedirect, setAuthRedirect] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (d.success) setCurrentUser(d.data)
    })
  }, [])

  const handleBook = () => {
    if (!currentUser) {
      setAuthRedirect(`/book/${profileSlug}`)
      setAuthMessage(`Sign in to book ${profileName}`)
      setShowAuth(true)
    } else {
      router.push(`/book/${profileSlug}`)
    }
  }

  const handleContact = () => {
    if (!currentUser) {
      setAuthRedirect(`/contact/${profileSlug}`)
      setAuthMessage(`Sign in to message ${profileName}`)
      setShowAuth(true)
    } else {
      router.push(`/contact/${profileSlug}`)
    }
  }

  // Don't show buttons to the profile owner
  if (currentUser && currentUser.id === profileUserId) return null

  return (
    <>
      <div className="flex gap-3">
        <button onClick={handleBook}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
          <Calendar className="h-4 w-4" />
          Book {profileName.split(' ')[0]}
        </button>
        <button onClick={handleContact}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 py-3 text-sm font-medium text-stone-300 hover:border-stone-600 hover:text-stone-100 transition-colors">
          <MessageSquare className="h-4 w-4" />
          Contact
        </button>
      </div>

      <AuthGateModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        redirectTo={authRedirect}
        message={authMessage}
      />
    </>
  )
}
