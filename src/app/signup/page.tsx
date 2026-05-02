'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Building2 } from 'lucide-react'

const COUNTRIES_WITH_CITIES: Record<string, { code: string; cities: string[] }> = {
  "Australia": { code: "AU", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"] },
  "Austria": { code: "AT", cities: ["Vienna", "Graz", "Salzburg"] },
  "Bahrain": { code: "BH", cities: ["Manama", "Riffa"] },
  "Belgium": { code: "BE", cities: ["Brussels", "Antwerp", "Ghent"] },
  "Brazil": { code: "BR", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"] },
  "Canada": { code: "CA", cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa"] },
  "China": { code: "CN", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"] },
  "Colombia": { code: "CO", cities: ["Bogotá", "Medellín", "Cali", "Cartagena"] },
  "Croatia": { code: "HR", cities: ["Zagreb", "Split", "Dubrovnik"] },
  "Cyprus": { code: "CY", cities: ["Nicosia", "Limassol", "Larnaca", "Paphos"] },
  "Czech Republic": { code: "CZ", cities: ["Prague", "Brno"] },
  "Denmark": { code: "DK", cities: ["Copenhagen", "Aarhus"] },
  "Egypt": { code: "EG", cities: ["Cairo", "Alexandria", "Sharm el-Sheikh", "Hurghada"] },
  "Finland": { code: "FI", cities: ["Helsinki", "Tampere"] },
  "France": { code: "FR", cities: ["Paris", "Marseille", "Lyon", "Nice", "Bordeaux"] },
  "Germany": { code: "DE", cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt"] },
  "Ghana": { code: "GH", cities: ["Accra", "Kumasi"] },
  "Greece": { code: "GR", cities: ["Athens", "Thessaloniki", "Mykonos", "Santorini"] },
  "Hungary": { code: "HU", cities: ["Budapest"] },
  "India": { code: "IN", cities: ["Mumbai", "Delhi", "Bangalore", "Goa", "Chennai"] },
  "Indonesia": { code: "ID", cities: ["Jakarta", "Bali", "Surabaya"] },
  "Ireland": { code: "IE", cities: ["Dublin", "Cork", "Galway"] },
  "Israel": { code: "IL", cities: ["Tel Aviv", "Jerusalem"] },
  "Italy": { code: "IT", cities: ["Rome", "Milan", "Florence", "Venice", "Naples"] },
  "Jamaica": { code: "JM", cities: ["Kingston", "Montego Bay"] },
  "Japan": { code: "JP", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama"] },
  "Jordan": { code: "JO", cities: ["Amman", "Aqaba"] },
  "Kenya": { code: "KE", cities: ["Nairobi", "Mombasa"] },
  "Kuwait": { code: "KW", cities: ["Kuwait City"] },
  "Lebanon": { code: "LB", cities: ["Beirut"] },
  "Malaysia": { code: "MY", cities: ["Kuala Lumpur", "George Town", "Johor Bahru"] },
  "Maldives": { code: "MV", cities: ["Malé"] },
  "Malta": { code: "MT", cities: ["Valletta", "St. Julian's"] },
  "Mexico": { code: "MX", cities: ["Mexico City", "Guadalajara", "Cancún", "Monterrey"] },
  "Monaco": { code: "MC", cities: ["Monaco"] },
  "Montenegro": { code: "ME", cities: ["Podgorica", "Budva", "Kotor"] },
  "Morocco": { code: "MA", cities: ["Casablanca", "Marrakech", "Rabat", "Fes"] },
  "Netherlands": { code: "NL", cities: ["Amsterdam", "Rotterdam", "The Hague"] },
  "New Zealand": { code: "NZ", cities: ["Auckland", "Wellington", "Queenstown"] },
  "Nigeria": { code: "NG", cities: ["Lagos", "Abuja"] },
  "Norway": { code: "NO", cities: ["Oslo", "Bergen"] },
  "Oman": { code: "OM", cities: ["Muscat", "Salalah"] },
  "Pakistan": { code: "PK", cities: ["Karachi", "Lahore", "Islamabad"] },
  "Philippines": { code: "PH", cities: ["Manila", "Cebu City", "Makati"] },
  "Poland": { code: "PL", cities: ["Warsaw", "Kraków", "Gdańsk"] },
  "Portugal": { code: "PT", cities: ["Lisbon", "Porto", "Faro"] },
  "Qatar": { code: "QA", cities: ["Doha"] },
  "Romania": { code: "RO", cities: ["Bucharest", "Cluj-Napoca"] },
  "Russia": { code: "RU", cities: ["Moscow", "Saint Petersburg", "Sochi"] },
  "Saudi Arabia": { code: "SA", cities: ["Riyadh", "Jeddah", "Dammam"] },
  "Serbia": { code: "RS", cities: ["Belgrade", "Novi Sad"] },
  "Singapore": { code: "SG", cities: ["Singapore"] },
  "South Africa": { code: "ZA", cities: ["Johannesburg", "Cape Town", "Durban"] },
  "South Korea": { code: "KR", cities: ["Seoul", "Busan", "Jeju"] },
  "Spain": { code: "ES", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Ibiza", "Marbella"] },
  "Sweden": { code: "SE", cities: ["Stockholm", "Gothenburg", "Malmö"] },
  "Switzerland": { code: "CH", cities: ["Zurich", "Geneva", "Basel"] },
  "Thailand": { code: "TH", cities: ["Bangkok", "Phuket", "Pattaya", "Chiang Mai"] },
  "Tunisia": { code: "TN", cities: ["Tunis", "Sousse"] },
  "Turkey": { code: "TR", cities: ["Istanbul", "Ankara", "Antalya", "Bodrum"] },
  "Ukraine": { code: "UA", cities: ["Kyiv", "Odessa", "Lviv"] },
  "United Arab Emirates": { code: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"] },
  "United Kingdom": { code: "GB", cities: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh"] },
  "United States": { code: "US", cities: ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Dallas", "Houston", "Atlanta", "Boston", "Seattle"] },
  "Vietnam": { code: "VN", cities: ["Ho Chi Minh City", "Hanoi", "Da Nang"] },
}

const SORTED_COUNTRIES = Object.keys(COUNTRIES_WITH_CITIES).sort()

type AccountType = 'model' | 'agency' | 'guest' | null

export default function SignupPage() {
  const [accountType, setAccountType] = useState<AccountType>(null)
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

    const endpoint =
      accountType === 'agency' ? '/api/auth/agency-signup' :
      accountType === 'guest' ? '/api/auth/guest-signup' :
      '/api/auth/signup'

    const body =
      accountType === 'agency'
        ? { name: form.name, email: form.email, password: form.password, country: form.country, countryCode: form.countryCode, city: form.city }
        : accountType === 'guest'
        ? { name: form.name, email: form.email, password: form.password }
        : { displayName: form.name, email: form.email, password: form.password, country: form.country, countryCode: form.countryCode, city: form.city }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        router.push(accountType === 'agency' ? '/agency-dashboard' : '/dashboard')
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

  const needsLocation = accountType === 'model' || accountType === 'agency'

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-4xl font-light tracking-widest text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>FEMME</span>
          </Link>
          <p className="mt-2 text-sm text-stone-500">Create your account</p>
        </div>

        {!accountType ? (
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
            <h2 className="mb-6 text-center text-lg font-light text-stone-200" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              I am joining as...
            </h2>
            <div className="space-y-3">
              <button onClick={() => setAccountType('model')}
                className="flex w-full items-center gap-4 rounded-xl border border-stone-700 bg-stone-800 p-4 text-left transition-all hover:border-amber-700">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-700">
                  <User className="h-6 w-6 text-stone-300" />
                </div>
                <div>
                  <p className="font-medium text-stone-200">Independent Model</p>
                  <p className="text-xs text-stone-500 mt-0.5">Create your own profile and be discovered</p>
                </div>
              </button>

              <button onClick={() => setAccountType('agency')}
                className="flex w-full items-center gap-4 rounded-xl border border-stone-700 bg-stone-800 p-4 text-left transition-all hover:border-amber-700">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-900/40">
                  <Building2 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-stone-200">Model Agency</p>
                  <p className="text-xs text-stone-500 mt-0.5">Manage a roster of models and get featured</p>
                </div>
              </button>

              <button onClick={() => setAccountType('guest')}
                className="flex w-full items-center gap-4 rounded-xl border border-stone-700 bg-stone-800 p-4 text-left transition-all hover:border-amber-700">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-700">
                  <User className="h-6 w-6 text-stone-400" />
                </div>
                <div>
                  <p className="font-medium text-stone-200">Client / Guest</p>
                  <p className="text-xs text-stone-500 mt-0.5">Book models and send enquiries</p>
                </div>
              </button>
            </div>
            <p className="mt-6 text-center text-sm text-stone-500">
              Already have an account? <Link href="/login" className="text-amber-500 hover:text-amber-400">Sign in</Link>
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => { setAccountType(null); setError('') }} className="text-stone-500 hover:text-stone-300 text-sm">← Back</button>
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${accountType === 'agency' ? 'bg-amber-900/30 text-amber-400' : 'bg-stone-800 text-stone-400'}`}>
                {accountType === 'agency' ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {accountType === 'agency' ? 'Agency Account' : accountType === 'guest' ? 'Client Account' : 'Model Account'}
              </span>
            </div>

            {accountType === 'agency' && (
              <div className="mb-4 rounded-xl border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-xs text-amber-400">
                Agency accounts include a 30-day free trial.
              </div>
            )}

            {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-4 py-3 text-sm text-red-400">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                  {accountType === 'agency' ? 'Agency Name' : 'Full Name'}
                </label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required minLength={2}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                  placeholder={accountType === 'agency' ? 'Your agency name' : accountType === 'guest' ? 'Your full name' : 'Your professional name'} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Password</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                  placeholder="Min 8 characters" />
              </div>

              {needsLocation && (
                <>
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
                        placeholder={form.country ? 'Enter your city' : 'Select a country first'} />
                    )}
                  </div>
                </>
              )}

              <button type="submit" disabled={loading}
                className="mt-2 w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                {loading ? 'Creating account...' : accountType === 'agency' ? 'Create Agency Account' : accountType === 'guest' ? 'Create Account' : 'Create Profile'}
              </button>
              <p className="text-center text-sm text-stone-500">
                Already have an account? <Link href="/login" className="text-amber-500 hover:text-amber-400">Sign in</Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
