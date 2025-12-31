"use client"

import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet"
import L from "leaflet"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { cn } from "@/lib/utils"

const iconRetinaUrl = typeof markerIcon2x === "string" ? markerIcon2x : markerIcon2x.src
const iconUrl = typeof markerIcon === "string" ? markerIcon : markerIcon.src
const shadowUrl =
  typeof markerShadow === "string" ? markerShadow : markerShadow.src

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

type TrackingMapProps = {
  lat: number
  lng: number
  city: string
  routePoints?: Array<{ lat: number; lng: number; label: string }>
  currentPoint?: { lat: number; lng: number; label: string }
  className?: string
}

export function TrackingMap({
  lat,
  lng,
  city,
  routePoints = [],
  currentPoint,
  className,
}: TrackingMapProps) {
  const hasRoute = routePoints.length >= 2
  const points = hasRoute ? routePoints : [{ lat, lng, label: city }]
  const bounds =
    points.length > 1 ? points.map((point) => [point.lat, point.lng]) : undefined

  const currentCityLabel = currentPoint?.label || city

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border/60",
        className
      )}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
        bounds={bounds}
        boundsOptions={{ padding: [20, 20] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasRoute && (
          <Polyline
            positions={routePoints.map((point) => [point.lat, point.lng])}
            pathOptions={{ color: "#2563eb", weight: 4 }}
          />
        )}
        {points.map((point, index) => (
          <Marker key={`${point.label}-${index}`} position={[point.lat, point.lng]}>
            <Popup>{point.label}</Popup>
          </Marker>
        ))}
        {currentPoint && (
          <CircleMarker
            center={[currentPoint.lat, currentPoint.lng]}
            radius={8}
            pathOptions={{ color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.9 }}
          >
            <Popup>موقعیت فعلی: {currentCityLabel}</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  )
}
