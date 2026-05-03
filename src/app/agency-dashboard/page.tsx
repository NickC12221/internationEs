'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, Plus, Trash2, Star, Users, MapPin, CheckCircle, Edit3, X, Upload, Loader2, Globe, Instagram, Phone, Mail, Camera, Link as LinkIcon, MessageSquare, RefreshCw } from 'lucide-react'
import Header from '@/components/layout/Header'
import ContactSupportButton from '@/components/support/ContactSupportButton'
import ReportButton from '@/components/support/ReportButton'

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
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
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
  "Qatar": ["Doha"], "Kuwait": ["Kuwait City"], "Bahrain": ["Manama"], "Singapore": ["Singapore"],
  "Switzerland": ["Zurich", "Geneva", "Basel"], "Netherlands": ["Amsterdam", "Rotterdam", "The Hague"],
  "Greece": ["Athens", "Thessaloniki", "Mykonos", "Santorini"], "Portugal": ["Lisbon", "Porto", "Faro"],
  "Egypt": ["Cairo", "Alexandria", "Sharm el-Sheikh", "Hurghada"], "India": ["Mumbai", "Delhi", "Bangalore", "Goa"],
  "Malaysia": ["Kuala Lumpur", "George Town"], "Indonesia": ["Jakarta", "Bali"],
  "Cyprus": ["Nicosia", "Limassol", "Larnaca", "Paphos"], "Lebanon": ["Beirut"], "Jordan": ["Amman", "Aqaba"],
  "Nigeria": ["Lagos", "Abuja"], "Kenya": ["Nairobi", "Mombasa"], "Vietnam": ["Ho Chi Minh City", "Hanoi"],
  "New Zealand": ["Auckland", "Wellington", "Queenstown"], "Ireland": ["Dublin", "Cork"],
  "Belgium": ["Brussels", "Antwerp"], "Denmark": ["Copenhagen"], "Norway": ["Oslo"],
  "Austria": ["Vienna", "Salzburg"], "Poland": ["Warsaw", "Kraków"], "Czech Republic": ["Prague"],
  "Hungary": ["Budapest"], "Romania": ["Bucharest"], "Ukraine": ["Kyiv", "Odessa"],
}

const PREMIUM_FEATURES = [
  { icon: '📍', title: 'City Page Sidebar', desc: 'Featured in the sidebar on your city\'s model listing page.' },
  { icon: '⭐', title: 'Premium Badge', desc: 'Gold "Premium Agency" badge builds instant trust.' },
  { icon: '🔝', title: 'Priority Placement', desc: 'Top of the agency directory above standard listings.' },
  { icon: '📊', title: 'Profile Analytics', desc: 'See views on your agency profile and models.' },
  { icon: '✉️', title: 'Newsletter Feature', desc: 'Included in our monthly featured agency newsletter.' },
  { icon: '🌟', title: 'Discounted Model Premium', desc: 'Upgrade your models to premium at a reduced rate.' },
]

interface ProfileImage { id: string; url: string; key: string; isMain: boolean; order: number }

interface AgencyModel {
  id: string; displayName: string; city: string; country: string; countryCode: string
  citySlug: string; availability: string; listingTier: string; isVerified: boolean
  profileImageUrl: string | null; images: ProfileImage[]; slug: string
  bio: string | null; age: number | null; phone: string | null
}

interface Agency {
  id: string; name: string; slug: string; city: string; country: string
  logoUrl: string | null; isPremium: boolean; subscriptionStatus: string
  subscriptionExpiresAt: string | null; bio: string | null; email: string | null
  phone: string | null; website: string | null; instagram: string | null
}

type Tab = 'models' | 'bookings' | 'settings'

