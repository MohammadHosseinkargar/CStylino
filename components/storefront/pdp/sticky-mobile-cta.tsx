import { Button } from "@/components/ui/button"
import { PriceBlock } from "@/components/storefront/price-block"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
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
    <div className="lg:hidden fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur">
      <PageContainer className="flex items-center justify-between gap-4 py-4">
        <PriceBlock price={price} size="sm" />
        <Button
          onClick={onAddToCart}
          disabled={disabled}
          className={cn("h-12 flex-1 text-sm", isAdding && "opacity-80")}
        >
          {isAdding ? fa.price.addingToCart : fa.price.addToCart}
        </Button>
      </PageContainer>
    </div>
  )
}
