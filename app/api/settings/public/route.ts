import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const SETTINGS_KEY = "shipping_cost"
const DEFAULT_SHIPPING_COST = 50000

export async function GET() {
  try {
    const shippingCostSetting = await prisma.settings.findUnique({
      where: { key: SETTINGS_KEY },
    })

    return NextResponse.json({
      flatShippingCost: shippingCostSetting
        ? Number.parseInt(shippingCostSetting.value, 10)
        : DEFAULT_SHIPPING_COST,
    })
  } catch (error) {
    console.error("Error fetching public settings:", error)
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات عمومی." },
      { status: 500 }
    )
  }
}
