"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const DEFAULT_FORM = {
  flatShippingCost: "50000",
  commissionLevel1Percent: "10",
  commissionLevel2Percent: "5",
}

const toNumber = (value: string) => Number.parseInt(value, 10)

const validateSettings = (payload: {
  flatShippingCost: number
  commissionLevel1Percent: number
  commissionLevel2Percent: number
}) => {
  if (Number.isNaN(payload.flatShippingCost)) {
    return "هزینه ارسال عددی نیست."
  }
  if (payload.flatShippingCost < 0) {
    return "هزینه ارسال نمی‌تواند منفی باشد."
  }
  if (Number.isNaN(payload.commissionLevel1Percent)) {
    return "درصد کمیسیون سطح ۲ عددی نیست."
  }
  if (payload.commissionLevel1Percent < 0 || payload.commissionLevel1Percent > 100) {
    return "درصد کمیسیون سطح ۲ باید بین ۰ تا ۱۰۰ باشد."
  }
  if (Number.isNaN(payload.commissionLevel2Percent)) {
    return "درصد کمیسیون سطح ۲ عددی نیست."
  }
  if (payload.commissionLevel2Percent < 0 || payload.commissionLevel2Percent > 100) {
    return "درصد کمیسیون سطح ۲ باید بین ۰ تا ۱۰۰ باشد."
  }
  return null
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState(DEFAULT_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings")
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "خطا در دریافت تنظیمات.")
      }
      return res.json()
    },
  })

  useEffect(() => {
    if (!data) return
    setFormData({
      flatShippingCost: String(data.flatShippingCost ?? DEFAULT_FORM.flatShippingCost),
      commissionLevel1Percent: String(
        data.commissionLevel1Percent ?? DEFAULT_FORM.commissionLevel1Percent
      ),
      commissionLevel2Percent: String(
        data.commissionLevel2Percent ?? DEFAULT_FORM.commissionLevel2Percent
      ),
    })
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      flatShippingCost: number
      commissionLevel1Percent: number
      commissionLevel2Percent: number
    }) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "خطا در به‌روزرسانی تنظیمات.")
      }
      return res.json()
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
      setFormData({
        flatShippingCost: String(updated.flatShippingCost),
        commissionLevel1Percent: String(updated.commissionLevel1Percent),
        commissionLevel2Percent: String(updated.commissionLevel2Percent),
      })
      toast({
        title: "موفقیت",
        description: "تنظیمات با موفقیت به‌روزرسانی شد.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSave = () => {
    const payload = {
      flatShippingCost: toNumber(formData.flatShippingCost),
      commissionLevel1Percent: toNumber(formData.commissionLevel1Percent),
      commissionLevel2Percent: toNumber(formData.commissionLevel2Percent),
    }

    const validationError = validateSettings(payload)
    if (validationError) {
      toast({
        title: "خطا",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    saveMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold mb-2">تنظیمات</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          مدیریت کمیسیون‌ها و هزینه ارسال
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>تنظیمات کمیسیون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="level1Commission">درصد کمیسیون سطح ۱ (درصد)</Label>
              <Input
                id="level1Commission"
                type="number"
                min={0}
                max={100}
                value={formData.commissionLevel1Percent}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    commissionLevel1Percent: event.target.value,
                  })
                }
                className="persian-number"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="level2Commission">درصد کمیسیون سطح ۲ (درصد)</Label>
              <Input
                id="level2Commission"
                type="number"
                min={0}
                max={100}
                value={formData.commissionLevel2Percent}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    commissionLevel2Percent: event.target.value,
                  })
                }
                className="persian-number"
              />
            </div>
            <Button
              className="btn-editorial w-full"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </Button>
          </CardContent>
        </Card>

        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>تنظیمات ارسال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="shippingCost">هزینه ارسال ثابت (تومان)</Label>
              <Input
                id="shippingCost"
                type="number"
                min={0}
                value={formData.flatShippingCost}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    flatShippingCost: event.target.value,
                  })
                }
                className="persian-number"
              />
            </div>
            <Button
              className="btn-editorial w-full"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
