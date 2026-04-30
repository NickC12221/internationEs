// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 px-4 text-center">
      <p
        className="text-8xl font-light text-stone-800"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        404
      </p>
      <h1
        className="mt-4 text-3xl font-light text-stone-200"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-amber-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
      >
        Back to Directory
      </Link>
    </div>
  )
}
