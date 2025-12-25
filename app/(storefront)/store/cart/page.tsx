"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Price } from "@/components/storefront/price"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { EmptyState } from "@/components/ui/empty-state"

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
      <PageContainer className="py-20 min-h-screen flex items-center justify-center" dir="rtl">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 text-muted-foreground" />}
          title="سبد خرید شما خالی است"
          description="برای شروع خرید، به بخش محصولات سر بزنید و کالاهای مورد علاقه خود را به سبد اضافه کنید."
          action={
            <Link href="/store/products">
              <Button size="lg" className="btn-editorial">
                <ArrowLeft className="w-5 h-5 ml-2" />
                مشاهده محصولات
              </Button>
            </Link>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8 md:py-12 lg:py-16" dir="rtl">
      <SectionHeader
        title="سبد خرید"
        subtitle={`${items.length} محصول در سبد خرید`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <StyledCard variant="elevated" className="border-border/40 hidden md:block">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b border-border/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-right font-semibold px-6 py-4">محصول</th>
                    <th className="text-center font-semibold px-4 py-4">تعداد</th>
                    <th className="text-right font-semibold px-4 py-4">قیمت</th>
                    <th className="text-left font-semibold px-6 py-4"> </th>
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
                                <span>{item.variantSize}</span>
                              </span>
                              <span>×</span>
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
                              aria-label="کاهش تعداد"
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
                              aria-label="افزایش تعداد"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <Price price={item.price * item.quantity} size="sm" className="text-right" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                            onClick={() => removeItem(item.variantId)}
                            aria-label="حذف از سبد خرید"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </StyledCard>

          <div className="space-y-6 md:hidden">
            {items.map((item) => (
              <StyledCard key={item.variantId} variant="elevated" className="overflow-hidden border-border/40">
                <CardContent className="p-5">
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
                          <span>{item.variantSize}</span>
                        </span>
                        <span>×</span>
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
                            aria-label="کاهش تعداد"
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
                            aria-label="افزایش تعداد"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Price price={item.price * item.quantity} size="sm" className="text-left" />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                          onClick={() => removeItem(item.variantId)}
                          aria-label="حذف از سبد خرید"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </StyledCard>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
          <StyledCard variant="subtle" className="border-border/40">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-base md:text-title">خلاصه سفارش</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-body">
                  <span className="text-muted-foreground">جمع محصولات:</span>
                  <span className="font-semibold persian-number">
                    {itemsTotal.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-muted-foreground">هزینه ارسال:</span>
                  <span className={`font-semibold persian-number ${shippingCost === null ? "animate-pulse" : ""}`}>
                    {shippingCost === null
                      ? "..."
                      : `${shippingCost.toLocaleString("fa-IR")} تومان`}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                  <span className="text-subtitle font-bold">مبلغ کل:</span>
                  {total === null ? (
                    <span className="font-semibold persian-number animate-pulse">...</span>
                  ) : (
                    <Price price={total} size="lg" />
                  )}
                </div>
              </div>
              <Link href="/store/checkout" className="block">
                <Button className="w-full btn-editorial h-14 text-base" size="lg">
                  ادامه و پرداخت
                </Button>
              </Link>
              <Link href="/store/products" className="block">
                <Button variant="outline" className="w-full">
                  ادامه خرید
                </Button>
              </Link>
            </CardContent>
          </StyledCard>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-0 z-30 -mx-4 mt-8 border-t border-border/50 bg-background/95 backdrop-blur px-4 py-4">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-muted-foreground">مبلغ کل:</span>
          {total === null ? (
            <span className="font-semibold persian-number animate-pulse">...</span>
          ) : (
            <span className="font-semibold persian-number">
              {total.toLocaleString("fa-IR")} تومان
            </span>
          )}
        </div>
        <Link href="/store/checkout" className="block">
          <Button className="w-full btn-editorial h-12 text-base">ادامه و پرداخت</Button>
        </Link>
      </div>
    </PageContainer>
  )
}
