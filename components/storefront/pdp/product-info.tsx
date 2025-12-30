import { Button } from "@/components/ui/button"
import { PriceBlock } from "@/components/storefront/price-block"
import { VariantSelector } from "@/components/storefront/variant-selector"
import { cn } from "@/lib/utils"
import { CheckCircle, Heart, Minus, Plus, Share2, ShoppingCart } from "lucide-react"
import { SizeGuide } from "@/components/storefront/pdp/size-guide"
import { fa } from "@/lib/copy/fa"

interface ProductInfoProps {
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

export function ProductInfo({
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
}: ProductInfoProps) {
  return (
    <div className="flex flex-col gap-6 order-2 rounded-[32px] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
            stock > 0 ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              stock > 0 ? "bg-primary" : "bg-destructive"
            )}
          />
          {stock > 0 ? `${fa.pdp.stockAvailable} (${stock})` : fa.pdp.stockUnavailable}
        </div>
        <SizeGuide />
      </div>

      <div className="space-y-3">
        <div className="text-caption text-muted-foreground">{fa.pdp.featuredTag}</div>
        <h1 className="text-hero font-bold leading-tight">{name}</h1>
        <PriceBlock price={price} size="lg" />
      </div>

      <div className="space-y-6 border-t border-border/50 pt-6">
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
            <span className="text-caption font-semibold text-foreground">{fa.pdp.quantity}</span>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-1 py-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label={fa.cart.quantityDecrease}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold persian-number">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
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
        <Button
          className={cn(
            "w-full h-14 rounded-xl text-base font-semibold shadow-lg transition-all",
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

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 gap-2" onClick={onShare} aria-label={fa.pdp.share}>
            <Share2 className="h-4 w-4" />
            {fa.pdp.share}
          </Button>
          <Button
            variant="outline"
            className={cn("h-12 gap-2", isWishlisted && "border-primary text-primary")}
            onClick={onToggleWishlist}
            aria-label={fa.price.addToWishlist}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            {fa.pdp.wishlist}
          </Button>
        </div>
      </div>
    </div>
  )
}
