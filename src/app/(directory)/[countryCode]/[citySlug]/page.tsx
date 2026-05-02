export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import LocationSidebar from '@/components/layout/LocationSidebar'
import ModelGrid from '@/components/model/ModelGrid'
import PremiumAgencySidebar from '@/components/agency/PremiumAgencySidebar'

interface Props {
  params: { countryCode: string; citySlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cc = params.countryCode.toUpperCase()
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const profile = await prisma.profile.findFirst({
      where: { countryCode: cc, citySlug: params.citySlug, isActive: true },
      select: { country: true, city: true },
    })
    if (!profile) return { title: 'Models' }
    return {
      title: `Models in ${profile.city}, ${profile.country}`,
      description: `Browse professional female models based in ${profile.city}, ${profile.country}.`,
    }
  } catch {
    return { title: 'Models' }
  }
}

export default async function CityPage({ params }: Props) {
  if (["api", "_next", "dashboard", "admin", "agencies", "book", "contact", "search", "login", "signup"].includes(params.countryCode)) {
    const { notFound } = await import("next/navigation")
    notFound()
  }
  // Prevent API routes being caught by dynamic segment
  if (['api', '_next', 'dashboard', 'admin', 'agencies', 'book', 'contact', 'search', 'login', 'signup'].includes(params.countryCode)) {
    const { notFound } = await import('next/navigation')
    notFound()
  }
  const cc = params.countryCode.toUpperCase()
  let locationInfo = null
  try {
    const { prisma } = await import('@/lib/db/prisma')
    locationInfo = await prisma.profile.findFirst({
      where: { countryCode: cc, citySlug: params.citySlug, isActive: true },
      select: { country: true, city: true },
    })
  } catch {}

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          {/* Left sidebar - location nav */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <LocationSidebar />
            </div>
          </div>

          {/* Main content */}
          <ModelGrid
            title={locationInfo ? `Models in ${locationInfo.city}` : 'Models'}
            initialFilters={{ citySlug: params.citySlug }}
          />

          {/* Right sidebar - premium agencies */}
          <div className="hidden xl:block">
            <PremiumAgencySidebar
              countryCode={cc}
              citySlug={params.citySlug}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
