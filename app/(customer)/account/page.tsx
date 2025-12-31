import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SectionHeader } from "@/components/ui/section-header"
import { PanelContainer } from "@/components/account/panel-container"
import { PanelCard } from "@/components/account/panel-card"
import { StatusBadge } from "@/components/account/status-badge"
import { Package, Truck, CheckCircle2, ArrowUpRight } from "lucide-react"
import { formatDate, formatPrice } from "@/lib/utils"
import { ORDER_STATUS_LABELS_FA } from "@/lib/order-status"

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  const [totalOrders, shippedOrders, deliveredOrders, recentOrders] = userId
    ? await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.order.count({ where: { userId, status: "shipped" } }),
        prisma.order.count({ where: { userId, status: "delivered" } }),
        prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            createdAt: true,
            totalAmount: true,
            status: true,
          },
        }),
      ])
    : [0, 0, 0, []]

  return (
    <PanelContainer dir="rtl">
      <SectionHeader
        kicker="حساب کاربری"
        title={<h1 className="text-xl font-semibold">داشبورد شما</h1>}
        subtitle="مرور سریع سفارش‌ها و وضعیت ارسال در یک نگاه."
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <PanelCard className="border-primary/20">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">کل سفارش‌ها</p>
              <p className="text-2xl font-bold persian-number">{totalOrders}</p>
            </div>
          </div>
        </PanelCard>
        <PanelCard>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">در حال ارسال</p>
              <p className="text-2xl font-bold persian-number">{shippedOrders}</p>
            </div>
          </div>
        </PanelCard>
        <PanelCard>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تحویل‌شده</p>
              <p className="text-2xl font-bold persian-number">{deliveredOrders}</p>
            </div>
          </div>
        </PanelCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <PanelCard>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">آخرین سفارش‌ها</h3>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
              >
                مشاهده همه
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            {recentOrders.length ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">
                        سفارش <span dir="ltr">#{order.id.slice(0, 8)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-end space-y-1">
                      <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                      <StatusBadge variant="neutral">
                        {ORDER_STATUS_LABELS_FA[order.status]}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                هنوز سفارشی ثبت نشده است.
              </p>
            )}
          </div>
        </PanelCard>

        <PanelCard>
          <div className="space-y-3">
            <h3 className="text-base font-semibold">دسترسی سریع</h3>
            <p className="text-sm text-muted-foreground">
              پیگیری مرسوله یا مشاهده تاریخچه سفارش‌ها با یک کلیک.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/account/orders"
                className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
              >
                سفارش‌ها
              </Link>
              <Link
                href="/account/tracking"
                className="inline-flex items-center justify-center rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                پیگیری مرسوله
              </Link>
            </div>
          </div>
        </PanelCard>
      </div>
    </PanelContainer>
  )
}
