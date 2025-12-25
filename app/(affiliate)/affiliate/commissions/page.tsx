"use client"

import { useEffect, useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"

const getCommissionStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "available":
      return "قابل برداشت"
    case "paid":
      return "پرداخت شده"
    case "void":
      return "باطل شده"
    default:
      return "نامشخص"
  }
}

export default function AffiliateCommissionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const appliedStatus = searchParams.get("status") || "all"
  const appliedStartDate = searchParams.get("startDate") || ""
  const appliedEndDate = searchParams.get("endDate") || ""

  const [status, setStatus] = useState(appliedStatus)
  const [startDate, setStartDate] = useState(appliedStartDate)
  const [endDate, setEndDate] = useState(appliedEndDate)

  useEffect(() => {
    setStatus(appliedStatus)
    setStartDate(appliedStartDate)
    setEndDate(appliedEndDate)
  }, [appliedStatus, appliedStartDate, appliedEndDate])

  const { data, isLoading } = useQuery({
    queryKey: [
      "affiliate-commissions",
      appliedStatus,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (appliedStatus && appliedStatus !== "all") {
        params.set("status", appliedStatus)
      }
      if (appliedStartDate) params.set("startDate", appliedStartDate)
      if (appliedEndDate) params.set("endDate", appliedEndDate)
      const query = params.toString()
      const res = await fetch(`/api/affiliate/commissions${query ? `?${query}` : ""}`)
      if (!res.ok) throw new Error("خطا در دریافت کمیسیون ها.")
      return res.json()
    },
  })

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (status && status !== "all") params.set("status", status)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    const query = params.toString()
    router.replace(`/affiliate/commissions${query ? `?${query}` : ""}`)
  }

  const handleClearFilters = () => {
    setStatus("all")
    setStartDate("")
    setEndDate("")
    router.replace("/affiliate/commissions")
  }

  const commissions = data?.commissions || []

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader title="کمیسیون ها" subtitle="فهرست کمیسیون ها و وضعیت آنها" />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>فیلترها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">از تاریخ</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">تا تاریخ</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">وضعیت</Label>
              <select
                id="status"
                className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">همه</option>
                <option value="pending">در انتظار</option>
                <option value="available">قابل برداشت</option>
                <option value="paid">پرداخت شده</option>
                <option value="void">باطل شده</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="btn-editorial" onClick={handleApplyFilters}>
              اعمال فیلتر
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              پاک کردن
            </Button>
          </div>
        </CardContent>
      </StyledCard>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            کمیسیون های اخیر
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
                    title={`سفارش #${commission.orderId?.slice(0, 8) || "N/A"}`}
                    subtitle={`سطح ${commission.level}`}
                    meta={formatPrice(commission.amount)}
                  >
                    <div className="text-caption text-muted-foreground">
                      {formatDate(commission.createdAt)}
                    </div>
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
              title="کمیسیونی ثبت نشده"
              description="هنوز کمیسیونی ثبت نشده است."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
