import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { affiliateBankInfoSchema } from "@/lib/validations"
import { requireAffiliate } from "@/lib/rbac"

const normalizeBankInfo = (input: {
  bankShaba?: string
  bankCard?: string
  bankAccount?: string
}) => ({
  bankShaba: (input.bankShaba || "").replace(/\s+/g, "").toUpperCase(),
  bankCard: (input.bankCard || "").replace(/\s+/g, ""),
  bankAccount: (input.bankAccount || "").trim(),
})

export async function GET() {
  try {
    const guard = await requireAffiliate()
    if (!guard.ok) {
      return guard.response
    }

    const user = await prisma.user.findUnique({
      where: { id: guard.user.id },
      select: { bankShaba: true, bankCard: true, bankAccount: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "کاربر پیدا نشد." },
        { status: 404 }
      )
    }

    const bankInfoComplete = Boolean(
      user.bankShaba && user.bankCard && user.bankAccount
    )

    return NextResponse.json({ bankInfo: user, bankInfoComplete })
  } catch (error) {
    console.error("Error fetching affiliate bank info:", error)
    return NextResponse.json(
      { error: "دریافت اطلاعات بانکی ناموفق بود." },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = await requireAffiliate()
    if (!guard.ok) {
      return guard.response
    }

    const body = await request.json()
    const normalized = normalizeBankInfo(body)
    const validated = affiliateBankInfoSchema.parse(normalized)

    const updated = await prisma.user.update({
      where: { id: guard.user.id },
      data: {
        bankShaba: validated.bankShaba,
        bankCard: validated.bankCard,
        bankAccount: validated.bankAccount,
      },
      select: { bankShaba: true, bankCard: true, bankAccount: true },
    })

    return NextResponse.json({
      bankInfo: updated,
      bankInfoComplete: true,
    })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating affiliate bank info:", error)
    return NextResponse.json(
      { error: "ذخیره اطلاعات بانکی ناموفق بود." },
      { status: 500 }
    )
  }
}
