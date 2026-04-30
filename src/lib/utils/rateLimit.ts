// src/lib/utils/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  max: number       // Max requests per window
}

const configs: Record<string, RateLimitConfig> = {
  auth: { windowMs: 15 * 60 * 1000, max: 10 },        // 10 requests per 15 min
  upload: { windowMs: 60 * 60 * 1000, max: 20 },       // 20 uploads per hour
  api: { windowMs: 60 * 1000, max: 60 },               // 60 requests per minute
}

export function rateLimit(key: string, configName: keyof typeof configs = 'api'): boolean {
  const config = configs[configName]
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs })
    return true // allowed
  }

  if (entry.count >= config.max) {
    return false // rate limited
  }

  entry.count++
  return true // allowed
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function createRateLimitResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please try again later.' },
    { status: 429 }
  )
}
