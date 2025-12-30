"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { fa } from "@/lib/copy/fa"

function PaymentCallbackPageContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const authority = searchParams.get("Authority")
    const status = searchParams.get("Status")
    const orderId = searchParams.get("orderId")

    if (authority && orderId) {
      const verifyUrl = `/api/payment/verify?Authority=${authority}&Status=${status}&orderId=${orderId}`
      window.location.href = verifyUrl
    }
  }, [searchParams])

  return (
    <div className="page-container py-12 flex items-center justify-center min-h-screen" dir="rtl">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg">{fa.common.loading}</p>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCallbackPageContent />
    </Suspense>
  )
}
