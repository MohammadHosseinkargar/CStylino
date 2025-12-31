import { ProductImage } from "@/components/product-image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PRODUCT_PLACEHOLDER_SRC } from "@/lib/product-image"

interface ProductGalleryProps {
  images: string[]
  name: string
  currentIndex: number
  onChange: (index: number) => void
  badge?: string
}

export function ProductGallery({
  images,
  name,
  currentIndex,
  onChange,
  badge,
}: ProductGalleryProps) {
  const hasMultiple = images.length > 1
  const galleryImages = images.length > 0 ? images : [PRODUCT_PLACEHOLDER_SRC]

  return (
    <div className="space-y-6 order-1">
      <div className="relative group rounded-3xl overflow-hidden border border-border/50 bg-card shadow-sm">
        <ProductImage
          src={galleryImages[currentIndex] ?? PRODUCT_PLACEHOLDER_SRC}
          alt={name}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {badge ? (
          <div className="absolute top-5 right-5 rounded-full bg-primary/90 px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md backdrop-blur-sm">
            {badge}
          </div>
        ) : null}

        {hasMultiple && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-lg opacity-0 transition-all group-hover:opacity-100"
              onClick={() => onChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
              aria-label="تصویر قبلی"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-lg opacity-0 transition-all group-hover:opacity-100"
              onClick={() => onChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
              aria-label="تصویر بعدی"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {galleryImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              onClick={() => onChange(idx)}
              className={cn(
                "relative flex-shrink-0 h-24 w-20 overflow-hidden rounded-xl border-2 transition-all",
                currentIndex === idx
                  ? "border-primary shadow-md opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
              aria-label={`تصویر ${idx + 1}`}
            >
              <ProductImage src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}