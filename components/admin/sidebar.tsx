"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  TrendingUp,
  LogOut,
  Store,
  FolderTree,
  Wallet,
  Menu,
  X,
} from "lucide-react"

const menuItems = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/categories", label: "دسته بندی ها", icon: FolderTree },
  { href: "/admin/orders", label: "سفارش ها", icon: ShoppingCart },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/affiliates", label: "همکاران فروش", icon: TrendingUp },
  { href: "/admin/payouts", label: "تسویه های همکاران", icon: Wallet },
  { href: "/admin/settings", label: "تنظیمات", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const renderNav = (onLinkClick?: () => void) => (
    <nav className="grid grid-cols-2 gap-2 md:block md:space-y-2 flex-1">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
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

  const renderFooter = (onLinkClick?: () => void) => (
    <div className="mt-auto pt-4 border-t border-border/50 space-y-2">
      <Link
        href="/store"
        onClick={onLinkClick}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-accent text-foreground/80 hover:text-foreground"
      >
        <Store className="w-5 h-5" />
        <span className="font-medium">بازگشت به فروشگاه</span>
      </Link>
      <button
        onClick={() => {
          onLinkClick?.()
          signOut({ callbackUrl: "/store" })
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-accent text-foreground/80 hover:text-foreground"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">خروج از حساب</span>
      </button>
    </div>
  )

  return (
    <>
      <div className="relative z-40 md:hidden border-b border-border/50 bg-muted/30 p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative z-50 inline-flex items-center justify-center rounded-lg border border-border/60 bg-background/80 p-2 shadow-sm"
          aria-label="باز کردن منو"
          aria-expanded={isOpen}
          aria-controls="admin-drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-base font-semibold">پنل ادمین</span>
        <div className="w-9" aria-hidden="true" />
      </div>

      <aside className="hidden md:flex w-full md:w-64 border-b md:border-b-0 md:border-l border-border/50 bg-muted/30 p-4 md:p-6 flex-col h-auto md:h-screen flex-shrink-0">
        <div className="mb-8">
          <h2 className="text-xl font-bold">پنل ادمین</h2>
        </div>
        {renderNav()}
        {renderFooter()}
      </aside>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          id="admin-drawer"
          side="right"
          aria-label="ناوبری ادمین"
          className="md:hidden w-72 max-w-[85%] bg-muted/95 backdrop-blur border-l border-border/50 p-5"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold">پنل ادمین</h2>
            <SheetClose asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-background/80 p-2 shadow-sm"
                aria-label="بستن منو"
              >
                <X className="w-5 h-5" />
              </button>
            </SheetClose>
          </div>
          {renderNav(() => setIsOpen(false))}
          {renderFooter(() => setIsOpen(false))}
        </SheetContent>
      </Sheet>
    </>
  )
}
