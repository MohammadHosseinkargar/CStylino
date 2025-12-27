import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CommissionStatus, Prisma } from "@prisma/client"
import { requireAffiliate } from "@/lib/rbac"

const isValidStatus = (status?: string) =>
  status &&
  Object.values(CommissionStatus).includes(status as CommissionStatus)

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAffiliate()
    if (!guard.ok) {
      return guard.response
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    if (status && !isValidStatus(status)) {
      return NextResponse.json(
        { error: "وضعیت نامعتبر است." },
        { status: 400 }
      )
    }

    const where: Prisma.CommissionWhereInput = {
      affiliateId: guard.user.id,
    }

    if (status) {
      where.status = status as CommissionStatus
    }

    if (startDate || endDate) {
      const createdAt: Prisma.DateTimeFilter = {}
      if (startDate) {
        const parsed = new Date(startDate)
        if (!Number.isNaN(parsed.getTime())) {
          createdAt.gte = parsed
        }
      }
      if (endDate) {
        const parsed = new Date(endDate)
        if (!Number.isNaN(parsed.getTime())) {
          parsed.setHours(23, 59, 59, 999)
          createdAt.lte = parsed
        }
      }
      if (Object.keys(createdAt).length > 0) {
        where.createdAt = createdAt
      }
    }

    const commissions = await prisma.commission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderId: true,
        level: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ commissions })
  } catch (error) {
    console.error("Error fetching affiliate commissions:", error)
    return NextResponse.json(
      { error: "دریافت گزارش کمیسیون‌ها ناموفق بود." },
      { status: 500 }
    )
  }
}
export const dynamic = "force-dynamic"
