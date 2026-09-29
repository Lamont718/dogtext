import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from '../components/providers/session-provider'
import Header from '../components/navigation/header'
import Footer from '../components/navigation/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://dogtext-tau.vercel.app'),
  title: 'DogText: letters from your dog to your kids',
  description: 'Every day your family dog writes your kids a short letter in its own voice, in words they understand. Read it at breakfast or bedtime. Free.',
  keywords: 'dog care, AI dog chat, pet training, dog breeds, dog health, pet companion',
  authors: [{ name: 'DogText Team' }],
  openGraph: {
    title: 'DogText: letters from your dog to your kids',
    description: 'Every day your family dog writes your kids a short letter, in its own voice. Free.',
    siteName: 'DogText',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DogText - Premium Dog Care Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DogText: letters from your dog to your kids',
    description: 'Every day your family dog writes your kids a short letter, in its own voice. Free.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Home Screen app on iPhone (needed there for notifications) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="DogText" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#FF8C42" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="min-h-screen bg-white dark:bg-background flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}