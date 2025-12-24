import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminSettingsSchema } from "@/lib/validations"

const SETTINGS_KEYS = {
  shippingCost: "shipping_cost",
  commissionLevel1: "commission_level1_percentage",
  commissionLevel2: "commission_level2_percentage",
}

const DEFAULTS = {
  flatShippingCost: 50000,
  commissionLevel1Percent: 10,
  commissionLevel2Percent: 5,
}

const getNumericSetting = (value: string | null | undefined, fallback: number) =>
  value ? Number.parseInt(value, 10) : fallback

// GET - Read settings (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز است." },
        { status: 403 }
      )
    }

    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            SETTINGS_KEYS.shippingCost,
            SETTINGS_KEYS.commissionLevel1,
            SETTINGS_KEYS.commissionLevel2,
          ],
        },
      },
    })

    const settingsMap = new Map(settings.map((item) => [item.key, item.value]))

    return NextResponse.json({
      flatShippingCost: getNumericSetting(
        settingsMap.get(SETTINGS_KEYS.shippingCost),
        DEFAULTS.flatShippingCost
      ),
      commissionLevel1Percent: getNumericSetting(
        settingsMap.get(SETTINGS_KEYS.commissionLevel1),
        DEFAULTS.commissionLevel1Percent
      ),
      commissionLevel2Percent: getNumericSetting(
        settingsMap.get(SETTINGS_KEYS.commissionLevel2),
        DEFAULTS.commissionLevel2Percent
      ),
    })
  } catch (error) {
    console.error("Error fetching admin settings:", error)
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات." },
      { status: 500 }
    )
  }
}

// PATCH - Update settings (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز است." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = adminSettingsSchema.parse(body)

    await prisma.$transaction([
      prisma.settings.upsert({
        where: { key: SETTINGS_KEYS.shippingCost },
        update: {
          value: String(validatedData.flatShippingCost),
          updatedBy: session.user.id,
        },
        create: {
          key: SETTINGS_KEYS.shippingCost,
          value: String(validatedData.flatShippingCost),
          description: "هزینه ارسال ثابت",
          updatedBy: session.user.id,
        },
      }),
      prisma.settings.upsert({
        where: { key: SETTINGS_KEYS.commissionLevel1 },
        update: {
          value: String(validatedData.commissionLevel1Percent),
          updatedBy: session.user.id,
        },
        create: {
          key: SETTINGS_KEYS.commissionLevel1,
          value: String(validatedData.commissionLevel1Percent),
          description: "درصد کمیسیون سطح اول",
          updatedBy: session.user.id,
        },
      }),
      prisma.settings.upsert({
        where: { key: SETTINGS_KEYS.commissionLevel2 },
        update: {
          value: String(validatedData.commissionLevel2Percent),
          updatedBy: session.user.id,
        },
        create: {
          key: SETTINGS_KEYS.commissionLevel2,
          value: String(validatedData.commissionLevel2Percent),
          description: "درصد کمیسیون سطح دوم",
          updatedBy: session.user.id,
        },
      }),
    ])

    return NextResponse.json({
      flatShippingCost: validatedData.flatShippingCost,
      commissionLevel1Percent: validatedData.commissionLevel1Percent,
      commissionLevel2Percent: validatedData.commissionLevel2Percent,
    })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating admin settings:", error)
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی تنظیمات." },
      { status: 500 }
    )
  }
}
