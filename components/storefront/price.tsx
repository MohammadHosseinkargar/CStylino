import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { fa } from "@/lib/copy/fa"

interface PriceProps {
  price: number
  originalPrice?: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Price({ price, originalPrice, className, size = "md" }: PriceProps) {
  const hasDiscount = originalPrice && originalPrice > price
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className={cn("font-bold text-foreground persian-number", sizeClasses[size])}>
          {formatPrice(price)}
        </span>
        {hasDiscount && (
          <>
            <span
              className={cn(
                "line-through text-muted-foreground/60 persian-number",
                size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
              )}
            >
              {formatPrice(originalPrice!)}
            </span>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
              {discountPercent}% {fa.price.discountLabel}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
