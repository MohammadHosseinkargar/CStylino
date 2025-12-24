"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatPrice } from "@/lib/utils"

export default function AffiliatePayoutsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: payoutData, isLoading, refetch } = useQuery({
    queryKey: ["affiliate-payouts"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/payouts")
      if (!res.ok) throw new Error("Failed to fetch")
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
        throw new Error(error?.error || "Failed to request payout")
      }

      toast({
        title: "Payout request submitted",
        description: "Your payout request is now pending review.",
      })
      await refetch()
    } catch (error) {
      toast({
        title: "Request failed",
        description:
          error instanceof Error ? error.message : "Unable to request payout",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const availableToRequest = payoutData?.availableToRequest || 0
  const minimumPayoutAmount = payoutData?.minimumPayoutAmount || 0
  const payouts = payoutData?.payouts || []

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">Payouts</h1>
        <p className="text-muted-foreground">
          Request your available affiliate balance.
        </p>
      </div>

      <Card className="card-luxury bg-gradient-to-l from-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Available balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6">
            <div className="text-5xl font-bold mb-2">
              {formatPrice(availableToRequest)}
            </div>
            <p className="text-muted-foreground">Available to request</p>
            <p className="text-xs text-muted-foreground mt-2">
              Minimum payout: {formatPrice(minimumPayoutAmount)}
            </p>
          </div>

          <Button
            className="btn-editorial w-full"
            onClick={handlePayoutRequest}
            disabled={availableToRequest < minimumPayoutAmount || isSubmitting}
          >
            Request payout
          </Button>

          {availableToRequest < minimumPayoutAmount && (
            <p className="text-sm text-center text-muted-foreground">
              You need a higher balance before requesting a payout.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="card-luxury">
        <CardHeader>
          <CardTitle>Recent payout requests</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length > 0 ? (
            <div className="space-y-4">
              {payouts.map((payout: any) => (
                <div
                  key={payout.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {formatPrice(payout.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(payout.createdAt)}
                    </div>
                  </div>
                  <div className="text-left text-xs text-muted-foreground capitalize">
                    {payout.status === "pending" && "Pending"}
                    {payout.status === "approved" && "Approved"}
                    {payout.status === "paid" && "Paid"}
                    {payout.status === "rejected" && "Rejected"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No payout requests yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
