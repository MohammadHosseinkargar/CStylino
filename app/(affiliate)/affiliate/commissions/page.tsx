"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp } from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton-kit"

const getCommissionStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "available":
      return "قابل برداشت"
    case "paid":
      return "پرداخت‌شده"
    case "void":
      return "باطل‌شده"
    default:
      return "در حال بررسی"
  }
}

export default function AffiliateCommissionsPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["affiliate-commissions"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard")
      if (!res.ok) throw new Error("بارگیری داده‌ها امکان‌پذیر نیست")
      return res.json()
    },
  })

  const commissions = dashboardData?.user?.commissions || []

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="کمیسیون‌های من"
        subtitle="گزارش مالی کمیسیون‌ها و وضعیت هر برداشت"
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            کمیسیون‌های اخیر
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={6} />
          ) : commissions.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "order", header: "سفارش" },
                    { key: "level", header: "سطح" },
                    { key: "date", header: "تاریخ" },
                    { key: "amount", header: "مبلغ" },
                    { key: "status", header: "وضعیت" },
                  ]}
                  data={commissions}
                  renderRow={(commission: any) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-semibold">
                        سفارش #{commission.orderId?.slice(0, 8) || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        سطح {commission.level}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(commission.createdAt)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(commission.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getCommissionStatusLabel(commission.status)}
                      </TableCell>
                    </TableRow>
                  )}
                />
              </div>
              <div className="md:hidden space-y-4">
                {commissions.map((commission: any) => (
                  <ListCard
                    key={commission.id}
                    title={`سفارش #${commission.orderId?.slice(0, 8) || 'Unknown'}`}
                    subtitle={`سطح ${commission.level} · ${formatDate(commission.createdAt)}`}
                    meta={formatPrice(commission.amount)}
                  >
                    <div className="text-caption text-muted-foreground">
                      {getCommissionStatusLabel(commission.status)}
                    </div>
                  </ListCard>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6 text-muted-foreground" />}
              title="هنوز کمیسیونی ثبت نشده"
              description="فعلاً هیچ کمیسیونی برای نمایش وجود ندارد."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
