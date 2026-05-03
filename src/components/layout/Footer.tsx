import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-stone-950">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="text-2xl font-light tracking-widest text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              FEMME
            </span>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              The premier directory connecting clients with professional models and agencies worldwide.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4">Browse</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'All Models', href: '/' },
                { label: 'Agencies', href: '/agencies' },
                { label: 'Search', href: '/search' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-500 hover:text-stone-300 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Models */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4">For Models</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Create Profile', href: '/signup' },
                { label: 'Premium Listing', href: '/dashboard/premium' },
                { label: 'Sign In', href: '/login' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-500 hover:text-stone-300 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Agencies */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4">For Agencies</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'List Your Agency', href: '/signup' },
                { label: 'Premium Agency', href: '/agency-dashboard/upgrades' },
                { label: 'Agency Directory', href: '/agencies' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-500 hover:text-stone-300 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600">
            © {new Date().getFullYear()} Femme Directory. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-stone-600 hover:text-stone-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-stone-600 hover:text-stone-400 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-xs text-stone-600 hover:text-stone-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
