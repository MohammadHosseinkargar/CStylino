import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SectionHeader } from "@/components/ui/section-header"
import { formatPrice, formatDate } from "@/lib/utils"
import { ORDER_STATUS_LABELS_FA } from "@/lib/order-status"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PanelContainer } from "@/components/account/panel-container"
import { PanelCard } from "@/components/account/panel-card"
import { StatusBadge } from "@/components/account/status-badge"

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  })

  if (!order) {
    redirect("/account/orders")
  }

  return (
    <PanelContainer dir="rtl">
      <SectionHeader
        kicker="جزئیات سفارش"
        title={
          <h1 className="text-xl font-semibold">
            سفارش <span dir="ltr">#{order.id.slice(0, 8)}</span>
          </h1>
        }
        subtitle="وضعیت سفارش، آدرس ارسال و اقلام خریداری‌شده."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <PanelCard className="lg:col-span-2">
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">تاریخ ثبت</span>
              <span className="font-semibold">
                {formatDate(order.createdAt.toString())}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">وضعیت سفارش</span>
              <StatusBadge variant="neutral">
                {ORDER_STATUS_LABELS_FA[order.status]}
              </StatusBadge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">مبلغ پرداختی</span>
              <span className="font-bold persian-number">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">کد رهگیری</span>
              <span className="font-semibold" dir="ltr">
                {order.trackingCode || "ثبت نشده"}
              </span>
            </div>
          </div>
        </PanelCard>

        <PanelCard>
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">آدرس ارسال</h3>
            <p className="text-muted-foreground leading-6">
              {order.shippingProvince}، {order.shippingCity}
            </p>
            <p>{order.shippingAddress}</p>
            <p className="text-muted-foreground">
              کد پستی: <span dir="ltr">{order.shippingPostalCode || "---"}</span>
            </p>
          </div>
        </PanelCard>
      </div>

      <PanelCard>
        <div className="space-y-4">
          <h3 className="text-base font-semibold">اقلام سفارش</h3>
          <div className="space-y-3 text-sm">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-muted-foreground">
                  {item.product.name} - <span dir="ltr">{item.variant.size}</span> / {item.variant.color} - {item.quantity}
                </span>
                <span className="font-semibold persian-number">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-3">
            <Button asChild variant="outline">
              <Link href="/account/orders">بازگشت به سفارش‌ها</Link>
            </Button>
            <Button asChild>
              <Link
                href={
                  order.trackingCode
                    ? `/account/tracking?code=${order.trackingCode}`
                    : "/account/tracking"
                }
              >
                پیگیری مرسوله
              </Link>
            </Button>
          </div>
        </div>
      </PanelCard>
    </PanelContainer>
  )
}
