'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'

const COUNTRIES_WITH_CITIES: Record<string, { code: string; cities: string[] }> = {
  "United Arab Emirates": { code: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"] },
  "United Kingdom": { code: "GB", cities: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh"] },
  "United States": { code: "US", cities: ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Dallas"] },
  "France": { code: "FR", cities: ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux"] },
  "Germany": { code: "DE", cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt"] },
  "Italy": { code: "IT", cities: ["Rome", "Milan", "Florence", "Venice", "Naples"] },
  "Spain": { code: "ES", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Ibiza", "Marbella"] },
  "Australia": { code: "AU", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Gold Coast"] },
  "Canada": { code: "CA", cities: ["Toronto", "Montreal", "Vancouver", "Calgary"] },
  "Brazil": { code: "BR", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"] },
  "Russia": { code: "RU", cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Sochi"] },
  "Japan": { code: "JP", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama"] },
  "South Korea": { code: "KR", cities: ["Seoul", "Busan", "Incheon", "Jeju"] },
  "Thailand": { code: "TH", cities: ["Bangkok", "Phuket", "Pattaya", "Chiang Mai"] },
  "Turkey": { code: "TR", cities: ["Istanbul", "Ankara", "Antalya", "Bodrum"] },
  "Morocco": { code: "MA", cities: ["Casablanca", "Marrakech", "Rabat", "Fes"] },
  "Mexico": { code: "MX", cities: ["Mexico City", "Guadalajara", "Cancún", "Monterrey"] },
  "Colombia": { code: "CO", cities: ["Bogotá", "Medellín", "Cali", "Cartagena"] },
  "Philippines": { code: "PH", cities: ["Manila", "Cebu City", "Makati"] },
  "South Africa": { code: "ZA", cities: ["Johannesburg", "Cape Town", "Durban"] },
  "Saudi Arabia": { code: "SA", cities: ["Riyadh", "Jeddah", "Dammam"] },
  "Qatar": { code: "QA", cities: ["Doha"] },
  "Kuwait": { code: "KW", cities: ["Kuwait City"] },
  "Bahrain": { code: "BH", cities: ["Manama"] },
  "Singapore": { code: "SG", cities: ["Singapore"] },
  "Switzerland": { code: "CH", cities: ["Zurich", "Geneva", "Basel"] },
  "Netherlands": { code: "NL", cities: ["Amsterdam", "Rotterdam", "The Hague"] },
  "Sweden": { code: "SE", cities: ["Stockholm", "Gothenburg", "Malmö"] },
  "Greece": { code: "GR", cities: ["Athens", "Thessaloniki", "Mykonos", "Santorini"] },
  "Portugal": { code: "PT", cities: ["Lisbon", "Porto", "Faro"] },
}

const SORTED_COUNTRIES = Object.keys(COUNTRIES_WITH_CITIES).sort()

export default function AgencySignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', country: '', countryCode: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const cities = form.country ? (COUNTRIES_WITH_CITIES[form.country]?.cities || []) : []

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = e.target.value
    const data = COUNTRIES_WITH_CITIES[countryName]
    setForm(p => ({ ...p, country: countryName, countryCode: data?.code || '', city: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/agency-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/agency-dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-4xl font-light tracking-widest text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>FEMME</span>
          </Link>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-stone-400">Create an Agency Account</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-400">
          Agency accounts include a 30-day free trial. Subscription required to remain active.
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
          {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-4 py-3 text-sm text-red-400">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Agency Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="Your agency name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="agency@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Country</label>
              <select value={form.country} onChange={handleCountryChange} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                <option value="">Select country...</option>
                {SORTED_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">City</label>
              {cities.length > 0 ? (
                <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                  <option value="">Select city...</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                  placeholder={form.country ? "Enter your city" : "Select a country first"} />
              )}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="mt-6 w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
            {loading ? 'Creating agency...' : 'Create Agency Account'}
          </button>
          <p className="mt-4 text-center text-sm text-stone-500">
            Already have an account? <Link href="/login" className="text-amber-500 hover:text-amber-400">Sign in</Link>
          </p>
          <p className="mt-2 text-center text-sm text-stone-500">
            Are you a model? <Link href="/signup" className="text-amber-500 hover:text-amber-400">Sign up here</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
