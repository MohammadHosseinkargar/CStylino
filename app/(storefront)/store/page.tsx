import { getHomepageHeroContent } from "@/lib/homepage-content"
import { StoreLandingPage } from "@/components/storefront/store-landing-page"

export const revalidate = 60

export default async function StoreLandingPageRoute() {
  const heroContent = await getHomepageHeroContent()

  return (
    <StoreLandingPage
      heroHeadline={heroContent.heroHeadline}
      heroSubheadline={heroContent.heroSubheadline}
    />
  )
}
