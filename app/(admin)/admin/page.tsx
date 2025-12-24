import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { TrendingUp, Package, Users, ShoppingCart } from "lucide-react"

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
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">داشبورد</h1>
        <p className="text-muted-foreground">خلاصه فعالیت‌های فروشگاه</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              کل سفارش‌ها
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">همه زمان‌ها</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              کل درآمد
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(totalRevenue._sum.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">درآمد خالص</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              محصولات
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">محصول فعال</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              کاربران
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">کاربران ثبت‌نام شده</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle>سفارش‌های اخیر</CardTitle>
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
                      {order.status === "pending" && "در انتظار"}
                      {order.status === "processing" && "در حال پردازش"}
                      {order.status === "shipped" && "ارسال شده"}
                      {order.status === "delivered" && "تحویل داده شده"}
                      {order.status === "canceled" && "لغو شده"}
                      {order.status === "refunded" && "بازگشت شده"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                هنوز سفارشی ثبت نشده است
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

