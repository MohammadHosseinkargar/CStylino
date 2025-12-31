"use client"

import { m, useReducedMotion } from "framer-motion"
import { CheckCircle, Heart, Minus, Plus, Share2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PriceBlock } from "@/components/storefront/price-block"
import { VariantSelector } from "@/components/storefront/variant-selector"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SizeGuide } from "@/components/storefront/pdp/size-guide"
import { cn } from "@/lib/utils"
import { fa } from "@/lib/copy/fa"

interface PurchasePanelProps {
  variants: Array<{
    id: string
    size: string
    color: string
    colorHex: string
    stockOnHand: number
    stockReserved: number
  }>
  name: string
  price: number
  stock: number
  isOutOfStock: boolean
  selectedSize: string
  selectedColor: string
  availableSizes: string[]
  availableColors: Array<{ color: string; hex: string }>
  quantity: number
  onQuantityChange: (quantity: number) => void
  onSizeSelect: (size: string) => void
  onColorSelect: (color: string) => void
  onAddToCart: () => void
  isAdding: boolean
  showSuccess: boolean
  isWishlisted: boolean
  onToggleWishlist: () => void
  onShare: () => void
}

const easeOut = [0.22, 0.61, 0.36, 1] as const

export function PurchasePanel({
  variants,
  name,
  price,
  stock,
  isOutOfStock,
  selectedSize,
  selectedColor,
  availableSizes,
  availableColors,
  quantity,
  onQuantityChange,
  onSizeSelect,
  onColorSelect,
  onAddToCart,
  isAdding,
  showSuccess,
  isWishlisted,
  onToggleWishlist,
  onShare,
}: PurchasePanelProps) {
  const prefersReducedMotion = useReducedMotion()
  const formatNumber = (value: number) => value.toLocaleString("fa-IR")

  return (
    <div className="order-2 lg:order-1 lg:sticky lg:top-24">
      <div className="flex flex-col gap-6 rounded-[32px] border border-border/60 bg-card p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <Badge
            variant={stock > 0 ? "primary" : "default"}
            className={cn(
              "gap-2 rounded-full border-primary/20 bg-primary/10 text-xs font-semibold",
              stock <= 0 && "border-border/60 bg-muted text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                stock > 0 ? "bg-primary" : "bg-muted-foreground"
              )}
            />
            {stock > 0 ? (
              <span>
                {fa.pdp.stockAvailable} (<span dir="ltr">{formatNumber(stock)}</span>)
              </span>
            ) : (
              fa.pdp.stockUnavailable
            )}
          </Badge>
          <SizeGuide />
        </div>

        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            {fa.pdp.featuredTag}
          </div>
          <h1 className="text-2xl md:text-[28px] font-semibold leading-tight tracking-tight">
            {name}
          </h1>
          <PriceBlock
            price={price}
            size="lg"
            priceClassName="tracking-tight tabular-nums"
            className="gap-2"
          />
        </div>

        <div className="space-y-6 border-t border-border/60 pt-6">
          <VariantSelector
            variants={variants}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            onSizeSelect={onSizeSelect}
            onColorSelect={onColorSelect}
            availableSizes={availableSizes}
            availableColors={availableColors}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-caption font-semibold text-foreground">
                {fa.pdp.quantity}
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/20 px-1.5 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label={fa.cart.quantityDecrease}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm font-semibold persian-number">
                  {formatNumber(quantity)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  onClick={() => onQuantityChange(quantity + 1)}
                  disabled={quantity >= stock}
                  aria-label={fa.cart.quantityIncrease}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-caption text-muted-foreground">
              {selectedSize && selectedColor
                ? `${selectedSize} / ${selectedColor}`
                : fa.pdp.selectVariantHint}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <m.div
            whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: easeOut }}
          >
            <Button
              className={cn(
                "w-full h-14 rounded-2xl text-base font-semibold shadow-[0_20px_45px_-25px_hsl(var(--primary)/0.6)] transition-all",
                showSuccess
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              )}
              onClick={onAddToCart}
              disabled={isAdding || isOutOfStock || !selectedSize || !selectedColor}
            >
              {isAdding ? (
                <span className="flex items-center">
                  <span className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {fa.price.addingToCart}
                </span>
              ) : showSuccess ? (
                <span className="flex items-center">
                  <CheckCircle className="me-2 h-5 w-5" />
                  {fa.pdp.addedToCart}
                </span>
              ) : (
                <span className="flex items-center">
                  <ShoppingCart className="me-2 h-5 w-5" />
                  {fa.price.addToCart}
                </span>
              )}
            </Button>
          </m.div>

          <TooltipProvider>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-2xl"
                    onClick={onShare}
                    aria-label={fa.pdp.share}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{fa.pdp.share}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-11 w-11 rounded-2xl",
                      isWishlisted && "border-primary text-primary"
                    )}
                    onClick={onToggleWishlist}
                    aria-label={fa.price.addToWishlist}
                  >
                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{fa.pdp.wishlist}</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
