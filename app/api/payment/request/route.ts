import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { zarinpalRequest, getZarinpalGatewayUrl } from "@/lib/zarinpal"

/**
 * POST /api/payment/request
 * Creates payment request and returns gateway URL
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "لطفاً ابتدا وارد شوید." },
        { status: 401 }
      )
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId الزامی است." },
        { status: 400 }
      )
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "سفارشی با این شناسه پیدا نشد." },
        { status: 404 }
      )
    }

    const isAdmin = session.user.role === "admin"
    if (!isAdmin && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "شما دسترسی به این سفارش ندارید." },
        { status: 403 }
      )
    }

    // Check if order is in pending status
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "امکان پرداخت برای این سفارش وجود ندارد." },
        { status: 400 }
      )
    }

    // Check if already has authority (prevent duplicate requests)
    if (order.zarinpalAuthority) {
      return NextResponse.json({
        url: getZarinpalGatewayUrl(order.zarinpalAuthority),
        authority: order.zarinpalAuthority,
      })
    }

    // Get callback URL from env or use default
    const callbackUrl =
      process.env.ZARINPAL_CALLBACK_URL ||
      `${process.env.APP_URL || process.env.NEXTAUTH_URL}/api/payment/verify`

    // Request payment from Zarinpal
    const paymentResult = await zarinpalRequest({
      amount: order.totalAmount,
      description: `پرداخت سفارش ${order.id}`,
      callbackUrl,
      orderId: order.id,
      email: order.user.email,
    })

    if (!paymentResult.success || !paymentResult.authority) {
      return NextResponse.json(
        { error: paymentResult.error || "خطا در ایجاد درخواست پرداخت." },
        { status: 400 }
      )
    }

    // Update order with authority
    await prisma.order.update({
      where: { id: orderId },
      data: { zarinpalAuthority: paymentResult.authority },
    })

    // Return gateway URL
    return NextResponse.json({
      url: getZarinpalGatewayUrl(paymentResult.authority),
      authority: paymentResult.authority,
    })
  } catch (error: any) {
    console.error("Payment request error:", error)
    return NextResponse.json(
      { error: error.message || "خطا در ایجاد درخواست پرداخت." },
      { status: 500 }
    )
  }
}

