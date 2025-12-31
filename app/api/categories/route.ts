import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LruCache } from "@/lib/lru-cache"

const CATEGORIES_TTL_MS = 120_000
const categoriesCache = new LruCache<any>(50)
const cacheHeaders = {
  "Cache-Control": "public, max-age=120, s-maxage=120, stale-while-revalidate=120",
}

export async function GET() {
  try {
    const cached = categoriesCache.get("categories")
    if (cached) {
      return NextResponse.json(cached, { headers: cacheHeaders })
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    })

    categoriesCache.set("categories", categories, CATEGORIES_TTL_MS)
    return NextResponse.json(categories, { headers: cacheHeaders })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    )
  }
}
