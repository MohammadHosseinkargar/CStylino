"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Users,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
} from "lucide-react"

const menuItems = [
  { href: "/affiliate", label: "داشبورد", icon: LayoutDashboard },
  { href: "/affiliate/commissions", label: "کمیسیون ها", icon: TrendingUp },
  { href: "/affiliate/payouts", label: "تسویه ها", icon: Wallet },
  { href: "/affiliate/sub-affiliates", label: "زیرمجموعه ها", icon: Users },
  { href: "/affiliate/settings", label: "تنظیمات", icon: Settings },
]

export function AffiliateSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const previousOverflow = useRef("")

  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        triggerRef.current?.focus()
      }
      return
    }

    previousOverflow.current = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const id = window.requestAnimationFrame(() => {
      firstLinkRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(id)
      document.body.style.overflow = previousOverflow.current
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false)
    }
  }, [pathname, isOpen])

  const renderNav = (withFocusRef: boolean) => (
    <nav className="grid grid-cols-2 gap-2 md:block md:space-y-2 flex-1">
      {menuItems.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            ref={withFocusRef && index === 0 ? firstLinkRef : undefined}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm md:text-base",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:bg-accent text-foreground/80 hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const renderFooter = () => (
    <div className="mt-auto pt-4 border-t border-border/50 space-y-2">
      <Link
        href="/store"
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-accent text-foreground/80 hover:text-foreground"
      >
        <Store className="w-5 h-5" />
        <span className="font-medium">بازگشت به فروشگاه</span>
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/store" })}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-accent text-foreground/80 hover:text-foreground"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">خروج از حساب</span>
      </button>
    </div>
  )

  return (
    <>
      <div className="md:hidden border-b border-border/50 bg-muted/30 p-4 flex items-center justify-between">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-background/80 p-2 shadow-sm"
          aria-label="باز کردن منو"
          aria-expanded={isOpen}
          aria-controls="affiliate-drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-base font-semibold">پنل همکاری</span>
        <div className="w-9" aria-hidden="true" />
      </div>

      <aside className="hidden md:flex w-full md:w-64 border-b md:border-b-0 md:border-l border-border/50 bg-muted/30 p-4 md:p-6 flex-col h-auto md:h-screen flex-shrink-0">
        <div className="mb-8">
          <h2 className="text-xl font-bold">پنل همکاری</h2>
        </div>
        {renderNav(false)}
        {renderFooter()}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false)
          }
        }}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        <aside
          id="affiliate-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="ناوبری همکاری"
          className={cn(
            "absolute right-0 top-0 h-full w-72 max-w-[85%] bg-muted/95 backdrop-blur border-l border-border/50 p-5 flex flex-col transition-transform duration-200",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold">پنل همکاری</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-background/80 p-2 shadow-sm"
              aria-label="بستن منو"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderNav(true)}
          {renderFooter()}
        </aside>
      </div>
    </>
  )
}
