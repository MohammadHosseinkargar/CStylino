"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { SectionHeader } from "@/components/ui/section-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"
import { decodeUnicodeEscapes } from "@/lib/utils"
import { PanelContainer } from "@/components/account/panel-container"
import { PanelCard } from "@/components/account/panel-card"
import { StatusBadge } from "@/components/account/status-badge"

const TrackingMap = dynamic(
  () => import("@/components/customer/tracking-map").then((mod) => mod.TrackingMap),
  { ssr: false }
)

type TrackingEvent = {
  friendly_event_date?: string
  local_event_date?: string
  event_time?: string
  description?: string
  location?: string
}

type TrackingResponse = {
  trackingCode: string
  status: "Delivered" | "InTransit" | "Unknown"
  lastKnownCity: string | null
  coords: { lat: number; lng: number } | null
  routeCities: string[]
  routePoints: Array<{ lat: number; lng: number; label: string }>
  currentPoint: { lat: number; lng: number; label: string } | null
  events: TrackingEvent[]
  timelineNewestFirst: TrackingEvent[]
  message?: string
}

const statusMeta = {
  Delivered: { label: "تحویل شده", variant: "success" },
  InTransit: { label: "در حال ارسال", variant: "info" },
  Unknown: { label: "نامشخص", variant: "neutral" },
} as const

const toEnglishDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => "0123456789"[Number(d.charCodeAt(0) - 1776)])
    .replace(/[٠-٩]/g, (d) => "0123456789"[Number(d.charCodeAt(0) - 1632)])

const sanitizeTrackingInput = (value: string) =>
  toEnglishDigits(value.replace(/\s+/g, "")).replace(/[^\d]/g, "")

const decodeMaybe = (value?: string | null) =>
  value ? decodeUnicodeEscapes(value) : value

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const initialCode = searchParams.get("code") || ""
  const [code, setCode] = useState(sanitizeTrackingInput(initialCode))
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TrackingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialCode) {
      setCode(sanitizeTrackingInput(initialCode))
    }
  }, [initialCode])

  const normalizedCode = useMemo(() => sanitizeTrackingInput(code), [code])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setData(null)

    if (!normalizedCode) {
      setError("کد رهگیری را وارد کنید.")
      return
    }
    if (!/^\d{20,30}$/.test(normalizedCode)) {
      setError(
        "کد رهگیری باید ۲۰ تا ۳۰ رقم باشد."
      )
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/tracking/${normalizedCode}`)
      const payload = (await res.json()) as TrackingResponse
      if (!res.ok) {
        setError(payload?.message || "مشکلی در دریافت اطلاعات رخ داد.")
        return
      }
      setData(payload)
    } catch (err) {
      setError(
        "اتصال به سرور برقرار نشد. دوباره تلاش کنید."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PanelContainer dir="rtl">
      <SectionHeader
        title={
          <h1 className="text-xl font-semibold">
            {"رهگیری مرسوله"}
          </h1>
        }
        subtitle="کد رهگیری خود را وارد کنید تا وضعیت مرسوله را ببینید."
      />

      <PanelCard>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Input
                type="text"
                inputMode="numeric"
                dir="ltr"
                autoComplete="off"
                pattern="^\\d{20,30}$"
                maxLength={30}
                title="کد رهگیری باید ۲۰ تا ۳۰ رقم باشد."
                placeholder="مثال: 608220428200103030009114"
                value={code}
                onChange={(event) => setCode(sanitizeTrackingInput(event.target.value))}
                className="text-left"
              />
              <p className="text-xs text-muted-foreground">
                {"کد رهگیری ۲۰ تا ۳۰ رقمی را وارد کنید."}
              </p>
            </div>
            <Button type="submit" className="h-12 w-full md:w-auto px-6">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {"در حال بررسی"}
                </span>
              ) : (
                "رهگیری"
              )}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </PanelCard>

      {isLoading && (
        <PanelCard className="border-primary/20">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {"در حال دریافت اطلاعات مرسوله..."}
          </div>
        </PanelCard>
      )}

      {data && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PanelCard className="lg:sticky lg:top-6 h-fit space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {"کد رهگیری:"}{" "}
                  <span className="font-semibold" dir="ltr">
                    {data.trackingCode}
                  </span>
                </span>
              </div>
              <StatusBadge variant={statusMeta[data.status].variant}>
                {statusMeta[data.status].label}
              </StatusBadge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">
                  {"آخرین موقعیت"}
                </span>
                <span className="text-muted-foreground">
                  {decodeMaybe(data.lastKnownCity) ||
                    "اطلاعات موقعیت در دسترس نیست."}
                </span>
              </div>
              {data.coords && data.lastKnownCity ? (
                <TrackingMap
                  lat={data.coords.lat}
                  lng={data.coords.lng}
                  city={decodeMaybe(data.lastKnownCity) ?? ""}
                  routePoints={data.routePoints}
                  currentPoint={data.currentPoint ?? undefined}
                  className="h-[240px] sm:h-[280px] lg:h-[360px]"
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                  {"اطلاعاتی برای نمایش نقشه موجود نیست."}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {"مسیر نمایش‌داده‌شده تقریبی است و ممکن است با مسیر واقعی تفاوت داشته باشد."}
              </p>
            </div>
          </PanelCard>

          <PanelCard className="h-fit">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold">
                {"رویدادهای مسیر"}
              </h3>
              <span className="text-xs text-muted-foreground">
                {data.timelineNewestFirst?.length
                  ? `${data.timelineNewestFirst.length} رویداد`
                  : "بدون رویداد"}
              </span>
            </div>
            <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {data.timelineNewestFirst?.length ? (
                data.timelineNewestFirst.map((event, index) => (
                  <div key={`${event.description}-${index}`} className="relative pl-6">
                    <span className="absolute right-0 top-1.5 h-full w-px bg-border/60" />
                    <span className="absolute right-[-2px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {decodeMaybe(event.description) || "رویداد ثبت شد"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {decodeMaybe(event.location) || "-"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {event.friendly_event_date || event.local_event_date || "-"}
                        </span>
                        <span>
                          {event.event_time
                            ? `ساعت ${event.event_time}`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {"هنوز رویدادی برای این مرسوله ثبت نشده است."}
                </p>
              )}
            </div>
          </PanelCard>
        </div>
      )}
    </PanelContainer>
  )
}
