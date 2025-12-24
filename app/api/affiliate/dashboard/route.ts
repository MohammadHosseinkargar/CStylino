import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CommissionStatus } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "لطفاً ابتدا وارد شوید" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        commissions: true,
        subAffiliates: true,
      },
    })

    if (!user || !user.affiliateCode) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      )
    }

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
        subAffiliates: user.subAffiliates,
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
      { error: "خطا در دریافت اطلاعات" },
      { status: 500 }
    )
  }
}

