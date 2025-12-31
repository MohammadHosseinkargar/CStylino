"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QueryProvider } from "@/components/query-provider"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Wallet } from "lucide-react"

type PayoutAction = "approve" | "reject" | "markPaid"

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

function AdminPayoutsPageContent() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payouts")
      if (!res.ok) throw new Error("خطا در دریافت اطلاعات تسویه ها.")
      return res.json()
    },
  })

  const handleAction = async (id: string, action: PayoutAction) => {
    try {
      setActiveId(id)
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error?.error || "خطا در ثبت عملیات تسویه")
      }

      toast({
        title: "عملیات با موفقیت انجام شد",
        description: "وضعیت تسویه بروزرسانی شد.",
      })
      await queryClient.invalidateQueries({ queryKey: ["admin-payouts"] })
    } catch (error) {
      toast({
        title: "خطا",
        description:
          error instanceof Error ? error.message : "خطا در ثبت عملیات تسویه",
        variant: "destructive",
      })
    } finally {
      setActiveId(null)
    }
  }

  const payouts = data?.payouts || []

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader title="تسویه ها" subtitle="مدیریت درخواست های تسویه" />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>درخواست های تسویه</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={6} />
          ) : payouts.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "affiliate", header: "همکار" },
                    { key: "email", header: "ایمیل" },
                    { key: "date", header: "تاریخ" },
                    { key: "amount", header: "مبلغ" },
                    { key: "status", header: "وضعیت" },
                    { key: "actions", header: "عملیات" },
                  ]}
                  data={payouts}
                  renderRow={(payout: any) => {
                    const isProcessing = activeId === payout.id
                    return (
                      <TableRow key={payout.id}>
                        <TableCell className="font-semibold">
                          {payout.affiliate?.name || payout.affiliate?.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payout.affiliate?.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(payout.createdAt)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(payout.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getPayoutStatusLabel(payout.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="btn-editorial"
                              onClick={() => handleAction(payout.id, "approve")}
                              disabled={isProcessing || payout.status !== "pending"}
                            >
                              تایید
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(payout.id, "reject")}
                              disabled={isProcessing || payout.status === "paid"}
                            >
                              رد
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAction(payout.id, "markPaid")}
                              disabled={isProcessing || payout.status !== "approved"}
                            >
                              ثبت پرداخت
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }}
                />
              </div>
              <div className="md:hidden space-y-4">
                {payouts.map((payout: any) => {
                  const isProcessing = activeId === payout.id
                  return (
                    <ListCard
                      key={payout.id}
                      title={payout.affiliate?.name || payout.affiliate?.email}
                      subtitle={payout.affiliate?.email}
                      meta={formatPrice(payout.amount)}
                      actions={
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="btn-editorial"
                            onClick={() => handleAction(payout.id, "approve")}
                            disabled={isProcessing || payout.status !== "pending"}
                          >
                            تایید
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(payout.id, "reject")}
                            disabled={isProcessing || payout.status === "paid"}
                          >
                            رد
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAction(payout.id, "markPaid")}
                            disabled={isProcessing || payout.status !== "approved"}
                          >
                            ثبت پرداخت
                          </Button>
                        </div>
                      }
                    >
                      <div className="text-caption text-muted-foreground">
                        {formatDate(payout.createdAt)}
                      </div>
                      <div className="text-caption text-muted-foreground">
                        {getPayoutStatusLabel(payout.status)}
                      </div>
                    </ListCard>
                  )
                })}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Wallet className="h-6 w-6 text-muted-foreground" />}
              title="درخواستی ثبت نشده"
              description="هنوز درخواستی برای تسویه ثبت نشده است."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}

export default function AdminPayoutsPage() {
  return (
    <QueryProvider>
      <AdminPayoutsPageContent />
    </QueryProvider>
  )
}
