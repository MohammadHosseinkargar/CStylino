"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"
import { fa } from "@/lib/copy/fa"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const itemCount = useCartStore((state) => state.getItemCount())

  if (pathname?.startsWith("/store/products/")) {
    return null
  }

  const accountHref = session ? "/store/orders" : "/auth/signin"

  const navItems = [
    { href: "/store", label: fa.nav.home, icon: Home, match: (path: string) => path === "/store" },
    {
      href: "/store/products",
      label: fa.nav.products,
      icon: LayoutGrid,
      match: (path: string) => path.startsWith("/store/products"),
    },
    {
      href: "/store/cart",
      label: fa.nav.cart,
      icon: ShoppingCart,
      match: (path: string) => path.startsWith("/store/cart"),
    },
    {
      href: accountHref,
      label: fa.nav.account,
      icon: User,
      match: (path: string) => path.startsWith("/store/orders") || path.startsWith("/auth"),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[var(--mobile-bottom-nav-height)] border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex h-full items-center justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.match(pathname || "")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.href === "/store/cart" && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground text-center">
                    {itemCount > 9 ? "۹+" : itemCount.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
