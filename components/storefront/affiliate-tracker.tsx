"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function AffiliateTrackerInner() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      // Store in localStorage (7 days)
      localStorage.setItem("stylino_ref", ref)
      localStorage.setItem("stylino_ref_expiry", String(Date.now() + 7 * 24 * 60 * 60 * 1000))
      
      // Also set cookie via API
      fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      }).catch(console.error)
    }
  }, [searchParams])

  return null
}

export function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <AffiliateTrackerInner />
    </Suspense>
  )
}

