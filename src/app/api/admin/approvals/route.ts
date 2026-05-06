export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    let profiles: any[] = [], agencies: any[] = []
    try {
      const [profilesRes, agenciesRes] = await Promise.all([
        prisma.profile.findMany({
          where: { approvalStatus: 'PENDING' },
          include: {
            user: { select: { id: true, email: true, createdAt: true } },
            images: { where: { isMain: true }, take: 1 },
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.agency.findMany({
          where: { approvalStatus: 'PENDING' },
          include: { user: { select: { id: true, email: true, createdAt: true } } },
          orderBy: { createdAt: 'desc' }
        })
      ])
      profiles = profilesRes
      agencies = agenciesRes
    } catch (e) { /* schema not migrated yet */ }

    return NextResponse.json({ success: true, data: { profiles, agencies } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { id, type, action, adminNotes } = await req.json()
    const approved = action === 'APPROVED'

    if (type === 'profile') {
      await prisma.profile.update({ where: { id }, data: { approvalStatus: action, isActive: approved } })
      const profile = await prisma.profile.findUnique({ where: { id }, select: { userId: true } })
      if (profile) {
        await prisma.notification.create({ data: {
          userId: profile.userId,
          type: approved ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
          title: approved ? '🎉 Profile Approved!' : 'Profile Not Approved',
          body: approved ? 'Your profile is now live on the directory.' : adminNotes || 'Your profile requires changes. Please contact support.',
        }}).catch(() => {})
      }
    } else {
      await prisma.agency.update({ where: { id }, data: { approvalStatus: action, isActive: approved } })
      const agency = await prisma.agency.findUnique({ where: { id }, select: { userId: true } })
      if (agency) {
        await prisma.notification.create({ data: {
          userId: agency.userId,
          type: approved ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
          title: approved ? '🎉 Agency Approved!' : 'Agency Not Approved',
          body: approved ? 'Your agency is now live on the directory.' : adminNotes || 'Your agency requires changes. Please contact support.',
        }}).catch(() => {})
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
