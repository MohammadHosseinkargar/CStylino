"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { CartDrawer } from "@/components/storefront/cart-drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Header() {
  const { data: session } = useSession()
  const itemCount = useCartStore((state) => state.getItemCount())
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/store", label: "خانه" },
    { href: "/store/products", label: "محصولات" },
    { href: "/store/categories", label: "دسته‌بندی‌ها" },
    { href: "/store/about", label: "درباره ما" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "bg-background/40 backdrop-blur-sm border-b border-border/20"
      )}
    >
      <div className="editorial-container px-4 md:px-0">
        <div className="flex h-16 md:h-24 items-center justify-between gap-3 min-w-0">
          {/* Logo */}
          <Link
            href="/store"
            className="flex items-center group transition-transform duration-300 hover:scale-105 min-w-0"
          >
            <span className="text-xl md:text-3xl font-bold tracking-tight max-w-[60vw] truncate">
              <span className="bg-gradient-to-l from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
                استایلینو
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 right-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <CartDrawer open={cartOpen} onOpenChange={setCartOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 rounded-full hover:bg-accent/50 transition-all duration-300"
                aria-label="سبد خرید"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-in fade-in zoom-in">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Button>
            </CartDrawer>

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-full hover:bg-accent/50 transition-all duration-300"
                    aria-label="منوی کاربر"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl border-border/50 shadow-xl bg-background/95 backdrop-blur-xl"
                >
                  <div className="px-3 py-2.5 border-b border-border/50">
                    <div className="font-semibold text-sm">{session.user.name || session.user.email}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {session.user.role === "admin" && "مدیر"}
                      {session.user.role === "affiliate" && "همکار"}
                      {session.user.role === "customer" && "مشتری"}
                    </div>
                  </div>
                  <div className="py-1">
                    {session.user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">پنل مدیریت</Link>
                      </DropdownMenuItem>
                    )}
                    {(session.user.role === "affiliate" || session.user.role === "admin") && (
                      <DropdownMenuItem asChild>
                        <Link href="/affiliate" className="cursor-pointer">پنل همکاری</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/store/orders" className="cursor-pointer">سفارش‌های من</Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/store" })}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="btn-editorial">
                    ورود
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="btn-editorial">
                    ثبت‌نام
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-11 w-11 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="منو"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="editorial-container py-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-base font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!session && (
              <div className="pt-4 space-y-2 border-t border-border/40">
                <Link href="/auth/signin">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                    ورود
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                    ثبت‌نام
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
