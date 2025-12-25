"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function OrderShippingForm({
  orderId,
  initialCarrier,
  initialTrackingCode,
}: {
  orderId: string
  initialCarrier?: string | null
  initialTrackingCode?: string | null
}) {
  const router = useRouter()
  const { toast, dismiss } = useToast()
  const [shippingCarrier, setShippingCarrier] = useState(initialCarrier || "")
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    dismiss()
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipping`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingCarrier: shippingCarrier.trim(),
          trackingCode: trackingCode.trim(),
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "خطا در ثبت اطلاعات ارسال.")
      }
      toast({
        title: "اطلاعات ارسال ثبت شد",
        description: "اطلاعات ارسال با موفقیت ذخیره شد.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "خطا در ثبت اطلاعات ارسال",
        description: error.message || "خطا در ثبت اطلاعات ارسال.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={shippingCarrier}
        onChange={(event) => setShippingCarrier(event.target.value)}
        placeholder="نام شرکت حمل"
        className="w-full px-3 py-2 border border-input rounded-md bg-background"
      />
      <input
        value={trackingCode}
        onChange={(event) => setTrackingCode(event.target.value)}
        placeholder="کد رهگیری"
        className="w-full px-3 py-2 border border-input rounded-md bg-background"
      />
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "در حال ثبت..." : "ثبت اطلاعات ارسال"}
      </Button>
    </div>
  )
}
