import { prisma } from "@/lib/prisma"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { TrendingUp, Package, Users, ShoppingCart, AlertTriangle } from "lucide-react"
import { StyledCard } from "@/components/ui/styled-card"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { LOW_STOCK_THRESHOLD } from "@/lib/constants"

const getOrderStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "processing":
      return "در حال پردازش"
    case "shipped":
      return "ارسال شد"
    case "delivered":
      return "تحویل شد"
    case "canceled":
      return "لغو شد"
    case "refunded":
      return "بازپرداخت شد"
    case "returned":
      return "مرجوع شد"
    default:
      return "نامشخص"
  }
}

export default async function AdminDashboard() {
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    lowStockGroups,
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
    prisma.productVariant.groupBy({
      by: ["productId"],
      _sum: { stockOnHand: true, stockReserved: true },
    }),
  ])

  const lowStockCount = lowStockGroups.filter(
    (group) =>
      (group._sum.stockOnHand ?? 0) - (group._sum.stockReserved ?? 0) <=
      LOW_STOCK_THRESHOLD
  ).length

  return (
    <PageContainer className="space-y-8 py-6" dir="rtl">
      <SectionHeader title="داشبورد" subtitle="نمای کلی فروشگاه" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              کل سفارش ها
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">مجموع سفارش های ثبت شده</p>
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              درآمد کل
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(totalRevenue._sum.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">بدون سفارش های لغو شده</p>
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تعداد محصولات
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">مجموع محصولات ثبت شده</p>
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              کاربران
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">مجموع کاربران ثبت شده</p>
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              کمبود موجودی
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              محصولات زیر حد {LOW_STOCK_THRESHOLD}
            </p>
          </CardContent>
        </StyledCard>
      </div>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>آخرین سفارش ها</CardTitle>
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
                      {getOrderStatusLabel(order.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                هنوز سفارشی ثبت نشده است.
              </div>
            )}
          </div>
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
