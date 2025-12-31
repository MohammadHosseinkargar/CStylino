import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import { TrendingUp, Package, Users, ShoppingCart, AlertTriangle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { SectionHeader } from "@/components/ui/section-header"
import { LOW_STOCK_THRESHOLD } from "@/lib/constants"
import { GlassCard } from "@/components/ui/glass-card"
import { Surface } from "@/components/ui/surface"

const getOrderStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "processing":
      return "در حال پردازش"
    case "shipped":
      return "ارسال شده"
    case "delivered":
      return "تحویل شده"
    case "canceled":
      return "لغو شده"
    case "refunded":
      return "بازگشت وجه"
    case "returned":
      return "مرجوع شده"
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
    <Container className="space-y-8 py-6" dir="rtl">
      <SectionHeader title="داشبورد مدیریت" subtitle="نمای کلی فروشگاه" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">کل سفارش‌ها</div>
              <div className="text-3xl font-bold persian-number mt-2">{totalOrders}</div>
            </div>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">مجموع سفارش‌های ثبت‌شده</p>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">درآمد</div>
              <div className="text-2xl font-bold mt-2">
                {formatPrice(totalRevenue._sum.totalAmount || 0)}
              </div>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">تجمعی سفارش‌های غیرلغو</p>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">محصولات</div>
              <div className="text-3xl font-bold persian-number mt-2">{totalProducts}</div>
            </div>
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">تعداد محصولات فعال</p>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">کاربران</div>
              <div className="text-3xl font-bold persian-number mt-2">{totalUsers}</div>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">ثبت‌نام‌های کل</p>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">کمبود موجودی</div>
              <div className="text-3xl font-bold persian-number mt-2">{lowStockCount}</div>
            </div>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            کمتر از {LOW_STOCK_THRESHOLD} عدد
          </p>
        </Surface>
      </div>

      <GlassCard className="p-6">
        <div className="text-base font-semibold mb-4">سفارش‌های اخیر</div>
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
                  <div className="text-xs text-muted-foreground">
                    {getOrderStatusLabel(order.status)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              سفارشی ثبت نشده است.
            </div>
          )}
        </div>
      </GlassCard>
    </Container>
  )
}
