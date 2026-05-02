'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, Plus, Trash2, Star, Users, MapPin, CheckCircle, Edit3, X, Check } from 'lucide-react'
import Header from '@/components/layout/Header'

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh", "Bristol", "Leeds"],
  "United States": ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Dallas", "Houston", "Atlanta", "Boston", "Seattle"],
  "France": ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux", "Toulouse"],
  "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart"],
  "Italy": ["Rome", "Milan", "Florence", "Venice", "Naples", "Turin"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Ibiza", "Marbella"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Gold Coast", "Adelaide"],
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
  "Russia": ["Moscow", "Saint Petersburg", "Novosibirsk", "Sochi"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Jeju"],
  "Thailand": ["Bangkok", "Phuket", "Pattaya", "Chiang Mai"],
  "Turkey": ["Istanbul", "Ankara", "Antalya", "Bodrum"],
  "Morocco": ["Casablanca", "Marrakech", "Rabat", "Fes"],
  "Mexico": ["Mexico City", "Guadalajara", "Cancún", "Monterrey"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Cartagena"],
  "Philippines": ["Manila", "Cebu City", "Makati"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam"],
  "Qatar": ["Doha"],
  "Kuwait": ["Kuwait City"],
  "Bahrain": ["Manama"],
  "Singapore": ["Singapore"],
  "Switzerland": ["Zurich", "Geneva", "Basel"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague"],
  "Greece": ["Athens", "Thessaloniki", "Mykonos", "Santorini"],
  "Portugal": ["Lisbon", "Porto", "Faro"],
  "Egypt": ["Cairo", "Alexandria", "Sharm el-Sheikh", "Hurghada"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Goa", "Chennai"],
  "Malaysia": ["Kuala Lumpur", "George Town", "Johor Bahru"],
  "Indonesia": ["Jakarta", "Bali", "Surabaya"],
  "Cyprus": ["Nicosia", "Limassol", "Larnaca", "Paphos"],
  "Lebanon": ["Beirut"],
  "Jordan": ["Amman", "Aqaba"],
  "Nigeria": ["Lagos", "Abuja"],
  "Kenya": ["Nairobi", "Mombasa"],
  "Vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang"],
  "New Zealand": ["Auckland", "Wellington", "Queenstown"],
  "Ireland": ["Dublin", "Cork", "Galway"],
  "Belgium": ["Brussels", "Antwerp"],
  "Denmark": ["Copenhagen"],
  "Norway": ["Oslo", "Bergen"],
  "Austria": ["Vienna", "Salzburg"],
  "Poland": ["Warsaw", "Kraków", "Gdańsk"],
  "Czech Republic": ["Prague", "Brno"],
  "Hungary": ["Budapest"],
  "Romania": ["Bucharest", "Cluj-Napoca"],
  "Ukraine": ["Kyiv", "Odessa", "Lviv"],
  "Kazakhstan": ["Almaty", "Nur-Sultan"],
  "Pakistan": ["Karachi", "Lahore", "Islamabad"],
}

const PREMIUM_AGENCY_FEATURES = [
  { icon: '📍', title: 'City Page Sidebar', desc: 'Your agency appears in the featured sidebar on your city\'s model listing page — maximum visibility.' },
  { icon: '⭐', title: 'Premium Badge', desc: 'A gold "Premium Agency" badge on your public profile builds instant trust.' },
  { icon: '🔝', title: 'Priority Placement', desc: 'Appear at the top of the agency directory above standard listings.' },
  { icon: '📊', title: 'Analytics', desc: 'See how many people are viewing your agency profile and models.' },
  { icon: '✉️', title: 'Featured Newsletter', desc: 'Your agency is included in our monthly featured agency newsletter.' },
  { icon: '🌟', title: 'Unlimited Premium Models', desc: 'Upgrade any of your models to premium at a discounted rate.' },
]

interface AgencyModel {
  id: string
  displayName: string
  city: string
  country: string
  countryCode: string
  citySlug: string
  availability: string
  listingTier: string
  isVerified: boolean
  profileImageUrl: string | null
  images: { url: string }[]
  slug: string
  bio: string | null
  age: number | null
  phone: string | null
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

export default function AgencyDashboardPage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [models, setModels] = useState<AgencyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ displayName: '', city: '', bio: '', age: '' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [editingModel, setEditingModel] = useState<AgencyModel | null>(null)
  const [editForm, setEditForm] = useState({ displayName: '', city: '', bio: '', age: '', phone: '', availability: 'AVAILABLE' })
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      const [agencyRes, modelsRes] = await Promise.all([fetch('/api/agency'), fetch('/api/agency/models')])
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
        body: JSON.stringify({ displayName: addForm.displayName, city: addForm.city, bio: addForm.bio || undefined, age: addForm.age ? parseInt(addForm.age) : undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setAddForm({ displayName: '', city: '', bio: '', age: '' })
        fetchData()
      } else {
        setAddError(data.error || 'Failed to add model')
      }
    } finally {
      setAdding(false)
    }
  }

  const handleEditModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingModel) return
    setSaving(true)
    try {
      const res = await fetch(`/api/agency/models/${editingModel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editForm.displayName,
          city: editForm.city,
          bio: editForm.bio,
          age: editForm.age ? parseInt(editForm.age) : undefined,
          phone: editForm.phone,
          availability: editForm.availability,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingModel(null)
        fetchData()
      }
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (model: AgencyModel) => {
    setEditingModel(model)
    setEditForm({
      displayName: model.displayName,
      city: model.city,
      bio: model.bio || '',
      age: model.age?.toString() || '',
      phone: model.phone || '',
      availability: model.availability,
    })
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
    const uploadRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mimeType: file.type, folder: 'profiles', isPrivate: false }) })
    const { data } = await uploadRes.json()
    await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    await fetch('/api/agency', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logoUrl: data.publicUrl }) })
    fetchData()
  }

  if (loading) return <div className="min-h-screen bg-stone-950"><Header /><div className="flex items-center justify-center py-24 text-stone-500">Loading...</div></div>

  const slotsUsed = models.length
  const logoUrl = agency?.logoUrl ?? null
  const agencyCities = agency?.country ? (CITIES_BY_COUNTRY[agency.country] || []) : []

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        {/* Agency Header */}
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="relative">
                {logoUrl ? (
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-stone-800">
                    <img src={logoUrl} alt="Agency logo" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-stone-800 text-2xl font-light text-amber-500">
                    {agency?.name?.[0] || 'A'}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-stone-600 p-1 hover:bg-stone-500 transition-colors" title="Upload banner">
                  <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                  <span className="text-xs">✎</span>
                </label>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="h-4 w-4 text-amber-500" />
                  <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    {agency?.name || 'Your Agency'}
                  </h1>
                  {agency?.isPremium && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-900/30 px-2.5 py-0.5 text-xs text-amber-400">
                      <Star className="h-3 w-3 fill-current" /> Premium Agency
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{agency?.city}, {agency?.country}</span>
                </div>
                {agency?.slug && (
                  <a href={`/agencies/${agency.slug}`} target="_blank" className="mt-1 inline-block text-xs text-amber-600 hover:text-amber-500">
                    View public profile →
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-medium mb-1 ${agency?.subscriptionStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                {agency?.subscriptionStatus === 'ACTIVE' ? '● Active Subscription' : '● Subscription Inactive'}
              </div>
              {agency?.subscriptionExpiresAt && (
                <div className="text-xs text-stone-500 mb-3">Expires {new Date(agency.subscriptionExpiresAt).toLocaleDateString()}</div>
              )}
              <div className="text-3xl font-light text-stone-100">{slotsUsed}<span className="text-stone-600 text-lg">/20</span></div>
              <div className="text-xs text-stone-500 mb-1">Models used</div>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-700 ml-auto">
                <div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${(slotsUsed / 20) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Models */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-stone-200">Manage Models</h2>
            <p className="text-xs text-stone-500 mt-0.5">{slotsUsed} of 20 slots used</p>
          </div>
          <button onClick={() => slotsUsed < 20 ? setShowAddModal(true) : alert('Model limit reached (20/20)')}
            className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
            <Plus className="h-4 w-4" /> Add Model
          </button>
        </div>

        {models.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-700 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-stone-700 mb-3" />
            <p className="text-stone-400 font-medium">No models yet</p>
            <p className="text-stone-600 text-sm mt-1">Click "Add Model" to add your first model</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {models.map(model => {
              const img = model.profileImageUrl || model.images?.[0]?.url
              const profileUrl = `/${model.countryCode?.toLowerCase() || 'ae'}/${model.citySlug}/${model.slug}`
              return (
                <div key={model.id} className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
                  <div className="relative aspect-[3/2] bg-stone-800">
                    {img ? (
                      <Image src={img} alt={model.displayName} fill className="object-cover" sizes="33vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center flex-col gap-1">
                        <span className="text-stone-600 text-3xl font-light">{model.displayName[0]}</span>
                        <span className="text-xs text-stone-600">No photo yet</span>
                      </div>
                    )}
                    {model.listingTier === 'PREMIUM' && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-amber-900/90 px-2 py-0.5 text-xs text-amber-300">
                        <Star className="h-3 w-3 fill-current" /> Premium
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-medium text-stone-200 truncate">{model.displayName}</p>
                      {model.isVerified && <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />}
                    </div>
                    <p className="text-xs text-stone-500">{model.city}{model.age ? ` · Age ${model.age}` : ''}</p>
                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                      <button onClick={() => openEdit(model)}
                        className="flex items-center justify-center rounded-lg bg-stone-800 py-1.5 text-xs text-stone-400 hover:bg-stone-700 transition-colors" title="Edit">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleUpgradePremium(model.id, model.listingTier)}
                        className={`rounded-lg px-1 py-1.5 text-xs font-medium transition-colors ${model.listingTier === 'PREMIUM' ? 'bg-amber-900/30 text-amber-400' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                        title={model.listingTier === 'PREMIUM' ? 'Remove premium' : 'Make premium'}>
                        ★
                      </button>
                      <Link href={profileUrl} target="_blank"
                        className="flex items-center justify-center rounded-lg bg-stone-800 py-1.5 text-xs text-stone-400 hover:bg-stone-700 transition-colors" title="View profile">
                        ↗
                      </Link>
                      <button onClick={() => handleDeleteModel(model.id)}
                        className="flex items-center justify-center rounded-lg bg-red-950/30 py-1.5 text-xs text-red-400 hover:bg-red-950/60 transition-colors" title="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Premium Agency Upsell */}
        {!agency?.isPremium && (
          <div className="mt-10 rounded-2xl border border-amber-900/40 bg-amber-950/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-amber-900/30">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-amber-500 fill-current flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-stone-100 text-lg" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Upgrade to Premium Agency</h3>
                  <p className="text-sm text-stone-400 mt-0.5">Get maximum exposure for your agency and models</p>
                </div>
                <div className="ml-auto text-right flex-shrink-0">
                  <p className="text-2xl font-light text-amber-400">$49<span className="text-sm text-stone-500">/mo</span></p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {PREMIUM_AGENCY_FEATURES.map(f => (
                  <div key={f.title} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{f.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-stone-200">{f.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
                Upgrade to Premium Agency — $49/month
              </button>
              <p className="text-center text-xs text-stone-600 mt-2">Cancel anytime. No auto-renewal commitment.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Model Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-stone-200">Add Model</h2>
              <button onClick={() => { setShowAddModal(false); setAddError('') }} className="text-stone-500 hover:text-stone-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-xs text-stone-500">Model will be listed under {agency?.country}. Contact enquiries use your agency details.</p>
            {addError && <div className="mb-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{addError}</div>}
            <form onSubmit={handleAddModel} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Display Name *</label>
                <input value={addForm.displayName} onChange={e => setAddForm(p => ({ ...p, displayName: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                  placeholder="Model's professional name" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">City * <span className="text-stone-600 font-normal">(within {agency?.country})</span></label>
                {agencyCities.length > 0 ? (
                  <select value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                    <option value="">Select city...</option>
                    {agencyCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                    placeholder="Enter city" />
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Age <span className="text-stone-600 font-normal">(optional)</span></label>
                <input type="number" min="18" max="60" value={addForm.age} onChange={e => setAddForm(p => ({ ...p, age: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="e.g. 24" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Bio <span className="text-stone-600 font-normal">(optional)</span></label>
                <textarea value={addForm.bio} onChange={e => setAddForm(p => ({ ...p, bio: e.target.value }))} rows={2}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none" placeholder="Short bio..." />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={adding}
                  className="flex-1 rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {adding ? 'Adding...' : 'Add Model'}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(''); setAddForm({ displayName: '', city: '', bio: '', age: '' }) }}
                  className="flex-1 rounded-lg border border-stone-700 py-2.5 text-sm text-stone-400 hover:border-stone-600 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-stone-200">Edit Model</h2>
              <button onClick={() => setEditingModel(null)} className="text-stone-500 hover:text-stone-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditModel} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Display Name *</label>
                <input value={editForm.displayName} onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">City</label>
                {agencyCities.length > 0 ? (
                  <select value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                    {agencyCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Age</label>
                <input type="number" min="18" max="60" value={editForm.age} onChange={e => setEditForm(p => ({ ...p, age: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none"
                  placeholder="+1 234 567 890" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Availability</label>
                <select value={editForm.availability} onChange={e => setEditForm(p => ({ ...p, availability: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="TRAVELING">Traveling</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingModel(null)}
                  className="flex-1 rounded-lg border border-stone-700 py-2.5 text-sm text-stone-400 hover:border-stone-600">
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
