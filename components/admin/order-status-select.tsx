"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OrderStatus } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

const statusLabels: Record<OrderStatus, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شد",
  delivered: "تحویل شد",
  canceled: "لغو شد",
  refunded: "بازپرداخت شد",
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
        throw new Error(error.error || "خطا در به روزرسانی وضعیت")
      }
      toast({
        title: "وضعیت به روزرسانی شد",
        description: "وضعیت سفارش با موفقیت ثبت شد.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "خطا",
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
        {isSaving ? "در حال ذخیره..." : "ثبت وضعیت"}
      </Button>
    </div>
  )
}
