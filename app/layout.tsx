import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from '@/components/theme-context';
import { AuthProvider } from '../lib/auth/auth-context'
import { ThemeScript } from '@/components/theme-script';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "wrkout",
  description: "Track your workouts and progressive overload journey",
  generator: 'Next.js',
  applicationName: 'wrkout',
  keywords: ['workout', 'fitness', 'progressive overload', 'PPL', 'strength training'],
  authors: [{ name: 'wrkout team' }],
  creator: 'wrkout team',
  publisher: 'wrkout',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/pwa-startup-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-startup-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/pwa-startup-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/pwa-startup-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
