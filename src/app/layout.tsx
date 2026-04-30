// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Femme Directory — Discover Models Worldwide',
    template: '%s | Femme Directory',
  },
  description:
    'The premier directory for professional female models. Browse by country and city, connect with verified talent worldwide.',
  keywords: ['model directory', 'female models', 'modeling agency', 'book a model'],
  openGraph: {
    type: 'website',
    siteName: 'Femme Directory',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-stone-950 text-stone-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
