import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"

export default async function AdminDashboard() {
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "canceled" } },
    }),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
  ])

  return (
    <DashboardClient
      totalOrders={totalOrders}
      totalRevenue={totalRevenue._sum.totalAmount || 0}
      totalProducts={totalProducts}
      totalUsers={totalUsers}
      recentOrders={recentOrders}
    />
  )
}
