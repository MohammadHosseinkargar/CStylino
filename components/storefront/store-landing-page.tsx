import { StoreLandingPageClient } from "@/components/storefront/store-landing-page.client"

type StoreLandingPageProps = {
  heroHeadline: string
  heroSubheadline: string
}

export function StoreLandingPage({
  heroHeadline,
  heroSubheadline,
}: StoreLandingPageProps) {
  return <StoreLandingPageClient heroHeadline={heroHeadline} heroSubheadline={heroSubheadline} />
}