export default function AgencyDashboardPage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [models, setModels] = useState<AgencyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('models')

  // Add model
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ displayName: '', city: '', bio: '', age: '' })
  const [addPhotos, setAddPhotos] = useState<File[]>([])
  const [addPhotoUrls, setAddPhotoUrls] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  // Edit model
  const [editingModel, setEditingModel] = useState<AgencyModel | null>(null)
  const [editForm, setEditForm] = useState({ displayName: '', city: '', bio: '', age: '', phone: '', availability: 'AVAILABLE' })
  const [saving, setSaving] = useState(false)
  const [modelImages, setModelImages] = useState<ProfileImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Agency settings
  const [agencyBookings, setAgencyBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [settingsForm, setSettingsForm] = useState({ bio: '', phone: '', website: '', instagram: '' })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)

  const fetchData = async () => {
    try {
      const [ar, mr] = await Promise.all([fetch('/api/agency'), fetch('/api/agency/models')])
      const [ad, md] = await Promise.all([ar.json(), mr.json()])
      if (ad.success) {
        setAgency(ad.data as Agency)
        setSettingsForm({ bio: ad.data.bio || '', phone: ad.data.phone || '', website: ad.data.website || '', instagram: ad.data.instagram || '' })
      }
      if (md.success) setModels(md.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (tab === 'bookings' && agencyBookings.length === 0) {
      setLoadingBookings(true)
      fetch('/api/bookings?role=agency')
        .then(r => r.json())
        .then(d => { if (d.success) setAgencyBookings(d.data) })
        .finally(() => setLoadingBookings(false))
    }
  }, [tab])

  const openEdit = async (model: AgencyModel) => {
    setEditingModel(model)
    setEditForm({ displayName: model.displayName, city: model.city, bio: model.bio || '', age: model.age?.toString() || '', phone: model.phone || '', availability: model.availability })
    setLoadingImages(true)
    setModelImages([])
    const res = await fetch(`/api/agency/models/${model.id}/images`)
    const data = await res.json()
    if (data.success) setModelImages(data.data)
    setLoadingImages(false)
  }

  const handleUploadModelImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingModel) return
    const file = e.target.files?.[0]
    if (!file) return
    if (modelImages.length >= 15) { alert('Maximum 15 images'); return }
    setUploadingImage(true)
    try {
      const uploadRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mimeType: file.type, folder: 'gallery', isPrivate: false }) })
      const { data } = await uploadRes.json()
      await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      const saveRes = await fetch(`/api/agency/models/${editingModel.id}/images`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: data.key, url: data.publicUrl, isMain: modelImages.length === 0 })
      })
      const saved = await saveRes.json()
      if (saved.success) setModelImages(prev => [...prev, saved.data])
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteModelImage = async (imageId: string) => {
    if (!editingModel) return
    await fetch(`/api/agency/models/${editingModel.id}/images`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId })
    })
    setModelImages(prev => prev.filter(i => i.id !== imageId))
  }

  const handleEditModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingModel) return
    setSaving(true)
    try {
      await fetch(`/api/agency/models/${editingModel.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: editForm.displayName, city: editForm.city, bio: editForm.bio, age: editForm.age ? parseInt(editForm.age) : undefined, phone: editForm.phone, availability: editForm.availability }),
      })
      setEditingModel(null)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setAddError('')
    try {
      const res = await fetch('/api/agency/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: addForm.displayName, city: addForm.city, bio: addForm.bio || undefined, age: addForm.age ? parseInt(addForm.age) : undefined }) })
      const data = await res.json()
      if (data.success) {
        const profileId = data.data.id
        // Upload photos if any
        if (addPhotos.length > 0) {
          for (const photo of addPhotos) {
            const uploadRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'profile', profileId }) })
            const uploadData = await uploadRes.json()
            if (uploadData.uploadUrl) {
              await fetch(uploadData.uploadUrl, { method: 'PUT', body: photo, headers: { 'Content-Type': photo.type } })
              await fetch('/api/agency/models/' + profileId + '/images', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: uploadData.key, url: uploadData.publicUrl }) })
            }
          }
        }
        setShowAddModal(false)
        setAddForm({ displayName: '', city: '', bio: '', age: '' })
        setAddPhotos([])
        setAddPhotoUrls([])
        fetchData()
      }
      else setAddError(data.error || 'Failed')
    } finally { setAdding(false) }
  }

  const handleDeleteModel = async (profileId: string) => {
    if (!confirm('Remove this model?')) return
    await fetch(`/api/agency/models/${profileId}`, { method: 'DELETE' })
    fetchData()
  }

  const handleDowngradePremium = async (profileId: string) => {
    if (!confirm('Remove premium status from this model?')) return
    await fetch(`/api/agency/models/${profileId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingTier: 'FREE' }) })
    fetchData()
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mimeType: file.type, folder: 'profiles', isPrivate: false }) })
      const { data } = await res.json()
      await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      await fetch('/api/agency', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logoUrl: data.publicUrl }) })
      fetchData()
    } finally { setBannerUploading(false) }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    await fetch('/api/agency', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsForm) })
    setSavingSettings(false)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
    fetchData()
  }

  if (loading) return <div className="min-h-screen bg-stone-950"><Header /><div className="flex items-center justify-center py-24 text-stone-500">Loading...</div></div>

  const slotsUsed = models.length
  const agencyCities = agency?.country ? (CITIES_BY_COUNTRY[agency.country] || []) : []

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* Agency Header */}
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden">
          {/* Banner area */}
          <div className="relative h-32 bg-stone-800">
            {agency?.logoUrl ? (
              <img src={agency.logoUrl} alt="Agency banner" className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center flex-col gap-2">
                <Upload className="h-6 w-6 text-stone-600" />
                <p className="text-xs text-stone-600">No banner image</p>
              </div>
            )}
            <label className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-all ${agency?.logoUrl ? 'opacity-0 hover:opacity-100 bg-stone-950/60' : 'opacity-100'}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              <div className="text-center">
                {bannerUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin mx-auto" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-white mx-auto mb-1" />
                    <p className="text-xs text-white font-medium">{agency?.logoUrl ? 'Change Banner' : 'Upload Banner'}</p>
                    <p className="text-xs text-stone-300">Recommended: 1200×400px</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Agency info below banner */}
          <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="h-4 w-4 text-amber-500" />
                <h1 className="text-xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {agency?.name}
                </h1>
                {agency?.isPremium && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-900/30 px-2.5 py-0.5 text-xs text-amber-400">
                    <Star className="h-3 w-3 fill-current" /> Premium
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5" /><span>{agency?.city}, {agency?.country}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {agency?.slug && (
                  <a href={`/agencies/${agency.slug}`} target="_blank"
                    className="flex items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:border-amber-700 hover:text-amber-400 transition-colors">
                    👁 View Public Profile
                  </a>
                )}
                <Link href="/dashboard/settings"
                  className="flex items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors">
                  ⚙️ Account Settings
                </Link>
                {agency?.isPremium && (
                  <Link href="/agency-dashboard/analytics"
                    className="flex items-center gap-1.5 rounded-lg border border-amber-800 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-900/20 transition-colors">
                    📊 Analytics
                  </Link>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-medium ${agency?.subscriptionStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                {agency?.subscriptionStatus === 'ACTIVE' ? '● Active' : '● Inactive'}
              </div>
              {agency?.subscriptionExpiresAt && <div className="text-xs text-stone-600">Expires {new Date(agency.subscriptionExpiresAt).toLocaleDateString()}</div>}
              <div className="text-2xl font-light text-stone-100 mt-1">{slotsUsed}<span className="text-stone-600 text-base">/20</span></div>
              <div className="text-xs text-stone-500">Models</div>
              <div className="h-1 w-20 overflow-hidden rounded-full bg-stone-700 mt-1 ml-auto">
                <div className="h-full rounded-full bg-amber-600" style={{ width: `${(slotsUsed / 20) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>


        {/* Premium expiry / upgrade bar */}
        {(() => {
          const isPremium = agency?.isPremium
          const expiresAt = agency?.subscriptionExpiresAt
          const days = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000) : null
          const expired = days !== null && days < 0
          return (
            <div className={`mb-4 rounded-xl border px-4 py-3 flex items-center justify-between gap-3 flex-wrap ${
              isPremium
                ? expired ? 'border-red-900/50 bg-red-950/10'
                : days !== null && days <= 14 ? 'border-amber-900/50 bg-amber-950/10'
                : 'border-stone-800 bg-stone-900/60'
                : 'border-stone-800 bg-stone-900/60'
            }`}>
              <div className="flex items-center gap-3">
                <Star className={`h-4 w-4 flex-shrink-0 ${isPremium ? (expired ? 'text-red-400' : 'text-amber-400 fill-current') : 'text-stone-600'}`} />
                <div>
                  {isPremium ? (
                    <>
                      <p className={`text-sm font-medium ${expired ? 'text-red-400' : 'text-stone-200'}`}>
                        {expired ? 'Agency Premium Expired' : days !== null ? `Agency Premium — ${days} day${days !== 1 ? 's' : ''} remaining` : 'Agency Premium Active'}
                      </p>
                      <p className="text-xs text-stone-500">
                        {expiresAt && `${expired ? 'Expired' : 'Expires'} ${new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-stone-300">Upgrade to Premium Agency</p>
                      <p className="text-xs text-stone-500">Priority placement, city sidebar, analytics & up to 20 models</p>
                    </>
                  )}
                </div>
              </div>
              <Link href="/agency-dashboard/upgrade-agency"
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isPremium
                    ? expired ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'border border-amber-800 text-amber-400 hover:bg-amber-900/20'
                    : 'bg-amber-700 text-white hover:bg-amber-600'
                }`}>
                <Star className="h-3.5 w-3.5" />
                {isPremium ? (expired ? 'Renew Now' : 'Extend') : 'Upgrade — $49/mo'}
              </Link>
            </div>
          )
        })()}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-stone-800 bg-stone-900 p-1">
          {(['models', 'bookings', 'settings'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-stone-800 text-stone-100' : 'text-stone-500 hover:text-stone-300'}`}>
{t === 'models' ? `Models (${slotsUsed})` : t === 'bookings' ? 'Bookings' : 'Agency Settings'}
            </button>
          ))}
        </div>

        {/* MODELS TAB */}
        {tab === 'models' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">{slotsUsed} of 20 model slots used</p>
              <button onClick={() => { const limit = agency?.isPremium ? 20 : 5; slotsUsed < limit ? setShowAddModal(true) : alert(agency?.isPremium ? 'Model limit reached (20/20)' : 'Free plan limited to 5 models. Upgrade to Premium for up to 20 models.') }}
                className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
                <Plus className="h-4 w-4" /> Add Model
              </button>
            </div>

            {models.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-700 py-16 text-center">
                <Users className="mx-auto h-10 w-10 text-stone-700 mb-3" />
                <p className="text-stone-400 font-medium">No models yet</p>
                <p className="text-stone-600 text-sm mt-1">Click "Add Model" to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {models.map(model => {
                  const img = model.profileImageUrl || model.images?.[0]?.url
                  const profileUrl = `/${model.countryCode?.toLowerCase() || 'ae'}/${model.citySlug}/${model.slug}`
                  return (
                    <div key={model.id} className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
                      <div className="relative aspect-[3/2] bg-stone-800">
                        {img ? <Image src={img} alt={model.displayName} fill className="object-cover" sizes="33vw" /> : (
                          <div className="flex h-full items-center justify-center flex-col gap-1">
                            <span className="text-stone-600 text-3xl">{model.displayName[0]}</span>
                            <span className="text-xs text-stone-600">No photo</span>
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
                          {model.isVerified && <CheckCircle className="h-3.5 w-3.5 text-blue-400" />}
                        </div>
                        <p className="text-xs text-stone-500">{model.city}{model.age ? ` · ${model.age}` : ''}</p>
                        <p className="text-xs text-stone-600 mt-0.5">{model.images?.length || 0} photo{model.images?.length !== 1 ? 's' : ''}</p>
                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                          <button onClick={() => openEdit(model)}
                            className="flex items-center justify-center gap-1 rounded-lg bg-stone-800 py-1.5 text-xs text-stone-400 hover:bg-stone-700 transition-colors">
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </button>
                          {model.listingTier === 'PREMIUM' ? (
                            <button onClick={() => handleDowngradePremium(model.id)}
                              className="rounded-lg px-1 py-1.5 text-xs font-medium bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 transition-colors">
                              ★ Premium
                            </button>
                          ) : (
                            <Link href={`/agency-dashboard/upgrade/${model.id}`}
                              className="flex items-center justify-center rounded-lg px-1 py-1.5 text-xs font-medium bg-stone-800 text-stone-500 hover:bg-amber-900/20 hover:text-amber-400 transition-colors">
                              ★ Upgrade
                            </Link>
                          )}
                          <button onClick={() => handleDeleteModel(model.id)}
                            className="flex items-center justify-center rounded-lg bg-red-950/30 py-1.5 text-xs text-red-400 hover:bg-red-950/60 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Premium agency upsell */}
            {!agency?.isPremium && (
              <div className="mt-10 rounded-2xl border border-amber-900/40 bg-amber-950/10 overflow-hidden">
                <div className="px-6 py-5 border-b border-amber-900/30 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-amber-500 fill-current" />
                    <div>
                      <h3 className="font-medium text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Upgrade to Premium Agency</h3>
                      <p className="text-xs text-stone-400 mt-0.5">Maximum exposure for your agency and models</p>
                    </div>
                  </div>
                  <p className="text-2xl font-light text-amber-400">$49<span className="text-sm text-stone-500">/mo</span></p>
                </div>
                <div className="px-6 py-5 grid gap-3 sm:grid-cols-2">
                  {PREMIUM_FEATURES.map(f => (
                    <div key={f.title} className="flex items-start gap-3">
                      <span className="text-lg">{f.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-200">{f.title}</p>
                        <p className="text-xs text-stone-500">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <button className="w-full rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
                    Upgrade to Premium Agency — $49/month
                  </button>
                  <p className="text-center text-xs text-stone-600 mt-2">Cancel anytime. No auto-renewal.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div>
            {loadingBookings ? (
              <div className="flex justify-center py-16 text-stone-500">Loading...</div>
            ) : agencyBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-700 py-16 text-center">
                <p className="text-stone-400">No booking requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agencyBookings.map((booking: any) => (
                  <div key={booking.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium text-stone-200">{booking.contactName}</p>
                        <p className="text-xs text-stone-500 mt-0.5">For: {booking.profile?.displayName}</p>
                        <p className="text-xs text-stone-500">
                          {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{booking.startTime && ` at ${booking.startTime}`} · {booking.duration}h
                        </p>
                        {booking.message && <p className="mt-1 text-xs text-stone-400 line-clamp-2">{booking.message}</p>}
                        <p className="mt-1 text-xs text-stone-600">{booking.contactEmail}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          booking.status === 'PENDING' ? 'bg-amber-900/30 text-amber-400' :
                          booking.status === 'ACCEPTED' ? 'bg-emerald-900/30 text-emerald-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>{booking.status}</span>
                        <div className="flex flex-col gap-2 items-end">
                          {booking.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={async () => {
                                await fetch('/api/bookings/' + booking.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ACCEPTED' }) })
                                setAgencyBookings((prev: any[]) => prev.map((b: any) => b.id === booking.id ? { ...b, status: 'ACCEPTED' } : b))
                              }} className="rounded-lg bg-emerald-900/30 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-900/50">
                                Accept
                              </button>
                              <button onClick={async () => {
                                await fetch('/api/bookings/' + booking.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) })
                                setAgencyBookings((prev: any[]) => prev.map((b: any) => b.id === booking.id ? { ...b, status: 'REJECTED' } : b))
                              }} className="rounded-lg bg-red-900/30 px-3 py-1 text-xs text-red-400 hover:bg-red-900/50">
                                Decline
                              </button>
                            </div>
                          )}
                          <button onClick={async () => {
                            const res = await fetch('/api/messages', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ recipientUserId: booking.guestId, initialMessage: `Hi, following up on your booking request for ${booking.profile?.displayName} on ${new Date(booking.date).toLocaleDateString()}.` })
                            })
                            const data = await res.json()
                            if (data.success) window.location.href = `/dashboard/inbox#${data.data.conversationId}`
                          }} className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1 text-xs text-stone-400 hover:bg-stone-700 hover:text-stone-200 transition-colors">
                            💬 Message Guest
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone-500">Agency Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">Bio / Description</label>
                  <textarea value={settingsForm.bio} onChange={e => setSettingsForm(p => ({ ...p, bio: e.target.value }))} rows={4}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none resize-none"
                    placeholder="Tell models and clients about your agency..." />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</label>
                    <input value={settingsForm.phone} onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
                      placeholder="+1 234 567 890" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</label>
                    <input value={settingsForm.website} onChange={e => setSettingsForm(p => ({ ...p, website: e.target.value }))}
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
                      placeholder="https://youragency.com" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-400 flex items-center gap-1.5"><Instagram className="h-3.5 w-3.5" /> Instagram</label>
                    <input value={settingsForm.instagram} onChange={e => setSettingsForm(p => ({ ...p, instagram: e.target.value }))}
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-700 focus:outline-none"
                      placeholder="@youragency" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={savingSettings}
              className="w-full rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
              {savingSettings ? 'Saving...' : settingsSaved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>

      {/* Support buttons */}
      <div className="mt-8 flex items-center justify-center gap-3 border-t border-stone-800 pt-6">
        <ContactSupportButton />
        <ReportButton />
      </div>

      {/* Add Model Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-medium text-stone-200">Add Model</h2>
              <button onClick={() => { setShowAddModal(false); setAddError('') }} className="text-stone-500 hover:text-stone-300"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-4 text-xs text-stone-500">Listed under {agency?.country}. You can add photos after creating the profile.</p>
            {addError && <div className="mb-3 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{addError}</div>}
            <form onSubmit={handleAddModel} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Display Name *</label>
                <input value={addForm.displayName} onChange={e => setAddForm(p => ({ ...p, displayName: e.target.value }))} required
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="Professional name" />
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
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Age</label>
                <input type="number" min="18" max="60" value={addForm.age} onChange={e => setAddForm(p => ({ ...p, age: e.target.value }))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="e.g. 24" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Bio</label>
                <textarea value={addForm.bio} onChange={e => setAddForm(p => ({ ...p, bio: e.target.value }))} rows={2}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none" placeholder="Short bio..." />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Photos <span className="text-stone-600 font-normal">(optional — add up to 5 now)</span></label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {addPhotoUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-stone-800">
                      <img src={url} className="h-full w-full object-cover" alt="" />
                      <button type="button" onClick={() => { setAddPhotos(p => p.filter((_, j) => j !== i)); setAddPhotoUrls(p => p.filter((_, j) => j !== i)) }}
                        className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-950/80 text-stone-300 hover:text-white">
                        ×
                      </button>
                    </div>
                  ))}
                  {addPhotos.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-stone-700 bg-stone-800 hover:border-amber-700 transition-colors">
                      <Camera className="h-5 w-5 text-stone-600" />
                      <span className="text-xs text-stone-600 mt-1">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                        const files = Array.from(e.target.files || []).slice(0, 5 - addPhotos.length)
                        setAddPhotos(p => [...p, ...files])
                        files.forEach(f => { const r = new FileReader(); r.onload = ev => setAddPhotoUrls(p => [...p, ev.target?.result as string]); r.readAsDataURL(f) })
                        e.target.value = ''
                      }} />
                    </label>
                  )}
                </div>
                <p className="text-xs text-stone-600">You can also add more photos after creating the profile via the Edit button.</p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={adding} className="flex-1 rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {adding ? 'Adding...' : 'Add Model'}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setAddError('') }}
                  className="flex-1 rounded-lg border border-stone-700 py-2.5 text-sm text-stone-400 hover:border-stone-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-stone-800">
              <h2 className="text-lg font-medium text-stone-200">Edit — {editingModel.displayName}</h2>
              <button onClick={() => setEditingModel(null)} className="text-stone-500 hover:text-stone-300"><X className="h-5 w-5" /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {/* Photos section */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-stone-300">Photos ({modelImages.length}/15)</h3>
                  <label className={`cursor-pointer flex items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-amber-700 hover:text-stone-200 transition-colors ${uploadingImage || modelImages.length >= 15 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadModelImage} disabled={uploadingImage || modelImages.length >= 15} />
                    {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {uploadingImage ? 'Uploading...' : 'Add Photo'}
                  </label>
                </div>

                {loadingImages ? (
                  <div className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 text-stone-600 animate-spin" /></div>
                ) : modelImages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-700 py-8 text-center text-xs text-stone-600">
                    No photos yet. Click "Add Photo" above.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {modelImages.map(img => (
                      <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-stone-800">
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                        {img.isMain && <span className="absolute top-1 left-1 rounded-full bg-amber-800/90 px-1.5 py-0.5 text-xs text-amber-200">Main</span>}
                        <button onClick={() => handleDeleteModelImage(img.id)}
                          className="absolute inset-0 flex items-center justify-center bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit form */}
              <form onSubmit={handleEditModel} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-400">Display Name</label>
                  <input value={editForm.displayName} onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-400">Phone</label>
                  <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="+1 234 567 890" />
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
                  <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditingModel(null)}
                    className="flex-1 rounded-lg border border-stone-700 py-2.5 text-sm text-stone-400 hover:border-stone-600">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
