"use client"

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
} from "lucide-react"

const menuItems = [
  { href: "/affiliate", label: "داشبورد", icon: LayoutDashboard },
  { href: "/affiliate/commissions", label: "کمیسیون‌ها", icon: TrendingUp },
  { href: "/affiliate/payouts", label: "درخواست پرداخت", icon: Wallet },
  { href: "/affiliate/sub-affiliates", label: "زیرمجموعه‌ها", icon: Users },
  { href: "/affiliate/settings", label: "تنظیمات", icon: Settings },
]

export function AffiliateSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-l border-border/50 bg-muted/30 p-4 md:p-6 flex flex-col h-auto md:h-screen flex-shrink-0">
      <div className="mb-8">
        <h2 className="text-xl font-bold">پنل همکاری</h2>
      </div>
      <nav className="grid grid-cols-2 gap-2 md:block md:space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  )
}
