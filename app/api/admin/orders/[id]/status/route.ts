import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateCommissionsOnOrderStatusChange } from "@/lib/commission"
import { OrderStatus, Prisma } from "@prisma/client"
import { z } from "zod"
import { requireAdmin } from "@/lib/rbac"
import { createAuditLog, getRequestIp } from "@/lib/audit"
import {
  getOrderStatusTransitionError,
  isValidOrderStatusTransition,
  shouldRestockForTransition,
} from "@/lib/order-status"

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().trim().max(500).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
    }

    const body = await request.json()
    const { status, note } = statusSchema.parse(body)

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === status) {
      return NextResponse.json({ order })
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: params.id },
        data: {
          status,
          statusUpdatedAt: new Date(),
          updatedBy: guard.user.id,
        },
      })

      const shouldRelease =
        status === OrderStatus.canceled || status === OrderStatus.refunded

      if (shouldRelease) {
        if (order.status === OrderStatus.pending) {
          for (const item of order.items) {
            await tx.$queryRaw(
              Prisma.sql`
                UPDATE "ProductVariant"
                SET "stockReserved" = "stockReserved" - ${item.quantity}
                WHERE "id" = ${item.variantId}
                AND "stockReserved" >= ${item.quantity}
              `
            )
          }

          await tx.stockMovement.createMany({
            data: order.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              delta: item.quantity,
              reason: "order_released" as const,
              note: `Order ${order.id}`,
              createdByUserId: guard.user.id,
            })),
          })
        } else if (
          order.status === OrderStatus.processing ||
          order.status === OrderStatus.shipped ||
          order.status === OrderStatus.delivered
        ) {
          for (const item of order.items) {
            await tx.$queryRaw(
              Prisma.sql`
                UPDATE "ProductVariant"
                SET "stockOnHand" = "stockOnHand" + ${item.quantity}
                WHERE "id" = ${item.variantId}
              `
            )
          }

          await tx.stockMovement.createMany({
            data: order.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              delta: item.quantity,
              reason: "refund_return" as const,
              note: `Order ${order.id}`,
              createdByUserId: guard.user.id,
            })),
          })
        }
      }

      return updated
    })

    await updateCommissionsOnOrderStatusChange(updatedOrder.id, status)

    return NextResponse.json({ order: updatedOrder })

  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: "به‌روزرسانی وضعیت سفارش ناموفق بود." },
      { status: 500 }
    )
  }
}
