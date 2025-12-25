import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { zarinpalVerify } from "@/lib/zarinpal"
import { createCommissionsForOrder } from "@/lib/commission"
import { OrderStatus, Prisma } from "@prisma/client"

/**
 * GET /api/payment/verify
 * Zarinpal callback handler - verifies payment and updates order
 * This route is idempotent - can be called multiple times safely
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const authority = searchParams.get("Authority")
    const status = searchParams.get("Status")
    const orderId = searchParams.get("orderId")

    // Validate required parameters
    if (!authority) {
      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?error=missing_authority`
      )
    }

    if (!orderId) {
      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?error=missing_order`
      )
    }

    // Find order by ID first (more reliable than authority)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        refAffiliate: true,
      },
    })

    if (!order) {
      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?error=order_not_found`
      )
    }

    // Verify authority matches
    if (order.zarinpalAuthority !== authority) {
      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?error=invalid_authority&orderId=${order.id}`
      )
    }

    // Check if payment was canceled by user
    if (status !== "OK") {
      await prisma.$transaction(async (tx) => {
        const freshOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        })

        if (!freshOrder || freshOrder.status !== OrderStatus.pending) {
          return
        }

        for (const item of freshOrder.items) {
          await tx.$queryRaw(
            Prisma.sql`
              UPDATE "ProductVariant"
              SET "stockReserved" = "stockReserved" - ${item.quantity}
              WHERE "id" = ${item.variantId}
              AND "stockReserved" >= ${item.quantity}
            `
          )
        }

        await tx.order.update({
          where: { id: freshOrder.id },
          data: { status: OrderStatus.canceled, statusUpdatedAt: new Date() },
        })

        await tx.stockMovement.createMany({
          data: freshOrder.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            delta: item.quantity,
            reason: "order_released" as const,
            note: `Order ${freshOrder.id}`,
            createdByUserId: freshOrder.userId,
          })),
        })
      })

      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?orderId=${order.id}`
      )
    }

    // Prevent double verification (idempotent check)
    if (order.status !== OrderStatus.pending) {
      // Order already processed
      if (order.status === OrderStatus.processing || order.status === OrderStatus.shipped || order.status === OrderStatus.delivered) {
        return NextResponse.redirect(
          `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/success?orderId=${order.id}`
        )
      }
      // Order was canceled or failed
      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?orderId=${order.id}`
      )
    }

    // Verify payment with Zarinpal
    const verificationResult = await zarinpalVerify({
      authority,
      amount: order.totalAmount,
    })

    if (!verificationResult.success) {
      console.error("Payment verification failed:", verificationResult.error)

      await prisma.$transaction(async (tx) => {
        const freshOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        })

        if (!freshOrder || freshOrder.status !== OrderStatus.pending) {
          return
        }

        for (const item of freshOrder.items) {
          await tx.$queryRaw(
            Prisma.sql`
              UPDATE "ProductVariant"
              SET "stockReserved" = "stockReserved" - ${item.quantity}
              WHERE "id" = ${item.variantId}
              AND "stockReserved" >= ${item.quantity}
            `
          )
        }

        await tx.order.update({
          where: { id: freshOrder.id },
          data: { status: OrderStatus.canceled, statusUpdatedAt: new Date() },
        })

        await tx.stockMovement.createMany({
          data: freshOrder.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            delta: item.quantity,
            reason: "order_released" as const,
            note: `Order ${freshOrder.id}`,
            createdByUserId: freshOrder.userId,
          })),
        })
      })

      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?orderId=${order.id}&error=${verificationResult.error}`
      )
    }

    // Payment verified successfully
    let transactionResult: {
      status: "paid" | "already_processed"
      order: { id: string; status: OrderStatus; refAffiliateId: string | null }
    }

    try {
      transactionResult = await prisma.$transaction(async (tx) => {
        const freshOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        })

        if (!freshOrder) {
          throw new Error("ORDER_NOT_FOUND")
        }

        if (freshOrder.status !== OrderStatus.pending) {
          return {
            status: "already_processed",
            order: {
              id: freshOrder.id,
              status: freshOrder.status,
              refAffiliateId: freshOrder.refAffiliateId,
            },
          }
        }

        for (const item of freshOrder.items) {
          const updated = await tx.$queryRaw<{ id: string }[]>(
            Prisma.sql`
              UPDATE "ProductVariant"
              SET "stockOnHand" = "stockOnHand" - ${item.quantity},
                  "stockReserved" = "stockReserved" - ${item.quantity}
              WHERE "id" = ${item.variantId}
              AND "stockReserved" >= ${item.quantity}
              RETURNING "id"
            `
          )

          if (updated.length === 0) {
            throw new Error("RESERVATION_MISSING")
          }
        }

        await tx.order.update({
          where: { id: freshOrder.id },
          data: {
            status: OrderStatus.processing,
            statusUpdatedAt: new Date(),
            zarinpalRefId: verificationResult.refId?.toString() || null,
          },
        })
        await tx.orderStatusHistory.create({
          data: {
            orderId: freshOrder.id,
            fromStatus: OrderStatus.pending,
            toStatus: OrderStatus.processing,
          },
        })

        await tx.stockMovement.createMany({
          data: freshOrder.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            delta: -item.quantity,
            reason: "order_committed" as const,
            note: `Order ${freshOrder.id}`,
            createdByUserId: freshOrder.userId,
          })),
        })

        return {
          status: "paid",
          order: {
            id: freshOrder.id,
            status: OrderStatus.processing,
            refAffiliateId: freshOrder.refAffiliateId,
          },
        }
      })
    } catch (error: any) {
      if (error?.message === "RESERVATION_MISSING") {
        await prisma.$transaction(async (tx) => {
          const freshOrder = await tx.order.findUnique({
            where: { id: order.id },
            include: { items: true },
          })

          if (!freshOrder || freshOrder.status !== OrderStatus.pending) {
            return
          }

          for (const item of freshOrder.items) {
            await tx.$queryRaw(
              Prisma.sql`
                UPDATE "ProductVariant"
                SET "stockReserved" = "stockReserved" - ${item.quantity}
                WHERE "id" = ${item.variantId}
                AND "stockReserved" >= ${item.quantity}
              `
            )
          }

          await tx.order.update({
            where: { id: freshOrder.id },
            data: { status: OrderStatus.canceled, statusUpdatedAt: new Date() },
          })

          await tx.orderStatusHistory.create({
            data: {
              orderId: freshOrder.id,
              fromStatus: OrderStatus.pending,
              toStatus: OrderStatus.canceled,
            },
          })

          await tx.stockMovement.createMany({
            data: freshOrder.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              delta: item.quantity,
              reason: "order_released" as const,
              note: `Order ${freshOrder.id}`,
              createdByUserId: freshOrder.userId,
            })),
          })
        })

          if (result.count > 0) {
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                fromStatus: OrderStatus.pending,
                toStatus: OrderStatus.canceled,
              },
            })
          }
        })

        return NextResponse.redirect(
          `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?orderId=${order.id}&error=out_of_stock`
        )
      }

      if (error?.message === "ORDER_NOT_FOUND") {
        return NextResponse.redirect(
          `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?error=order_not_found`
        )
      }

      throw error
    }

    if (transactionResult.status === "already_processed") {
      if (
        transactionResult.order.status === OrderStatus.processing ||
        transactionResult.order.status === OrderStatus.shipped ||
        transactionResult.order.status === OrderStatus.delivered
      ) {
        return NextResponse.redirect(
          `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/success?orderId=${transactionResult.order.id}`
        )
      }

      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?orderId=${transactionResult.order.id}`
      )
    }

    // Create commissions if affiliate exists (only if not already created)
    if (transactionResult.order.refAffiliateId && !verificationResult.alreadyVerified) {
      try {
        await createCommissionsForOrder(transactionResult.order.id)
      } catch (error) {
        console.error("Error creating commissions:", error)
        // Don't fail the payment if commission creation fails
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/success?orderId=${transactionResult.order.id}`
    )
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.redirect(
      `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?error=server_error`
    )
  }
}

/**
 * POST /api/payment/verify
 * Alternative endpoint for POST requests (if needed)
 */
export async function POST(request: NextRequest) {
  // Redirect to GET handler
  return GET(request)
}
