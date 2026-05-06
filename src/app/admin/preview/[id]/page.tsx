export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'
import Header from '@/components/layout/Header'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminPreviewPage({ params }: { params: { id: string } }) {
  // Verify admin
  const cookieStore = cookies()
  const token = cookieStore.get('femme_session')?.value
  if (!token) redirect('/login')
  const session = await verifyToken(token)
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: 'asc' } },
      user: { select: { email: true, createdAt: true } },
    }
  })

  if (!profile) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Profile not found</div>

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      {/* Admin banner */}
      <div className="bg-amber-900/30 border-b border-amber-800 px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 text-sm font-medium">👁 Admin Preview</span>
            <span className="text-stone-500 text-xs">This profile is pending approval and not visible to the public</span>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-stone-500 transition-colors">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left column */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-900">
              {profile.profileImageUrl ? (
                <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-600">No photo</div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${profile.approvalStatus === 'PENDING' ? 'bg-amber-900/80 text-amber-300' : 'bg-emerald-900/80 text-emerald-300'}`}>
                  {profile.approvalStatus}
                </span>
                {profile.listingTier === 'PREMIUM' && (
                  <span className="rounded-full bg-amber-800/80 px-2.5 py-1 text-xs text-amber-300">PREMIUM</span>
                )}
              </div>
            </div>

            {/* Info card */}
            <div className="rounded-xl border border-stone-800 bg-stone-900 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Email</span><span className="text-stone-300">{profile.user.email}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Joined</span><span className="text-stone-300">{new Date(profile.user.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Active</span><span className={profile.isActive ? 'text-emerald-400' : 'text-red-400'}>{profile.isActive ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Verified</span><span className={profile.isVerified ? 'text-blue-400' : 'text-stone-500'}>{profile.isVerified ? 'Yes' : 'No'}</span></div>
            </div>

            {/* Rates */}
            {(profile.rate1hr || profile.rate2hr || profile.rateOvernight) && (
              <div className="rounded-xl border border-stone-800 bg-stone-900 p-4">
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">Rates</h3>
                <div className="space-y-1.5 text-sm">
                  {profile.rate1hr && <div className="flex justify-between"><span className="text-stone-400">1 Hour</span><span className="text-stone-200">${profile.rate1hr}</span></div>}
                  {profile.rate2hr && <div className="flex justify-between"><span className="text-stone-400">2 Hours</span><span className="text-stone-200">${profile.rate2hr}</span></div>}
                  {profile.rate3hr && <div className="flex justify-between"><span className="text-stone-400">3 Hours</span><span className="text-stone-200">${profile.rate3hr}</span></div>}
                  {profile.rate4hr && <div className="flex justify-between"><span className="text-stone-400">4 Hours</span><span className="text-stone-200">${profile.rate4hr}</span></div>}
                  {profile.rateHalf && <div className="flex justify-between"><span className="text-stone-400">Half Day</span><span className="text-stone-200">${profile.rateHalf}</span></div>}
                  {profile.rateFull && <div className="flex justify-between"><span className="text-stone-400">Full Day</span><span className="text-stone-200">${profile.rateFull}</span></div>}
                  {profile.rateDinner && <div className="flex justify-between"><span className="text-stone-400">Dinner Date</span><span className="text-stone-200">${profile.rateDinner}</span></div>}
                  {profile.rateOvernight && <div className="flex justify-between"><span className="text-stone-400">Overnight</span><span className="text-stone-200">${profile.rateOvernight}</span></div>}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {profile.displayName}
                {profile.isVerified && <span className="ml-2 text-blue-400 text-lg">✓</span>}
              </h1>
              <p className="text-stone-400 mt-1">{profile.city}, {profile.country}</p>
              {profile.age && <p className="text-stone-500 text-sm mt-0.5">Age {profile.age}</p>}
            </div>

            {profile.bio && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">About</h3>
                <p className="text-stone-300 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Physical */}
            {(profile.height || profile.build || profile.hairColor || profile.eyeColor || profile.ethnicity) && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">Physical</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {profile.height && <div className="flex justify-between rounded-lg bg-stone-900 px-3 py-2"><span className="text-stone-500">Height</span><span className="text-stone-300">{profile.height}</span></div>}
                  {profile.build && <div className="flex justify-between rounded-lg bg-stone-900 px-3 py-2"><span className="text-stone-500">Build</span><span className="text-stone-300">{profile.build}</span></div>}
                  {profile.hairColor && <div className="flex justify-between rounded-lg bg-stone-900 px-3 py-2"><span className="text-stone-500">Hair</span><span className="text-stone-300">{profile.hairColor}</span></div>}
                  {profile.eyeColor && <div className="flex justify-between rounded-lg bg-stone-900 px-3 py-2"><span className="text-stone-500">Eyes</span><span className="text-stone-300">{profile.eyeColor}</span></div>}
                  {profile.ethnicity && <div className="flex justify-between rounded-lg bg-stone-900 px-3 py-2"><span className="text-stone-500">Ethnicity</span><span className="text-stone-300">{profile.ethnicity}</span></div>}
                  {profile.nationality && <div className="flex justify-between rounded-lg bg-stone-900 px-3 py-2"><span className="text-stone-500">Nationality</span><span className="text-stone-300">{profile.nationality}</span></div>}
                </div>
              </div>
            )}

            {/* Services */}
            {profile.services?.length > 0 && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((s: string) => (
                    <span key={s} className="rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-400">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="flex gap-3">
              {profile.incall && <span className="rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-300">Incall</span>}
              {profile.outcall && <span className="rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-300">Outcall</span>}
              {profile.travel && <span className="rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-300">Travel Available</span>}
            </div>

            {/* Gallery */}
            {profile.images.length > 1 && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">Gallery ({profile.images.length} photos)</h3>
                <div className="grid grid-cols-3 gap-2">
                  {profile.images.map(img => (
                    <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-stone-900">
                      <Image src={img.url} alt="Gallery" fill className="object-cover" />
                      {img.isMain && <span className="absolute top-1 left-1 rounded-full bg-amber-800/80 px-1.5 py-0.5 text-xs text-amber-200">Main</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
