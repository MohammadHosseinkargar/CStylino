import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { adminSettingsSchema } from "@/lib/validations"
import { requireAdmin } from "@/lib/rbac"
import { createAuditLog, getRequestIp } from "@/lib/audit"

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
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
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
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
    }

    const body = await request.json()
    const validatedData = adminSettingsSchema.parse(body)

    const previousSettings = await prisma.settings.findMany({
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
    const previousMap = new Map(
      previousSettings.map((item) => [item.key, item.value])
    )

    await prisma.$transaction([
      prisma.settings.upsert({
        where: { key: SETTINGS_KEYS.shippingCost },
        update: {
          value: String(validatedData.flatShippingCost),
          updatedBy: guard.user.id,
        },
        create: {
          key: SETTINGS_KEYS.shippingCost,
          value: String(validatedData.flatShippingCost),
          description: "هزینه ارسال ثابت",
          updatedBy: guard.user.id,
        },
      }),
      prisma.settings.upsert({
        where: { key: SETTINGS_KEYS.commissionLevel1 },
        update: {
          value: String(validatedData.commissionLevel1Percent),
          updatedBy: guard.user.id,
        },
        create: {
          key: SETTINGS_KEYS.commissionLevel1,
          value: String(validatedData.commissionLevel1Percent),
          description: "درصد کمیسیون سطح اول",
          updatedBy: guard.user.id,
        },
      }),
      prisma.settings.upsert({
        where: { key: SETTINGS_KEYS.commissionLevel2 },
        update: {
          value: String(validatedData.commissionLevel2Percent),
          updatedBy: guard.user.id,
        },
        create: {
          key: SETTINGS_KEYS.commissionLevel2,
          value: String(validatedData.commissionLevel2Percent),
          description: "درصد کمیسیون سطح دوم",
          updatedBy: guard.user.id,
        },
      }),
    ])

    await createAuditLog({
      actorUserId: guard.user.id,
      action: "settings.update",
      entityType: "settings",
      entityId: "admin",
      before: {
        flatShippingCost: getNumericSetting(
          previousMap.get(SETTINGS_KEYS.shippingCost),
          DEFAULTS.flatShippingCost
        ),
        commissionLevel1Percent: getNumericSetting(
          previousMap.get(SETTINGS_KEYS.commissionLevel1),
          DEFAULTS.commissionLevel1Percent
        ),
        commissionLevel2Percent: getNumericSetting(
          previousMap.get(SETTINGS_KEYS.commissionLevel2),
          DEFAULTS.commissionLevel2Percent
        ),
      },
      after: {
        flatShippingCost: validatedData.flatShippingCost,
        commissionLevel1Percent: validatedData.commissionLevel1Percent,
        commissionLevel2Percent: validatedData.commissionLevel2Percent,
      },
      ip: getRequestIp(request),
    })

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
export const dynamic = "force-dynamic"
