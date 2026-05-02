'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Building2, CheckCircle } from 'lucide-react'

const COUNTRIES_WITH_CITIES: Record<string, { code: string; cities: string[] }> = {
  "Afghanistan": { code: "AF", cities: ["Kabul", "Kandahar", "Herat"] },
  "Albania": { code: "AL", cities: ["Tirana", "Durrës", "Vlorë"] },
  "Algeria": { code: "DZ", cities: ["Algiers", "Oran", "Constantine"] },
  "Argentina": { code: "AR", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"] },
  "Australia": { code: "AU", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra"] },
  "Austria": { code: "AT", cities: ["Vienna", "Graz", "Linz", "Salzburg"] },
  "Azerbaijan": { code: "AZ", cities: ["Baku", "Ganja"] },
  "Bahrain": { code: "BH", cities: ["Manama", "Riffa", "Muharraq"] },
  "Bangladesh": { code: "BD", cities: ["Dhaka", "Chittagong", "Sylhet"] },
  "Belarus": { code: "BY", cities: ["Minsk", "Gomel", "Vitebsk"] },
  "Belgium": { code: "BE", cities: ["Brussels", "Antwerp", "Ghent", "Bruges"] },
  "Bolivia": { code: "BO", cities: ["La Paz", "Santa Cruz", "Cochabamba"] },
  "Brazil": { code: "BR", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Curitiba", "Recife", "Porto Alegre"] },
  "Bulgaria": { code: "BG", cities: ["Sofia", "Plovdiv", "Varna"] },
  "Cambodia": { code: "KH", cities: ["Phnom Penh", "Siem Reap"] },
  "Canada": { code: "CA", cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Quebec City", "Winnipeg"] },
  "Chile": { code: "CL", cities: ["Santiago", "Valparaíso", "Concepción"] },
  "China": { code: "CN", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Wuhan", "Xi'an", "Hangzhou", "Nanjing"] },
  "Colombia": { code: "CO", cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"] },
  "Croatia": { code: "HR", cities: ["Zagreb", "Split", "Dubrovnik"] },
  "Cyprus": { code: "CY", cities: ["Nicosia", "Limassol", "Larnaca", "Paphos"] },
  "Czech Republic": { code: "CZ", cities: ["Prague", "Brno", "Ostrava"] },
  "Denmark": { code: "DK", cities: ["Copenhagen", "Aarhus", "Odense"] },
  "Dominican Republic": { code: "DO", cities: ["Santo Domingo", "Santiago", "Punta Cana"] },
  "Ecuador": { code: "EC", cities: ["Quito", "Guayaquil"] },
  "Egypt": { code: "EG", cities: ["Cairo", "Alexandria", "Giza", "Sharm el-Sheikh", "Hurghada", "Luxor"] },
  "Estonia": { code: "EE", cities: ["Tallinn", "Tartu"] },
  "Finland": { code: "FI", cities: ["Helsinki", "Espoo", "Tampere"] },
  "France": { code: "FR", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux", "Lille"] },
  "Georgia": { code: "GE", cities: ["Tbilisi", "Batumi"] },
  "Germany": { code: "DE", cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dresden"] },
  "Ghana": { code: "GH", cities: ["Accra", "Kumasi"] },
  "Greece": { code: "GR", cities: ["Athens", "Thessaloniki", "Patras", "Mykonos", "Santorini"] },
  "Hungary": { code: "HU", cities: ["Budapest", "Debrecen"] },
  "India": { code: "IN", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa"] },
  "Indonesia": { code: "ID", cities: ["Jakarta", "Surabaya", "Bandung", "Bali", "Yogyakarta"] },
  "Iran": { code: "IR", cities: ["Tehran", "Mashhad", "Isfahan"] },
  "Iraq": { code: "IQ", cities: ["Baghdad", "Basra", "Erbil"] },
  "Ireland": { code: "IE", cities: ["Dublin", "Cork", "Limerick", "Galway"] },
  "Israel": { code: "IL", cities: ["Tel Aviv", "Jerusalem", "Haifa"] },
  "Italy": { code: "IT", cities: ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice", "Bologna"] },
  "Jamaica": { code: "JM", cities: ["Kingston", "Montego Bay"] },
  "Japan": { code: "JP", cities: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kyoto", "Hiroshima"] },
  "Jordan": { code: "JO", cities: ["Amman", "Zarqa", "Aqaba"] },
  "Kazakhstan": { code: "KZ", cities: ["Almaty", "Nur-Sultan"] },
  "Kenya": { code: "KE", cities: ["Nairobi", "Mombasa"] },
  "Kuwait": { code: "KW", cities: ["Kuwait City", "Salmiya"] },
  "Latvia": { code: "LV", cities: ["Riga", "Daugavpils"] },
  "Lebanon": { code: "LB", cities: ["Beirut", "Tripoli"] },
  "Lithuania": { code: "LT", cities: ["Vilnius", "Kaunas"] },
  "Luxembourg": { code: "LU", cities: ["Luxembourg City"] },
  "Malaysia": { code: "MY", cities: ["Kuala Lumpur", "George Town", "Johor Bahru", "Kota Kinabalu"] },
  "Maldives": { code: "MV", cities: ["Malé"] },
  "Malta": { code: "MT", cities: ["Valletta", "St. Julian's"] },
  "Mexico": { code: "MX", cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Cancún", "Mérida"] },
  "Moldova": { code: "MD", cities: ["Chișinău"] },
  "Monaco": { code: "MC", cities: ["Monaco"] },
  "Montenegro": { code: "ME", cities: ["Podgorica", "Budva", "Kotor"] },
  "Morocco": { code: "MA", cities: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir"] },
  "Netherlands": { code: "NL", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"] },
  "New Zealand": { code: "NZ", cities: ["Auckland", "Wellington", "Christchurch", "Queenstown"] },
  "Nigeria": { code: "NG", cities: ["Lagos", "Abuja", "Kano", "Port Harcourt"] },
  "Norway": { code: "NO", cities: ["Oslo", "Bergen", "Stavanger"] },
  "Oman": { code: "OM", cities: ["Muscat", "Salalah"] },
  "Pakistan": { code: "PK", cities: ["Karachi", "Lahore", "Islamabad", "Peshawar"] },
  "Panama": { code: "PA", cities: ["Panama City"] },
  "Peru": { code: "PE", cities: ["Lima", "Arequipa", "Cusco"] },
  "Philippines": { code: "PH", cities: ["Manila", "Cebu City", "Davao", "Makati"] },
  "Poland": { code: "PL", cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Gdańsk"] },
  "Portugal": { code: "PT", cities: ["Lisbon", "Porto", "Braga", "Faro"] },
  "Qatar": { code: "QA", cities: ["Doha", "Al Wakrah"] },
  "Romania": { code: "RO", cities: ["Bucharest", "Cluj-Napoca", "Timișoara"] },
  "Russia": { code: "RU", cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Kazan", "Sochi"] },
  "Saudi Arabia": { code: "SA", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"] },
  "Serbia": { code: "RS", cities: ["Belgrade", "Novi Sad"] },
  "Singapore": { code: "SG", cities: ["Singapore"] },
  "Slovakia": { code: "SK", cities: ["Bratislava", "Košice"] },
  "Slovenia": { code: "SI", cities: ["Ljubljana", "Maribor"] },
  "South Africa": { code: "ZA", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria"] },
  "South Korea": { code: "KR", cities: ["Seoul", "Busan", "Incheon", "Daegu", "Jeju"] },
  "Spain": { code: "ES", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Málaga", "Bilbao", "Ibiza", "Marbella"] },
  "Sri Lanka": { code: "LK", cities: ["Colombo", "Kandy", "Galle"] },
  "Sweden": { code: "SE", cities: ["Stockholm", "Gothenburg", "Malmö"] },
  "Switzerland": { code: "CH", cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"] },
  "Taiwan": { code: "TW", cities: ["Taipei", "Kaohsiung", "Taichung"] },
  "Tanzania": { code: "TZ", cities: ["Dar es Salaam", "Zanzibar", "Arusha"] },
  "Thailand": { code: "TH", cities: ["Bangkok", "Chiang Mai", "Pattaya", "Phuket", "Koh Samui"] },
  "Tunisia": { code: "TN", cities: ["Tunis", "Sfax", "Sousse"] },
  "Turkey": { code: "TR", cities: ["Istanbul", "Ankara", "Izmir", "Antalya", "Bodrum"] },
  "Ukraine": { code: "UA", cities: ["Kyiv", "Kharkiv", "Odessa", "Lviv"] },
  "United Arab Emirates": { code: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"] },
  "United Kingdom": { code: "GB", cities: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh", "Bristol", "Leeds"] },
  "United States": { code: "US", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "Las Vegas", "Seattle", "Boston", "Atlanta", "Dallas"] },
  "Uruguay": { code: "UY", cities: ["Montevideo", "Punta del Este"] },
  "Uzbekistan": { code: "UZ", cities: ["Tashkent", "Samarkand"] },
  "Venezuela": { code: "VE", cities: ["Caracas", "Maracaibo"] },
  "Vietnam": { code: "VN", cities: ["Ho Chi Minh City", "Hanoi", "Da Nang"] },
  "Zimbabwe": { code: "ZW", cities: ["Harare", "Bulawayo"] },
}

const SORTED_COUNTRIES = Object.keys(COUNTRIES_WITH_CITIES).sort()

type AccountType = 'model' | 'agency' | 'guest' | null

export default function SignupPage() {
  const [accountType, setAccountType] = useState<AccountType>(null)
  const [agencyPlan, setAgencyPlan] = useState<'free' | 'premium'>('free')
  const [agencyPlan, setAgencyPlan] = useState<'FREE' | 'PREMIUM'>('FREE')
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
    const endpoint = accountType === 'agency' ? '/api/auth/agency-signup' : accountType === 'guest' ? '/api/auth/guest-signup' : '/api/auth/signup'
    const body = accountType === 'agency'
      ? { name: form.name, email: form.email, password: form.password, country: form.country, countryCode: form.countryCode, city: form.city, isPremium: agencyPlan === 'premium' }
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="text-4xl font-light tracking-widest text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>FEMME</span>
          </Link>
          <p className="mt-2 text-sm text-stone-500">Create your account</p>
        </div>

        {/* Account type selection */}
        {!accountType ? (
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
            <h2 className="mb-6 text-center text-lg font-light text-stone-200" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              I am joining as...
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setAccountType('model')}
                className="flex w-full items-center gap-4 rounded-xl border border-stone-700 bg-stone-800 p-4 text-left transition-all hover:border-amber-700 hover:bg-stone-750"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-stone-700">
                  <User className="h-6 w-6 text-stone-300" />
                </div>
                <div>
                  <p className="font-medium text-stone-200">Independent Model</p>
                  <p className="text-xs text-stone-500 mt-0.5">Create your own profile and be discovered</p>
                </div>
              </button>

              <button
                onClick={() => setAccountType('agency')}
                className="flex w-full items-center gap-4 rounded-xl border border-stone-700 bg-stone-800 p-4 text-left transition-all hover:border-amber-700"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-900/40">
                  <Building2 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-stone-200">Model Agency</p>
                  <p className="text-xs text-stone-500 mt-0.5">Manage a roster of models and get featured</p>
                </div>
              </button>

              <button
                onClick={() => setAccountType('guest')}
                className="flex w-full items-center gap-4 rounded-xl border border-stone-700 bg-stone-800 p-4 text-left transition-all hover:border-amber-700"
              >
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
              Already have an account?{' '}
              <Link href="/login" className="text-amber-500 hover:text-amber-400">Sign in</Link>
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
            {/* Back button + type indicator */}
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => { setAccountType(null); setError('') }} className="text-stone-500 hover:text-stone-300 text-sm">
                ← Back
              </button>
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${accountType === 'agency' ? 'bg-amber-900/30 text-amber-400' : 'bg-stone-800 text-stone-400'}`}>
                {accountType === 'agency' ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {accountType === 'agency' ? 'Agency Account' : 'Model Account'}
              </span>
            </div>

            {accountType === 'agency' && (
              <div className="mb-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">Choose your plan</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${agencyPlan === 'free' ? 'border-amber-700 bg-amber-950/20' : 'border-stone-700 bg-stone-800 hover:border-stone-600'}`}>
                    <input type="radio" name="plan" value="free" checked={agencyPlan === 'free'} onChange={() => setAgencyPlan('free')} className="hidden" />
                    <p className="font-medium text-stone-200 text-sm">Free</p>
                    <p className="text-lg font-light text-stone-100 mt-1">$0</p>
                    <p className="text-xs text-stone-500 mt-1">Standard listing</p>
                  </label>
                  <label className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${agencyPlan === 'premium' ? 'border-amber-700 bg-amber-950/20' : 'border-stone-700 bg-stone-800 hover:border-stone-600'}`}>
                    <input type="radio" name="plan" value="premium" checked={agencyPlan === 'premium'} onChange={() => setAgencyPlan('premium')} className="hidden" />
                    <p className="font-medium text-amber-400 text-sm">Premium</p>
                    <p className="text-lg font-light text-stone-100 mt-1">$49<span className="text-xs text-stone-500">/mo</span></p>
                    <p className="text-xs text-stone-500 mt-1">Featured in city sidebar</p>
                  </label>
                </div>
              </div>
            )}

            {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-4 py-3 text-sm text-red-400">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                  {accountType === 'agency' ? 'Agency Name' : 'Display Name'}
                </label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required minLength={2}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                  placeholder={accountType === 'agency' ? 'Your agency name' : 'Your professional name'} />
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
              {accountType !== 'guest' && <div>
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

              <button type="submit" disabled={loading}
                className="mt-2 w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                {loading ? 'Creating account...' : accountType === 'agency' ? 'Create Agency Account' : 'Create Profile'}
              </button>

              <p className="text-center text-sm text-stone-500">
                Already have an account?{' '}
                <Link href="/login" className="text-amber-500 hover:text-amber-400">Sign in</Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
