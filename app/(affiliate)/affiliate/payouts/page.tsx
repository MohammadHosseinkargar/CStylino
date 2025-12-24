"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AffiliatePayoutsPage() {
  const { toast } = useToast()
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["affiliate-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const handlePayoutRequest = async () => {
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      
      if (res.ok) {
        toast({
          title: "درخواست ثبت شد",
          description: "درخواست برداشت شما با موفقیت ثبت شد",
        })
      } else {
        throw new Error("Failed to request payout")
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ثبت درخواست برداشت",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const availableCommissions = dashboardData?.availableCommissions || 0

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">درخواست پرداخت</h1>
        <p className="text-muted-foreground">برداشت کمیسیون‌های خود</p>
      </div>

      <Card className="card-luxury bg-gradient-to-l from-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            موجودی قابل برداشت
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6">
            <div className="text-5xl font-bold mb-2">
              {formatPrice(availableCommissions)}
            </div>
            <p className="text-muted-foreground">موجودی شما</p>
          </div>
          
          <Button
            className="btn-editorial w-full"
            onClick={handlePayoutRequest}
            disabled={availableCommissions === 0}
          >
            درخواست برداشت
          </Button>
          
          {availableCommissions === 0 && (
            <p className="text-sm text-center text-muted-foreground">
              موجودی کافی برای برداشت ندارید
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="card-luxury">
        <CardHeader>
          <CardTitle>تاریخچه پرداخت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            هنوز پرداختی ثبت نشده است
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

