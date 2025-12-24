"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { CardContent } from "@/components/ui/card"
import { StyledCard } from "@/components/ui/styled-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import gsap from "gsap"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".failed-card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      })

      gsap.from(".failed-content > *", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="page-container py-12 md:py-20 flex items-center justify-center min-h-[80vh]" dir="rtl" ref={containerRef}>
      <StyledCard variant="elevated" className="w-full max-w-2xl border-border/40 failed-card">
        <CardContent className="p-12 md:p-16 text-center failed-content">
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl" />
            <div className="relative h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-14 h-14 text-destructive" />
            </div>
          </div>
          <h1 className="text-hero font-bold mb-6">پرداخت ناموفق</h1>
          <p className="text-body text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
            متأسفانه پرداخت شما انجام نشد.
            <br />
            لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
          </p>
          {orderId && (
            <div className="bg-muted/50 rounded-2xl p-6 mb-8 border border-border/40">
              <p className="text-caption text-muted-foreground mb-2">شماره سفارش</p>
              <p className="text-subtitle font-bold font-mono persian-number">{orderId.slice(0, 8)}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link href="/store/cart" className="flex-1">
              <Button className="w-full btn-editorial h-14 text-base" size="lg">
                <RefreshCw className="w-5 h-5 ml-2" />
                تلاش مجدد
              </Button>
            </Link>
            <Link href="/store/products" className="flex-1">
              <Button variant="outline" className="w-full h-14 text-base" size="lg">
                <ArrowLeft className="w-5 h-5 ml-2" />
                بازگشت
              </Button>
            </Link>
          </div>
        </CardContent>
      </StyledCard>
    </div>
  )
}

