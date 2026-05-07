export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/jwt')
    const { prisma } = await import('@/lib/db/prisma')
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Deactivate profile/agency rather than hard delete
    if (session.role === 'MODEL') {
      await prisma.profile.updateMany({
        where: { userId: session.id },
        data: { isActive: false, approvalStatus: 'REJECTED' }
      })
    } else if (session.role === 'AGENCY') {
      await prisma.agency.updateMany({
        where: { userId: session.id },
        data: { isActive: false }
      })
    }

    // Deactivate user
    await prisma.user.update({
      where: { id: session.id },
      data: { name: '[Deleted]' }
    })

    // Clear session cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('femme_session')
    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
