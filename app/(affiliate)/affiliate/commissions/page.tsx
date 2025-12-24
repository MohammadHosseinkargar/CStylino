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

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="?????????"
        subtitle="?????? ?????????? ???"
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ???? ?????????
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
                    { key: "order", header: "?????" },
                    { key: "level", header: "???" },
                    { key: "date", header: "?????" },
                    { key: "amount", header: "????" },
                    { key: "status", header: "?????" },
                  ]}
                  data={commissions}
                  renderRow={(commission: any) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-semibold">
                        ????? #{commission.orderId?.slice(0, 8) || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">??? {commission.level}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(commission.createdAt)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(commission.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {commission.status === "pending" && "?? ??????"}
                        {commission.status === "available" && "???? ??????"}
                        {commission.status === "paid" && "?????? ???"}
                        {commission.status === "void" && "???? ???"}
                      </TableCell>
                    </TableRow>
                  )}
                />
              </div>
              <div className="md:hidden space-y-4">
                {commissions.map((commission: any) => (
                  <ListCard
                    key={commission.id}
                    title={`????? #${commission.orderId?.slice(0, 8) || "N/A"}`}
                    subtitle={`??? ${commission.level} • ${formatDate(commission.createdAt)}`}
                    meta={formatPrice(commission.amount)}
                  >
                    <div className="text-caption text-muted-foreground">
                      {commission.status === "pending" && "?? ??????"}
                      {commission.status === "available" && "???? ??????"}
                      {commission.status === "paid" && "?????? ???"}
                      {commission.status === "void" && "???? ???"}
                    </div>
                  </ListCard>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6 text-muted-foreground" />}
              title="???????? ???? ???"
              description="???? ???????? ??? ???? ???."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
