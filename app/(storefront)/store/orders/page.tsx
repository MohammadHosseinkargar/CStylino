"use client"

import { useQuery } from "@tanstack/react-query"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { OrderStatus } from "@prisma/client"
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CornerUpLeft,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton-kit"
import { ORDER_STATUS_LABELS_FA } from "@/lib/order-status"

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: { name: string }
  variant: { size: string; color: string }
}

type OrderListItem = {
  id: string
  createdAt: string
  totalAmount: number
  status: OrderStatus
  items: OrderItem[]
}

const statusIcons: Record<OrderStatus, LucideIcon> = {
  pending: Package,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  canceled: XCircle,
  returned: CornerUpLeft,
  refunded: RotateCcw,
}

const statusColors: Record<OrderStatus, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  processing: "text-blue-600 bg-blue-50",
  shipped: "text-purple-600 bg-purple-50",
  delivered: "text-green-600 bg-green-50",
  canceled: "text-red-600 bg-red-50",
  returned: "text-orange-600 bg-orange-50",
  refunded: "text-gray-600 bg-gray-50",
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery<OrderListItem[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders")
      if (!res.ok) throw new Error("Failed to fetch orders")
      return (await res.json()) as OrderListItem[]
    },
  })

  if (isLoading) {
    return (
      <PageContainer className="py-10" dir="rtl">
        <SkeletonTable rows={6} />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8 md:py-12" dir="rtl">
      <SectionHeader title="سفارش‌های من" subtitle="مشاهده وضعیت و جزئیات سفارش‌ها" />

      {orders?.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-muted-foreground" />}
          title="هنوز سفارشی ثبت نکرده‌اید"
          description="برای مشاهده سفارش‌ها، ابتدا خرید خود را ثبت کنید."
        />
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => {
            const StatusIcon = statusIcons[order.status]
            return (
              <StyledCard key={order.id} variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center",
                          statusColors[order.status]
                        )}
                      >
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
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          statusColors[order.status]
                        )}
                      >
                        {ORDER_STATUS_LABELS_FA[order.status]}
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
              </StyledCard>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
