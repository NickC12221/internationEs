export const dynamic = 'force-dynamic' // force-rebuild

// src/app/api/locations/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get all active profiles grouped by country/city
    const groups = await prisma.profile.groupBy({
      by: ['country', 'countryCode', 'city', 'citySlug'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: [
        { country: 'asc' },
        { city: 'asc' },
      ],
    })

    // Structure into country -> cities format
    const locationMap = new Map<string, {
      country: string
      countryCode: string
      cities: { city: string; citySlug: string; count: number }[]
      totalCount: number
    }>()

    for (const group of groups) {
      const key = group.countryCode
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          country: group.country,
          countryCode: group.countryCode,
          cities: [],
          totalCount: 0,
        })
      }
      const entry = locationMap.get(key)!
      entry.cities.push({
        city: group.city,
        citySlug: group.citySlug,
        count: group._count.id,
      })
      entry.totalCount += group._count.id
    }

    const locations = Array.from(locationMap.values()).sort(
      (a, b) => b.totalCount - a.totalCount
    )

    return NextResponse.json({ success: true, data: locations })
  } catch (error) {
    console.error('Locations error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch locations' }, { status: 500 })
  }
}
