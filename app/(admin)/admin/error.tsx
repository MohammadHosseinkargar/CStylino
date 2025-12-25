"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
      <Card className="card-editorial max-w-md">
        <CardContent className="p-12 text-center">
          <h1 className="text-hero font-bold mb-4">مشکلی پیش آمد</h1>
          <p className="text-body text-muted-foreground mb-8 leading-relaxed">
            در بارگذاری این بخش مشکلی رخ داد. لطفا دوباره تلاش کنید.
          </p>
          <Button className="btn-editorial" onClick={reset}>
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
