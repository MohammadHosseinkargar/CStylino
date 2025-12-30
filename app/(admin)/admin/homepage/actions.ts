"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { upsertHomepageHeroContent } from "@/lib/homepage-content"

const heroSchema = z.object({
  heroHeadline: z.string().trim().min(1).max(140),
  heroSubheadline: z.string().trim().min(1).max(180),
  heroEnabled: z.boolean(),
})

const messages = {
  unauthorized: "دسترسی شما مجاز نیست.",
  blocked: "حساب کاربری شما مسدود شده است.",
  forbidden: "اجازه دسترسی به این بخش را ندارید.",
  success: "متن هیرو با موفقیت ذخیره شد.",
  genericError: "ذخیره‌سازی ناموفق بود. دوباره تلاش کنید.",
}

export async function updateHomepageHeroContent(input: {
  heroHeadline: string
  heroSubheadline: string
  heroEnabled: boolean
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { ok: false, message: messages.unauthorized }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isBlocked: true },
  })

  if (!user) {
    return { ok: false, message: messages.unauthorized }
  }

  if (user.isBlocked) {
    return { ok: false, message: messages.blocked }
  }

  if (user.role !== "admin") {
    return { ok: false, message: messages.forbidden }
  }

  const parsed = heroSchema.safeParse({
    heroHeadline: input.heroHeadline,
    heroSubheadline: input.heroSubheadline,
    heroEnabled: input.heroEnabled,
  })

  if (!parsed.success) {
    return { ok: false, message: messages.genericError }
  }

  const data = parsed.data

  const updated = await upsertHomepageHeroContent({
    heroHeadline: data.heroHeadline,
    heroSubheadline: data.heroSubheadline,
    heroEnabled: data.heroEnabled,
  })

  revalidatePath("/store")

  return {
    ok: true,
    message: messages.success,
    content: {
      heroHeadline: updated.heroHeadline,
      heroSubheadline: updated.heroSubheadline,
      heroEnabled: updated.heroEnabled,
    },
  }
}
