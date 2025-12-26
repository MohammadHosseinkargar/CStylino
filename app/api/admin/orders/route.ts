import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { requireAdmin } from "@/lib/rbac"

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
    }

    const searchParams = request.nextUrl.searchParams
    const statusParam = searchParams.get("status")
    const search = searchParams.get("search")?.trim()
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const perPage = Math.min(
      Math.max(parseInt(searchParams.get("perPage") || "10", 10), 1),
      50
    )

    const status =
      statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : undefined

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: "insensitive" as const } },
              { trackingCode: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    return NextResponse.json({
      data: orders,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
      },
    })
  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return NextResponse.json(
      { error: "خطا در دریافت سفارش‌ها." },
      { status: 500 }
    )
  }
}
export const dynamic = "force-dynamic"
