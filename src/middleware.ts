export const runtime = "nodejs"
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

const COOKIE_NAME = 'femme_session'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/verify']
// Routes that require admin role
const ADMIN_ROUTES = ['/admin']
// Routes only for guests (redirect if logged in)
const GUEST_ONLY_ROUTES = ['/login', '/signup']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  let session = null
  if (token) {
    session = await verifyToken(token)
  }

  // Redirect logged-in users away from guest-only routes
  if (GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Protect authenticated routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

// This ensures /api/* routes are never caught by dynamic page segments
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/verify/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
}
