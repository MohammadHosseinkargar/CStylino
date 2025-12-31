import { NextResponse } from "next/server"
import { getCityCache, setCityCache } from "@/lib/city-cache"
import { LruCache } from "@/lib/lru-cache"

export const dynamic = "force-dynamic"

type TrackingEvent = {
  friendly_event_date?: string
  local_event_date?: string
  event_time?: string
  description?: string
  location?: string
}

const POSTEX_BASE_URL = "https://api.postex.ir/api/app/v1/tracking/public"
const TRACKING_TTL_MS = 60_000
const trackingCache = new LruCache<{
  ok: boolean
  trackingCode: string
  status: "Delivered" | "InTransit" | "Unknown"
  lastKnownCity: string | null
  coords: { lat: number; lng: number } | null
  routeCities: string[]
  routePoints: Array<{ lat: number; lng: number; label: string }>
  currentPoint: { lat: number; lng: number; label: string } | null
  events: TrackingEvent[]
  timelineNewestFirst: TrackingEvent[]
}>(100)
const cacheHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
}

function normalizeEvent(event: any): TrackingEvent {
  return {
    friendly_event_date:
      event.friendly_event_date || event.friendlyEventDate || event.event_date_fa,
    local_event_date:
      event.local_event_date || event.localEventDate || event.event_date || event.date,
    event_time: event.event_time || event.eventTime || event.time,
    description: event.description || event.event_description || event.event,
    location: event.location || event.event_location || event.place,
  }
}

function getSortableTimestamp(event: TrackingEvent): number {
  const datePart = event.local_event_date || event.friendly_event_date
  const timePart = event.event_time || "00:00"
  if (!datePart) return Number.NaN
  const candidate = `${datePart} ${timePart}`.trim()
  const parsed = Date.parse(candidate)
  return Number.isNaN(parsed) ? Number.NaN : parsed
}

function extractEvents(payload: any): TrackingEvent[] {
  const rawEvents =
    payload?.data?.events ||
    payload?.data?.tracking?.events ||
    payload?.tracking?.events ||
    payload?.data?.history ||
    payload?.history ||
    []

  if (!Array.isArray(rawEvents)) {
    return []
  }

  const withIndex = rawEvents.map((event, index) => ({
    index,
    event: normalizeEvent(event),
  }))

  withIndex.sort((a, b) => {
    const aTime = getSortableTimestamp(a.event)
    const bTime = getSortableTimestamp(b.event)
    if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) {
      return aTime - bTime
    }
    if (!Number.isNaN(aTime)) return -1
    if (!Number.isNaN(bTime)) return 1
    return a.index - b.index
  })

  return withIndex.map((item) => item.event)
}

function extractLastKnownCity(events: TrackingEvent[]) {
  const cityRegex = /شهر\s+([^\s]+)/i
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const location = events[i]?.location?.trim()
    if (!location) continue
    if (location.startsWith("نامه رسان")) continue
    const match = location.match(cityRegex)
    if (match?.[1]) {
      return match[1].replace(/^[\s،.;:؛-]+|[\s،.;:؛-]+$/g, "")
    }
  }
  return null
}

function extractRouteCities(events: TrackingEvent[]) {
  const cityRegex = /شهر\s+([^\s]+)/i
  const cities: string[] = []
  for (const event of events) {
    const location = event?.location?.trim()
    if (!location) continue
    if (location.startsWith("نامه رسان")) continue
    const match = location.match(cityRegex)
    if (!match?.[1]) continue
    const city = match[1].replace(/^[\s،.;:؛-]+|[\s،.;:؛-]+$/g, "")
    if (!city) continue
    if (cities[cities.length - 1] === city) continue
    cities.push(city)
  }
  return cities
}

