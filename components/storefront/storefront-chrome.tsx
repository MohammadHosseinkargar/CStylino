"use client"

import { SessionProviderWrapper } from "@/components/session-provider"
import { AffiliateTracker } from "@/components/storefront/affiliate-tracker"
import { Header } from "@/components/storefront/header"
import { MobileBottomNav } from "@/components/storefront/mobile-bottom-nav"

export function StorefrontChrome() {
  return (
    <SessionProviderWrapper>
      <AffiliateTracker />
      <Header />
      <MobileBottomNav />
    </SessionProviderWrapper>
  )
}
