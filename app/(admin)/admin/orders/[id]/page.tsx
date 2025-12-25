import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatPrice } from "@/lib/utils"
import { OrderStatusSelect } from "@/components/admin/order-status-select"
import { OrderShippingForm } from "@/components/admin/order-shipping-form"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { ORDER_STATUS_LABELS_FA } from "@/lib/order-status"

const formatNumber = (value: number) => new Intl.NumberFormat("fa-IR").format(value)

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { name: true, email: true },
      },
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: {
          changedByUser: {
            select: { name: true, email: true },
          },
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title={`سفارش #${order.id.slice(0, 8)}`}
        subtitle={`${formatDate(order.createdAt)} • ${ORDER_STATUS_LABELS_FA[order.status]}`}
        actions={
          <Link
            href="/admin/orders"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            بازگشت به سفارش ها
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StyledCard variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>وضعیت سفارش</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader>
            <CardTitle>ارسال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">شرکت حمل</div>
              <div>{order.shippingCarrier || "-"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">کد رهگیری</div>
              <div>{order.trackingCode || "-"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">تاریخ ارسال</div>
              <div>{order.shippedAt ? formatDate(order.shippedAt) : "-"}</div>
            </div>
            <div className="pt-2">
              <OrderShippingForm
                orderId={order.id}
                initialCarrier={order.shippingCarrier}
                initialTrackingCode={order.trackingCode}
              />
            </div>
          </CardContent>
        </StyledCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StyledCard variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>اقلام سفارش</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm border-b border-border/50 pb-3 last:border-none last:pb-0"
              >
                <div className="space-y-1">
                  <div className="font-semibold">{item.product.name}</div>
                  <div className="text-muted-foreground">
                    {item.variant.size} / {item.variant.color} • تعداد {formatNumber(item.quantity)}
                  </div>
                </div>
                <div className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader>
            <CardTitle>مشتری</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="font-semibold">
              {order.customerName || order.user.name || order.user.email}
            </div>
            <div className="text-muted-foreground">{order.user.email}</div>
            <div className="text-muted-foreground">{order.shippingPhone}</div>
            <div className="text-muted-foreground">
              {order.shippingProvince} - {order.shippingCity}
            </div>
            <div className="text-muted-foreground">{order.shippingAddress}</div>
            {order.shippingPostalCode && (
              <div className="text-muted-foreground">
                کد پستی: {order.shippingPostalCode}
              </div>
            )}
            {order.notes && (
              <div className="text-muted-foreground">یادداشت: {order.notes}</div>
            )}
          </CardContent>
        </StyledCard>
      </div>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>تاریخچه وضعیت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {order.statusHistory.length > 0 ? (
            order.statusHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-1 border-b border-border/50 pb-3 last:border-none last:pb-0"
              >
                <div className="font-semibold">
                  از {ORDER_STATUS_LABELS_FA[entry.fromStatus]} به {ORDER_STATUS_LABELS_FA[entry.toStatus]}
                </div>
                <div className="text-muted-foreground">
                  {formatDate(entry.createdAt)}
                  {entry.changedByUser?.email
                    ? ` • ${entry.changedByUser.name || entry.changedByUser.email}`
                    : ""}
                </div>
                {entry.note && (
                  <div className="text-muted-foreground">یادداشت: {entry.note}</div>
                )}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">تاریخچه ای ثبت نشده است.</div>
          )}
        </CardContent>
      </StyledCard>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>جمع کل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">جمع جزء</span>
            <span className="font-semibold">
              {formatPrice(order.totalAmount - order.shippingCost)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">هزینه ارسال</span>
            <span className="font-semibold">{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>مبلغ نهایی</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
