import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'International Escorts — Premium Escort Directory Worldwide',
    template: '%s | International Escorts',
  },
  description:
    'International Escorts is the premier global escort directory. Browse verified independent escorts and escort agencies by city and country. Discreet, professional and worldwide.',
  keywords: ['escort directory', 'international escorts', 'escort agency', 'independent escort', 'escorts near me', 'verified escorts', 'premium escort', 'book an escort', 'female escorts', 'escort service'],
  openGraph: {
    type: 'website',
    siteName: 'International Escorts',
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
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  )
}
