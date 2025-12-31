import { Button } from "@/components/ui/button"
import { PriceBlock } from "@/components/storefront/price-block"
import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"
import { fa } from "@/lib/copy/fa"

interface StickyMobileCTAProps {
  price: number
  disabled?: boolean
  isAdding?: boolean
  onAddToCart: () => void
}

export function StickyMobileCTA({
  price,
  disabled,
  isAdding,
  onAddToCart,
}: StickyMobileCTAProps) {
  return (
    <div className="lg:hidden fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md shadow-[0_-12px_24px_-18px_rgba(0,0,0,0.2)]">
      <Container className="flex items-center justify-between gap-4 py-4">
        <PriceBlock price={price} size="sm" label="جمع کل" />
        <Button
          onClick={onAddToCart}
          disabled={disabled}
          className={cn("h-12 flex-1 rounded-2xl text-sm", isAdding && "opacity-80")}
        >
          {isAdding ? fa.price.addingToCart : fa.price.addToCart}
        </Button>
      </Container>
    </div>
  )
}
