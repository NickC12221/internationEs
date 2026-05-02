'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, Plus, Trash2, Star, Users, MapPin, CheckCircle, Edit3, Bell, Calendar, ChevronRight, Upload, X } from 'lucide-react'
import Header from '@/components/layout/Header'

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 12, 24]
const AVAILABILITY_OPTIONS = ['AVAILABLE', 'UNAVAILABLE', 'TRAVELING', 'BUSY']

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
  isActive: boolean
  profileImageUrl: string | null
  images: { url: string }[]
  slug: string
  bio: string | null
  age: number | null
  email: string | null
  phone: string | null
  instagram: string | null
  pricing: Record<string, number> | null
}

interface Agency {
  id: string
  name: string
  slug: string
  city: string
  country: string
  logoUrl: string | null
  isPremium: boolean
  plan: string
  subscriptionStatus: string
  subscriptionExpiresAt: string | null
  bio: string | null
  email: string | null
  phone: string | null
  website: string | null
  instagram: string | null
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

const emptyForm = {
  displayName: '', city: '', email: '', bio: '', age: '',
  availability: 'AVAILABLE', phone: '', instagram: '', profileImageUrl: '',
  pricing: {} as Record<string, number>,
}

export default function AgencyDashboardPage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [models, setModels] = useState<AgencyModel[]>([])
  const [limit, setLimit] = useState(5)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'models' | 'bookings' | 'notifications'>('models')
  const [showModal, setShowModal] = useState(false)
  const [editingModel, setEditingModel] = useState<AgencyModel | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const [agencyRes, modelsRes, notifRes, bookingRes] = await Promise.all([
        fetch('/api/agency'),
        fetch('/api/agency/models'),
        fetch('/api/notifications'),
        fetch('/api/bookings'),
      ])
      const [agencyData, modelsData, notifData, bookingData] = await Promise.all([
        agencyRes.json(), modelsRes.json(), notifRes.json(), bookingRes.json()
      ])
      if (agencyData.success) setAgency(agencyData.data as Agency)
      if (modelsData.success) {
        setModels(modelsData.data)
        setLimit(modelsData.limit || 5)
      }
      if (notifData.success) {
        setNotifications(notifData.data)
        setUnreadCount(notifData.data.filter((n: Notification) => !n.isRead).length)
      }
      if (bookingData.success) setBookings(bookingData.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openAddModal = () => {
    setEditingModel(null)
    setForm({ ...emptyForm })
    setSaveError('')
    setShowModal(true)
  }

  const openEditModal = (model: AgencyModel) => {
    setEditingModel(model)
    setForm({
      displayName: model.displayName,
      city: model.city,
      email: model.email || '',
      bio: model.bio || '',
      age: model.age?.toString() || '',
      availability: model.availability,
      phone: model.phone || '',
      instagram: model.instagram || '',
      profileImageUrl: model.profileImageUrl || '',
      pricing: model.pricing || {},
    })
    setSaveError('')
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: file.type, folder: 'profiles', isPrivate: false }),
      })
      const { data } = await uploadRes.json()
      await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      setForm(p => ({ ...p, profileImageUrl: data.publicUrl }))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const method = editingModel ? 'PATCH' : 'POST'
      const url = editingModel ? `/api/agency/models/${editingModel.id}` : '/api/agency/models'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        fetchData()
      } else {
        setSaveError(data.error || 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (profileId: string) => {
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

  const handleBookingStatus = async (bookingId: string, status: string) => {
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchData()
  }

  const markNotificationsRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setUnreadCount(0)
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

  const setPricing = (hours: number, value: string) => {
    const key = `${hours}h`
    const num = parseFloat(value)
    setForm(p => ({
      ...p,
      pricing: value === '' ? Object.fromEntries(Object.entries(p.pricing).filter(([k]) => k !== key))
        : { ...p.pricing, [key]: isNaN(num) ? 0 : num }
    }))
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Header />
      <div className="flex items-center justify-center py-24 text-stone-500">Loading...</div>
    </div>
  )

  const slotsUsed = models.length
  const logoUrl = agency?.logoUrl ?? null
  const isPremiumPlan = agency?.plan === 'PREMIUM'

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        {/* Agency Header */}
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="h-5 w-5 text-amber-500" />
                <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {agency?.name}
                </h1>
                {isPremiumPlan && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-400">
                    <Star className="h-3 w-3 fill-current" /> Premium Plan
                  </span>
                )}
                {!isPremiumPlan && (
                  <span className="rounded-full bg-stone-800 px-2 py-0.5 text-xs text-stone-400">Free Plan</span>
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
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-light text-stone-100">{slotsUsed}/{limit}</div>
              <div className="text-xs text-stone-500">Models</div>
              <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-stone-700">
                <div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${Math.min((slotsUsed / limit) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Banner upload */}
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-5">
          <h3 className="mb-3 text-sm font-medium text-stone-300">Agency Banner / Logo</h3>
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                <img src={logoUrl} alt="Banner" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-stone-700 bg-stone-800 text-stone-600 text-xs text-center px-2">
                No banner yet
              </div>
            )}
            <div>
              <p className="text-xs text-stone-500 mb-2">Shown as hero banner on your agency profile page. Recommended: 1200×400px.</p>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                <span className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-stone-400 hover:border-amber-700 hover:text-stone-200 transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Upload Banner
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-stone-900 border border-stone-800 p-1">
          {([
            { key: 'models', label: 'Models', icon: <Users className="h-4 w-4" /> },
            { key: 'bookings', label: 'Bookings', icon: <Calendar className="h-4 w-4" />, badge: bookings.filter(b => b.status === 'PENDING').length },
            { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, badge: unreadCount },
          ] as any[]).map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key); if (tab.key === 'notifications') markNotificationsRead() }}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-stone-800 text-stone-100' : 'text-stone-500 hover:text-stone-300'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute right-2 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-xs text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* MODELS TAB */}
        {activeTab === 'models' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-stone-200">Your Models</h2>
              <button
                onClick={() => slotsUsed < limit ? openAddModal() : alert(`Model limit reached (${limit}/${limit}). ${!isPremiumPlan ? 'Upgrade to Premium for up to 20 models.' : ''}`)}
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
                  const profileUrl = `/${model.countryCode?.toLowerCase() || 'ae'}/${model.citySlug || 'dubai'}/${model.slug}`
                  return (
                    <div key={model.id} className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
                      <div className="relative aspect-[3/2] bg-stone-800">
                        {img ? (
                          <Image src={img} alt={model.displayName} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-600 text-2xl font-light">
                            {model.displayName[0]}
                          </div>
                        )}
                        {model.listingTier === 'PREMIUM' && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-amber-900/90 px-2 py-0.5 text-xs text-amber-300">
                            <Star className="h-3 w-3 fill-current" /> Premium
                          </span>
                        )}
                        {!model.isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/70">
                            <span className="rounded-full bg-red-900/80 px-3 py-1 text-xs text-red-300">Inactive</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-stone-200 truncate">{model.displayName}</p>
                          {model.isVerified && <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />}
                        </div>
                        <p className="text-xs text-stone-500">{model.city}</p>
                        {model.pricing && Object.keys(model.pricing).length > 0 && (
                          <p className="mt-1 text-xs text-amber-600">
                            From ${Math.min(...Object.values(model.pricing))}/hr
                          </p>
                        )}
                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                          <button onClick={() => openEditModal(model)}
                            className="flex items-center justify-center gap-1 rounded-lg bg-stone-800 px-2 py-1.5 text-xs text-stone-300 hover:bg-stone-700 transition-colors">
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button onClick={() => handleUpgradePremium(model.id, model.listingTier)}
                            className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${model.listingTier === 'PREMIUM' ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                            <Star className="h-3.5 w-3.5" /> {model.listingTier === 'PREMIUM' ? 'Premium' : 'Upgrade'}
                          </button>
                          <Link href={profileUrl} target="_blank"
                            className="flex items-center justify-center gap-1 rounded-lg bg-stone-800 px-2 py-1.5 text-xs text-stone-400 hover:bg-stone-700 transition-colors">
                            <ChevronRight className="h-3.5 w-3.5" /> View
                          </Link>
                          <button onClick={() => handleDelete(model.id)}
                            className="flex items-center justify-center gap-1 rounded-lg bg-red-950/30 px-2 py-1.5 text-xs text-red-400 hover:bg-red-950/60 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!isPremiumPlan && (
              <div className="mt-8 rounded-2xl border border-amber-900/40 bg-amber-950/10 p-6">
                <div className="flex items-start gap-4">
                  <Star className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-stone-200">Upgrade to Premium Plan</h3>
                    <p className="mt-1 text-sm text-stone-400">Get up to 20 models, premium agency badge, and featured placement on city pages.</p>
                    <button className="mt-3 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
                      Upgrade — $49/month
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-stone-200">Booking Requests</h2>
            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-700 py-16 text-center">
                <Calendar className="mx-auto h-10 w-10 text-stone-700 mb-3" />
                <p className="text-stone-500">No bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className={`rounded-xl border p-4 ${booking.status === 'PENDING' ? 'border-amber-900/50 bg-amber-950/10' : 'border-stone-800 bg-stone-900'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-200">{booking.clientName}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            booking.status === 'PENDING' ? 'bg-amber-900/30 text-amber-400' :
                            booking.status === 'CONFIRMED' ? 'bg-emerald-900/30 text-emerald-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>{booking.status}</span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Model: <span className="text-stone-300">{booking.profile?.displayName}</span>
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{booking.duration}h
                          {booking.totalPrice && <span className="text-amber-500 ml-1">${booking.totalPrice}</span>}
                        </p>
                        <div className="mt-1 text-xs text-stone-500">
                          {booking.clientEmail} · {booking.clientPhone}
                        </div>
                        {booking.notes && <p className="mt-1 text-xs text-stone-500 italic">"{booking.notes}"</p>}
                      </div>
                      {booking.status === 'PENDING' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleBookingStatus(booking.id, 'CONFIRMED')}
                            className="rounded-lg bg-emerald-900/40 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-900/70 transition-colors">
                            Confirm
                          </button>
                          <button onClick={() => handleBookingStatus(booking.id, 'REJECTED')}
                            className="rounded-lg bg-red-900/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/60 transition-colors">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-stone-200">Notifications</h2>
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-700 py-16 text-center">
                <Bell className="mx-auto h-10 w-10 text-stone-700 mb-3" />
                <p className="text-stone-500">No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className={`rounded-xl border p-4 ${!n.isRead ? 'border-amber-900/40 bg-amber-950/10' : 'border-stone-800 bg-stone-900'}`}>
                    <div className="flex items-start gap-3">
                      <Bell className={`h-4 w-4 flex-shrink-0 mt-0.5 ${!n.isRead ? 'text-amber-400' : 'text-stone-600'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-200">{n.title}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{n.message}</p>
                        <p className="text-xs text-stone-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Model Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/80 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-stone-900 p-6 my-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-stone-200">{editingModel ? 'Edit Model' : 'Add Model'}</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-500 hover:text-stone-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            {saveError && <div className="mb-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{saveError}</div>}
            <form onSubmit={handleSave} className="space-y-4">

              {/* Photo upload */}
              <div>
                <label className="mb-2 block text-xs text-stone-500">Profile Photo</label>
                <div className="flex items-center gap-3">
                  {form.profileImageUrl ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                      <img src={form.profileImageUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-stone-700 bg-stone-800 text-stone-600 text-xs">
                      Photo
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    <span className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-stone-400 hover:border-amber-700 hover:text-stone-200 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-stone-500">Display Name *</label>
                  <input value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="Model name" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-stone-500">City *</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="City" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-stone-500">Age</label>
                  <input type="number" min="18" max="100" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="18" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-stone-500">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="model@example.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-stone-500">Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="+1 234 567 890" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-stone-500">Instagram</label>
                  <input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none" placeholder="@username" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-stone-500">Availability</label>
                  <select value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none">
                    {AVAILABILITY_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0) + o.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-stone-500">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-700 focus:outline-none resize-none" placeholder="Short bio..." />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Pricing (optional)</label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_OPTIONS.map(h => (
                    <div key={h}>
                      <label className="mb-1 block text-xs text-stone-600">{h}h</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-stone-500">$</span>
                        <input
                          type="number"
                          min="0"
                          value={form.pricing[`${h}h`] || ''}
                          onChange={e => setPricing(h, e.target.value)}
                          className="w-full rounded-lg border border-stone-700 bg-stone-800 py-2 pl-5 pr-2 text-xs text-stone-100 focus:border-amber-700 focus:outline-none"
                          placeholder="—"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploadingImage}
                  className="flex-1 rounded-lg bg-amber-700 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {saving ? 'Saving...' : editingModel ? 'Save Changes' : 'Add Model'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
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
