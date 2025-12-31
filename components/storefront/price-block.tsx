import { cn } from "@/lib/utils"
import { Price } from "@/components/storefront/price"

interface PriceBlockProps {
  price: number
  originalPrice?: number
  size?: "sm" | "md" | "lg"
  label?: string
  align?: "start" | "center" | "end"
  className?: string
  emphasis?: "strong" | "subtle"
  priceClassName?: string
}

export function PriceBlock({
  price,
  originalPrice,
  size = "md",
  label,
  align = "start",
  className,
  emphasis = "strong",
  priceClassName,
}: PriceBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        align === "center" && "items-center text-center",
        align === "end" && "items-end text-end",
        className
      )}
    >
      {label ? <span className="text-caption text-muted-foreground">{label}</span> : null}
      <Price
        price={price}
        originalPrice={originalPrice}
        size={size}
        emphasis={emphasis}
        priceClassName={priceClassName}
      />
    </div>
  )
}
