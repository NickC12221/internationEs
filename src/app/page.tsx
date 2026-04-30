// src/app/page.tsx
import Header from '@/components/layout/Header'
import LocationSidebar from '@/components/layout/LocationSidebar'
import ModelGrid from '@/components/model/ModelGrid'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <div className="border-b border-stone-900 bg-stone-950 px-4 py-12 text-center sm:px-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-amber-600">
          Premier Model Directory
        </p>
        <h1
          className="text-5xl font-light tracking-wide text-stone-100 sm:text-6xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Discover Exceptional Talent
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-stone-400">
          Browse verified professional models from cities around the world.
          Filter by location, availability, and more.
        </p>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <LocationSidebar />
            </div>
          </div>

          {/* Grid */}
          <ModelGrid title="All Models" />
        </div>
      </div>
    </div>
  )
}
