/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
        ],
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
        ],
      },
    ]
  },
  outputFileTracingExcludes: {
    "*": ["./public/banners/**"],
  },
  async redirects() {
    return [
      // Country redirects
      { source: '/uk', destination: '/gb', permanent: true },
      { source: '/uk/', destination: '/gb', permanent: true },
      { source: '/france', destination: '/fr', permanent: true },
      { source: '/france/', destination: '/fr', permanent: true },
      { source: '/singapore', destination: '/sg', permanent: true },
      { source: '/singapore/', destination: '/sg', permanent: true },
      { source: '/us', destination: '/us', permanent: true },
      { source: '/us/', destination: '/us', permanent: true },
      { source: '/germany', destination: '/de', permanent: true },
      { source: '/germany/', destination: '/de', permanent: true },
      { source: '/china', destination: '/cn', permanent: true },
      { source: '/china/', destination: '/cn', permanent: true },
      { source: '/austria', destination: '/at', permanent: true },
      { source: '/austria/', destination: '/at', permanent: true },
      { source: '/uae', destination: '/ae', permanent: true },
      { source: '/uae/', destination: '/ae', permanent: true },

      // City redirects
      { source: '/uk/london-uk', destination: '/gb/london', permanent: true },
      { source: '/uk/london-uk/', destination: '/gb/london', permanent: true },

      // escort-directory country pages
      { source: '/escort-directory/Europe/Turkey.html', destination: '/tr', permanent: true },
      { source: '/escort-directory/Europe/France.html', destination: '/fr', permanent: true },
      { source: '/escort-directory/Europe.html', destination: '/', permanent: true },

      // escort-directory city pages
      { source: '/escort-directory/Asia/India/Delhi.html', destination: '/in/delhi', permanent: true },
      { source: '/escort-directory/Asia/China/Beijing.html', destination: '/cn/beijing', permanent: true },
      { source: '/escort-directory/Europe/Italy/Milan.html', destination: '/it/milan', permanent: true },
      { source: '/escort-directory/Europe/United-Kingdom/London.html', destination: '/gb/london', permanent: true },
      { source: '/escort-directory/Europe/Germany/Berlin.html', destination: '/de/berlin', permanent: true },
      { source: '/escort-directory/Europe/France/Paris.html', destination: '/fr/paris', permanent: true },
      { source: '/escort-directory/Europe/Germany/Frankfurt.html', destination: '/de/frankfurt', permanent: true },
      { source: '/escort-directory/Asia/United-Arab-Emirates/Dubai.html', destination: '/ae/dubai', permanent: true },
      { source: '/escort-directory/America/Canada/Toronto.html', destination: '/ca/toronto', permanent: true },
      { source: '/escort-directory/Asia/China/Shanghai.html', destination: '/cn/shanghai', permanent: true },
      { source: '/escort-directory/Asia/Singapore.html', destination: '/sg/singapore', permanent: true },
      { source: '/escort-directory/America/United-States/New-York.html', destination: '/us/new-york', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.digitaloceanspaces.com' },
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
