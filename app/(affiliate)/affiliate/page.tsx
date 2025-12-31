"use client"

import { formatPrice } from "@/lib/utils"
import { Wallet, TrendingUp, Users, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { QueryProvider } from "@/components/query-provider"
import { Container } from "@/components/ui/container"
import { SectionHeader } from "@/components/ui/section-header"
import { SkeletonTable } from "@/components/ui/skeleton-kit"
import { GlassCard } from "@/components/ui/glass-card"
import { Surface } from "@/components/ui/surface"

function AffiliateDashboardContent() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const { data: userData } = useQuery({
    queryKey: ["affiliate-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard")
      if (!res.ok) throw new Error("دریافت اطلاعات همکاری ناموفق بود.")
      return res.json()
    },
  })

  if (!userData) {
    return (
      <Container className="py-10" dir="rtl">
        <SkeletonTable rows={4} />
      </Container>
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
        description: "لینک به کلیپ‌بورد منتقل شد.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "خطا",
        description: "کپی انجام نشد.",
        variant: "destructive",
      })
    }
  }

  return (
    <Container className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader title="داشبورد همکاری" subtitle="خلاصه عملکرد شما" />

      <GlassCard className="border-primary/20">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">کد همکاری</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold font-mono tracking-wider" dir="ltr">
                  {user.affiliateCode}
                </p>
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
                <code className="text-xs flex-1 truncate" dir="ltr">{affiliateLink}</code>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(affiliateLink)}>
                  {copied ? "کپی شد" : "کپی لینک"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">قابل برداشت</div>
              <div className="text-2xl font-bold mt-2">{formatPrice(availableCommissions)}</div>
            </div>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">قابل تسویه</p>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">در انتظار</div>
              <div className="text-2xl font-bold mt-2">{formatPrice(pendingCommissions)}</div>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">کمیسیون‌های تایید نشده</p>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">پرداخت‌شده</div>
              <div className="text-2xl font-bold mt-2">{formatPrice(paidCommissions)}</div>
            </div>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">تسویه‌های انجام‌شده</p>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">زیرمجموعه‌ها</div>
              <div className="text-2xl font-bold persian-number mt-2">
                {user.subAffiliates?.length || 0}
              </div>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">همکاران فعال</p>
        </Surface>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Surface className="p-6">
          <div className="text-base font-semibold">کمیسیون سطح ۱</div>
          <div className="text-3xl font-bold mb-2 mt-4">{formatPrice(level1Commissions)}</div>
          <p className="text-sm text-muted-foreground">از فروش مستقیم شما</p>
        </Surface>

        <Surface className="p-6">
          <div className="text-base font-semibold">کمیسیون سطح ۲</div>
          <div className="text-3xl font-bold mb-2 mt-4">{formatPrice(level2Commissions)}</div>
          <p className="text-sm text-muted-foreground">از زیرمجموعه‌ها</p>
        </Surface>
      </div>
    </Container>
  )
}

export default function AffiliateDashboard() {
  return (
    <QueryProvider>
      <AffiliateDashboardContent />
    </QueryProvider>
  )
}
