"use client"

import { useCallback } from "react"
import type { FormEvent } from "react"
import { MessageCircle } from "lucide-react"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Surface } from "@/components/ui/surface"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ReviewsSection() {
  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }, [])

  return (
    <section id="reviews" className="space-y-8">
      <SectionHeader
        title="نقد و بررسی مشتریان"
        subtitle="تجربه خرید خود را با دیگران به اشتراک بگذارید تا انتخاب بهتری داشته باشند."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Surface className="p-6 md:p-8">
          <EmptyState
            icon={<MessageCircle className="h-6 w-6 text-muted-foreground" />}
            title="هنوز نظری ثبت نشده است"
            description="اولین نفری باشید که تجربه خرید خود را درباره این محصول ثبت می‌کند."
          />
        </Surface>
        <Surface className="p-6 md:p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">نام و نام خانوادگی</label>
              <Input placeholder="مثال: مهدی رضایی" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">ایمیل</label>
              <Input placeholder="مثال: name@example.com" type="email" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">متن نظر</label>
              <textarea
                className="min-h-[120px] w-full rounded-2xl border-2 border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:border-primary/50 transition-all duration-300"
                placeholder="نظر خود را درباره کیفیت، سایزبندی و تجربه خرید بنویسید."
              />
            </div>
            <Button type="submit" className="h-12 rounded-2xl px-6">
              ثبت نظر
            </Button>
          </form>
        </Surface>
      </div>
    </section>
  )
}
