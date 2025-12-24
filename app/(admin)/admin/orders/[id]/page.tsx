import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatPrice } from "@/lib/utils"
import { OrderStatusSelect } from "@/components/admin/order-status-select"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
  refunded: "Refunded",
}

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
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title={`Order #${order.id.slice(0, 8)}`}
        subtitle={`${formatDate(order.createdAt)} • ${statusLabels[order.status]}`}
        actions={
          <Link
            href="/admin/orders"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to orders
          </Link>
        }
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
        </CardContent>
      </StyledCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StyledCard variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
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
                    {item.variant.size} / {item.variant.color} � Qty {item.quantity}
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
            <CardTitle>Customer</CardTitle>
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
                Postal: {order.shippingPostalCode}
              </div>
            )}
            {order.notes && (
              <div className="text-muted-foreground">Notes: {order.notes}</div>
            )}
          </CardContent>
        </StyledCard>
      </div>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">
              {formatPrice(order.totalAmount - order.shippingCost)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-semibold">{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
