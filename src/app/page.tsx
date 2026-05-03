import Header from '@/components/layout/Header'
import LocationSidebar from '@/components/layout/LocationSidebar'
import ModelGrid from '@/components/model/ModelGrid'
import Footer from '@/components/layout/Footer'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <div className="border-b border-stone-900 bg-stone-950 px-4 py-12 text-center sm:px-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-amber-600">
          Premier Model Directory
        </p>
        <h1 className="text-5xl font-light tracking-wide text-stone-100 sm:text-6xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Discover Exceptional Talent
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-stone-400">
          Browse verified professional models from cities around the world.
          Filter by location, availability, and more.
        </p>
      </div>

      {/* Main layout */}
      <div className="flex-1 mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <LocationSidebar />
            </div>
          </div>
          <ModelGrid title="All Models" pageSize={32} />
        </div>
      </div>

      {/* Content blocks */}
      <div className="border-t border-stone-900 bg-stone-950">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
              <div className="mb-4 text-3xl">✦</div>
              <h3 className="text-xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Verified Talent</h3>
              <p className="text-sm text-stone-400 leading-relaxed">Every model on Femme Directory is reviewed and verified by our team. Browse with confidence knowing each profile is genuine.</p>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
              <div className="mb-4 text-3xl">◈</div>
              <h3 className="text-xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Global Reach</h3>
              <p className="text-sm text-stone-400 leading-relaxed">Discover models across hundreds of cities worldwide. From Dubai to London, Paris to New York — talent without borders.</p>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
              <div className="mb-4 text-3xl">◇</div>
              <h3 className="text-xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Direct Booking</h3>
              <p className="text-sm text-stone-400 leading-relaxed">Connect and book directly with models and agencies. No middlemen, no hidden fees. Simple, transparent, professional.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
