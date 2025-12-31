"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  Percent,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
import { fa } from "@/lib/copy/fa"

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const itemCount = useCartStore((state) => state.getItemCount())
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const accountHref = session ? "/account" : "/auth/signin"
  const navItems = [
    { href: "/store", label: fa.nav.home },
    { href: "/store/products", label: fa.nav.products },
    { href: "/store/categories", label: fa.nav.categories },
    { href: "/store/about", label: fa.nav.about },
    { href: accountHref, label: fa.nav.account },
  ]

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm h-16 md:h-20"
            : "bg-background/40 backdrop-blur-sm border-b border-border/10 h-20 md:h-24"
        )}
      >
        <div className="container mx-auto h-full px-4 lg:px-8">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4 order-1">
              <CartDrawer open={cartOpen} onOpenChange={setCartOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 md:h-12 md:w-12 rounded-full"
                  aria-label={fa.nav.cart}
                >
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </CartDrawer>

              {session ? (
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 md:h-12 gap-2 px-2 md:px-4 rounded-full border border-border/40"
                    >
                      <div className="hidden md:flex flex-col items-end text-xs">
                        <span className="font-bold">{session.user.name?.split(" ")[0]}</span>
                        <span className="text-muted-foreground opacity-70">
                          {session.user.role === "admin"
                            ? "مدیر"
                            : session.user.role === "affiliate"
                            ? "همکار فروش"
                            : "مشتری"}
                        </span>
                      </div>
                      <div className="bg-primary/10 p-1.5 rounded-full text-primary">
                        <User className="h-5 w-5" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-[2.5rem] p-4 shadow-2xl border-none bg-background/95 backdrop-blur-xl"
                  >
                    <div className="px-4 py-3 text-right">
                      <p className="font-bold text-xl">
                        {session.user.name || "کاربر استایلینو"}
                      </p>
                      <div className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-3 py-1 rounded-full mt-2">
                        {session.user.role === "admin" && "ادمین استایلینو"}
                        {session.user.role === "affiliate" && "همکار فروش"}
                        {session.user.role === "customer" && "عضو استایلینو"}
                      </div>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <div className="py-1 space-y-1 text-right">
                      {session.user.role === "admin" && (
                        <DropdownMenuItem
                          asChild
                          className="rounded-xl cursor-pointer flex justify-between p-3"
                        >
                          <Link href="/admin">
                            <span>پنل مدیریت</span>
                            <LayoutDashboard className="h-5 w-5 opacity-70" />
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {(session.user.role === "affiliate" || session.user.role === "admin") && (
                        <DropdownMenuItem
                          asChild
                          className="rounded-xl cursor-pointer flex justify-between p-3"
                        >
                          <Link href="/affiliate">
                            <span>پنل همکاری</span>
                            <Percent className="h-5 w-5 opacity-70" />
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        asChild
                        className="rounded-xl cursor-pointer flex justify-between p-3"
                      >
                        <Link href="/store/orders">
                          <span>سفارش‌های من</span>
                          <Package className="h-5 w-5 opacity-70" />
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="rounded-xl cursor-pointer flex justify-between p-3 text-red-500 focus:bg-red-50 focus:text-red-600"
                    >
                      <span>خروج از حساب</span> <LogOut className="h-5 w-5" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="outline" className="hidden sm:flex rounded-full px-6">
                  <Link href="/auth/signin">ورود</Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-full bg-accent/50"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="باز کردن منو"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>

            <nav className="hidden lg:flex items-center gap-8 order-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-all duration-300 relative py-2",
                    pathname === item.href
                      ? "text-primary"
                      : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 right-0 h-[2px] w-full bg-primary"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="order-3">
              <Link href="/store" className="flex items-center group">
                <span className="text-2xl md:text-3xl font-black bg-gradient-to-l from-foreground via-foreground/80 to-primary bg-clip-text text-transparent">
                  {fa.brand.name}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-background shadow-2xl flex flex-col text-right"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <span className="font-black text-xl text-primary">{fa.brand.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full"
                  aria-label="بستن منو"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex flex-col p-4 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "p-4 rounded-xl text-lg font-medium",
                      pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-accent"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-6 border-t bg-accent/5 space-y-3">
                {session ? (
                  <>
                    {session.user.role === "admin" && (
                      <Button asChild variant="ghost" className="w-full justify-end gap-2">
                        <Link href="/admin">
                          پنل مدیریت <LayoutDashboard className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="ghost" className="w-full justify-end gap-2">
                      <Link href="/store/orders">
                        سفارش‌های من <Package className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => signOut()}
                      variant="outline"
                      className="w-full h-12 rounded-xl text-red-500 gap-2"
                    >
                      خروج <LogOut className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full h-12 rounded-xl">
                    <Link href="/auth/signin">ورود / ساخت حساب</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
