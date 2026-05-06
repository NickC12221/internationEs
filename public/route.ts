export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { prisma } = await import('@/lib/db/prisma')
    const base = 'https://www.internationalescorts.com'

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

    // Get unique countries and cities
    const countries = [...new Set(profiles.map(p => p.countryCode.toLowerCase()))]
    const cities = [...new Map(profiles.map(p => [`${p.countryCode.toLowerCase()}/${p.citySlug}`, p])).values()]

    const staticPages = ['', '/agencies', '/contact', '/privacy', '/terms', '/banners']

    const urls = [
      ...staticPages.map(path => `
  <url>
    <loc>${base}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`),
      ...countries.map(code => `
  <url>
    <loc>${base}/${code}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`),
      ...cities.map(p => `
  <url>
    <loc>${base}/${p.countryCode.toLowerCase()}/${p.citySlug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`),
      ...profiles.map(p => `
  <url>
    <loc>${base}/${p.countryCode.toLowerCase()}/${p.citySlug}/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`),
      ...agencies.map(a => `
  <url>
    <loc>${base}/agencies/${a.slug}</loc>
    <lastmod>${new Date(a.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`),
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`

    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
  } catch (err) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    })
  }
}
