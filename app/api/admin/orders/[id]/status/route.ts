import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateCommissionsOnOrderStatusChange } from "@/lib/commission"
import { OrderStatus } from "@prisma/client"
import { z } from "zod"

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = statusSchema.parse(body)

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === status) {
      return NextResponse.json({ order })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        statusUpdatedAt: new Date(),
        updatedBy: session.user.id,
      },
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
      { error: "Failed to update order status" },
      { status: 500 }
    )
  }
}
