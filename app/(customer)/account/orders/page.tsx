"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
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
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton-kit"
import { ORDER_STATUS_LABELS_FA } from "@/lib/order-status"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PanelContainer } from "@/components/account/panel-container"
import { PanelCard } from "@/components/account/panel-card"

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
  trackingCode: string | null
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

function OrderTrackingAction({
  trackingCode,
}: {
  trackingCode: string | null
}) {
  const [inputValue, setInputValue] = useState(trackingCode ?? "")
  const normalized = inputValue.replace(/[^\d]/g, "")

  return (
    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex-1">
        <Input
          inputMode="numeric"
          pattern="\\d*"
          placeholder="کد رهگیری را وارد کنید"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          className="text-left"
          dir="ltr"
        />
      </div>
      <Button asChild className="h-12 px-5">
        <Link href={`/account/tracking${normalized ? `?code=${normalized}` : ""}`}>
          {"رهگیری"}
        </Link>
      </Button>
    </div>
  )
}

export default function CustomerOrdersPage() {
  const { data: orders, isLoading } = useQuery<OrderListItem[]>({
    queryKey: ["customer-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders")
      if (!res.ok) throw new Error("خطا در دریافت سفارش‌ها")
      return (await res.json()) as OrderListItem[]
    },
  })

  if (isLoading) {
    return (
      <PanelContainer dir="rtl">
        <SkeletonTable rows={6} />
      </PanelContainer>
    )
  }

  return (
    <PanelContainer dir="rtl">
      <SectionHeader
        title={
          <h1 className="text-xl font-semibold">
            {"سفارش‌های من"}
          </h1>
        }
        subtitle="جزئیات سفارش‌ها و کدهای رهگیری."
      />

      {orders?.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-muted-foreground" />}
          title="سفارشی ثبت نشده است"
          description="پس از ثبت سفارش، اطلاعات آن در این بخش نمایش داده می‌شود."
        />
      ) : (
        <>
          <PanelCard className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <th className="py-3 text-right font-medium">سفارش</th>
                    <th className="py-3 text-right font-medium">تاریخ</th>
                    <th className="py-3 text-right font-medium">مبلغ</th>
                    <th className="py-3 text-right font-medium">وضعیت</th>
                    <th className="py-3 text-right font-medium">کد رهگیری</th>
                    <th className="py-3 text-right font-medium">جزئیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {orders?.map((order) => {
                    const StatusIcon = statusIcons[order.status]
                    return (
                      <tr key={order.id} className="align-top">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center",
                                statusColors[order.status]
                              )}
                            >
                              <StatusIcon className="w-4 h-4" />
                            </span>
                            <span className="font-semibold">#{order.id.slice(0, 8)}</span>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 font-semibold">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-4">
                          <span
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full font-medium",
                              statusColors[order.status]
                            )}
                          >
                            {ORDER_STATUS_LABELS_FA[order.status]}
                          </span>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          <span dir="ltr">{order.trackingCode || "ثبت نشده"}</span>
                        </td>
                        <td className="py-4">
                          <Button asChild variant="outline" className="h-9 px-3">
                            <Link href={`/account/orders/${order.id}`}>
                              {"مشاهده"}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </PanelCard>

          <div className="space-y-4 md:hidden">
            {orders?.map((order) => {
              const StatusIcon = statusIcons[order.status]
              return (
                <PanelCard key={order.id}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
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
                        <p className="text-sm font-semibold">
                          {"سفارش #"}
                          {order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="font-bold text-base mb-1">
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

                  <div className="mt-4 space-y-3 border-t border-border/60 pt-4 text-sm">
                    {order.items.map((item: OrderItem) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          {item.product.name} - {item.variant.size} / {item.variant.color} - {item.quantity}
                        </span>
                        <span className="font-semibold persian-number">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="text-muted-foreground">
                      {"کد رهگیری:"}{" "}
                      <span dir="ltr" className="text-foreground persian-number">
                        {order.trackingCode || "ثبت نشده"}
                      </span>
                    </div>
                    <Button asChild variant="outline" className="h-10 px-4">
                      <Link href={`/account/orders/${order.id}`}>
                        {"جزئیات"}
                      </Link>
                    </Button>
                  </div>

                  <OrderTrackingAction trackingCode={order.trackingCode} />
                </PanelCard>
              )
            })}
          </div>
        </>
      )}
    </PanelContainer>
  )
}