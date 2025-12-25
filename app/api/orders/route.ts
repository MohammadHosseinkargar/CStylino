import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkoutSchema } from "@/lib/validations"
import { getAffiliateRef } from "@/lib/affiliate"
import { createCommissionsForOrder } from "@/lib/commission"
import { getFlatShippingCost } from "@/lib/settings"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "لطفاً ابتدا وارد شوید" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, shippingData } = body

    // Validate shipping data
    const validatedShipping = checkoutSchema.parse(shippingData)

    // Get shipping cost from settings/env
    const shippingCost = await getFlatShippingCost()

    // Get affiliate ref
    const refAffiliateId = getAffiliateRef()
    let affiliateId = null

    if (refAffiliateId) {
      const affiliate = await prisma.user.findUnique({
        where: { affiliateCode: refAffiliateId },
      })
      if (affiliate) {
        affiliateId = affiliate.id
      }
    }

    let order
    try {
      order = await prisma.$transaction(async (tx) => {
        let totalAmount = 0
        const orderItems: Array<{
          productId: string
          variantId: string
          quantity: number
          price: number
        }> = []

        for (const item of items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          })

          if (!variant) {
            throw new Error("VARIANT_NOT_FOUND")
          }

          const reserved = await tx.$queryRaw<{ id: string }[]>(
            Prisma.sql`
              UPDATE "ProductVariant"
              SET "stockReserved" = "stockReserved" + ${item.quantity}
              WHERE "id" = ${item.variantId}
              AND "stockOnHand" - "stockReserved" >= ${item.quantity}
              RETURNING "id"
            `
          )

          if (reserved.length === 0) {
            throw new Error("OUT_OF_STOCK")
          }

          const price = variant.priceOverride || variant.product.basePrice
          totalAmount += price * item.quantity

          orderItems.push({
            productId: variant.productId,
            variantId: variant.id,
            quantity: item.quantity,
            price,
          })
        }

        totalAmount += shippingCost

        const createdOrder = await tx.order.create({
          data: {
            userId: session.user.id,
            status: "pending",
            totalAmount,
            shippingCost,
            refAffiliateId: affiliateId,
            customerName: validatedShipping.customerName,
            shippingProvince: validatedShipping.shippingProvince,
            shippingAddress: validatedShipping.shippingAddress,
            shippingCity: validatedShipping.shippingCity,
            shippingPostalCode: validatedShipping.shippingPostalCode,
            shippingPhone: validatedShipping.shippingPhone,
            notes: validatedShipping.notes,
            items: {
              create: orderItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        })

        const movementEntries = orderItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          delta: -item.quantity,
          reason: "order_reserved" as const,
          note: `Order ${createdOrder.id}`,
          createdByUserId: session.user.id,
        }))

        if (movementEntries.length > 0) {
          await tx.stockMovement.createMany({ data: movementEntries })
        }

        return createdOrder
      })
    } catch (error: any) {
      if (error?.message === "OUT_OF_STOCK") {
        return NextResponse.json(
          { error: "?????? ???? ????? ???? ????." },
          { status: 400 }
        )
      }
      if (error?.message === "VARIANT_NOT_FOUND") {
        return NextResponse.json(
          { error: "????? ?????????? ???? ???." },
          { status: 400 }
        )
      }
      throw error
    }

    // Note: Commissions will be created after payment verification
    // See: app/api/payment/verify/route.ts

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "خطا در ایجاد سفارش" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "لطفاً ابتدا وارد شوید" },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "خطا در دریافت سفارش‌ها" },
      { status: 500 }
    )
  }
}
