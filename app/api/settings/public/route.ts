import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LruCache } from "@/lib/lru-cache"

const SETTINGS_KEY = "shipping_cost"
const DEFAULT_SHIPPING_COST = 50000
const SETTINGS_TTL_MS = 60_000
const settingsCache = new LruCache<any>(20)
const cacheHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
}

export async function GET() {
  try {
    const cached = settingsCache.get(SETTINGS_KEY)
    if (cached) {
      return NextResponse.json(cached, { headers: cacheHeaders })
    }

    const shippingCostSetting = await prisma.settings.findUnique({
      where: { key: SETTINGS_KEY },
    })

    const responsePayload = {
      flatShippingCost: shippingCostSetting
        ? Number.parseInt(shippingCostSetting.value, 10)
        : DEFAULT_SHIPPING_COST,
    }

    settingsCache.set(SETTINGS_KEY, responsePayload, SETTINGS_TTL_MS)

    return NextResponse.json(responsePayload, { headers: cacheHeaders })
  } catch (error) {
    console.error("Error fetching public settings:", error)
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات عمومی." },
      { status: 500 }
    )
  }
}
