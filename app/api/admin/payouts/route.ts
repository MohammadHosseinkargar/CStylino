import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CommissionStatus, PayoutStatus, Prisma } from "@prisma/client"
import { z } from "zod"

const payoutActionSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject", "markPaid"]),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const payouts = await prisma.payoutRequest.findMany({
      include: {
        affiliate: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error("Error fetching payout requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch payout requests" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, action } = payoutActionSchema.parse(body)

    const payout = await prisma.payoutRequest.findUnique({
      where: { id },
    })

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }

    if (action === "approve") {
      if (payout.status !== PayoutStatus.pending) {
        return NextResponse.json(
          { error: "Only pending payouts can be approved" },
          { status: 400 }
        )
      }

      const [availableSum, reservedSum] = await Promise.all([
        prisma.commission.aggregate({
          _sum: { amount: true },
          where: {
            affiliateId: payout.affiliateId,
            status: CommissionStatus.available,
          },
        }),
        prisma.payoutRequest.aggregate({
          _sum: { amount: true },
          where: {
            affiliateId: payout.affiliateId,
            status: { in: [PayoutStatus.pending, PayoutStatus.approved] },
            id: { not: payout.id },
          },
        }),
      ])

      const availableCommissions = availableSum._sum.amount ?? 0
      const reservedAmount = reservedSum._sum.amount ?? 0
      const availableToRequest = availableCommissions - reservedAmount

      if (availableToRequest < payout.amount) {
        return NextResponse.json(
          { error: "Insufficient available balance for approval" },
          { status: 400 }
        )
      }

      const updated = await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: { status: PayoutStatus.approved },
      })

      return NextResponse.json({ payout: updated })
    }

    if (action === "reject") {
      if (payout.status === PayoutStatus.paid) {
        return NextResponse.json(
          { error: "Paid payouts cannot be rejected" },
          { status: 400 }
        )
      }

      const updated = await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: { status: PayoutStatus.rejected },
      })

      return NextResponse.json({ payout: updated })
    }

    if (payout.status !== PayoutStatus.approved) {
      return NextResponse.json(
        { error: "Only approved payouts can be marked as paid" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const commissions = await tx.commission.findMany({
          where: {
            affiliateId: payout.affiliateId,
            status: CommissionStatus.available,
          },
          orderBy: { createdAt: "asc" },
        })

        let runningTotal = 0
        const commissionIds: string[] = []

        for (const commission of commissions) {
          if (runningTotal >= payout.amount) {
            break
          }
          runningTotal += commission.amount
          commissionIds.push(commission.id)
        }

        if (runningTotal !== payout.amount) {
          return {
            error: "Available commissions no longer cover this payout",
            status: 400,
          }
        }

        await tx.commission.updateMany({
          where: { id: { in: commissionIds } },
          data: { status: CommissionStatus.paid },
        })

        const updated = await tx.payoutRequest.update({
          where: { id: payout.id },
          data: { status: PayoutStatus.paid },
        })

        return { payout: updated }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ payout: result.payout })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating payout:", error)
    return NextResponse.json(
      { error: "Failed to update payout" },
      { status: 500 }
    )
  }
}
