'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const COUNTRIES_WITH_CITIES: Record<string, { code: string; cities: string[] }> = {
  "Afghanistan": { code: "AF", cities: ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif"] },
  "Albania": { code: "AL", cities: ["Tirana", "Durrës", "Vlorë", "Shkodër"] },
  "Algeria": { code: "DZ", cities: ["Algiers", "Oran", "Constantine", "Annaba"] },
  "Argentina": { code: "AR", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Mar del Plata"] },
  "Australia": { code: "AU", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra"] },
  "Austria": { code: "AT", cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"] },
  "Azerbaijan": { code: "AZ", cities: ["Baku", "Ganja", "Sumqayit"] },
  "Bahrain": { code: "BH", cities: ["Manama", "Riffa", "Muharraq", "Hamad Town"] },
  "Bangladesh": { code: "BD", cities: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"] },
  "Belarus": { code: "BY", cities: ["Minsk", "Gomel", "Mogilev", "Vitebsk"] },
  "Belgium": { code: "BE", cities: ["Brussels", "Antwerp", "Ghent", "Bruges", "Liège"] },
  "Bolivia": { code: "BO", cities: ["La Paz", "Santa Cruz", "Cochabamba", "Sucre"] },
  "Bosnia and Herzegovina": { code: "BA", cities: ["Sarajevo", "Banja Luka", "Mostar"] },
  "Brazil": { code: "BR", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"] },
  "Bulgaria": { code: "BG", cities: ["Sofia", "Plovdiv", "Varna", "Burgas"] },
  "Cambodia": { code: "KH", cities: ["Phnom Penh", "Siem Reap", "Battambang"] },
  "Cameroon": { code: "CM", cities: ["Douala", "Yaoundé", "Bamenda"] },
  "Canada": { code: "CA", cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Quebec City", "Winnipeg", "Hamilton"] },
  "Chile": { code: "CL", cities: ["Santiago", "Valparaíso", "Concepción", "Antofagasta"] },
  "China": { code: "CN", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Chongqing", "Wuhan", "Xi'an", "Hangzhou", "Nanjing"] },
  "Colombia": { code: "CO", cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"] },
  "Croatia": { code: "HR", cities: ["Zagreb", "Split", "Rijeka", "Osijek", "Dubrovnik"] },
  "Cuba": { code: "CU", cities: ["Havana", "Santiago de Cuba", "Camagüey"] },
  "Cyprus": { code: "CY", cities: ["Nicosia", "Limassol", "Larnaca", "Paphos"] },
  "Czech Republic": { code: "CZ", cities: ["Prague", "Brno", "Ostrava", "Plzeň"] },
  "Denmark": { code: "DK", cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg"] },
  "Dominican Republic": { code: "DO", cities: ["Santo Domingo", "Santiago", "Punta Cana"] },
  "Ecuador": { code: "EC", cities: ["Quito", "Guayaquil", "Cuenca"] },
  "Egypt": { code: "EG", cities: ["Cairo", "Alexandria", "Giza", "Sharm el-Sheikh", "Hurghada", "Luxor"] },
  "Estonia": { code: "EE", cities: ["Tallinn", "Tartu", "Narva"] },
  "Ethiopia": { code: "ET", cities: ["Addis Ababa", "Dire Dawa", "Mekelle"] },
  "Finland": { code: "FI", cities: ["Helsinki", "Espoo", "Tampere", "Oulu"] },
  "France": { code: "FR", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"] },
  "Georgia": { code: "GE", cities: ["Tbilisi", "Batumi", "Kutaisi"] },
  "Germany": { code: "DE", cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Dresden"] },
  "Ghana": { code: "GH", cities: ["Accra", "Kumasi", "Tamale"] },
  "Greece": { code: "GR", cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Mykonos", "Santorini"] },
  "Hungary": { code: "HU", cities: ["Budapest", "Debrecen", "Miskolc", "Pécs"] },
  "India": { code: "IN", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa"] },
  "Indonesia": { code: "ID", cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Bali", "Yogyakarta"] },
  "Iran": { code: "IR", cities: ["Tehran", "Mashhad", "Isfahan", "Tabriz", "Shiraz"] },
  "Iraq": { code: "IQ", cities: ["Baghdad", "Basra", "Mosul", "Erbil"] },
  "Ireland": { code: "IE", cities: ["Dublin", "Cork", "Limerick", "Galway"] },
  "Israel": { code: "IL", cities: ["Tel Aviv", "Jerusalem", "Haifa", "Beer Sheva"] },
  "Italy": { code: "IT", cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Venice", "Bari"] },
  "Jamaica": { code: "JM", cities: ["Kingston", "Montego Bay", "Ocho Rios"] },
  "Japan": { code: "JP", cities: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Hiroshima"] },
  "Jordan": { code: "JO", cities: ["Amman", "Zarqa", "Irbid", "Aqaba"] },
  "Kazakhstan": { code: "KZ", cities: ["Almaty", "Nur-Sultan", "Shymkent"] },
  "Kenya": { code: "KE", cities: ["Nairobi", "Mombasa", "Kisumu"] },
  "Kuwait": { code: "KW", cities: ["Kuwait City", "Hawalli", "Salmiya"] },
  "Latvia": { code: "LV", cities: ["Riga", "Daugavpils", "Liepāja"] },
  "Lebanon": { code: "LB", cities: ["Beirut", "Tripoli", "Sidon"] },
  "Libya": { code: "LY", cities: ["Tripoli", "Benghazi", "Misrata"] },
  "Lithuania": { code: "LT", cities: ["Vilnius", "Kaunas", "Klaipėda"] },
  "Luxembourg": { code: "LU", cities: ["Luxembourg City", "Esch-sur-Alzette"] },
  "Malaysia": { code: "MY", cities: ["Kuala Lumpur", "George Town", "Ipoh", "Johor Bahru", "Kota Kinabalu"] },
  "Maldives": { code: "MV", cities: ["Malé"] },
  "Malta": { code: "MT", cities: ["Valletta", "Birkirkara", "St. Julian's"] },
  "Mexico": { code: "MX", cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Cancún", "León", "Mérida"] },
  "Moldova": { code: "MD", cities: ["Chișinău", "Tiraspol", "Bălți"] },
  "Monaco": { code: "MC", cities: ["Monaco"] },
  "Mongolia": { code: "MN", cities: ["Ulaanbaatar"] },
  "Montenegro": { code: "ME", cities: ["Podgorica", "Budva", "Kotor"] },
  "Morocco": { code: "MA", cities: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir"] },
  "Netherlands": { code: "NL", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"] },
  "New Zealand": { code: "NZ", cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Queenstown"] },
  "Nigeria": { code: "NG", cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt"] },
  "North Macedonia": { code: "MK", cities: ["Skopje", "Bitola", "Ohrid"] },
  "Norway": { code: "NO", cities: ["Oslo", "Bergen", "Stavanger", "Trondheim"] },
  "Oman": { code: "OM", cities: ["Muscat", "Salalah", "Sohar"] },
  "Pakistan": { code: "PK", cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"] },
  "Panama": { code: "PA", cities: ["Panama City", "Colón", "David"] },
  "Peru": { code: "PE", cities: ["Lima", "Arequipa", "Trujillo", "Cusco"] },
  "Philippines": { code: "PH", cities: ["Manila", "Cebu City", "Davao", "Quezon City", "Makati"] },
  "Poland": { code: "PL", cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk"] },
  "Portugal": { code: "PT", cities: ["Lisbon", "Porto", "Braga", "Coimbra", "Faro"] },
  "Qatar": { code: "QA", cities: ["Doha", "Al Wakrah", "Al Khor"] },
  "Romania": { code: "RO", cities: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"] },
  "Russia": { code: "RU", cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Sochi"] },
  "Saudi Arabia": { code: "SA", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"] },
  "Serbia": { code: "RS", cities: ["Belgrade", "Novi Sad", "Niš"] },
  "Singapore": { code: "SG", cities: ["Singapore"] },
  "Slovakia": { code: "SK", cities: ["Bratislava", "Košice", "Prešov"] },
  "Slovenia": { code: "SI", cities: ["Ljubljana", "Maribor", "Celje"] },
  "South Africa": { code: "ZA", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"] },
  "South Korea": { code: "KR", cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Jeju"] },
  "Spain": { code: "ES", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Bilbao", "Ibiza", "Marbella"] },
  "Sri Lanka": { code: "LK", cities: ["Colombo", "Kandy", "Galle"] },
  "Sweden": { code: "SE", cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"] },
  "Switzerland": { code: "CH", cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"] },
  "Syria": { code: "SY", cities: ["Damascus", "Aleppo", "Homs"] },
  "Taiwan": { code: "TW", cities: ["Taipei", "Kaohsiung", "Taichung", "Tainan"] },
  "Tanzania": { code: "TZ", cities: ["Dar es Salaam", "Zanzibar", "Arusha"] },
  "Thailand": { code: "TH", cities: ["Bangkok", "Chiang Mai", "Pattaya", "Phuket", "Koh Samui"] },
  "Tunisia": { code: "TN", cities: ["Tunis", "Sfax", "Sousse"] },
  "Turkey": { code: "TR", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Bodrum"] },
  "Uganda": { code: "UG", cities: ["Kampala", "Gulu", "Mbarara"] },
  "Ukraine": { code: "UA", cities: ["Kyiv", "Kharkiv", "Odessa", "Dnipro", "Lviv"] },
  "United Arab Emirates": { code: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"] },
  "United Kingdom": { code: "GB", cities: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh", "Bristol", "Leeds", "Sheffield"] },
  "United States": { code: "US", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Miami", "Las Vegas", "Seattle", "Boston", "Atlanta", "Denver"] },
  "Uruguay": { code: "UY", cities: ["Montevideo", "Punta del Este"] },
  "Uzbekistan": { code: "UZ", cities: ["Tashkent", "Samarkand", "Bukhara"] },
  "Venezuela": { code: "VE", cities: ["Caracas", "Maracaibo", "Valencia"] },
  "Vietnam": { code: "VN", cities: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hoi An"] },
  "Yemen": { code: "YE", cities: ["Sana'a", "Aden", "Taiz"] },
  "Zimbabwe": { code: "ZW", cities: ["Harare", "Bulawayo"] },
}

const SORTED_COUNTRIES = Object.keys(COUNTRIES_WITH_CITIES).sort()

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', displayName: '', country: '', countryCode: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const selectedCountryData = form.country ? COUNTRIES_WITH_CITIES[form.country] : null
  const cities = selectedCountryData?.cities || []

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = e.target.value
    const data = COUNTRIES_WITH_CITIES[countryName]
    setForm((p) => ({ ...p, country: countryName, countryCode: data?.code || '', city: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
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
          <p className="mt-2 text-sm text-stone-500">Create your model profile</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
          {error && <div className="mb-4 rounded-lg bg-red-950 border border-red-900 px-4 py-3 text-sm text-red-400">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Display Name</label>
              <input type="text" value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} required minLength={2}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="Your professional name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={8}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Country</label>
              <select value={form.country} onChange={handleCountryChange} required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                <option value="">Select country...</option>
                {SORTED_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">City</label>
              {cities.length > 0 ? (
                <select value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                  <option value="">Select city...</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                  placeholder={form.country ? "Enter your city" : "Select a country first"} />
              )}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="mt-6 w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Profile'}
          </button>
          <p className="mt-4 text-center text-sm text-stone-500">
            Already have an account? <Link href="/login" className="text-amber-500 hover:text-amber-400">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
