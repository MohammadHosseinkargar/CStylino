"use client"

import Link from "next/link"
import { ProductImage } from "@/components/product-image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { normalizeProductImageSrc } from "@/lib/product-image"
import { useCartStore } from "@/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useWishlistStore } from "@/store/wishlist-store"
import { PriceBlock } from "@/components/storefront/price-block"
import { fa } from "@/lib/copy/fa"
import { Surface } from "@/components/ui/surface"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  variants?: Array<{
    id: string
    size: string
    color: string
    colorHex: string
    stockOnHand: number
    stockReserved: number
    priceOverride?: number
  }>
  featured?: boolean
}

export function ProductCard({
  id,
  name,
  slug,
  basePrice,
  images,
  variants = [],
  featured = false,
}: ProductCardProps) {
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isWishlisted = useWishlistStore((state) => state.hasItem(id))
  const hasStock = variants.some((v) => v.stockOnHand - v.stockReserved > 0)
  const mainImage = normalizeProductImageSrc(images[0])
  const uniqueColors = Array.from(
    new Map(
      variants.map((v) => [
        `${v.color}-${v.colorHex}`,
        { color: v.color, hex: v.colorHex },
      ])
    ).values()
  )
  const primaryVariant =
    variants.find((v) => v.stockOnHand - v.stockReserved > 0) || variants[0]
  const extraColorCount = Math.max(0, uniqueColors.length - 4)
  const formatNumber = (value: number) => value.toLocaleString("fa-IR")

  const handleAddToCart = () => {
    if (!primaryVariant) {
      toast({
        title: fa.price.noVariantTitle,
        description: fa.price.noVariantDescription,
        variant: "destructive",
      })
      return
    }

    const availableStock = Math.max(
      0,
      primaryVariant.stockOnHand - primaryVariant.stockReserved
    )

    if (availableStock <= 0) {
      toast({
        title: fa.price.outOfStockTitle,
        description: fa.price.outOfStockDescription,
        variant: "destructive",
      })
      return
    }

    addItem({
      productId: id,
      variantId: primaryVariant.id,
      slug,
      productName: name,
      variantSize: primaryVariant.size,
      variantColor: primaryVariant.color,
      variantColorHex: primaryVariant.colorHex,
      price: primaryVariant.priceOverride ?? basePrice,
      quantity: 1,
      image: mainImage,
      availableStock,
    })

    toast({
      title: fa.price.addedToCartTitle,
      description: fa.price.addedToCartDescription,
    })
  }

  const handleWishlistToggle = () => {
    toggleWishlist({ productId: id, slug, name, image: mainImage })
    toast({
      title: isWishlisted ? fa.price.removeFromWishlist : fa.price.addToWishlist,
    })
  }

  return (
    <Surface
      className="group relative h-full overflow-hidden border-border/40 bg-card/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
    >
      <Link
        href={`/store/products/${slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-muted/30"
      >
        <ProductImage
          src={mainImage}
          alt={name}
          fill
          className={cn(
            "object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          )}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {featured && (
          <Badge variant="primary" className="absolute top-4 right-4 text-xs">
            {fa.price.featuredBadge}
          </Badge>
        )}
        {!hasStock && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">
              {fa.price.outOfStock}
            </span>
          </div>
        )}
        <div
          className={cn(
            "absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all duration-300 ease-out flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100",
            !hasStock && "opacity-0"
          )}
        >
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-background/95 shadow-md hover:bg-primary hover:text-primary-foreground transition-all duration-300 ease-out"
            onClick={(e) => {
              e.preventDefault()
              handleAddToCart()
            }}
            aria-label={fa.price.addToCart}
            disabled={!hasStock}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-background/95 shadow-md hover:bg-destructive/10 hover:text-destructive transition-all duration-300 ease-out"
            onClick={(e) => {
              e.preventDefault()
              handleWishlistToggle()
            }}
            aria-label={isWishlisted ? fa.price.removeFromWishlist : fa.price.addToWishlist}
          >
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
          </Button>
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <Link href={`/store/products/${slug}`}>
          <h3 className="text-sm font-medium mb-3 line-clamp-2 hover:text-primary transition-colors duration-300 leading-snug tracking-tight">
            {name}
          </h3>
        </Link>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <PriceBlock
            price={basePrice}
            size="sm"
            emphasis="subtle"
            priceClassName="text-base sm:text-lg"
          />
          {uniqueColors.length > 0 && (
            <div className="flex items-center gap-1">
              {uniqueColors.slice(0, 4).map((colorItem, idx) => (
                <div
                  key={idx}
                  className="h-3 w-3 rounded-full border border-border/50 shadow-sm"
                  style={{ backgroundColor: colorItem.hex }}
                  title={colorItem.color}
                />
              ))}
              {uniqueColors.length > 4 && (
                <span className="text-[11px] text-muted-foreground">
                  +{formatNumber(extraColorCount)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Surface>
  )
}
