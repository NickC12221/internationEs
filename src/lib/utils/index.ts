// src/lib/utils/index.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateProfileSlug(name: string, city: string): string {
  return `${slugify(name)}-${slugify(city)}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function getAvailabilityLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'Available',
    UNAVAILABLE: 'Unavailable',
    TRAVELING: 'Traveling',
    BUSY: 'Busy',
  }
  return labels[status] || status
}

export function getAvailabilityColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'text-emerald-400',
    UNAVAILABLE: 'text-red-400',
    TRAVELING: 'text-amber-400',
    BUSY: 'text-orange-400',
  }
  return colors[status] || 'text-gray-400'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function buildProfileUrl(countryCode: string, citySlug: string, profileSlug: string): string {
  return `/${countryCode.toLowerCase()}/${citySlug}/${profileSlug}`
}

export function buildCityUrl(countryCode: string, citySlug: string): string {
  return `/${countryCode.toLowerCase()}/${citySlug}`
}

export function buildCountryUrl(countryCode: string): string {
  return `/${countryCode.toLowerCase()}`
}
