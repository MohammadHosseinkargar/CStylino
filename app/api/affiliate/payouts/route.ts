import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { payoutRequestSchema } from "@/lib/validations"
import { CommissionStatus, PayoutStatus, Prisma } from "@prisma/client"

const DEFAULT_MIN_PAYOUT_AMOUNT = 100000

async function getMinimumPayoutAmount() {
  const setting = await prisma.settings.findUnique({
    where: { key: "minimum_payout_amount" },
  })
  const parsed = setting ? Number.parseInt(setting.value, 10) : NaN
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MIN_PAYOUT_AMOUNT
  }
  return parsed
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [payouts, availableSum, reservedSum, minimumPayoutAmount] =
      await Promise.all([
        prisma.payoutRequest.findMany({
          where: { affiliateId: session.user.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.commission.aggregate({
          _sum: { amount: true },
          where: {
            affiliateId: session.user.id,
            status: CommissionStatus.available,
          },
        }),
        prisma.payoutRequest.aggregate({
          _sum: { amount: true },
          where: {
            affiliateId: session.user.id,
            status: { in: [PayoutStatus.pending, PayoutStatus.approved] },
          },
        }),
        getMinimumPayoutAmount(),
      ])

    const availableCommissions = availableSum._sum.amount ?? 0
    const reservedAmount = reservedSum._sum.amount ?? 0
    const availableToRequest = Math.max(
      0,
      availableCommissions - reservedAmount
    )

    return NextResponse.json({
      payouts,
      availableCommissions,
      reservedAmount,
      availableToRequest,
      minimumPayoutAmount,
    })
  } catch (error) {
    console.error("Error fetching affiliate payouts:", error)
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = payoutRequestSchema.parse(body)
    const minimumPayoutAmount = await getMinimumPayoutAmount()

    const result = await prisma.$transaction(
      async (tx) => {
        const [availableSum, reservedSum] = await Promise.all([
          tx.commission.aggregate({
            _sum: { amount: true },
            where: {
              affiliateId: session.user.id,
              status: CommissionStatus.available,
            },
          }),
          tx.payoutRequest.aggregate({
            _sum: { amount: true },
            where: {
              affiliateId: session.user.id,
              status: { in: [PayoutStatus.pending, PayoutStatus.approved] },
            },
          }),
        ])

        const availableCommissions = availableSum._sum.amount ?? 0
        const reservedAmount = reservedSum._sum.amount ?? 0
        const availableToRequest = availableCommissions - reservedAmount

        if (availableToRequest < minimumPayoutAmount) {
          return {
            error: "Minimum payout threshold not met",
            status: 400,
          }
        }

        if (validatedData.amount < minimumPayoutAmount) {
          return {
            error: "Requested amount is below the minimum payout",
            status: 400,
          }
        }

        if (validatedData.amount > availableToRequest) {
          return {
            error: "Insufficient available balance",
            status: 400,
          }
        }

        if (validatedData.amount !== availableToRequest) {
          return {
            error: "Payout requests must use the full available balance",
            status: 400,
          }
        }

        const payout = await tx.payoutRequest.create({
          data: {
            affiliateId: session.user.id,
            amount: validatedData.amount,
            status: PayoutStatus.pending,
            bankAccount: validatedData.bankAccount || null,
            notes: validatedData.notes || null,
          },
        })

        return { payout }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ payout: result.payout }, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating payout request:", error)
    return NextResponse.json(
      { error: "Failed to create payout request" },
      { status: 500 }
    )
  }
}
