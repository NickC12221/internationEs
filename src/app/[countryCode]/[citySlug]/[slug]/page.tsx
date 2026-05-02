export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, Star, MapPin, Instagram, Globe, Phone, Building2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import BookingForm from '@/components/booking/BookingForm'
import { getAvailabilityLabel } from '@/lib/utils'

interface Props {
  params: { countryCode: string; citySlug: string; slug: string }
}

const DURATION_LABELS: Record<string, string> = {
  '1h': '1 hour', '2h': '2 hours', '3h': '3 hours', '4h': '4 hours',
  '5h': '5 hours', '6h': '6 hours', '12h': '12 hours', '24h': '24 hours',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const profile = await prisma.profile.findUnique({
      where: { slug: params.slug, isActive: true },
      select: { displayName: true, city: true, country: true, bio: true, profileImageUrl: true },
    })
    if (!profile) return { title: 'Model Not Found' }
    return {
      title: `${profile.displayName} — ${profile.city}, ${profile.country}`,
      description: profile.bio || `Professional model based in ${profile.city}, ${profile.country}.`,
      openGraph: { images: profile.profileImageUrl ? [profile.profileImageUrl] : [] },
    }
  } catch { return { title: 'Model' } }
}

export default async function ModelProfilePage({ params }: Props) {
  const { prisma } = await import('@/lib/db/prisma')

  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      images: { orderBy: { order: 'asc' } },
      agencyModel: { include: { agency: { select: { name: true, slug: true } } } }
    },
  })

  if (!profile) notFound()

  const countryUrl = `/${profile.countryCode.toLowerCase()}`
  const cityUrl = `/${profile.countryCode.toLowerCase()}/${profile.citySlug}`
  const agency = profile.agencyModel?.agency ?? null
  const pricing = profile.pricing as Record<string, number> | null
  const hasPricing = pricing && Object.keys(pricing).length > 0
  const hasBooking = !!agency

  const allImages = [
    ...(profile.profileImageUrl ? [{ url: profile.profileImageUrl, id: 'main' }] : []),
    ...profile.images.map(img => ({ url: img.url, id: img.id })),
  ]

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-300">All</Link>
          <span>/</span>
          <Link href={countryUrl} className="hover:text-stone-300">{profile.country}</Link>
          <span>/</span>
          <Link href={cityUrl} className="hover:text-stone-300">{profile.city}</Link>
          <span>/</span>
          <span className="text-stone-300">{profile.displayName}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Left — Images */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-900">
              {allImages[0] ? (
                <Image src={allImages[0].url} alt={profile.displayName} fill className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-8xl font-light text-stone-700" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    {profile.displayName[0]}
                  </span>
                </div>
              )}
              <div className="absolute left-3 top-3 flex flex-col gap-2">
                {profile.listingTier === 'PREMIUM' && (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-900/90 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-sm">
                    <Star className="h-3.5 w-3.5 fill-current" /> Premium
                  </span>
                )}
                {profile.isVerified && (
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-900/90 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur-sm">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {allImages.slice(1, 9).map(img => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-stone-900">
                    <Image src={img.url} alt={profile.displayName} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="space-y-4">
            {/* Name & location */}
            <div>
              <h1 className="text-3xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {profile.displayName}
              </h1>
              {profile.age && <p className="mt-0.5 text-sm text-stone-500">Age {profile.age}</p>}
              <div className="mt-2 flex items-center gap-1.5 text-sm text-stone-400">
                <MapPin className="h-4 w-4" />
                <Link href={cityUrl} className="hover:text-amber-400 transition-colors">{profile.city}</Link>
                <span>·</span>
                <Link href={countryUrl} className="hover:text-amber-400 transition-colors">{profile.country}</Link>
              </div>
            </div>

            {/* Agency badge */}
            {agency && (
              <Link href={`/agencies/${agency.slug}`}
                className="flex items-center gap-2 rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 transition-colors hover:border-amber-700">
                <Building2 className="h-4 w-4 flex-shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">Managed by</p>
                  <p className="text-sm font-medium text-amber-400 truncate">{agency.name}</p>
                </div>
                <span className="ml-auto text-xs text-stone-500">→</span>
              </Link>
            )}

            {/* Availability */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                profile.availability === 'AVAILABLE' ? 'bg-emerald-400' :
                profile.availability === 'TRAVELING' ? 'bg-amber-400' :
                profile.availability === 'BUSY' ? 'bg-orange-400' : 'bg-red-400'
              }`} />
              <span className={`text-sm font-medium ${
                profile.availability === 'AVAILABLE' ? 'text-emerald-400' :
                profile.availability === 'TRAVELING' ? 'text-amber-400' :
                profile.availability === 'BUSY' ? 'text-orange-400' : 'text-red-400'
              }`}>{getAvailabilityLabel(profile.availability)}</span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">About</p>
                <p className="text-sm leading-relaxed text-stone-300">{profile.bio}</p>
              </div>
            )}

            {/* Pricing */}
            {hasPricing && (
              <div className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">Rates</p>
                <div className="space-y-1.5">
                  {Object.entries(pricing!).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([key, price]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-stone-400">{DURATION_LABELS[key] || key}</span>
                      <span className="font-medium text-stone-200">${price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {(profile.email || profile.phone || profile.instagram || profile.website) && (
              <div className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">Contact</p>
                <div className="space-y-2.5">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <Mail className="h-4 w-4 flex-shrink-0" /><span className="truncate">{profile.email}</span>
                    </a>
                  )}
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <Phone className="h-4 w-4 flex-shrink-0" /><span>{profile.phone}</span>
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <Instagram className="h-4 w-4 flex-shrink-0" /><span>{profile.instagram}</span>
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                      <Globe className="h-4 w-4 flex-shrink-0" /><span className="truncate">{profile.website}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Booking form — only show for agency models */}
            {hasBooking && (
              <BookingForm
                profileId={profile.id}
                modelName={profile.displayName}
                pricing={pricing}
              />
            )}

            <p className="text-xs text-stone-600">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
