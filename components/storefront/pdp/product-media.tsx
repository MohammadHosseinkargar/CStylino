"use client"

import { m, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductImage } from "@/components/product-image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PRODUCT_PLACEHOLDER_SRC } from "@/lib/product-image"

interface ProductMediaProps {
  images: string[]
  name: string
  currentIndex: number
  onChange: (index: number) => void
  badge?: string
}

const easeOut = [0.22, 0.61, 0.36, 1] as const

export function ProductMedia({
  images,
  name,
  currentIndex,
  onChange,
  badge,
}: ProductMediaProps) {
  const prefersReducedMotion = useReducedMotion()
  const hasMultiple = images.length > 1
  const galleryImages = images.length > 0 ? images : [PRODUCT_PLACEHOLDER_SRC]
  const formatIndex = (value: number) => value.toLocaleString("fa-IR")

  return (
    <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
      <m.div
        className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-sm"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: easeOut }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      >
        <div className="relative aspect-[4/5] w-full">
          <ProductImage
            src={galleryImages[currentIndex] ?? PRODUCT_PLACEHOLDER_SRC}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 56vw"
          />
        </div>

        {badge ? (
          <div className="absolute top-4 right-4 rounded-full bg-primary/90 px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md backdrop-blur-sm">
            {badge}
          </div>
        ) : null}

        {hasMultiple && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-lg"
              onClick={() => onChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
              aria-label="تصویر قبلی"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-lg"
              onClick={() => onChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
              aria-label="تصویر بعدی"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </>
        )}
      </m.div>

      {hasMultiple && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {galleryImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              onClick={() => onChange(idx)}
              className={cn(
                "relative flex-shrink-0 h-24 w-20 overflow-hidden rounded-2xl border transition-all",
                currentIndex === idx
                  ? "border-primary shadow-md opacity-100"
                  : "border-border/60 opacity-70 hover:opacity-100"
              )}
              aria-label={`مشاهده تصویر ${formatIndex(idx + 1)}`}
            >
              <ProductImage src={img} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
