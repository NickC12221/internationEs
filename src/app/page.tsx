import Header from '@/components/layout/Header'
import LocationSidebar from '@/components/layout/LocationSidebar'
import ModelGrid from '@/components/model/ModelGrid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'International Escorts — Premium Escort Directory Worldwide',
  description: 'Find verified independent escorts and escort agencies worldwide. Browse by city, view photos, rates and availability. Discreet bookings across the UK, Europe, UAE and beyond.',
  keywords: 'escort directory, international escorts, independent escort, escort agency, escorts near me, verified escorts, premium escort, book an escort, female escorts',
  openGraph: {
    title: 'International Escorts — Premium Escort Directory Worldwide',
    description: 'Find verified independent escorts and escort agencies worldwide. Browse by city, view photos, rates and availability.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <div className="border-b border-stone-900 bg-stone-950 px-4 py-12 text-center sm:px-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-amber-600">
          The World's Premier Escort Directory
        </p>
        <h1 className="text-5xl font-light tracking-wide text-stone-100 sm:text-6xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Find Your Perfect Companion
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-stone-400">
          Browse verified independent escorts and agencies across 50+ countries. Discreet, professional and trusted worldwide.
        </p>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
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
              <h3 className="text-xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Verified &amp; Trusted</h3>
              <p className="text-sm text-stone-400 leading-relaxed">Every escort is reviewed by our team before going live. Real photos, genuine profiles, no fakes. Browse with complete confidence.</p>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
              <div className="mb-4 text-3xl">◈</div>
              <h3 className="text-xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Worldwide Coverage</h3>
              <p className="text-sm text-stone-400 leading-relaxed">From London to Dubai, Paris to New York. Hundreds of cities across Europe, Asia, the Middle East and beyond.</p>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
              <div className="mb-4 text-3xl">◇</div>
              <h3 className="text-xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Book Direct</h3>
              <p className="text-sm text-stone-400 leading-relaxed">Connect directly with escorts and agencies. No middlemen, transparent pricing, complete discretion guaranteed.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
