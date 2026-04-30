import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
