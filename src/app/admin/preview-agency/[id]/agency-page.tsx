export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'
import Header from '@/components/layout/Header'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminAgencyPreviewPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('femme_session')?.value
  if (!token) redirect('/login')
  const session = await verifyToken(token)
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const agency = await prisma.agency.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true, createdAt: true } },
      models: {
        include: {
          profile: {
            include: { images: { where: { isMain: true }, take: 1 } }
          }
        }
      }
    }
  })

  if (!agency) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Agency not found</div>

  return (
    <div className="min-h-screen bg-stone-950">
      <Header />

      <div className="bg-amber-900/30 border-b border-amber-800 px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 text-sm font-medium">👁 Admin Preview — Agency</span>
            <span className="text-stone-500 text-xs">Pending approval · not visible to the public</span>
          </div>
          <Link href="/admin" className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-stone-500 transition-colors">
            ← Back to Admin
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5 flex flex-col items-center text-center">
              {agency.logoUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-xl mb-4">
                  <Image src={agency.logoUrl} alt={agency.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-xl bg-stone-800 flex items-center justify-center text-3xl text-stone-500 mb-4">
                  {agency.name.charAt(0)}
                </div>
              )}
              <h1 className="text-2xl font-light text-stone-100" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{agency.name}</h1>
              <p className="text-stone-400 text-sm mt-1">{agency.city}, {agency.country}</p>
              <div className="mt-2 flex gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs ${agency.approvalStatus === 'PENDING' ? 'bg-amber-900/50 text-amber-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
                  {agency.approvalStatus}
                </span>
                {agency.isPremium && <span className="rounded-full bg-amber-800/50 px-2.5 py-1 text-xs text-amber-300">PREMIUM</span>}
              </div>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-900 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Email</span><span className="text-stone-300 truncate ml-2">{agency.user.email}</span></div>
              {agency.phone && <div className="flex justify-between"><span className="text-stone-500">Phone</span><span className="text-stone-300">{agency.phone}</span></div>}
              {agency.website && <div className="flex justify-between"><span className="text-stone-500">Website</span><span className="text-stone-300 truncate ml-2">{agency.website}</span></div>}
              <div className="flex justify-between"><span className="text-stone-500">Escorts</span><span className="text-stone-300">{agency.models.length}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Joined</span><span className="text-stone-300">{new Date(agency.user.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-6">
            {agency.bio && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">About</h3>
                <p className="text-stone-300 leading-relaxed">{agency.bio}</p>
              </div>
            )}

            {agency.models.length > 0 && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">Escorts ({agency.models.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {agency.models.map((m: any) => (
                    <div key={m.id} className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
                      <div className="relative aspect-square bg-stone-800">
                        {m.profile.images[0] ? (
                          <Image src={m.profile.images[0].url} alt={m.profile.displayName} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-600 text-2xl">?</div>
                        )}
                        {m.profile.listingTier === 'PREMIUM' && (
                          <span className="absolute top-1 right-1 rounded-full bg-amber-800/80 px-1.5 py-0.5 text-xs text-amber-200">P</span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-stone-300 truncate">{m.profile.displayName}</p>
                        <p className="text-xs text-stone-600">{m.profile.city}</p>
                      </div>
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
