import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CommissionStatus } from "@prisma/client"
import { requireAffiliate } from "@/lib/rbac"

export async function GET() {
  try {
    const guard = await requireAffiliate()
    if (!guard.ok) {
      return guard.response
    }

    const user = await prisma.user.findUnique({
      where: { id: guard.user.id },
      include: {
        commissions: true,
        subAffiliates: {
          select: {
            id: true,
            name: true,
            email: true,
            affiliateCode: true,
            role: true,
            affiliateStatus: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user || !user.affiliateCode) {
      return NextResponse.json(
        { error: "کاربر همکاری یافت نشد." },
        { status: 404 }
      )
    }

    const subAffiliates = user.subAffiliates.map((subAffiliate) => {
      const status =
        subAffiliate.affiliateStatus ??
        (subAffiliate.role === "affiliate" ? "active" : "pending")

      return { ...subAffiliate, status }
    })

    const availableCommissions = user.commissions
      .filter((c) => c.status === CommissionStatus.available)
      .reduce((sum, c) => sum + c.amount, 0)

    const pendingCommissions = user.commissions
      .filter((c) => c.status === CommissionStatus.pending)
      .reduce((sum, c) => sum + c.amount, 0)

    const paidCommissions = user.commissions
      .filter((c) => c.status === CommissionStatus.paid)
      .reduce((sum, c) => sum + c.amount, 0)

    const level1Commissions = user.commissions
      .filter((c) => c.level === 1)
      .reduce((sum, c) => sum + c.amount, 0)

    const level2Commissions = user.commissions
      .filter((c) => c.level === 2)
      .reduce((sum, c) => sum + c.amount, 0)

    return NextResponse.json({
      user: {
        id: user.id,
        affiliateCode: user.affiliateCode,
        subAffiliates,
        commissions: user.commissions,
      },
      availableCommissions,
      pendingCommissions,
      paidCommissions,
      level1Commissions,
      level2Commissions,
    })
  } catch (error) {
    console.error("Error fetching affiliate dashboard:", error)
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات داشبورد همکاری." },
      { status: 500 }
    )
  }
}
export const dynamic = "force-dynamic"
