"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, MapPin, User } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/account",
    label: "داشبورد",
    icon: LayoutDashboard,
    match: (path: string) => path === "/account",
  },
  {
    href: "/account/orders",
    label: "سفارش‌ها",
    icon: Package,
    match: (path: string) => path.startsWith("/account/orders"),
  },
  {
    href: "/account/tracking",
    label: "رهگیری",
    icon: MapPin,
    match: (path: string) => path.startsWith("/account/tracking"),
  },
  {
    href: "/account/profile",
    label: "پروفایل",
    icon: User,
    match: (path: string) => path.startsWith("/account/profile"),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-40 h-[var(--mobile-bottom-nav-height)] border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden font-sans"
    >
      <div className="flex h-full items-center justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.match(pathname || "")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}