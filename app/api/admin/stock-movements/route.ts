import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { Prisma, StockMovementReason } from "@prisma/client"
import { z } from "zod"

const createSchema = z.object({
  variantId: z.string().min(1),
  delta: z
    .number()
    .int()
    .refine((value) => value !== 0, { message: "Delta must be non-zero." }),
  reason: z.nativeEnum(StockMovementReason),
  note: z.string().max(500).nullable().optional(),
})

const reasonLabels: Record<StockMovementReason, string> = {
  manual_adjust: "تنظیم دستی",
  order_reserved: "رزرو سفارش",
  order_committed: "ثبت سفارش",
  order_released: "آزادسازی رزرو",
  refund_return: "مرجوعی / بازپرداخت",
  initial_stock: "موجودی اولیه",
}

export async function GET(request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return guard.response
  }

  const params = request.nextUrl.searchParams
  const productId = params.get("productId")

  if (!productId) {
    return NextResponse.json({ error: "productId الزامی است." }, { status: 400 })
  }

  const reason = params.get("reason") as StockMovementReason | null
  const variantId = params.get("variantId")
  const from = params.get("from")
  const to = params.get("to")

  const where: any = { productId }

  if (variantId) {
    where.variantId = variantId
  }

  if (reason && reasonLabels[reason]) {
    where.reason = reason
  }

  if (from || to) {
    where.createdAt = {}
    if (from) {
      where.createdAt.gte = new Date(from)
    }
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      variant: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    movements.map((movement) => ({
      ...movement,
      reasonLabel: reasonLabels[movement.reason],
    }))
  )
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return guard.response
  }

  try {
    const body = await request.json()
    const data = createSchema.parse(body)

    const allowedReasons: StockMovementReason[] = [
      "manual_adjust",
      "initial_stock",
      "refund_return",
    ]

    if (!allowedReasons.includes(data.reason)) {
      return NextResponse.json({ error: "دلیل انتخاب شده مجاز نیست." }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.$queryRaw<
        { id: string; productId: string }[]
      >(
        Prisma.sql`
          UPDATE "ProductVariant"
          SET "stockOnHand" = "stockOnHand" + ${data.delta}
          WHERE "id" = ${data.variantId}
          AND "stockOnHand" + ${data.delta} >= 0
          AND "stockOnHand" + ${data.delta} >= "stockReserved"
          RETURNING "id", "productId"
        `
      )

      if (updated.length === 0) {
        throw new Error("INVALID_ADJUSTMENT")
      }

      await tx.stockMovement.create({
        data: {
          productId: updated[0].productId,
          variantId: data.variantId,
          delta: data.delta,
          reason: data.reason,
          note: data.note ?? null,
          createdByUserId: guard.user.id,
        },
      })

      return updated[0]
    })

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    if (error?.message === "INVALID_ADJUSTMENT") {
      return NextResponse.json(
        { error: "تغییر موجودی معتبر نیست یا باعث منفی شدن موجودی می شود." },
        { status: 400 }
      )
    }

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error creating stock movement:", error)
    return NextResponse.json({ error: "خطا در ثبت تغییر موجودی." }, { status: 500 })
  }
}
export const dynamic = "force-dynamic"
