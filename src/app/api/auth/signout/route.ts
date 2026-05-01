export const dynamic = 'force-dynamic' // force-rebuild

// src/app/api/auth/signout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const { prisma } = await import('@/lib/db/prisma')
  const response = NextResponse.json({ success: true })
  response.cookies.delete('femme_session')
  return response
}
