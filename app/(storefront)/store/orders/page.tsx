"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { OrderStatus } from "@prisma/client"
import { Package, Truck, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

const statusLabels: Record<OrderStatus, string> = {
  pending: "در انتظار پرداخت",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  canceled: "لغو شده",
  refunded: "بازگشت شده",
}

const statusIcons: Record<OrderStatus, typeof Package> = {
  pending: Package,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  canceled: XCircle,
  refunded: RotateCcw,
}

const statusColors: Record<OrderStatus, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  processing: "text-blue-600 bg-blue-50",
  shipped: "text-purple-600 bg-purple-50",
  delivered: "text-green-600 bg-green-50",
  canceled: "text-red-600 bg-red-50",
  refunded: "text-gray-600 bg-gray-50",
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders")
      if (!res.ok) throw new Error("Failed to fetch orders")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="container py-12 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">سفارش‌های من</h1>
        <p className="text-muted-foreground">تاریخچه تمام سفارش‌های شما</p>
      </div>

      {orders?.length === 0 ? (
        <Card className="card-luxury">
          <CardContent className="p-12 md:p-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">هنوز سفارشی ثبت نکرده‌اید</h2>
            <p className="text-muted-foreground mb-6">
              برای شروع خرید، به صفحه محصولات بروید
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders?.map((order: any) => {
            const StatusIcon = statusIcons[order.status]
            return (
              <Card key={order.id} className="card-luxury">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        statusColors[order.status]
                      )}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">سفارش #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg mb-1">
                        {formatPrice(order.totalAmount)}
                      </div>
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium",
                        statusColors[order.status]
                      )}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 pt-4 border-t border-border">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {item.product.name} - {item.variant.size} / {item.variant.color} × {item.quantity}
                        </span>
                        <span className="font-semibold persian-number">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
