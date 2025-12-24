"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { SkeletonTable } from "@/components/ui/skeleton-kit"

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
    return "????? ????? ???? ????."
  }
  if (payload.flatShippingCost < 0) {
    return "????? ????? ???????? ???? ????."
  }
  if (Number.isNaN(payload.commissionLevel1Percent)) {
    return "???? ??????? ??? ? ???? ????."
  }
  if (payload.commissionLevel1Percent < 0 || payload.commissionLevel1Percent > 100) {
    return "???? ??????? ??? ? ???? ??? ? ?? ??? ????."
  }
  if (Number.isNaN(payload.commissionLevel2Percent)) {
    return "???? ??????? ??? ? ???? ????."
  }
  if (payload.commissionLevel2Percent < 0 || payload.commissionLevel2Percent > 100) {
    return "???? ??????? ??? ? ???? ??? ? ?? ??? ????."
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
        throw new Error(error.error || "??? ?? ?????? ???????.")
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
        throw new Error(error.error || "??? ?? ?????????? ???????.")
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
        title: "??????",
        description: "??????? ?? ?????? ?????????? ??.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "???",
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
        title: "???",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    saveMutation.mutate(payload)
  }

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="???????"
        subtitle="?????? ????????? ? ????? ?????"
      />

      {isLoading ? (
        <SkeletonTable rows={4} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StyledCard variant="elevated">
            <CardHeader>
              <CardTitle>??????? ???????</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="level1Commission">???? ??????? ??? ? (????)</Label>
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
                <Label htmlFor="level2Commission">???? ??????? ??? ? (????)</Label>
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
                {saveMutation.isPending ? "?? ??? ?????..." : "????? ???????"}
              </Button>
            </CardContent>
          </StyledCard>

          <StyledCard variant="elevated">
            <CardHeader>
              <CardTitle>??????? ?????</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="shippingCost">????? ????? ???? (?????)</Label>
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
                {saveMutation.isPending ? "?? ??? ?????..." : "????? ???????"}
              </Button>
            </CardContent>
          </StyledCard>
        </div>
      )}
    </PageContainer>
  )
}
