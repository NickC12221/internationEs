'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Menu, X, User, LogOut, Settings, Shield, Building2, MessageSquare } from 'lucide-react'
import NotificationBell from '@/components/messaging/NotificationBell'

interface UserData {
  id: string
  email: string
  role: string
  profile?: { displayName: string; slug: string } | null
  agency?: { name: string; slug: string } | null
}

export default function Header() {
  const [user, setUser] = useState<UserData | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        if (data.success) setUser(data.data)
        else setUser(null)
      })
      .catch(() => setUser(null))
  }, [pathname])

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const dashboardUrl = user?.role === 'AGENCY' ? '/agency-dashboard' : '/dashboard'
  const displayName = user?.role === 'AGENCY'
    ? (user.agency?.name || user.email)
    : (user?.profile?.displayName || user?.email)

  return (
    <header className="sticky top-0 z-50 border-b border-stone-800 bg-stone-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-display text-2xl font-light tracking-widest text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              FEMME
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xs md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search models, cities..."
                className="w-full rounded-full border border-stone-800 bg-stone-900 py-2 pl-9 pr-4 text-sm text-stone-200 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
              />
            </div>
          </form>

          {/* Nav links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-400 md:flex">
            <Link href="/" className="hover:text-stone-100 transition-colors">Browse</Link>
            <Link href="/agencies" className="hover:text-stone-100 transition-colors">Agencies</Link>
            <Link href="/search" className="hover:text-stone-100 transition-colors">Search</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm hover:border-stone-600 transition-colors"
                >
                  {user.role === 'AGENCY'
                    ? <Building2 className="h-4 w-4 text-amber-400" />
                    : <User className="h-4 w-4 text-stone-400" />
                  }
                  <span className="hidden text-stone-200 sm:block max-w-[120px] truncate">
                    {displayName}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg border border-stone-800 bg-stone-900 py-1 shadow-xl z-50">
                    <div className="px-4 py-2 border-b border-stone-800">
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      <p className={`text-xs font-medium mt-0.5 ${user.role === 'AGENCY' ? 'text-amber-400' : user.role === 'ADMIN' ? 'text-red-400' : 'text-stone-400'}`}>
                        {user.role === 'AGENCY' ? '🏢 Agency' : user.role === 'ADMIN' ? '🛡 Admin' : '👤 Model'}
                      </p>
                    </div>
                    <Link
                      href={dashboardUrl}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-stone-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {user.role === 'AGENCY' ? <Building2 className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                      {user.role === 'AGENCY' ? 'Agency Dashboard' : 'Dashboard'}
                    </Link>
                    <Link
                      href="/dashboard/inbox"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-stone-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <MessageSquare className="h-4 w-4" /> Inbox
                    </Link>
                    <Link
                      href="/dashboard/bookings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-stone-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      📅 My Bookings
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-stone-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-stone-800" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-stone-400 hover:bg-stone-800 hover:text-stone-100"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm text-stone-400 hover:text-stone-100 transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-stone-100 hover:bg-amber-600 transition-colors">
                  Join
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-stone-400 hover:text-stone-100"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-stone-800 py-4 md:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search models, cities..."
                  className="w-full rounded-full border border-stone-800 bg-stone-900 py-2 pl-9 pr-4 text-sm text-stone-200 placeholder-stone-500 focus:border-amber-700 focus:outline-none"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-3 text-sm text-stone-400">
              <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-stone-100">Browse</Link>
              <Link href="/agencies" onClick={() => setMenuOpen(false)} className="hover:text-stone-100">Agencies</Link>
              <Link href="/search" onClick={() => setMenuOpen(false)} className="hover:text-stone-100">Search</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
