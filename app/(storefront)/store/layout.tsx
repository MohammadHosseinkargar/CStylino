import { Header } from "@/components/storefront/header"
import { Footer } from "@/components/storefront/footer"
import { AffiliateTracker } from "@/components/storefront/affiliate-tracker"
import { MobileBottomNav } from "@/components/storefront/mobile-bottom-nav"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AffiliateTracker />
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileBottomNav />
      <Footer />
    </div>
  )
}
