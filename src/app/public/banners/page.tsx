import Header from '@/components/layout/Header'

export const metadata = {
  title: 'Banners | International Escorts',
  description: 'Download banners and link codes to promote International Escorts on your website.',
}

const BANNERS = [
  { file: '728x90.gif', size: '728 × 90', label: 'Leaderboard', desc: 'Header/footer banner' },
  { file: '300x250.gif', size: '300 × 250', label: 'Medium Rectangle', desc: 'Sidebar & in-content' },
  { file: '160x600.gif', size: '160 × 600', label: 'Wide Skyscraper', desc: 'Tall sidebar' },
  { file: '468x60.gif', size: '468 × 60', label: 'Full Banner', desc: 'Classic banner' },
  { file: '320x50.gif', size: '320 × 50', label: 'Mobile Banner', desc: 'Mobile optimised' },
  { file: '120x60.gif', size: '120 × 60', label: 'Button', desc: 'Small button link' },
]

export default function BannersPage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Banners & Link Codes
          </h1>
          <p className="text-stone-400 max-w-xl">
            Add an International Escorts banner to your website and start referring visitors. Copy the embed code below any banner and paste it into your site's HTML.
          </p>
        </div>

        <div className="space-y-6">
          {BANNERS.map(b => {
            const [w, h] = b.file.replace('.gif','').split('x').map(Number)
            const embedCode = `<a href="https://internationalescorts.com" target="_blank" rel="noopener noreferrer"><img src="https://internationalescorts.com/banners/${b.file}" width="${w}" height="${h}" alt="International Escorts — Premium Escort Directory" border="0" /></a>`
            const directUrl = `https://internationalescorts.com/banners/${b.file}`
            return (
              <div key={b.file} className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <h2 className="text-base font-medium text-stone-200">{b.label} <span className="text-stone-600 font-normal text-sm ml-1">{b.size}px</span></h2>
                    <p className="text-xs text-stone-500">{b.desc}</p>
                  </div>
                  <a href={directUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-amber-600 hover:text-amber-500 transition-colors">
                    Direct URL →
                  </a>
                </div>

                {/* Banner preview */}
                <div className="mb-4 overflow-x-auto rounded-lg bg-stone-950 border border-stone-800 p-4 flex justify-center">
                  <img
                    src={`/banners/${b.file}`}
                    width={Math.min(w, 660)}
                    height={Math.round(h * (Math.min(w, 660) / w))}
                    alt={`${b.label} banner preview`}
                    className="max-w-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="hidden text-xs text-stone-600 py-2" id={`placeholder-${b.file}`}>
                    Banner image not yet uploaded
                  </div>
                </div>

                {/* Embed code */}
                <div className="mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">HTML Embed Code</p>
                  <div className="rounded-lg bg-stone-800 p-3 font-mono text-xs text-stone-400 break-all select-all">
                    {embedCode}
                  </div>
                </div>

                {/* Direct URL */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">Direct Image URL</p>
                  <div className="rounded-lg bg-stone-800 p-3 font-mono text-xs text-amber-600 break-all select-all">
                    {directUrl}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Text link */}
        <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-base font-medium text-stone-200 mb-1">Text Link</h2>
          <p className="text-xs text-stone-500 mb-4">A simple text link — works anywhere, no image needed.</p>
          <div className="rounded-lg bg-stone-800 p-3 font-mono text-xs text-stone-400 break-all select-all">
            {`<a href="https://internationalescorts.com" target="_blank" rel="noopener noreferrer">International Escorts — Premium Escort Directory Worldwide</a>`}
          </div>
        </div>

        <p className="mt-8 text-xs text-stone-600 text-center">
          To add new banner sizes, upload image files to the <span className="text-stone-400">public/banners/</span> folder of the project.
        </p>
      </div>
    </div>
  )
}
