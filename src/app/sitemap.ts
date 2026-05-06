import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.internationalescorts.com'

  try {
    const { prisma } = await import('@/lib/db/prisma')

    const [profiles, agencies] = await Promise.all([
      prisma.profile.findMany({
        where: { isActive: true, approvalStatus: 'APPROVED' },
        select: { slug: true, countryCode: true, citySlug: true, updatedAt: true }
      }),
      prisma.agency.findMany({
        where: { isActive: true, approvalStatus: 'APPROVED' },
        select: { slug: true, updatedAt: true }
      })
    ])

    const countries = [...new Set(profiles.map((p: any) => p.countryCode.toLowerCase()))]
    const cities = [...new Map(profiles.map((p: any) => [`${p.countryCode.toLowerCase()}/${p.citySlug}`, p])).values()]

    return [
      { url: base, changeFrequency: 'daily', priority: 1 },
      { url: `${base}/agencies`, changeFrequency: 'daily', priority: 0.8 },
      { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${base}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${base}/terms`, changeFrequency: 'monthly', priority: 0.3 },
      ...countries.map((code: any) => ({ url: `${base}/${code}`, changeFrequency: 'daily' as const, priority: 0.8 })),
      ...cities.map((p: any) => ({ url: `${base}/${p.countryCode.toLowerCase()}/${p.citySlug}`, changeFrequency: 'daily' as const, priority: 0.7 })),
      ...profiles.map((p: any) => ({ url: `${base}/${p.countryCode.toLowerCase()}/${p.citySlug}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
      ...agencies.map((a: any) => ({ url: `${base}/agencies/${a.slug}`, lastModified: a.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ]
  } catch {
    return [{ url: base, priority: 1 }]
  }
}
