import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkoutSchema } from "@/lib/validations"
import { getAffiliateRef } from "@/lib/affiliate"
import { createCommissionsForOrder } from "@/lib/commission"
import { getFlatShippingCost } from "@/lib/settings"

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

    // Get cart items and calculate total
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      })

      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `موجودی ${variant?.product.name} کافی نیست` },
          { status: 400 }
        )
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

    // Get shipping cost from settings/env
    const shippingCost = await getFlatShippingCost()

    totalAmount += shippingCost

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

    // Create order
    const order = await prisma.order.create({
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

