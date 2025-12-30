"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updateHomepageHeroContent } from "@/app/(admin)/admin/homepage/actions"
import { DEFAULT_HOMEPAGE_HERO } from "@/lib/homepage-content"
import type { HomepageHeroContent } from "@/lib/homepage-content"

const MAX_HEADLINE = 140
const MAX_SUBHEADLINE = 180

type MessageState = { type: "success" | "error"; text: string } | null

type HomepageHeroFormProps = {
  initialContent: HomepageHeroContent
}

export function HomepageHeroForm({ initialContent }: HomepageHeroFormProps) {
  const [headline, setHeadline] = useState(initialContent.heroHeadline)
  const [subheadline, setSubheadline] = useState(initialContent.heroSubheadline)
  const [heroEnabled, setHeroEnabled] = useState(initialContent.heroEnabled)
  const [message, setMessage] = useState<MessageState>(null)
  const [isPending, startTransition] = useTransition()
  const [snapshot, setSnapshot] = useState(initialContent)

  const validation = useMemo(() => {
    const trimmedHeadline = headline.trim()
    const trimmedSubheadline = subheadline.trim()
    const errors: { headline?: string; subheadline?: string } = {}

    if (!trimmedHeadline) {
      errors.headline = "تیتر نمی‌تواند خالی باشد."
    } else if (trimmedHeadline.length > MAX_HEADLINE) {
      errors.headline = `حداکثر ${MAX_HEADLINE} کاراکتر مجاز است.`
    }

    if (!trimmedSubheadline) {
      errors.subheadline = "زیرتیتر نمی‌تواند خالی باشد."
    } else if (trimmedSubheadline.length > MAX_SUBHEADLINE) {
      errors.subheadline = `حداکثر ${MAX_SUBHEADLINE} کاراکتر مجاز است.`
    }

    return {
      errors,
      trimmedHeadline,
      trimmedSubheadline,
    }
  }, [headline, subheadline])

  const hasErrors = Boolean(validation.errors.headline || validation.errors.subheadline)
  const isDirty =
    snapshot.heroHeadline !== headline ||
    snapshot.heroSubheadline !== subheadline ||
    snapshot.heroEnabled !== heroEnabled

  const previewHeadline = heroEnabled ? headline : DEFAULT_HOMEPAGE_HERO.heroHeadline
  const previewSubheadline = heroEnabled
    ? subheadline
    : DEFAULT_HOMEPAGE_HERO.heroSubheadline

  const handleSubmit = () => {
    setMessage(null)

    if (hasErrors) {
      setMessage({ type: "error", text: "لطفا خطاهای فرم را برطرف کنید." })
      return
    }

    startTransition(async () => {
      const result = await updateHomepageHeroContent({
        heroHeadline: validation.trimmedHeadline,
        heroSubheadline: validation.trimmedSubheadline,
        heroEnabled,
      })

      if (result?.ok) {
        setMessage({ type: "success", text: result.message })
        setSnapshot({
          heroHeadline: validation.trimmedHeadline,
          heroSubheadline: validation.trimmedSubheadline,
          heroEnabled,
        })
      } else {
        setMessage({
          type: "error",
          text: result?.message || "ذخیره‌سازی ناموفق بود.",
        })
      }
    })
  }

  return (
    <div className="space-y-10" dir="rtl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <div>
            <label className="block text-body font-semibold mb-2" htmlFor="heroHeadline">
              تیتر اصلی
            </label>
            <textarea
              id="heroHeadline"
              className="w-full min-h-[120px] rounded-lg border border-border bg-background p-4 text-body focus-editorial"
              maxLength={MAX_HEADLINE}
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="تیتر اصلی صفحه نخست"
            />
            <div className="mt-2 flex items-center justify-between text-caption text-muted-foreground">
              <span>{validation.errors.headline || " "}</span>
              <span>{headline.trim().length}/{MAX_HEADLINE}</span>
            </div>
          </div>

          <div>
            <label className="block text-body font-semibold mb-2" htmlFor="heroSubheadline">
              زیرتیتر
            </label>
            <textarea
              id="heroSubheadline"
              className="w-full min-h-[120px] rounded-lg border border-border bg-background p-4 text-body focus-editorial"
              maxLength={MAX_SUBHEADLINE}
              value={subheadline}
              onChange={(event) => setSubheadline(event.target.value)}
              placeholder="زیرتیتر صفحه نخست"
            />
            <div className="mt-2 flex items-center justify-between text-caption text-muted-foreground">
              <span>{validation.errors.subheadline || " "}</span>
              <span>{subheadline.trim().length}/{MAX_SUBHEADLINE}</span>
            </div>
          </div>

          <label className="flex items-center gap-3 text-body font-medium">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus-editorial"
              checked={heroEnabled}
              onChange={(event) => setHeroEnabled(event.target.checked)}
            />
            نمایش متن سفارشی در صفحه نخست
          </label>

          <div className="flex items-center gap-4">
            <Button
              className="btn-editorial"
              onClick={handleSubmit}
              disabled={isPending || hasErrors || !isDirty}
            >
              {isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
            {message && (
              <span
                className={
                  message.type === "success"
                    ? "text-body text-primary"
                    : "text-body text-destructive"
                }
              >
                {message.text}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <div className="text-caption text-muted-foreground mb-4">پیش‌نمایش صفحه نخست</div>
          <div className="text-center space-y-4">
            <div className="text-display font-bold leading-tight hero-line hero-line-delay-1">
              {previewHeadline}
            </div>
            <div className="text-subtitle text-muted-foreground leading-relaxed hero-line hero-line-delay-2">
              {previewSubheadline}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-caption text-muted-foreground">
        تغییرات پس از ذخیره، بلافاصله در صفحه نخست اعمال می‌شوند.
      </div>
    </div>
  )
}
