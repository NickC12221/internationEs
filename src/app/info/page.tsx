import Header from '@/components/layout/Header'
import Link from 'next/link'

export const metadata = {
  title: 'How It Works | International Escorts',
  robots: 'noindex, nofollow',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            How International Escorts Works
          </h1>
          <p className="text-stone-400 max-w-xl mx-auto">Everything you need to know about getting set up and making the most of your listing.</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-3 mb-10 border-b border-stone-800 pb-0">
          <a href="#escorts" className="px-5 py-2.5 text-sm font-medium text-amber-400 border-b-2 border-amber-600 -mb-px">For Escorts</a>
          <a href="#agencies" className="px-5 py-2.5 text-sm font-medium text-stone-400 hover:text-stone-200 transition-colors">For Agencies</a>
        </div>

        {/* FOR ESCORTS */}
        <section id="escorts" className="mb-20">
          <h2 className="text-2xl font-light text-stone-100 mb-8" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            For Independent Escorts
          </h2>

          <div className="space-y-4 mb-10">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up as an Independent Escort. Fill in your display name, location and basic profile details. Your profile will be submitted for review.' },
              { step: '02', title: 'Awaiting Approval', desc: 'Our team manually reviews every new profile before it goes live. This usually takes 24–48 hours. You\'ll receive a notification once approved.' },
              { step: '03', title: 'Complete Your Profile', desc: 'Add photos (up to 15), write a bio, set your services, rates, availability and physical details. The more complete your profile, the more enquiries you\'ll receive.' },
              { step: '04', title: 'Get Verified', desc: 'Submit your verification documents via the Dashboard → Verify tab. Verified profiles get a badge and rank higher in search results.' },
              { step: '05', title: 'Upgrade to Premium', desc: 'Premium listings appear at the top of every city and country page. You also get access to video upload, analytics and a featured newsletter spot.' },
              { step: '06', title: 'Receive Bookings', desc: 'Clients can book you directly through your profile or send a message. You\'ll be notified instantly and can accept or decline from your dashboard.' },
            ].map(item => (
              <div key={item.step} className="flex gap-5 rounded-xl border border-stone-800 bg-stone-900 p-5">
                <span className="text-2xl font-light text-amber-700 flex-shrink-0 w-8" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{item.step}</span>
                <div>
                  <h3 className="font-medium text-stone-200 mb-1">{item.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-light text-stone-100 mb-5" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              { q: 'How long does profile approval take?', a: 'We aim to review all new profiles within 24–48 hours. You\'ll receive a dashboard notification when your profile is approved or if we need any changes.' },
              { q: 'How do I get verified?', a: 'Go to Dashboard → Verify. You\'ll need to upload a photo ID and a short video selfie for likeness confirmation. Verification is reviewed within 48 hours.' },
              { q: 'What\'s the difference between Free and Premium?', a: 'Free listings appear below premium ones in search. Premium escorts appear at the top of all city and country listings, can upload a video, and get analytics and newsletter features.' },
              { q: 'Can I change my location?', a: 'Yes — go to Dashboard and click Edit to update your city and country at any time.' },
              { q: 'How do I receive payments?', a: 'All payments are handled directly between you and the client. International Escorts is a directory only and does not process payments for bookings.' },
              { q: 'Can I pause my listing?', a: 'Yes — set your availability to "Unavailable" in your dashboard and you will no longer appear in search results.' },
              { q: 'What happens if I get a bad review?', a: 'Only clients with a confirmed booking can leave a review. If you believe a review is fraudulent, contact support and we\'ll investigate.' },
              { q: 'How do I delete my account?', a: 'Contact support at support@internationalescorts.com and we will remove your profile and all associated data within 48 hours.' },
            ].map(item => (
              <details key={item.q} className="rounded-xl border border-stone-800 bg-stone-900">
                <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-stone-200 list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-stone-600 text-lg">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-stone-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FOR AGENCIES */}
        <section id="agencies">
          <h2 className="text-2xl font-light text-stone-100 mb-8" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            For Escort Agencies
          </h2>

          <div className="space-y-4 mb-10">
            {[
              { step: '01', title: 'Create an Agency Account', desc: 'Sign up as an Escort Agency. Provide your agency name, location and contact details. Your agency will be submitted for review before going live.' },
              { step: '02', title: 'Awaiting Approval', desc: 'Our team reviews all new agencies within 24–48 hours. You\'ll receive a notification when approved.' },
              { step: '03', title: 'Set Up Your Agency Profile', desc: 'Upload your agency logo, banner photo, write a description and add your contact details including phone, Twitter/X and website.' },
              { step: '04', title: 'Add Your Escorts', desc: 'Free accounts can add up to 5 escorts. Each escort gets their own profile with photos, bio, services and rates. Premium agencies can add up to 20 escorts.' },
              { step: '05', title: 'Upgrade to Premium Agency', desc: 'Premium agencies get priority placement in the agency directory, a city page sidebar feature, analytics, newsletter inclusion and discounted escort premium upgrades.' },
              { step: '06', title: 'Manage Bookings', desc: 'All booking requests come into your agency inbox. Manage bookings, messages and notifications from your agency dashboard.' },
            ].map(item => (
              <div key={item.step} className="flex gap-5 rounded-xl border border-stone-800 bg-stone-900 p-5">
                <span className="text-2xl font-light text-amber-700 flex-shrink-0 w-8" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{item.step}</span>
                <div>
                  <h3 className="font-medium text-stone-200 mb-1">{item.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-light text-stone-100 mb-5" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              { q: 'How many escorts can I add?', a: 'Free agency accounts can add up to 5 escorts. Upgrading to Premium allows up to 20 escorts on your roster.' },
              { q: 'Can escorts have their own premium listings?', a: 'Yes — you can upgrade individual escorts to Premium from the Upgrades tab in your agency dashboard. Premium escorts appear at the top of all listings.' },
              { q: 'How does the agency profile work?', a: 'Your agency gets its own public page listing all your escorts. Clients can browse your roster and contact you or book individual escorts directly.' },
              { q: 'Can I manage all my escorts from one dashboard?', a: 'Yes — the Agency Dashboard gives you a complete overview of all your escorts, bookings, messages and premium status in one place.' },
              { q: 'What is the city page sidebar?', a: 'Premium agencies get a featured sidebar placement on city listing pages, making your agency visible to everyone browsing escorts in that city.' },
              { q: 'How do I get agency approval?', a: 'Submit your agency details on signup. Our team reviews within 24–48 hours. You\'ll be notified when approved.' },
              { q: 'Can I add videos for my escorts?', a: 'Yes — escorts who have been upgraded to Premium can have a video uploaded from the Edit Escort form in your agency dashboard.' },
              { q: 'How do I contact support?', a: 'Use the Contact Support button at the bottom of your agency dashboard, or email support@internationalescorts.com.' },
            ].map(item => (
              <details key={item.q} className="rounded-xl border border-stone-800 bg-stone-900">
                <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-stone-200 list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-stone-600 text-lg">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-stone-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 text-center border-t border-stone-800 pt-10">
          <p className="text-stone-500 text-sm mb-4">Still have questions?</p>
          <Link href="/contact" className="rounded-xl bg-amber-700 px-6 py-3 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
