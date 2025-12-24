"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Wallet, TrendingUp, Users, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

export default function AffiliateDashboard() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const { data: userData } = useQuery({
    queryKey: ["affiliate-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const {
    user,
    availableCommissions,
    pendingCommissions,
    paidCommissions,
    level1Commissions,
    level2Commissions,
  } = userData

  if (!user || !user.affiliateCode) return null

  const affiliateLink = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/store?ref=${user.affiliateCode}`

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "کپی شد",
        description: "لینک معرفی در کلیپ‌بورد کپی شد",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "خطا",
        description: "خطا در کپی کردن لینک",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">پنل همکاری</h1>
        <p className="text-muted-foreground">مدیریت کمیسیون‌ها و زیرمجموعه‌ها</p>
      </div>

      {/* Affiliate Code */}
      <Card className="card-luxury bg-gradient-to-l from-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">کد معرف شما</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold font-mono tracking-wider">{user.affiliateCode}</p>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleCopy(user.affiliateCode)}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <p className="text-sm text-muted-foreground mb-2">لینک معرفی</p>
              <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-xl">
                <code className="text-xs flex-1 truncate">{affiliateLink}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(affiliateLink)}
                >
                  {copied ? "کپی شد!" : "کپی"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              موجودی قابل برداشت
            </CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(availableCommissions)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">آماده برداشت</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              در انتظار تایید
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(pendingCommissions)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">در حال بررسی</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              پرداخت شده
            </CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(paidCommissions)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">کل پرداخت‌ها</p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              زیرمجموعه‌ها
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold persian-number">
              {user.subAffiliates?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">همکار فعال</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle>کمیسیون سطح 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatPrice(level1Commissions)}
            </div>
            <p className="text-sm text-muted-foreground">
              فروش مستقیم شما (۱۰٪)
            </p>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader>
            <CardTitle>کمیسیون سطح 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatPrice(level2Commissions)}
            </div>
            <p className="text-sm text-muted-foreground">
              فروش زیرمجموعه‌های شما (۵٪)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
