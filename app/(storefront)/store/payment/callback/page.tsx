"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * This page is just a loading state
 * The actual verification happens in /api/payment/verify
 * Users will be redirected here first, then to success/failed pages
 */
export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // This page should not be accessed directly
    // Zarinpal redirects to /api/payment/verify which handles everything
    // If user somehow lands here, redirect to verify endpoint
    const authority = searchParams.get("Authority")
    const status = searchParams.get("Status")
    const orderId = searchParams.get("orderId")

    if (authority && orderId) {
      // Redirect to verify endpoint
      const verifyUrl = `/api/payment/verify?Authority=${authority}&Status=${status}&orderId=${orderId}`
      window.location.href = verifyUrl
    }
  }, [searchParams])

  return (
    <div className="page-container py-12 flex items-center justify-center min-h-screen" dir="rtl">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg">در حال تایید پرداخت...</p>
      </div>
    </div>
  )
}


