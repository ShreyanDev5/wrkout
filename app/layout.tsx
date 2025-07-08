import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-context"
import { AuthProvider } from '../lib/auth/auth-context'
import AuthGate from "@/components/auth/auth-gate"
import DemoDataLoader from "@/components/auth/demo-data-loader"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Wrkout - Progressive Overload Tracker",
  description: "Track your workouts and progressive overload journey",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <AuthGate>
            <DemoDataLoader>
              <ThemeProvider>{children}</ThemeProvider>
            </DemoDataLoader>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  )
}
