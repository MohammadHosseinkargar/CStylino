"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatPrice } from "@/lib/utils"

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const payouts = data?.payouts || []

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">Affiliate payouts</h1>
        <p className="text-muted-foreground">
          Review and process affiliate payout requests.
        </p>
      </div>

      <Card className="card-editorial">
        <CardHeader>
          <CardTitle>Payout requests</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length > 0 ? (
            <div className="space-y-4">
              {payouts.map((payout: any) => {
                const isProcessing = activeId === payout.id
                return (
                  <div
                    key={payout.id}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border border-border/40 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {payout.affiliate?.name || payout.affiliate?.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payout.affiliate?.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(payout.createdAt)}
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="font-bold">
                        {formatPrice(payout.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {payout.status}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="btn-editorial"
                        onClick={() => handleAction(payout.id, "approve")}
                        disabled={
                          isProcessing || payout.status !== "pending"
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(payout.id, "reject")}
                        disabled={isProcessing || payout.status === "paid"}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAction(payout.id, "markPaid")}
                        disabled={
                          isProcessing || payout.status !== "approved"
                        }
                      >
                        Mark paid
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No payout requests found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
