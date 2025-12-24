"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Variant {
  id: string
  size: string
  color: string
  colorHex: string
  stock: number
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
      return variant?.stock || 0
    }

    if (size) {
      return variants
        .filter((v) => v.size === size)
        .reduce((sum, v) => sum + (v.stock || 0), 0)
    }

    if (color) {
      return variants
        .filter((v) => v.color === color)
        .reduce((sum, v) => sum + (v.stock || 0), 0)
    }

    return 0
  }

  return (
    <div className="space-y-8">
      {availableColors.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-4 text-foreground/80">
            رنگ: <span className="text-foreground font-bold">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((colorItem) => {
              const stock = selectedSize
                ? getVariantStock(selectedSize, colorItem.color)
                : getVariantStock(undefined, colorItem.color)
              const isSelected = selectedColor === colorItem.color
              const isDisabled = stock <= 0

              return (
                <button
                  key={colorItem.color}
                  onClick={() => !isDisabled && onColorSelect(colorItem.color)}
                  disabled={isDisabled}
                  className={cn(
                    "group relative h-10 w-10 rounded-full border border-border shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isSelected ? "ring-2 ring-ring ring-offset-2" : "",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: colorItem.hex }}
                  aria-label={`Select color ${colorItem.color}`}
                >
                   {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className={cn("w-4 h-4 text-white drop-shadow-md", colorItem.hex.toLowerCase() === '#ffffff' && "text-black")} />
                      </span>
                   )}
                   {isDisabled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-full h-px bg-foreground/50 rotate-45" />
                      </div>
                   )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {availableSizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-4 text-foreground/80">
            سایز: <span className="text-foreground font-bold">{selectedSize}</span>
             {selectedSize && (
                <span className="text-muted-foreground font-normal mr-2 text-xs">
                  ({getVariantStock(selectedSize, selectedColor || undefined) > 0
                    ? "موجود"
                  : "ناموجود"})
                </span>
              )}
          </label>
          <div className="flex flex-wrap gap-3">
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
                    "relative min-w-[3rem] h-12 px-4 rounded-xl border transition-all duration-200 text-sm font-medium",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-background hover:border-primary/50 text-foreground",
                    isDisabled && "opacity-40 cursor-not-allowed bg-muted text-muted-foreground decoration-slice"
                  )}
                >
                  {size}
                  {isDisabled && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-full h-px bg-foreground/30 rotate-45" />
                     </div>
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
