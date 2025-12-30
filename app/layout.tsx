import type { Metadata } from "next"
import { Vazirmatn } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { fa } from "@/lib/copy/fa"

const vazirmatn = Vazirmatn({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-persian",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
})

export const metadata: Metadata = {
  title: `${fa.brand.name} | ${fa.brand.descriptor}`,
  description: fa.brand.shortDescription,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground grain-texture">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
