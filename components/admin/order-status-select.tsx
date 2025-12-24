"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OrderStatus } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
  refunded: "Refunded",
}

const statusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]

export function OrderStatusSelect({
  orderId,
  initialStatus,
}: {
  orderId: string
  initialStatus: OrderStatus
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update status")
      }
      toast({
        title: "Status updated",
        description: "Order status updated successfully.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as OrderStatus)}
        className="w-full sm:w-56 px-3 py-2 border border-input rounded-md bg-background"
      >
        {statusOptions.map((value) => (
          <option key={value} value={value}>
            {statusLabels[value]}
          </option>
        ))}
      </select>
      <Button onClick={handleSave} disabled={isSaving || status === initialStatus}>
        {isSaving ? "Saving..." : "Update"}
      </Button>
    </div>
  )
}
