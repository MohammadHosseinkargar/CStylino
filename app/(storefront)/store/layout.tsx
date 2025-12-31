import { Footer } from "@/components/storefront/footer"
import { StorefrontChrome } from "@/components/storefront/storefront-chrome"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StorefrontChrome />
      <main className="flex-1 pb-20 md:pb-0 pt-[var(--storefront-header-height)]">
        {children}
      </main>
      <Footer />
    </div>
  )
}
