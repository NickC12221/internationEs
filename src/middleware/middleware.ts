import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

const COOKIE_NAME = 'femme_session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  let session = null
  if (token) {
    session = await verifyToken(token)
  }

  // Redirect logged-in users away from auth pages
  if (['/login', '/signup', '/agency-signup'].some(r => pathname.startsWith(r))) {
    if (session) {
      const redirect = session.role === 'AGENCY' ? '/agency-dashboard' : session.role === 'ADMIN' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(redirect, req.url))
    }
    return NextResponse.next()
  }

  // Admin only
  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
    if (session.role !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  // Agency only
  if (pathname.startsWith('/agency-dashboard')) {
    if (!session) return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
    if (session.role !== 'AGENCY') return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

  // Auth required (any logged-in user)
  const authRequired = ['/dashboard', '/book/', '/contact/']
  if (authRequired.some(r => pathname.startsWith(r))) {
    if (!session) return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agency-dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/agency-signup',
  ],
}
