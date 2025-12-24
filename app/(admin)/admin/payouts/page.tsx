"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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

export default function AdminPayoutsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payouts")
      if (!res.ok) throw new Error("Failed to fetch")
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
        throw new Error(error?.error || "Failed to update payout")
      }

      toast({
        title: "Payout updated",
        description: "The payout status has been updated successfully.",
      })
      await queryClient.invalidateQueries({ queryKey: ["admin-payouts"] })
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Unable to update payout",
        variant: "destructive",
      })
    } finally {
      setActiveId(null)
    }
  }

  const payouts = data?.payouts || []

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="?????????? ??????"
        subtitle="????? ? ????? ?????????? ??????"
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>?????????</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={6} />
          ) : payouts.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "affiliate", header: "??????" },
                    { key: "email", header: "?????" },
                    { key: "date", header: "?????" },
                    { key: "amount", header: "????" },
                    { key: "status", header: "?????" },
                    { key: "actions", header: "" },
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
                        <TableCell className="text-muted-foreground capitalize">
                          {payout.status}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="btn-editorial"
                              onClick={() => handleAction(payout.id, "approve")}
                              disabled={isProcessing || payout.status !== "pending"}
                            >
                              ?????
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(payout.id, "reject")}
                              disabled={isProcessing || payout.status === "paid"}
                            >
                              ??
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAction(payout.id, "markPaid")}
                              disabled={isProcessing || payout.status !== "approved"}
                            >
                              ?????? ??
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
                            ?????
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(payout.id, "reject")}
                            disabled={isProcessing || payout.status === "paid"}
                          >
                            ??
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAction(payout.id, "markPaid")}
                            disabled={isProcessing || payout.status !== "approved"}
                          >
                            ?????? ??
                          </Button>
                        </div>
                      }
                    >
                      <div className="text-caption text-muted-foreground">
                        {formatDate(payout.createdAt)}
                      </div>
                      <div className="text-caption text-muted-foreground capitalize">
                        {payout.status}
                      </div>
                    </ListCard>
                  )
                })}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Wallet className="h-6 w-6 text-muted-foreground" />}
              title="???????? ???? ???"
              description="???? ???????? ??? ???? ???."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