async function geocodeCity(city: string) {
  try {
    const cached = await getCityCache(city)
    if (cached) {
      return { lat: cached.lat, lng: cached.lng }
    }
  } catch (error) {
    console.warn("City cache read error:", error)
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    `${city}, Iran`
  )}&limit=1`
  const res = await fetch(url, {
    headers: {
      "User-Agent": "stylino-tracking/1.0 (support@stylino.ir)",
    },
  })

  if (!res.ok) {
    return null
  }

  const results = (await res.json()) as Array<{ lat: string; lon: string }>
  const first = results?.[0]
  if (!first) return null

  const lat = Number(first.lat)
  const lng = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  try {
    await setCityCache(city, { lat, lng, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.warn("City cache write error:", error)
  }
  return { lat, lng }
}

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  const trackingCode = params.code?.trim()

  if (!trackingCode || !/^\d+$/.test(trackingCode)) {
    return NextResponse.json(
      { message: "کد رهگیری معتبر نیست." },
      { status: 400 }
    )
  }

  const cached = trackingCache.get(trackingCode)
  if (cached) {
    return NextResponse.json(cached, { headers: cacheHeaders })
  }


  try {
    const url = `${POSTEX_BASE_URL}/${trackingCode}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12_000)

    let res: Response
    let bodyText = ""

    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "CStylino/1.0",
        },
        cache: "no-store",
        signal: controller.signal,
      })
      bodyText = await res.text()
    } catch (error: any) {
      console.error("Tracking fetch error:", error)
      const message =
        error?.name === "AbortError"
          ? "زمان درخواست به پایان رسید."
          : "خطا در ارتباط با سرویس رهگیری."
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          {
            ok: false,
            message,
            debug: {
              name: error?.name,
              message: error?.message,
              cause: error?.cause,
              stack: error?.stack,
            },
            status: 502,
            url,
          },
          { status: 502 }
        )
      }
      return NextResponse.json({ ok: false, message }, { status: 502 })
    } finally {
      clearTimeout(timeoutId)
    }

    let data: any
    try {
      data = JSON.parse(bodyText)
    } catch (error: any) {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          {
            ok: false,
            message: "پاسخ سرویس رهگیری نامعتبر است.",
            debug: {
              name: error?.name,
              message: error?.message,
              cause: error?.cause,
              stack: error?.stack,
              bodyPreview: bodyText.slice(0, 200),
            },
            status: 502,
            url,
          },
          { status: 502 }
        )
      }
      return NextResponse.json(
        { ok: false, message: "پاسخ سرویس رهگیری نامعتبر است." },
        { status: 502 }
      )
    }

    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          {
            ok: false,
            message: data?.message || "اطلاعات رهگیری یافت نشد.",
            debug: {
              status: res.status,
              bodyPreview: bodyText.slice(0, 200),
            },
            status: res.status,
            url,
          },
          { status: res.status }
        )
      }
      return NextResponse.json(
        { ok: false, message: data?.message || "اطلاعات رهگیری یافت نشد." },
        { status: res.status }
      )
    }

    const rawEvents = Array.isArray(data?.events) ? data.events : []
    const events = rawEvents.map(normalizeEvent)
    const timelineNewestFirst = [...events].reverse()
    const lastKnownCity = extractLastKnownCity(events)
    const routeCities = extractRouteCities(events)

    const latestDescription = events.at(-1)?.description || ""
    const isDelivered =
      latestDescription.includes("تحویل گیرنده") ||
      /تحویل.+گردیده/.test(latestDescription)

    const status: "Delivered" | "InTransit" | "Unknown" =
      events.length === 0 ? "Unknown" : isDelivered ? "Delivered" : "InTransit"

    let coords = null
    if (lastKnownCity) {
      try {
        coords = await geocodeCity(lastKnownCity)
      } catch (error) {
        console.error("Geocode error:", error)
        coords = null
      }
    }
    const routePoints: Array<{ lat: number; lng: number; label: string }> = []
    for (const city of routeCities) {
      try {
        const point = await geocodeCity(city)
        if (point) {
          routePoints.push({ ...point, label: city })
        }
      } catch (error) {
        console.error("Route geocode error:", error)
      }
    }
    const currentPoint =
      coords && lastKnownCity ? { ...coords, label: lastKnownCity } : null

    const responsePayload = {
      ok: true,
      trackingCode,
      status,
      lastKnownCity,
      coords,
      routeCities,
      routePoints,
      currentPoint,
      events,
      timelineNewestFirst,
    }

    trackingCache.set(trackingCode, responsePayload, TRACKING_TTL_MS)

    return NextResponse.json(responsePayload, { headers: cacheHeaders })
  } catch (error) {
    console.error("Tracking error:", error)
    return NextResponse.json(
      { message: "خطا در ارتباط با سرویس رهگیری." },
      { status: 500 }
    )
  }
}
