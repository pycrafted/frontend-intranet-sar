import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { AuthProvider } from "@/contexts/AuthContext"
import { ChromeFix } from "@/components/ChromeFix"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: "Intranet - SAR",
  description: "Plateforme intranet de la Société Africaine de Raffinage",
  generator: "v0.app",
  icons: {
    icon: "/sarlogo.png",
    shortcut: "/sarlogo.png",
    apple: "/sarlogo.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#dc2626",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${inter.variable} antialiased`}>
        <Providers>
          <AuthProvider>
            <ChromeFix />
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
