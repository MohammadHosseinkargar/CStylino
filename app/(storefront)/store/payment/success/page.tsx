"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useCartStore } from "@/store/cart-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Package, ArrowLeft, Sparkles } from "lucide-react"

function PaymentSuccessPageContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    // Clear cart on successful payment
    clearCart()
  }, [clearCart])

  return (
    <div className="page-container py-12 md:py-20 flex items-center justify-center min-h-screen" dir="rtl">
      <Card className="w-full max-w-2xl card-editorial border-border/40">
        <CardContent className="p-12 md:p-16 text-center">
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-primary" />
            </div>
          </div>
          <h1 className="text-hero font-bold mb-6">پرداخت موفق</h1>
          <p className="text-body text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
            سفارش شما با موفقیت ثبت شد و در حال پردازش است.
            <br />
            ما به زودی با شما تماس خواهیم گرفت.
          </p>
          {orderId && (
            <div className="bg-muted/50 rounded-2xl p-6 mb-8 border border-border/40">
              <p className="text-caption text-muted-foreground mb-2">شماره سفارش</p>
              <p className="text-subtitle font-bold font-mono persian-number">{orderId.slice(0, 8)}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link href="/store/orders" className="flex-1">
              <Button className="w-full btn-editorial h-14 text-base" size="lg">
                <Package className="w-5 h-5 ml-2" />
                مشاهده سفارش‌ها
              </Button>
            </Link>
            <Link href="/store/products" className="flex-1">
              <Button variant="outline" className="w-full h-14 text-base" size="lg">
                <ArrowLeft className="w-5 h-5 ml-2" />
                ادامه خرید
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessPageContent />
    </Suspense>
  )
}
