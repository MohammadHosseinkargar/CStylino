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
import Link from "next/link"

const getPayoutStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "approved":
      return "تایید شده"
    case "paid":
      return "پرداخت شده"
    case "rejected":
      return "رد شده"
    default:
      return "نامشخص"
  }
}

export default function AffiliatePayoutsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: payoutData, isLoading, refetch } = useQuery({
    queryKey: ["affiliate-payouts"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/payouts")
      if (!res.ok) throw new Error("خطا در دریافت اطلاعات تسویه ها.")
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
        throw new Error(error?.error || "خطا در ثبت درخواست تسویه.")
      }

      toast({
        title: "درخواست تسویه ثبت شد",
        description: "درخواست شما ثبت شد و در حال بررسی است.",
      })
      await refetch()
    } catch (error) {
      toast({
        title: "خطا",
        description:
          error instanceof Error ? error.message : "خطا در ثبت درخواست تسویه.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableToRequest = payoutData?.availableToRequest || 0
  const minimumPayoutAmount = payoutData?.minimumPayoutAmount || 0
  const payouts = payoutData?.payouts || []
  const bankInfoComplete = payoutData?.bankInfoComplete ?? false
  const canRequest =
    bankInfoComplete && availableToRequest >= minimumPayoutAmount && !isSubmitting

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader title="تسویه ها" subtitle="درخواست برداشت و وضعیت تسویه ها" />

      <StyledCard variant="glass" className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            موجودی قابل برداشت
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6">
            <div className="text-5xl font-bold mb-2">
              {formatPrice(availableToRequest)}
            </div>
            <p className="text-muted-foreground">موجودی قابل درخواست</p>
            <p className="text-xs text-muted-foreground mt-2">
              حداقل مبلغ تسویه: {formatPrice(minimumPayoutAmount)}
            </p>
          </div>

          <Button
            className="btn-editorial w-full"
            onClick={handlePayoutRequest}
            disabled={!canRequest}
          >
            {isSubmitting ? "در حال ارسال درخواست..." : "درخواست تسویه"}
          </Button>

          {!bankInfoComplete && (
            <p className="text-sm text-center text-destructive">
              برای ثبت درخواست تسویه، ابتدا اطلاعات بانکی را در{" "}
              <Link href="/affiliate/settings" className="underline">
                تنظیمات
              </Link>{" "}
              تکمیل کنید.
            </p>
          )}

          {bankInfoComplete && availableToRequest < minimumPayoutAmount && (
            <p className="text-sm text-center text-muted-foreground">
              حداقل مبلغ برای تسویه {formatPrice(minimumPayoutAmount)} است.
            </p>
          )}
        </CardContent>
      </StyledCard>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>سوابق تسویه</CardTitle>
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
              title="درخواستی ثبت نشده"
              description="هنوز درخواست تسویه ای ثبت نشده است."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
