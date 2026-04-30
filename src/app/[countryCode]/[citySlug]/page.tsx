import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import LocationSidebar from '@/components/layout/LocationSidebar'
import ModelGrid from '@/components/model/ModelGrid'
import { prisma } from '@/lib/db/prisma'

interface Props {
  params: { countryCode: string; citySlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cc = params.countryCode.toUpperCase()
  const profile = await prisma.profile.findFirst({
    where: { countryCode: cc, citySlug: params.citySlug, isActive: true },
    select: { country: true, city: true },
  })
  if (!profile) return { title: 'Models' }
  return {
    title: `Models in ${profile.city}, ${profile.country}`,
    description: `Browse professional female models based in ${profile.city}, ${profile.country}.`,
  }
}

export default async function CityPage({ params }: Props) {
  const cc = params.countryCode.toUpperCase()
  const locationInfo = await prisma.profile.findFirst({
    where: { countryCode: cc, citySlug: params.citySlug, isActive: true },
    select: { country: true, city: true },
  })
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <LocationSidebar />
            </div>
          </div>
          <ModelGrid
            title={locationInfo ? `Models in ${locationInfo.city}` : 'Models'}
            initialFilters={{ citySlug: params.citySlug }}
          />
        </div>
      </div>
    </div>
  )
}
