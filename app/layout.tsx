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
  title: 'DogText: your dog texts you every morning',
  description: 'A free morning text from your dog, in their voice, built from their breed and personality. Text them back, share it to your story, plus plain-language breed guides and calculators.',
  keywords: 'dog care, AI dog chat, pet training, dog breeds, dog health, pet companion',
  authors: [{ name: 'DogText Team' }],
  openGraph: {
    title: 'DogText: your dog texts you every morning',
    description: 'A free morning text from your dog, in their voice. Text them back and share it to your story.',
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
    title: 'DogText: your dog texts you every morning',
    description: 'A free morning text from your dog, in their voice. Text them back and share it to your story.',
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
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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