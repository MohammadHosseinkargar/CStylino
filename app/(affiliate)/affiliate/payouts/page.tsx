"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatPrice } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton-kit"

const getPayoutStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "approved":
      return "در حال تایید"
    case "paid":
      return "پرداخت‌شده"
    case "rejected":
      return "رد شده"
    default:
      return "در حال بررسی"
  }
}

export default function AffiliatePayoutsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: payoutData, isLoading, refetch } = useQuery({
    queryKey: ["affiliate-payouts"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/payouts")
      if (!res.ok) throw new Error("بارگیری داده‌های برداشت ممکن نیست")
      return res.json()
    },
  })

  const handlePayoutRequest = async () => {
    try {
      setIsSubmitting(true)
      const res = await fetch("/api/affiliate/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payoutData?.availableToRequest || 0 }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error?.error || "درخواست برداشت امکان‌پذیر نیست")
      }

      toast({
        title: "درخواست برداشت ثبت شد",
        description: "تقاضای برداشت شما با موفقیت ارسال شد.",
      })
      await refetch()
    } catch (error) {
      toast({
        title: "خطا",
        description:
          error instanceof Error ? error.message : "امکان ثبت درخواست وجود ندارد",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableToRequest = payoutData?.availableToRequest || 0
  const minimumPayoutAmount = payoutData?.minimumPayoutAmount || 0
  const payouts = payoutData?.payouts || []

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="درخواست‌های برداشت"
        subtitle="مدیریت موجودی و تاریخچه برداشت‌ها"
      />

      <StyledCard variant="glass" className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            موجودی قابل برداشت
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6">
            <div className="text-5xl font-bold mb-2">{formatPrice(availableToRequest)}</div>
            <p className="text-muted-foreground">موجودی فعلی شما</p>
            <p className="text-xs text-muted-foreground mt-2">
              حداقل برداشت: {formatPrice(minimumPayoutAmount)}
            </p>
          </div>

          <Button
            className="btn-editorial w-full"
            onClick={handlePayoutRequest}
            disabled={availableToRequest < minimumPayoutAmount || isSubmitting}
          >
            {isSubmitting ? "در حال ارسال درخواست..." : "درخواست برداشت"}
          </Button>

          {availableToRequest < minimumPayoutAmount && (
            <p className="text-sm text-center text-muted-foreground">
              برای ثبت درخواست برداشت حداقل به {formatPrice(minimumPayoutAmount)} نیاز است.
            </p>
          )}
        </CardContent>
      </StyledCard>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>سوابق برداشت</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={5} />
          ) : payouts.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "amount", header: "مبلغ" },
                    { key: "date", header: "تاریخ" },
                    { key: "status", header: "وضعیت" },
                  ]}
                  data={payouts}
                  renderRow={(payout: any) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-semibold">
                        {formatPrice(payout.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(payout.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getPayoutStatusLabel(payout.status)}
                      </TableCell>
                    </TableRow>
                  )}
                />
              </div>
              <div className="md:hidden space-y-4">
                {payouts.map((payout: any) => (
                  <ListCard
                    key={payout.id}
                    title={formatPrice(payout.amount)}
                    subtitle={formatDate(payout.createdAt)}
                    meta={getPayoutStatusLabel(payout.status)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Wallet className="h-6 w-6 text-muted-foreground" />}
              title="هنوز درخواستی ثبت نشده"
              description="پس از ثبت اولین برداشت، سابقه در اینجا نمایش داده می‌شود."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
