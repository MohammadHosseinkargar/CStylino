"use client"

import Link from "next/link"
import Image from "next/image"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/storefront/price"
import { ShoppingCart, Heart } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { StyledCard } from "@/components/ui/styled-card"

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
    stock: number
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
  const [isHovered, setIsHovered] = useState(false)
  const hasStock = variants.some((v) => v.stock > 0)
  
  const mainImage = images[0] || "/placeholder-product.jpg"
  const hoverImage = images[1] || mainImage

  const uniqueColors = Array.from(
    new Set(variants.map((v) => ({ color: v.color, hex: v.colorHex })))
  )

  return (
    <StyledCard
      variant="elevated"
      className="group overflow-hidden h-full flex flex-col border-border/40 rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/store/products/${slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-muted/30"
      >
        <Image
          src={mainImage}
          alt={name}
          fill
          className={cn(
            "object-cover transition-all duration-700 ease-out",
            isHovered && hoverImage !== mainImage ? "opacity-0" : "opacity-100",
            isHovered && "scale-105"
          )}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {hoverImage !== mainImage && (
          <Image
            src={hoverImage}
            alt={name}
            fill
            className={cn(
              "object-cover transition-all duration-700 ease-out absolute inset-0",
              isHovered ? "opacity-100 scale-105" : "opacity-0"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {featured && (
          <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-[10px] tracking-wider font-bold px-3 py-1 rounded-full uppercase shadow-sm">
            ویژه
          </div>
        )}
        {!hasStock && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center backdrop-blur-sm z-10">
            <span className="text-sm font-medium tracking-wide text-muted-foreground">ناموجود</span>
          </div>
        )}
        
        {/* Quick actions overlay - Mobile optimized: always show on touch, hover on desktop */}
        <div
          className={cn(
            "absolute bottom-4 left-0 right-0 flex justify-center gap-3 transition-all duration-500 z-20",
            isHovered || !hasStock ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          {hasStock && (
            <>
               <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-white text-black hover:bg-black hover:text-white shadow-lg transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault()
                  // Add to cart logic
                }}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.preventDefault()
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </Link>

      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Link href={`/store/products/${slug}`} className="block">
            <h3 className="font-medium text-lg leading-tight group-hover:text-accent transition-colors duration-300">
              {name}
            </h3>
          </Link>
          <div className="flex items-center gap-1">
             {uniqueColors.slice(0, 3).map((c, i) => (
               <span 
                 key={i} 
                 className="w-3 h-3 rounded-full border border-border/50" 
                 style={{ backgroundColor: c.hex }}
               />
             ))}
             {uniqueColors.length > 3 && (
               <span className="text-xs text-muted-foreground">+</span>
             )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <Price price={basePrice} className="text-lg font-medium" />
        </div>
      </CardContent>
    </StyledCard>
  )
}
