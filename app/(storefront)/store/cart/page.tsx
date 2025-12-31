"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/storefront/price"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Container } from "@/components/ui/container"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { formatPrice } from "@/lib/utils"
import { fa } from "@/lib/copy/fa"
import { GlassCard } from "@/components/ui/glass-card"
import { Surface } from "@/components/ui/surface"

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const itemsTotal = getTotal()
  const total = shippingCost === null ? null : itemsTotal + shippingCost

  useEffect(() => {
    let isMounted = true

    const loadShippingCost = async () => {
      try {
        const response = await fetch("/api/settings/public")
        if (!response.ok) {
          throw new Error("Failed to load shipping cost")
        }
        const data = await response.json()
        if (isMounted) {
          const parsed = Number(data.flatShippingCost)
          setShippingCost(Number.isFinite(parsed) ? parsed : 0)
        }
      } catch (error) {
        if (isMounted) {
          setShippingCost(null)
        }
      }
    }

    loadShippingCost()

    return () => {
      isMounted = false
    }
  }, [])

  if (items.length === 0) {
    return (
      <Container className="py-20 min-h-screen flex items-center justify-center" dir="rtl">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 text-muted-foreground" />}
          title={fa.cart.emptyTitle}
          description={fa.cart.emptyDescription}
          action={
            <Link href="/store/products">
              <Button size="lg">
                <ArrowLeft className="w-5 h-5 ms-2" />
                {fa.cart.emptyCta}
              </Button>
            </Link>
          }
        />
      </Container>
    )
  }

  return (
    <Container className="py-8 md:py-12 lg:py-16 pb-[calc(var(--mobile-bottom-nav-height)+2.5rem)]" dir="rtl">
      <SectionHeader
        title={fa.cart.title}
        subtitle={fa.cart.subtitle.replace("{count}", items.length.toLocaleString("fa-IR"))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="hidden md:block">
            <div className="p-0">
              <table className="w-full">
                <thead className="border-b border-border/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-start font-semibold px-6 py-4">{fa.cart.productHeader}</th>
                    <th className="text-center font-semibold px-4 py-4">
                      {fa.cart.quantityHeader}
                    </th>
                    <th className="text-start font-semibold px-4 py-4">{fa.cart.priceHeader}</th>
                    <th className="text-end font-semibold px-6 py-4"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {items.map((item) => (
                    <tr key={item.variantId} className="align-top">
                      <td className="px-6 py-5">
                        <div className="flex gap-4">
                          <Link
                            href={`/store/products/${item.slug || item.productId}`}
                            className="relative h-24 w-20 rounded-xl overflow-hidden bg-muted/20 flex-shrink-0 group"
                          >
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.productName}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="80px"
                              />
                            )}
                          </Link>
                          <div className="min-w-0">
                            <Link href={`/store/products/${item.slug || item.productId}`}>
                              <div className="text-sm font-semibold line-clamp-2 leading-relaxed">
                                {item.productName}
                              </div>
                            </Link>
                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-3">
                              <span className="flex items-center gap-2">
                                <span className="font-medium">سایز:</span>
                                <span dir="ltr">{item.variantSize}</span>
                              </span>
                              <span> - </span>
                              <span className="flex items-center gap-2">
                                <span className="font-medium">رنگ:</span>
                                <span
                                  className="inline-block w-4 h-4 rounded-full border-2 border-border/50 shadow-sm"
                                  style={{ backgroundColor: item.variantColorHex }}
                                />
                                <span>{item.variantColor}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-2 border-2 border-border/50 rounded-xl p-1 bg-background">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-accent/50"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              aria-label={fa.cart.quantityDecrease}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center font-semibold text-sm persian-number">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-accent/50"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.availableStock}
                              aria-label={fa.cart.quantityIncrease}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <Price price={item.price * item.quantity} size="sm" className="text-start" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                            onClick={() => removeItem(item.variantId)}
                            aria-label={fa.cart.removeItem}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <div className="space-y-6 md:hidden">
            {items.map((item) => (
              <Surface key={item.variantId} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex gap-4">
                    <Link
                      href={`/store/products/${item.slug || item.productId}`}
                      className="relative w-24 h-28 rounded-2xl overflow-hidden bg-muted/20 flex-shrink-0 group"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="96px"
                        />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/store/products/${item.slug || item.productId}`}>
                        <h3 className="text-sm font-semibold mb-2 hover:text-primary transition-colors duration-300 line-clamp-2 leading-relaxed">
                          {item.productName}
                        </h3>
                      </Link>
                      <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-2">
                          <span className="font-medium">سایز:</span>
                          <span dir="ltr">{item.variantSize}</span>
                        </span>
                        <span> - </span>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">رنگ:</span>
                          <span
                            className="inline-block w-4 h-4 rounded-full border-2 border-border/50 shadow-sm"
                            style={{ backgroundColor: item.variantColorHex }}
                          />
                          <span>{item.variantColor}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 border-2 border-border/50 rounded-xl p-1 bg-background">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-accent/50"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            aria-label={fa.cart.quantityDecrease}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-10 text-center font-semibold text-sm persian-number">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-accent/50"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.availableStock}
                            aria-label={fa.cart.quantityIncrease}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Price price={item.price * item.quantity} size="sm" className="text-end" />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                          onClick={() => removeItem(item.variantId)}
                          aria-label={fa.cart.removeItem}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Surface>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
          <GlassCard className="p-6">
            <div className="pb-4 md:pb-6">
              <div className="text-base md:text-title font-semibold">{fa.cart.summaryTitle}</div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-body">
                  <span className="text-muted-foreground">{fa.cart.itemsTotal}</span>
                  <span className="font-semibold persian-number">{formatPrice(itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-muted-foreground">{fa.cart.shipping}</span>
                  <span
                    className={`font-semibold persian-number ${shippingCost === null ? "animate-pulse" : ""}`}
                  >
                    {shippingCost === null ? "..." : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                  <span className="text-subtitle font-bold">{fa.cart.total}</span>
                  {total === null ? (
                    <span className="font-semibold persian-number animate-pulse">...</span>
                  ) : (
                    <Price price={total} size="lg" />
                  )}
                </div>
              </div>
              <Link href="/store/checkout" className="block">
                <Button className="w-full h-14 text-base" size="lg">
                  {fa.cart.checkout}
                </Button>
              </Link>
              <Link href="/store/products" className="block">
                <Button variant="outline" className="w-full">
                  {fa.cart.continueShopping}
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom))] z-30 -mx-4 mt-8 border-t border-border/50 bg-background/95 backdrop-blur-sm px-4 py-4">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-muted-foreground">{fa.cart.total}</span>
          {total === null ? (
            <span className="font-semibold persian-number animate-pulse">...</span>
          ) : (
            <span className="font-semibold persian-number">{formatPrice(total)}</span>
          )}
        </div>
        <Link href="/store/checkout" className="block">
          <Button className="w-full h-12 text-base">{fa.cart.checkout}</Button>
        </Link>
      </div>
    </Container>
  )
}
