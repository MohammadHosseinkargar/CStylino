import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { z } from "zod"
import { requireAdmin } from "@/lib/rbac"

const shippingSchema = z.object({
  shippingCarrier: z.string().trim().max(100).optional().nullable(),
  trackingCode: z.string().trim().max(100).optional().nullable(),
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
    const parsed = shippingSchema.parse(body)

    const shippingCarrier =
      parsed.shippingCarrier && parsed.shippingCarrier.length
        ? parsed.shippingCarrier
        : null
    const trackingCode =
      parsed.trackingCode && parsed.trackingCode.length ? parsed.trackingCode : null

    if (!shippingCarrier && !trackingCode) {
      return NextResponse.json(
        { error: "حداقل یکی از فیلدهای شرکت حمل یا کد رهگیری را وارد کنید." },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, shippedAt: true },
    })

    if (!order) {
      return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        shippingCarrier,
        trackingCode,
        shippedAt:
          order.status === OrderStatus.shipped && !order.shippedAt
            ? new Date()
            : order.shippedAt,
      },
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating shipping info:", error)
    return NextResponse.json(
      { error: "ثبت اطلاعات ارسال ناموفق بود." },
      { status: 500 }
    )
  }
}
