// src/app/[countryCode]/page.tsx
import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import LocationSidebar from '@/components/layout/LocationSidebar'
import ModelGrid from '@/components/model/ModelGrid'
import { prisma } from '@/lib/db/prisma'

interface Props {
  params: { countryCode: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const countryCode = params.countryCode.toUpperCase()
  const profile = await prisma.profile.findFirst({
    where: { countryCode, isActive: true },
    select: { country: true },
  })

  const country = profile?.country || countryCode
  return {
    title: `Models in ${country}`,
    description: `Browse professional female models based in ${country}.`,
  }
}

export default async function CountryPage({ params }: Props) {
  const countryCode = params.countryCode.toUpperCase()

  const countryInfo = await prisma.profile.findFirst({
    where: { countryCode, isActive: true },
    select: { country: true },
  })

  const country = countryInfo?.country || countryCode

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
            title={`Models in ${country}`}
            initialFilters={{ countryCode }}
          />
        </div>
      </div>
    </div>
  )
}
