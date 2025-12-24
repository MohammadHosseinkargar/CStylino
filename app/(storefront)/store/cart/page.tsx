"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Price } from "@/components/storefront/price"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } =
    useCartStore()
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
      <div className="editorial-container py-20 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <div className="h-32 w-32 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-16 h-16 text-muted-foreground" />
          </div>
          <h2 className="text-hero font-bold mb-4">سبد خرید شما خالی است</h2>
          <p className="text-body text-muted-foreground mb-12 leading-relaxed">
            برای شروع خرید، به صفحه محصولات بروید و محصولات مورد علاقه خود را به سبد خرید اضافه کنید
          </p>
          <Link href="/store/products">
            <Button size="lg" className="btn-editorial">
              <ArrowLeft className="w-5 h-5 ml-2" />
              مشاهده محصولات
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="editorial-container py-8 md:py-12 lg:py-20 px-4 md:px-0" dir="rtl">
      <div className="mb-8 md:mb-16">
        <h1 className="text-2xl md:text-hero font-bold mb-3 md:mb-4">سبد خرید</h1>
        <p className="text-sm md:text-body text-muted-foreground persian-number">
          {items.length} محصول در سبد خرید
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
        {/* Cart Items - Editorial */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <Card
              key={item.variantId}
              className="card-editorial overflow-hidden border-border/40"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link
                    href={`/store/products/${item.slug || item.productId}`}
                    className="relative w-full sm:w-32 h-48 sm:h-32 rounded-2xl overflow-hidden bg-muted/20 flex-shrink-0 group"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="128px"
                      />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/store/products/${item.slug || item.productId}`}>
                      <h3 className="text-subtitle font-semibold mb-3 hover:text-primary transition-colors duration-300 line-clamp-2 leading-relaxed">
                        {item.productName}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-caption text-muted-foreground mb-6">
                      <span className="flex items-center gap-2">
                        <span className="font-medium">سایز:</span>
                        <span>{item.variantSize}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">رنگ:</span>
                        <span
                          className="inline-block w-5 h-5 rounded-full border-2 border-border/50 shadow-sm"
                          style={{ backgroundColor: item.variantColorHex }}
                        />
                        <span>{item.variantColor}</span>
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border-2 border-border/50 rounded-xl p-1.5 bg-background">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg hover:bg-accent/50"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            aria-label="کاهش تعداد"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold text-base persian-number">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg hover:bg-accent/50"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            aria-label="افزایش تعداد"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <Price
                          price={item.price * item.quantity}
                          size="md"
                          className="text-left"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                          onClick={() => removeItem(item.variantId)}
                          aria-label="حذف از سبد خرید"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary - Sticky */}
        <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
          <Card className="card-editorial border-border/40">
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
                  <span className="font-semibold persian-number">
                    {shippingCost === null
                      ? "..."
                      : `${shippingCost.toLocaleString("fa-IR")} تومان`}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                  <span className="text-subtitle font-bold">جمع کل:</span>
                  {total === null ? (
                    <span className="font-semibold persian-number">...</span>
                  ) : (
                    <Price price={total} size="lg" />
                  )}
                </div>
              </div>
              <Link href="/store/checkout" className="block">
                <Button className="w-full btn-editorial h-14 text-base" size="lg">
                  ?????? ? ????!
                </Button>
              </Link>
              <Link href="/store/products" className="block">
                <Button variant="outline" className="w-full">
                  ?????? ????? ????
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
