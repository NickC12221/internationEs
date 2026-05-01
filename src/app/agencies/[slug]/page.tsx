export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Globe, Instagram, Phone, Mail, Star, Users, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const agency = await prisma.agency.findUnique({
      where: { slug: params.slug, isActive: true },
      select: { name: true, bio: true, city: true, country: true },
    })
    if (!agency) return { title: 'Agency Not Found' }
    return {
      title: `${agency.name} — ${agency.city}, ${agency.country}`,
      description: agency.bio || `Model agency based in ${agency.city}, ${agency.country}.`,
    }
  } catch {
    return { title: 'Agency' }
  }
}

export default async function AgencyProfilePage({ params }: Props) {
  const { prisma } = await import('@/lib/db/prisma')

  const agency = await prisma.agency.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      models: {
        include: {
          profile: {
            include: {
              images: { take: 1, orderBy: { order: 'asc' } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!agency) notFound()

  const models = agency.models.map(m => m.profile).filter(p => p.isActive)

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      {/* Banner */}
      <div className="relative h-56 w-full bg-stone-900 sm:h-72">
        {agency.logoUrl ? (
          <Image
            src={agency.logoUrl}
            alt={`${agency.name} banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              className="text-6xl font-light text-stone-700"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {agency.name[0]}
            </span>
          </div>
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        {/* Agency name on banner */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-end gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1
                    className="text-3xl font-light text-stone-100 sm:text-4xl"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    {agency.name}
                  </h1>
                  {agency.isPremium && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-900/80 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-sm">
                      <Star className="h-3.5 w-3.5 fill-current" /> Premium Agency
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-stone-400 mt-1">
                  <MapPin className="h-4 w-4" />
                  <Link
                    href={`/${agency.countryCode.toLowerCase()}/${agency.citySlug}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {agency.city}, {agency.country}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">

          {/* Left — bio + models */}
          <div>
            {/* Bio */}
            {agency.bio && (
              <div className="mb-8">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">About</h2>
                <p className="text-stone-300 leading-relaxed">{agency.bio}</p>
              </div>
            )}

            {/* Models grid */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <h2
                  className="text-2xl font-light text-stone-100"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  Our Models
                </h2>
                <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-xs text-stone-400">
                  {models.length}
                </span>
              </div>

              {models.length === 0 ? (
                <p className="text-stone-600 py-8">No models listed yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {models.map(model => {
                    const img = model.profileImageUrl || model.images?.[0]?.url
                    const profileUrl = `/${model.countryCode.toLowerCase()}/${model.citySlug}/${model.slug}`
                    return (
                      <Link key={model.id} href={profileUrl} className="group block">
                        <div className="relative overflow-hidden rounded-xl bg-stone-900 transition-transform duration-300 group-hover:-translate-y-1">
                          <div className="aspect-[3/4] relative bg-stone-800">
                            {img ? (
                              <Image
                                src={img}
                                alt={model.displayName}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-stone-600 text-3xl">
                                {model.displayName[0]}
                              </div>
                            )}

                            {/* Gradient */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-950/90 to-transparent" />

                            {/* Badges */}
                            {model.listingTier === 'PREMIUM' && (
                              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-900/90 px-2 py-0.5 text-xs text-amber-300">
                                <Star className="h-3 w-3 fill-current" /> Premium
                              </span>
                            )}

                            {/* Name */}
                            <div className="absolute bottom-0 inset-x-0 p-3">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-stone-100 truncate">{model.displayName}</p>
                                {model.isVerified && <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />}
                              </div>
                              <p className="text-xs text-stone-400">{model.city}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — contact info */}
          <div>
            <div className="sticky top-24 space-y-4">
              {/* Contact card */}
              <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-500">Contact</h3>
                <div className="space-y-3">
                  {agency.website && (
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{agency.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {agency.instagram && (
                    <a
                      href={`https://instagram.com/${agency.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      <Instagram className="h-4 w-4 flex-shrink-0" />
                      <span>{agency.instagram}</span>
                    </a>
                  )}
                  {agency.phone && (
                    <a
                      href={`tel:${agency.phone}`}
                      className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{agency.phone}</span>
                    </a>
                  )}
                  {agency.email && (
                    <a
                      href={`mailto:${agency.email}`}
                      className="flex items-center gap-3 text-sm text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{agency.email}</span>
                    </a>
                  )}
                  {!agency.website && !agency.instagram && !agency.phone && !agency.email && (
                    <p className="text-sm text-stone-600">No contact info provided</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-500">Agency Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Models</span>
                    <span className="font-medium text-stone-200">{models.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Location</span>
                    <span className="font-medium text-stone-200">{agency.city}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Status</span>
                    <span className={`font-medium ${agency.isPremium ? 'text-amber-400' : 'text-stone-400'}`}>
                      {agency.isPremium ? '★ Premium' : 'Standard'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Member since</span>
                    <span className="font-medium text-stone-400">
                      {new Date(agency.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Back to agencies */}
              <Link
                href="/agencies"
                className="block text-center text-sm text-stone-500 hover:text-stone-300 transition-colors"
              >
                ← Back to all agencies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
