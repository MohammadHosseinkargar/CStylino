import { prisma } from "@/lib/prisma"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { TrendingUp, Package, Users, ShoppingCart } from "lucide-react"
import { StyledCard } from "@/components/ui/styled-card"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"

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
    <PageContainer className="space-y-8 py-6" dir="rtl">
      <SectionHeader title="???????" subtitle="????? ????????? ???????" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ?? ???????
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">??? ??????</p>
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ?? ?????
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(totalRevenue._sum.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">????? ????</p>
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ???????
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">????? ????</p>
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ???????
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">??????? ?????? ???</p>
          </CardContent>
        </StyledCard>
      </div>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>???????? ????</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {order.user.name || order.user.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-bold">{formatPrice(order.totalAmount)}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {order.status === "pending" && "?? ??????"}
                      {order.status === "processing" && "?? ??? ??????"}
                      {order.status === "shipped" && "????? ???"}
                      {order.status === "delivered" && "????? ???? ???"}
                      {order.status === "canceled" && "??? ???"}
                      {order.status === "refunded" && "?????? ???"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                ???? ?????? ??? ???? ???
              </div>
            )}
          </div>
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
