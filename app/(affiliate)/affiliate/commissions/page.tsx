"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp } from "lucide-react"

export default function AffiliateCommissionsPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["affiliate-commissions"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const commissions = dashboardData?.user?.commissions || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">کمیسیون‌ها</h1>
        <p className="text-muted-foreground">تاریخچه و وضعیت کمیسیون‌های شما</p>
      </div>

      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            لیست کمیسیون‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissions && commissions.length > 0 ? (
            <div className="space-y-4">
              {commissions.map((commission: any) => (
                <div
                  key={commission.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">
                      سفارش #{commission.orderId?.slice(0, 8) || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      سطح {commission.level} • {formatDate(commission.createdAt)}
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-bold">{formatPrice(commission.amount)}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {commission.status === "pending" && "در انتظار"}
                      {commission.status === "available" && "در دسترس"}
                      {commission.status === "paid" && "پرداخت شده"}
                      {commission.status === "void" && "باطل شده"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              هنوز کمیسیونی ثبت نشده است
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

