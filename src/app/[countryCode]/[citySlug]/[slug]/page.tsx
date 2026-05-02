export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, Star, MapPin, Instagram, Globe, Phone, Building2, Calendar, MessageSquare } from 'lucide-react'
import Header from '@/components/layout/Header'
import BookContactButtons from '@/components/booking/BookContactButtons'

interface Props {
  params: { countryCode: string; citySlug: string; slug: string }
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
  } catch {
    return { title: 'Model' }
  }
}

export default async function ModelProfilePage({ params }: Props) {
  const { prisma } = await import('@/lib/db/prisma')

  const [profile, reviewsData] = await Promise.all([
    prisma.profile.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        agencyModel: { include: { agency: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.review.findMany({
      where: { profile: { slug: params.slug }, isVisible: true },
      include: { user: { select: { name: true, profile: { select: { displayName: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  ])

  if (!profile) notFound()

  const avgRating = reviewsData.length > 0
    ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
    : 0

  const countryUrl = `/${profile.countryCode.toLowerCase()}`
  const cityUrl = `/${profile.countryCode.toLowerCase()}/${profile.citySlug}`
  const agency = profile.agencyModel?.agency ?? null

  const allImages = [
    ...(profile.profileImageUrl ? [{ url: profile.profileImageUrl, id: 'main' }] : []),
    ...profile.images.filter(img => img.url !== profile.profileImageUrl).map(img => ({ url: img.url, id: img.id })),
  ]

  const availabilityColors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-400 text-emerald-400',
    TRAVELING: 'bg-amber-400 text-amber-400',
    BUSY: 'bg-orange-400 text-orange-400',
    UNAVAILABLE: 'bg-red-400 text-red-400',
  }
  const availabilityLabels: Record<string, string> = {
    AVAILABLE: 'Available', TRAVELING: 'Traveling', BUSY: 'Busy', UNAVAILABLE: 'Unavailable'
  }
  const avColor = availabilityColors[profile.availability] || availabilityColors.UNAVAILABLE

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
          {/* Left - Images */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-900">
              {allImages[0] ? (
                <Image src={allImages[0].url} alt={profile.displayName} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 60vw" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-8xl font-light text-stone-700" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{profile.displayName[0]}</span>
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
                    <Image src={img.url} alt={profile.displayName} fill className="object-cover" sizes="25vw" />
                  </div>
                ))}
              </div>
            )}

            {/* Reviews section */}
            {reviewsData.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Reviews</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-stone-400">{avgRating.toFixed(1)} ({reviewsData.length} review{reviewsData.length !== 1 ? 's' : ''})</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviewsData.map(review => (
                    <div key={review.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-xs font-medium text-stone-400">
                            {(review.user.profile?.displayName || review.user.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-300">{review.user.profile?.displayName || review.user.name || 'Verified User'}</p>
                            <div className="flex items-center gap-1.5">
                              <div className="flex">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />
                                ))}
                              </div>
                              <span className="flex items-center gap-1 text-xs text-emerald-400">
                                <CheckCircle className="h-3 w-3" /> Verified Booking
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-stone-600">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                      </div>
                      <p className="mt-3 text-sm text-stone-400 leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div>
            <div className="sticky top-24">
              {/* Name + availability */}
              <div className="mb-4">
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
                {reviewsData.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-current' : 'text-stone-700'}`} />)}
                    <span className="ml-1 text-xs text-stone-500">{avgRating.toFixed(1)} ({reviewsData.length})</span>
                  </div>
                )}
              </div>

              {/* Agency badge */}
              {agency && (
                <Link href={`/agencies/${agency.slug}`}
                  className="mb-4 flex items-center gap-2 rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 transition-colors hover:border-amber-700">
                  <Building2 className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">Managed by</p>
                    <p className="text-sm font-medium text-amber-400 truncate">{agency.name}</p>
                  </div>
                  <span className="ml-auto text-xs text-stone-500">→</span>
                </Link>
              )}

              {/* Availability */}
              <div className="mb-5 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${avColor.split(' ')[0]}`} />
                <span className={`text-sm font-medium ${avColor.split(' ')[1]}`}>
                  {availabilityLabels[profile.availability]}
                </span>
              </div>

              {/* Book + Contact buttons — client component for auth gating */}
              <BookContactButtons
                profileSlug={profile.slug}
                profileName={profile.displayName}
                profileUserId={profile.userId}
              />

              {/* Bio */}
              {profile.bio && (
                <div className="mb-5 mt-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">About</p>
                  <p className="text-sm leading-relaxed text-stone-300">{profile.bio}</p>
                </div>
              )}

              {/* Contact */}
              <div className="space-y-3 rounded-xl border border-stone-800 bg-stone-900 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Contact</p>
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{profile.phone}</span>
                  </a>
                )}
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                    <Instagram className="h-4 w-4 flex-shrink-0" />
                    <span>{profile.instagram}</span>
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{profile.website}</span>
                  </a>
                )}
                {!profile.phone && !profile.instagram && !profile.website && (
                  <p className="text-sm text-stone-600">No contact info provided</p>
                )}
              </div>

              <p className="mt-4 text-xs text-stone-600">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
