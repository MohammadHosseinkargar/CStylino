import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">سفارش‌ها</h1>
        <p className="text-muted-foreground">مدیریت سفارش‌های مشتریان</p>
      </div>

      <Card className="card-editorial">
        <CardHeader>
          <CardTitle>لیست سفارش‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border/40 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
  <div className="font-semibold">
    {order.customerName || order.user.name || order.user.email}
  </div>
  <div className="text-sm text-muted-foreground">{order.shippingPhone}</div>
  <div className="text-xs text-muted-foreground line-clamp-1">
    {order.shippingProvince}? {order.shippingCity} - {order.shippingAddress}
  </div>
  <div className="text-sm text-muted-foreground">
    {formatDate(order.createdAt)} ? {order.items.length} ?????
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              هنوز سفارشی ثبت نشده است
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

