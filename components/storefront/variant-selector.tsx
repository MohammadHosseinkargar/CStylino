"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Variant {
  id: string
  size: string
  color: string
  colorHex: string
  stockOnHand: number
  stockReserved: number
  sku: string
}

interface VariantSelectorProps {
  variants: Variant[]
  selectedSize?: string
  selectedColor?: string
  onSizeSelect: (size: string) => void
  onColorSelect: (color: string) => void
  availableSizes?: string[]
  availableColors?: Array<{ color: string; hex: string }>
}

export function VariantSelector({
  variants,
  selectedSize,
  selectedColor,
  onSizeSelect,
  onColorSelect,
  availableSizes = [],
  availableColors = [],
}: VariantSelectorProps) {
  const getVariantStock = (size?: string, color?: string) => {
    if (size && color) {
      const variant = variants.find((v) => v.size === size && v.color === color)
      return variant ? Math.max(0, variant.stockOnHand - variant.stockReserved) : 0
    }

    if (size) {
      return variants
        .filter((v) => v.size === size)
        .reduce((sum, v) => sum + Math.max(0, v.stockOnHand - v.stockReserved), 0)
    }

    if (color) {
      return variants
        .filter((v) => v.color === color)
        .reduce((sum, v) => sum + Math.max(0, v.stockOnHand - v.stockReserved), 0)
    }

    return 0
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {availableSizes.length > 0 && (
        <div>
          <label className="block text-caption font-semibold mb-3 text-foreground">
            سایز
            {selectedSize && (
                <span className="text-muted-foreground font-normal mr-2 text-caption persian-number">
                  ({getVariantStock(selectedSize, selectedColor || undefined) > 0
                    ? `${getVariantStock(selectedSize, selectedColor || undefined)} عدد موجود`
                  : "ناموجود"})
                </span>
              )}
          </label>
          <div className="flex flex-wrap gap-2 md:gap-2.5">
            {availableSizes.map((size) => {
              const stock = selectedColor
                ? getVariantStock(size, selectedColor)
                : getVariantStock(size, undefined)
              const isSelected = selectedSize === size
              const isDisabled = stock <= 0

              return (
                <button
                  key={size}
                  onClick={() => !isDisabled && onSizeSelect(size)}
                  disabled={isDisabled}
                  className={cn(
                    "relative px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl border-2 font-medium text-xs md:text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                      : "border-border bg-background hover:border-primary/50 hover:bg-accent/50",
                    isDisabled && "opacity-30 cursor-not-allowed grayscale"
                  )}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                >
                  {size}
                  {isSelected && (
                    <Check className="absolute top-0.5 left-0.5 md:top-1 md:left-1 h-3 w-3 md:h-3.5 md:w-3.5" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {availableColors.length > 0 && (
        <div>
          <label className="block text-caption font-semibold mb-3 text-foreground">
            رنگ
            {selectedColor && (
                <span className="text-muted-foreground font-normal mr-2 text-caption persian-number">
                  ({getVariantStock(selectedSize || undefined, selectedColor) > 0
                    ? `${getVariantStock(selectedSize || undefined, selectedColor)} عدد موجود`
                  : "ناموجود"})
                </span>
              )}
          </label>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {availableColors.map((colorItem, idx) => {
              const stock = selectedSize
                ? getVariantStock(selectedSize, colorItem.color)
                : getVariantStock(undefined, colorItem.color)
              const isSelected = selectedColor === colorItem.color
              const isDisabled = stock <= 0

              return (
                <button
                  key={idx}
                  onClick={() => !isDisabled && onColorSelect(colorItem.color)}
                  disabled={isDisabled}
                  className={cn(
                    "relative h-12 w-12 md:h-14 md:w-14 rounded-full border-2 transition-all duration-300 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary ring-2 md:ring-4 ring-primary/20 ring-offset-1 md:ring-offset-2 ring-offset-background scale-110"
                      : "border-border/50 hover:border-primary/50",
                    isDisabled && "opacity-30 cursor-not-allowed grayscale"
                  )}
                  style={{ backgroundColor: colorItem.hex }}
                  title={colorItem.color}
                  aria-label={`رنگ ${colorItem.color}`}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                >
                  {isSelected && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 md:h-5 md:w-5 text-white drop-shadow-lg" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
