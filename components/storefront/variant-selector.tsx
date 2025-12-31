"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { fa } from "@/lib/copy/fa"

interface Variant {
  id: string
  size: string
  color: string
  colorHex: string
  stockOnHand: number
  stockReserved?: number
  sku?: string
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
  const formatNumber = (value: number) => value.toLocaleString("fa-IR")

  const getVariantStock = (size?: string, color?: string) => {
    if (size && color) {
      const variant = variants.find((v) => v.size === size && v.color === color)
      return variant
        ? Math.max(0, variant.stockOnHand - (variant.stockReserved ?? 0))
        : 0
    }

    if (size) {
      return variants
        .filter((v) => v.size === size)
        .reduce((sum, v) => sum + Math.max(0, v.stockOnHand - (v.stockReserved ?? 0)), 0)
    }

    if (color) {
      return variants
        .filter((v) => v.color === color)
        .reduce((sum, v) => sum + Math.max(0, v.stockOnHand - (v.stockReserved ?? 0)), 0)
    }

    return 0
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {availableSizes.length > 0 && (
        <div>
          <label className="block text-caption font-semibold mb-3 text-foreground">
            {fa.pdp.sizeLabel}
            {selectedSize && (
              <span className="text-muted-foreground font-normal ms-2 text-caption persian-number">
                (
                {getVariantStock(selectedSize, selectedColor || undefined) > 0 ? (
                  <>
                    <span dir="ltr">
                      {formatNumber(getVariantStock(selectedSize, selectedColor || undefined))}
                    </span>{" "}
                    {fa.pdp.stockCount}
                  </>
                ) : (
                  fa.pdp.stockUnavailable
                )}
                )
              </span>
            )}
          </label>
          <div
            className="flex flex-wrap gap-2 md:gap-2.5"
            role="radiogroup"
            aria-label={fa.pdp.sizeLabel}
          >
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
                    "relative px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border text-xs md:text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary/70 bg-primary/15 text-foreground shadow-sm"
                      : "border-border/70 bg-background hover:border-primary/40 hover:bg-accent/40",
                    isDisabled && "opacity-40 cursor-not-allowed grayscale"
                  )}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                  role="radio"
                  aria-checked={isSelected}
                >
                  {size}
                  {isSelected && (
                    <Check className="absolute top-1 left-1 h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
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
            {fa.pdp.colorLabel}
            {selectedColor && (
              <span className="text-muted-foreground font-normal ms-2 text-caption persian-number">
                (
                {getVariantStock(selectedSize || undefined, selectedColor) > 0 ? (
                  <>
                    <span dir="ltr">
                      {formatNumber(getVariantStock(selectedSize || undefined, selectedColor))}
                    </span>{" "}
                    {fa.pdp.stockCount}
                  </>
                ) : (
                  fa.pdp.stockUnavailable
                )}
                )
              </span>
            )}
          </label>
          <div
            className="flex flex-wrap gap-2 md:gap-3"
            role="radiogroup"
            aria-label={fa.pdp.colorLabel}
          >
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
                    "relative inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs md:text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary/70 bg-primary/15 text-foreground"
                      : "border-border/60 bg-background hover:border-primary/40 hover:bg-accent/30",
                    isDisabled && "opacity-40 cursor-not-allowed grayscale"
                  )}
                  title={colorItem.color}
                  aria-label={`${fa.pdp.colorLabel} ${colorItem.color}`}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-border/60 shadow-sm"
                    style={{ backgroundColor: colorItem.hex }}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap">{colorItem.color}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
