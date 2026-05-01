'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, Plus, Trash2, Star, Users, MapPin, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'

interface AgencyModel {
  id: string
  displayName: string
  city: string
  country: string
  availability: string
  listingTier: string
  isVerified: boolean
  profileImageUrl: string | null
  images: { url: string }[]
  slug: string
}

interface Agency {
  id: string
  name: string
  slug: string
  city: string
  country: string
  logoUrl: string | null
  isPremium: boolean
  subscriptionStatus: string
  subscriptionExpiresAt: string | null
  bio: string | null
  email: string | null
  phone: string | null
  website: string | null
  instagram: string | null
}


const COUNTRIES_WITH_CITIES: Record<string, string[]> = {
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh", "Bristol", "Leeds"],
  "United States": ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Dallas", "Seattle", "Boston", "Atlanta"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Bordeaux"],
  "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Málaga", "Ibiza", "Marbella"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"],
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
  "Russia": ["Moscow", "Saint Petersburg", "Novosibirsk", "Sochi"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Fukuoka"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Jeju"],
  "Thailand": ["Bangkok", "Phuket", "Pattaya", "Chiang Mai", "Koh Samui"],
  "Turkey": ["Istanbul", "Ankara", "Antalya", "Bodrum", "Izmir"],
  "Morocco": ["Casablanca", "Marrakech", "Rabat", "Fes", "Tangier", "Agadir"],
  "Mexico": ["Mexico City", "Guadalajara", "Cancún", "Monterrey"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Cartagena"],
  "Philippines": ["Manila", "Cebu City", "Davao", "Makati"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam", "Mecca"],
  "Qatar": ["Doha"],
  "Kuwait": ["Kuwait City", "Salmiya"],
  "Bahrain": ["Manama", "Riffa"],
  "Oman": ["Muscat", "Salalah"],
  "Singapore": ["Singapore"],
  "Switzerland": ["Zurich", "Geneva", "Basel", "Lausanne"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague"],
  "Sweden": ["Stockholm", "Gothenburg", "Malmö"],
  "Greece": ["Athens", "Thessaloniki", "Mykonos", "Santorini"],
  "Portugal": ["Lisbon", "Porto", "Faro"],
  "Egypt": ["Cairo", "Alexandria", "Sharm el-Sheikh", "Hurghada"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Goa", "Chennai"],
  "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"],
  "Indonesia": ["Jakarta", "Bali", "Surabaya"],
  "Malaysia": ["Kuala Lumpur", "George Town", "Johor Bahru"],
  "Vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang"],
  "Pakistan": ["Karachi", "Lahore", "Islamabad"],
  "Nigeria": ["Lagos", "Abuja", "Port Harcourt"],
  "Kenya": ["Nairobi", "Mombasa"],
  "Ukraine": ["Kyiv", "Odessa", "Lviv"],
  "Poland": ["Warsaw", "Kraków", "Gdańsk"],
  "Romania": ["Bucharest", "Cluj-Napoca"],
  "Czech Republic": ["Prague", "Brno"],
  "Hungary": ["Budapest"],
  "Cyprus": ["Nicosia", "Limassol", "Larnaca", "Paphos"],
  "Malta": ["Valletta", "St. Julian's"],
  "Montenegro": ["Podgorica", "Budva", "Kotor"],
  "Croatia": ["Zagreb", "Split", "Dubrovnik"],
  "Serbia": ["Belgrade", "Novi Sad"],
  "Lebanon": ["Beirut"],
  "Jordan": ["Amman", "Aqaba"],
  "Israel": ["Tel Aviv", "Jerusalem", "Haifa"],
  "Ireland": ["Dublin", "Cork", "Galway"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch", "Queenstown"],
  "Argentina": ["Buenos Aires", "Córdoba", "Mendoza"],
  "Chile": ["Santiago", "Valparaíso"],
  "Peru": ["Lima", "Cusco"],
  "Ecuador": ["Quito", "Guayaquil"],
  "Dominican Republic": ["Santo Domingo", "Punta Cana"],
  "Jamaica": ["Kingston", "Montego Bay"],
  "Panama": ["Panama City"],
}

export default function AgencyDashboardPage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [models, setModels] = useState<AgencyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ displayName: '', city: '', email: '', bio: '', age: '' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const fetchData = async () => {
    try {
      const [agencyRes, modelsRes] = await Promise.all([
        fetch('/api/agency'),
        fetch('/api/agency/models'),
      ])
      const [agencyData, modelsData] = await Promise.all([agencyRes.json(), modelsRes.json()])
      if (agencyData.success) setAgency(agencyData.data as Agency)
      if (modelsData.success) setModels(modelsData.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setAddError('')
    try {
      const res = await fetch('/api/agency/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm, age: addForm.age ? parseInt(addForm.age) : undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setAddForm({ displayName: '', city: '', email: '', bio: '', age: '' })
        fetchData()
      } else {
        setAddError(data.error || 'Failed to add model')
      }
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteModel = async (profileId: string) => {
    if (!confirm('Remove this model from your agency?')) return
    await fetch(`/api/agency/models/${profileId}`, { method: 'DELETE' })
    fetchData()
  }

  const handleUpgradePremium = async (profileId: string, current: string) => {
    const newTier = current === 'PREMIUM' ? 'FREE' : 'PREMIUM'
    await fetch(`/api/agency/models/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingTier: newTier }),
    })
    fetchData()
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mimeType: file.type, folder: 'profiles', isPrivate: false }),
    })
    const { data } = await uploadRes.json()
    await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    await fetch('/api/agency', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logoUrl: data.publicUrl }),
    })
    fetchData()
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="flex items-center justify-center py-24 text-stone-500">Loading...</div>
    </div>
  )

  const slotsUsed = models.length
  const slotsTotal = 20
  const logoUrl = agency?.logoUrl ?? null

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        {/* Agency Header */}
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {agency?.name}
                </h1>
                {agency?.isPremium && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-400">
                    <Star className="h-3 w-3 fill-current" /> Premium
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>{agency?.city}, {agency?.country}</span>
              </div>
              {agency?.slug && (
                <a href={`/agencies/${agency.slug}`} target="_blank" className="mt-1 text-xs text-amber-600 hover:text-amber-500">
                  View public profile →
                </a>
              )}
              <div className={`mt-2 text-xs font-medium ${agency?.subscriptionStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                Subscription: {agency?.subscriptionStatus}
                {agency?.subscriptionExpiresAt && (
                  <span className="text-stone-500 font-normal ml-1">
                    · Expires {new Date(agency.subscriptionExpiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-stone-100">{slotsUsed}/{slotsTotal}</div>
              <div className="text-xs text-stone-500">Models</div>
              <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-stone-700">
                <div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${(slotsUsed / slotsTotal) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Banner Upload */}
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-5">
          <h3 className="mb-3 text-sm font-medium text-stone-300">Agency Banner / Logo</h3>
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                <img src={logoUrl} alt="Agency banner" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-stone-700 bg-stone-800 text-stone-600 text-xs text-center px-2">
                No banner yet
              </div>
            )}
            <div>
              <p className="text-xs text-stone-500 mb-2">Upload a banner image for your agency profile page. Recommended: 1200×400px.</p>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                <span className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-stone-400 hover:border-amber-700 hover:text-stone-200 transition-colors">
                  Upload Banner
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Models section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-stone-200">Your Models</h2>
          <button
            onClick={() => slotsUsed < slotsTotal ? setShowAddModal(true) : alert('Model limit reached (20/20)')}
            className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Model
          </button>
        </div>

        {models.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-700 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-stone-700 mb-3" />
            <p className="text-stone-500">No models yet. Add your first model to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {models.map(model => {
              const img = model.profileImageUrl || model.images?.[0]?.url
              return (
                <div key={model.id} className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
                  <div className="relative aspect-[3/2] bg-stone-800">
                    {img ? (
                      <Image src={img} alt={model.displayName} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-600 text-2xl">
                        {model.displayName[0]}
                      </div>
                    )}
                    {model.listingTier === 'PREMIUM' && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-amber-900/90 px-2 py-0.5 text-xs text-amber-300">
                        <Star className="h-3 w-3 fill-current" /> Premium
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-stone-200">{model.displayName}</p>
                      {model.isVerified && <CheckCircle className="h-3.5 w-3.5 text-blue-400" />}
                    </div>
                    <p className="text-xs text-stone-500">{model.city}, {model.country}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleUpgradePremium(model.id, model.listingTier)}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${model.listingTier === 'PREMIUM' ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                      >
                        {model.listingTier === 'PREMIUM' ? '★ Premium' : 'Upgrade'}
                      </button>
                      <Link href={`/${model.countryCode?.toLowerCase() || 'ae'}/${model.slug}`} target="_blank"
                        className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-stone-400 hover:bg-stone-700 transition-colors">
                        View
                      </Link>
                      <button onClick={() => handleDeleteModel(model.id)}
                        className="rounded-lg bg-red-950/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/60 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!agency?.isPremium && (
          <div className="mt-8 rounded-2xl border border-amber-900/40 bg-amber-950/10 p-6">
            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-stone-200">Upgrade to Premium Agency</h3>
                <p className="mt-1 text-sm text-stone-400">Get featured in the sidebar on your city page. Boost visibility and attract more talent.</p>
                <button className="mt-3 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
                  Upgrade — $49/month
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="mb-4 text-lg font-medium text-stone-200">Add Model</h2>
            {addError && <div className="mb-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{addError}</div>}
            <form onSubmit={handleAddModel} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-stone-500">Display Name *</label>
                <input value={addForm.displayName} onChange={e => setAddForm(p => ({ ...p, displayName: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="Model name" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">City * (must be in {agency?.country})</label>
                {agency?.country && COUNTRIES_WITH_CITIES[agency.country] ? (
                  <select value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                    <option value="">Select city...</option>
                    {COUNTRIES_WITH_CITIES[agency.country].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                    placeholder="Enter city" />
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Email (optional)</label>
                <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="model@example.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Age (optional)</label>
                <input type="number" min="18" max="100" value={addForm.age} onChange={e => setAddForm(p => ({ ...p, age: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="18" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Bio (optional)</label>
                <textarea value={addForm.bio} onChange={e => setAddForm(p => ({ ...p, bio: e.target.value }))} rows={2}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none" placeholder="Short bio..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={adding}
                  className="flex-1 rounded-lg bg-amber-700 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {adding ? 'Adding...' : 'Add Model'}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setAddError('') }}
                  className="flex-1 rounded-lg border border-stone-700 py-2 text-sm text-stone-400 hover:border-stone-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
