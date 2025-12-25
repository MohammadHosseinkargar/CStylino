"use client"

import { useEffect, useRef } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { TrendingUp, Package, Users, ShoppingCart } from "lucide-react"
import { StyledCard } from "@/components/ui/styled-card"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import gsap from "gsap"

interface RecentOrder {
  id: string
  createdAt: Date
  totalAmount: number
  status: string
  user: {
    name: string | null
    email: string | null
  }
}

interface DashboardClientProps {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  recentOrders: RecentOrder[]
}

const getOrderStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "processing":
      return "در حال پردازش"
    case "shipped":
      return "ارسال شده"
    case "delivered":
      return "تحویل داده شده"
    case "canceled":
      return "کنسل شده"
    case "refunded":
      return "بازپرداخت‌شده"
    default:
      return "در حال بررسی"
  }
}

export function DashboardClient({
  totalOrders,
  totalRevenue,
  totalProducts,
  totalUsers,
  recentOrders,
}: DashboardClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dashboard-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })

      gsap.from(".recent-order-item", {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        delay: 0.4,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <PageContainer className="space-y-8 py-6" dir="rtl">
      <div ref={containerRef}>
        <SectionHeader
          title="داشبورد"
          subtitle="بازبینی سریع عملکرد فروشگاه"
          className="dashboard-card"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StyledCard variant="elevated" className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                سفارش‌های ثبت‌شده
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold persian-number">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">کل سفارش‌ها</p>
            </CardContent>
          </StyledCard>

          <StyledCard variant="elevated" className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                درآمد خالص
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatPrice(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">درآمد خالص از سفارش‌ها</p>
            </CardContent>
          </StyledCard>

          <StyledCard variant="elevated" className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                محصولات فعال
              </CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold persian-number">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">محصول موجود</p>
            </CardContent>
          </StyledCard>

          <StyledCard variant="elevated" className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                کاربران فعال
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold persian-number">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">کاربران ثبت‌شده</p>
            </CardContent>
          </StyledCard>
        </div>

        <StyledCard variant="elevated" className="dashboard-card">
          <CardHeader>
            <CardTitle>سفارش‌های اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-accent/50 transition-colors recent-order-item"
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
                        {getOrderStatusLabel(order.status)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  هنوز سفارش جدیدی ثبت نشده است
                </div>
              )}
            </div>
          </CardContent>
        </StyledCard>
      </div>
    </PageContainer>
  )
}
