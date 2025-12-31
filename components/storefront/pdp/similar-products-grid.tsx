"use client"

import { useMemo } from "react"
import { m, useReducedMotion } from "framer-motion"
import { EmptyState } from "@/components/ui/empty-state"
import { ProductCard } from "@/components/storefront/product-card"
import { Sparkles } from "lucide-react"

interface ProductVariant {
  id: string
  size: string
  color: string
  colorHex: string
  priceOverride?: number
  stockOnHand: number
  stockReserved?: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  images: string[]
  variants: ProductVariant[]
}

interface SimilarProductsGridProps {
  products: Product[]
  normalizeVariants: (items: ProductVariant[]) => ProductVariant[]
}

const easeOut = [0.22, 0.61, 0.36, 1] as const

export function SimilarProductsGrid({
  products,
  normalizeVariants,
}: SimilarProductsGridProps) {
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          duration: prefersReducedMotion ? 0 : 0.3,
          staggerChildren: prefersReducedMotion ? 0 : 0.12,
        },
      },
    }),
    [prefersReducedMotion]
  )

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: prefersReducedMotion ? 0 : 0.45, ease: easeOut },
      },
    }),
    [prefersReducedMotion]
  )

  if (!products.length) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6 text-muted-foreground" />}
        title="محصول مشابهی پیدا نشد"
        description="می‌توانید از محصولات دیگر فروشگاه دیدن کنید."
      />
    )
  }

  return (
    <m.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0"
    >
      {products.slice(0, 8).map((item, index) => (
        <m.div
          key={item.id}
          variants={itemVariants}
          className="min-w-[170px] snap-start md:min-w-0"
          whileHover={prefersReducedMotion ? undefined : { y: -6 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: easeOut }}
        >
          <ProductCard
            id={item.id}
            name={item.name}
            slug={item.slug}
            basePrice={item.basePrice}
            images={item.images}
            variants={normalizeVariants(item.variants)}
          />
        </m.div>
      ))}
    </m.div>
  )
}
