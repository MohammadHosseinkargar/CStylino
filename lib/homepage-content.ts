import { prisma } from "@/lib/prisma"

export const DEFAULT_HOMEPAGE_HERO = {
  heroHeadline: "منتخب‌های پوشاک و اکسسوری برای کمدی شیک، مینیمال و همیشه به‌روز.",
  heroSubheadline: "طراحی برای سلیقه‌های دقیق و جسور.",
  heroEnabled: true,
}

export type HomepageHeroContent = {
  heroHeadline: string
  heroSubheadline: string
  heroEnabled: boolean
}

const HOMEPAGE_KEY = "homepage"

export async function getHomepageHeroContent(): Promise<HomepageHeroContent> {
  const content = await prisma.homepageContent.findUnique({
    where: { key: HOMEPAGE_KEY },
    select: {
      heroHeadline: true,
      heroSubheadline: true,
      heroEnabled: true,
    },
  })

  if (!content || !content.heroEnabled) {
    return { ...DEFAULT_HOMEPAGE_HERO }
  }

  return {
    heroHeadline: content.heroHeadline || DEFAULT_HOMEPAGE_HERO.heroHeadline,
    heroSubheadline: content.heroSubheadline || DEFAULT_HOMEPAGE_HERO.heroSubheadline,
    heroEnabled: content.heroEnabled,
  }
}

export async function getHomepageHeroContentForAdmin(): Promise<HomepageHeroContent> {
  const content = await prisma.homepageContent.findUnique({
    where: { key: HOMEPAGE_KEY },
    select: {
      heroHeadline: true,
      heroSubheadline: true,
      heroEnabled: true,
    },
  })

  if (!content) {
    return { ...DEFAULT_HOMEPAGE_HERO }
  }

  return {
    heroHeadline: content.heroHeadline || DEFAULT_HOMEPAGE_HERO.heroHeadline,
    heroSubheadline: content.heroSubheadline || DEFAULT_HOMEPAGE_HERO.heroSubheadline,
    heroEnabled: content.heroEnabled,
  }
}

export async function upsertHomepageHeroContent(input: HomepageHeroContent) {
  return prisma.homepageContent.upsert({
    where: { key: HOMEPAGE_KEY },
    create: {
      key: HOMEPAGE_KEY,
      heroHeadline: input.heroHeadline,
      heroSubheadline: input.heroSubheadline,
      heroEnabled: input.heroEnabled,
    },
    update: {
      heroHeadline: input.heroHeadline,
      heroSubheadline: input.heroSubheadline,
      heroEnabled: input.heroEnabled,
    },
  })
}
