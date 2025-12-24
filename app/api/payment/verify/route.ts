import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { zarinpalVerify } from "@/lib/zarinpal"
import { createCommissionsForOrder } from "@/lib/commission"
import { OrderStatus } from "@prisma/client"

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
      // Update order status to canceled
      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.canceled },
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
      
      // Update order status to canceled
      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.canceled },
      })

      return NextResponse.redirect(
        `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/failed?orderId=${order.id}&error=${verificationResult.error}`
      )
    }

    // Payment verified successfully
    // Update order status to processing
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.processing,
        zarinpalRefId: verificationResult.refId?.toString() || null,
      },
    })

    // Create commissions if affiliate exists (only if not already created)
    if (order.refAffiliateId && !verificationResult.alreadyVerified) {
      try {
        await createCommissionsForOrder(order.id)
      } catch (error) {
        console.error("Error creating commissions:", error)
        // Don't fail the payment if commission creation fails
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.APP_URL || process.env.NEXTAUTH_URL}/store/payment/success?orderId=${order.id}`
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
