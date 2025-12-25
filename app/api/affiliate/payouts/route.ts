import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { payoutRequestSchema } from "@/lib/validations"
import { CommissionStatus, PayoutStatus, Prisma } from "@prisma/client"
import { requireAffiliate } from "@/lib/rbac"

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
    const guard = await requireAffiliate()
    if (!guard.ok) {
      return guard.response
    }

    const [payouts, availableSum, reservedSum, minimumPayoutAmount, user] =
      await Promise.all([
        prisma.payoutRequest.findMany({
          where: { affiliateId: guard.user.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.commission.aggregate({
          _sum: { amount: true },
          where: {
            affiliateId: guard.user.id,
            status: CommissionStatus.available,
          },
        }),
        prisma.payoutRequest.aggregate({
          _sum: { amount: true },
          where: {
            affiliateId: guard.user.id,
            status: { in: [PayoutStatus.pending, PayoutStatus.approved] },
          },
        }),
        getMinimumPayoutAmount(),
        prisma.user.findUnique({
          where: { id: guard.user.id },
          select: {
            bankShaba: true,
            bankCard: true,
            bankAccount: true,
          },
        }),
      ])

    const availableCommissions = availableSum._sum.amount ?? 0
    const reservedAmount = reservedSum._sum.amount ?? 0
    const availableToRequest = Math.max(
      0,
      availableCommissions - reservedAmount
    )
    if (!user) {
      return NextResponse.json(
        { error: "کاربر پیدا نشد." },
        { status: 404 }
      )
    }

    const bankInfoComplete = Boolean(
      user.bankShaba && user.bankCard && user.bankAccount
    )

    return NextResponse.json({
      payouts,
      availableCommissions,
      reservedAmount,
      availableToRequest,
      minimumPayoutAmount,
      bankInfoComplete,
    })
  } catch (error) {
    console.error("Error fetching affiliate payouts:", error)
    return NextResponse.json(
      { error: "دریافت اطلاعات پرداخت ناموفق بود." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAffiliate()
    if (!guard.ok) {
      return guard.response
    }

    const body = await request.json()
    const validatedData = payoutRequestSchema.parse(body)
    const minimumPayoutAmount = await getMinimumPayoutAmount()
    const user = await prisma.user.findUnique({
      where: { id: guard.user.id },
      select: {
        bankShaba: true,
        bankCard: true,
        bankAccount: true,
      },
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

    if (!bankInfoComplete) {
      return NextResponse.json(
        { error: "برای درخواست تسویه، ابتدا اطلاعات بانکی را کامل کنید." },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const [availableSum, reservedSum] = await Promise.all([
          tx.commission.aggregate({
            _sum: { amount: true },
            where: {
              affiliateId: guard.user.id,
              status: CommissionStatus.available,
            },
          }),
          tx.payoutRequest.aggregate({
            _sum: { amount: true },
            where: {
              affiliateId: guard.user.id,
              status: { in: [PayoutStatus.pending, PayoutStatus.approved] },
            },
          }),
        ])

        const availableCommissions = availableSum._sum.amount ?? 0
        const reservedAmount = reservedSum._sum.amount ?? 0
        const availableToRequest = availableCommissions - reservedAmount

        if (availableToRequest < minimumPayoutAmount) {
          return {
            error: "حداقل مبلغ تسویه رعایت نشده است.",
            status: 400,
          }
        }

        if (validatedData.amount < minimumPayoutAmount) {
          return {
            error: "مبلغ درخواست کمتر از حداقل تسویه است.",
            status: 400,
          }
        }

        if (validatedData.amount > availableToRequest) {
          return {
            error: "موجودی قابل تسویه کافی نیست.",
            status: 400,
          }
        }

        if (validatedData.amount !== availableToRequest) {
          return {
            error: "درخواست تسویه باید برای کل موجودی قابل برداشت باشد.",
            status: 400,
          }
        }

        const payout = await tx.payoutRequest.create({
          data: {
            affiliateId: guard.user.id,
            amount: validatedData.amount,
            status: PayoutStatus.pending,
            bankAccount: `شبا: ${user.bankShaba} | کارت: ${user.bankCard} | حساب: ${user.bankAccount}`,
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
      { error: "ثبت درخواست تسویه ناموفق بود." },
      { status: 500 }
    )
  }
}
