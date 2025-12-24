"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"

export default function AffiliateSubAffiliatesPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["affiliate-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const subAffiliates = dashboardData?.user?.subAffiliates || []

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div>
        <h1 className="text-4xl font-bold mb-2">زیرمجموعه‌ها</h1>
        <p className="text-muted-foreground">همکارانی که از طریق شما ثبت‌نام کرده‌اند</p>
      </div>

      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            لیست زیرمجموعه‌ها ({subAffiliates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subAffiliates.length > 0 ? (
            <div className="space-y-4">
              {subAffiliates.map((subAffiliate: any) => (
                <div
                  key={subAffiliate.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {subAffiliate.name || subAffiliate.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      کد: {subAffiliate.affiliateCode} • {formatDate(subAffiliate.createdAt)}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                      فعال
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              هنوز زیرمجموعه‌ای ثبت نشده است
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

