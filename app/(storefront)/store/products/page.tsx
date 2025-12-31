"use client"

import { useMemo, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { QueryProvider } from "@/components/query-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/storefront/product-card"
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useReducedMotion,
} from "framer-motion"
import { Filter, X, SlidersHorizontal } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { Container } from "@/components/ui/container"
import { SectionHeader } from "@/components/ui/section-header"
import { SkeletonCard } from "@/components/ui/skeleton-kit"
import { EmptyState } from "@/components/ui/empty-state"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/glass-card"
import { fa } from "@/lib/copy/fa"

const easeOut = [0.22, 0.61, 0.36, 1] as const

interface ProductVariant {
  id: string
  size: string
  color: string
  colorHex: string
  stockOnHand: number
  stockReserved: number
}

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  variants: ProductVariant[]
  category?: {
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

function ProductsPageContent() {
  const [filters, setFilters] = useState({
    category: "",
    minPrice: null as number | null,
    maxPrice: null as number | null,
    size: "",
    color: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState("newest")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
  const [rangeTouched, setRangeTouched] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("دریافت دسته‌بندی‌ها ناموفق بود.")
      return res.json()
    },
  })

  const { data, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.append("category", filters.category)
      if (filters.minPrice !== null) params.append("minPrice", String(filters.minPrice))
      if (filters.maxPrice !== null) params.append("maxPrice", String(filters.maxPrice))
      if (filters.size) params.append("size", filters.size)
      if (filters.color) params.append("color", filters.color)

      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error("دریافت محصولات ناموفق بود.")
      return res.json()
    },
  })

  const products = useMemo(() => data?.products ?? [], [data?.products])

  const availableSizes = useMemo(() => {
    const set = new Set<string>()
    products.forEach((product) =>
      product.variants?.forEach((variant) => set.add(variant.size))
    )
    return Array.from(set)
  }, [products])

  const availableColors = useMemo(() => {
    const map = new Map<string, { color: string; hex: string }>()
    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        map.set(`${variant.color}-${variant.colorHex}`, {
          color: variant.color,
          hex: variant.colorHex,
        })
      })
    })
    return Array.from(map.values())
  }, [products])

  const priceBounds = useMemo(() => {
    if (products.length === 0) return [0, 0] as [number, number]
    const prices = products.map((product) => product.basePrice)
    return [Math.min(...prices), Math.max(...prices)] as [number, number]
  }, [products])

  const listVariants = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: prefersReducedMotion ? 0 : 0.06,
          delayChildren: prefersReducedMotion ? 0 : 0.05,
        },
      },
    }),
    [prefersReducedMotion]
  )

  const cardVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: prefersReducedMotion ? 0 : 0.45, ease: easeOut },
      },
    }),
    [prefersReducedMotion]
  )

  const panelVariants = useMemo(
    () => ({
      hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 24 },
      show: {
        opacity: 1,
        x: 0,
        transition: { duration: prefersReducedMotion ? 0 : 0.35, ease: easeOut },
      },
      exit: {
        opacity: 0,
        x: prefersReducedMotion ? 0 : 24,
        transition: { duration: prefersReducedMotion ? 0 : 0.25, ease: easeOut },
      },
    }),
    [prefersReducedMotion]
  )

  useEffect(() => {
    if (rangeTouched || priceBounds[1] === 0) return
    setPriceRange(priceBounds)
  }, [priceBounds, rangeTouched])

  const sortedProducts = useMemo(() => {
    const list = [...products]
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.basePrice - b.basePrice)
      case "price-desc":
        return list.sort((a, b) => b.basePrice - a.basePrice)
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return list
    }
  }, [products, sort])

  const handlePriceCommit = (range: number[]) => {
    setPriceRange([range[0], range[1]])
    setRangeTouched(true)
    setFilters((prev) => ({
      ...prev,
      minPrice: range[0],
      maxPrice: range[1],
    }))
  }

  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: null,
      maxPrice: null,
      size: "",
      color: "",
    })
    setPriceRange(priceBounds)
    setRangeTouched(false)
  }

  const chipClasses =
    "h-8 rounded-full px-3 text-xs tracking-tight transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.98]"

  const FiltersPanel = () => (
    <GlassCard className="space-y-7 rounded-3xl border border-border/40 bg-background/80 p-5 sm:p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground/80">
            {fa.products.category}
          </label>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={resetFilters}
          >
            {fa.products.resetFilters}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className={chipClasses}
            variant={filters.category ? "outline" : "default"}
            onClick={() => setFilters((prev) => ({ ...prev, category: "" }))}
          >
            ???
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              size="sm"
              className={chipClasses}
              variant={filters.category === category.slug ? "default" : "outline"}
              onClick={() =>
                setFilters((prev) => ({ ...prev, category: category.slug }))
              }
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-medium text-foreground/80">
          {fa.products.priceRange}
        </label>
        <div className="space-y-4">
          <Slider
            min={priceBounds[0]}
            max={priceBounds[1]}
            step={10000}
            value={priceRange}
            onValueChange={(range) => setPriceRange([range[0], range[1]])}
            onValueCommit={handlePriceCommit}
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground persian-number">
            <span>{formatPrice(priceRange[0] || 0)}</span>
            <span>{formatPrice(priceRange[1] || 0)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              setFilters((prev) => {
                const nextMin = e.target.value ? Number(e.target.value) : null
                setPriceRange([nextMin ?? priceRange[0], priceRange[1]])
                setRangeTouched(true)
                return {
                  ...prev,
                  minPrice: nextMin,
                }
              })
            }
            placeholder={fa.products.minPrice}
            className="h-9 text-xs persian-number"
          />
          <Input
            type="number"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              setFilters((prev) => {
                const nextMax = e.target.value ? Number(e.target.value) : null
                setPriceRange([priceRange[0], nextMax ?? priceRange[1]])
                setRangeTouched(true)
                return {
                  ...prev,
                  maxPrice: nextMax,
                }
              })
            }
            placeholder={fa.products.maxPrice}
            className="h-9 text-xs persian-number"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-medium text-foreground/80">
          {fa.products.size}
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className={chipClasses}
            variant={filters.size ? "outline" : "default"}
            onClick={() => setFilters((prev) => ({ ...prev, size: "" }))}
          >
            ???
          </Button>
          {availableSizes.map((size) => (
            <Button
              key={size}
              size="sm"
              className={chipClasses}
              variant={filters.size === size ? "default" : "outline"}
              onClick={() => setFilters((prev) => ({ ...prev, size }))}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-medium text-foreground/80">
          {fa.products.color}
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className={chipClasses}
            variant={filters.color ? "outline" : "default"}
            onClick={() => setFilters((prev) => ({ ...prev, color: "" }))}
          >
            ???
          </Button>
          {availableColors.map((colorItem) => (
            <button
              key={colorItem.color}
              className={cn(
                "h-7 w-7 rounded-full border border-border/40 shadow-sm transition-all duration-200 ease-out hover:opacity-90 hover:scale-[1.03]",
                filters.color === colorItem.color
                  ? "border-primary ring-2 ring-primary/25"
                  : "hover:border-primary/50"
              )}
              style={{ backgroundColor: colorItem.hex }}
              onClick={() =>
                setFilters((prev) => ({ ...prev, color: colorItem.color }))
              }
              aria-label={`${fa.products.colorFilterLabel} ${colorItem.color}`}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  )

  if (isLoading) {
    return (
      <Container className="py-10 md:py-16" dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </Container>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <Container className="py-10 md:py-14 lg:py-16" dir="rtl">
          <SectionHeader title={fa.products.title} subtitle={fa.products.subtitle} />

          <AnimatePresence>
            {showFilters && (
              <m.div
                className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
                onClick={() => setShowFilters(false)}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.2, ease: easeOut } }}
                exit={{ opacity: 0, transition: { duration: 0.2, ease: easeOut } }}
              />
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-10">
            <aside className="hidden lg:block">
              <FiltersPanel />
            </aside>

            <AnimatePresence>
              {showFilters && (
                <m.aside
                  className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background/95 backdrop-blur-sm border-l border-border/40 p-6 overflow-y-auto lg:hidden"
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={panelVariants}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-base font-semibold tracking-tight">
                      {fa.products.filters}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setShowFilters(false)}
                      aria-label={fa.products.closeFilters}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <FiltersPanel />
                </m.aside>
              )}
            </AnimatePresence>

            <div className="lg:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3 lg:hidden">
                  <Button
                    variant="outline"
                    className="h-9 rounded-full px-4 text-xs transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.98]"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 ms-2" />
                    {fa.products.showFilters}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground transition-all duration-200 ease-out"
                    onClick={resetFilters}
                  >
                    {fa.products.resetFilters}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  {products.length > 0 && (
                    <p className="text-xs text-muted-foreground persian-number">
                      {products.length} {fa.products.itemsCount}
                    </p>
                  )}
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-9 rounded-full border border-border/50 bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="newest">{fa.products.sortNewest}</option>
                    <option value="price-asc">{fa.products.sortPriceAsc}</option>
                    <option value="price-desc">{fa.products.sortPriceDesc}</option>
                    <option value="name-asc">{fa.products.sortNameAsc}</option>
                  </select>
                </div>
              </div>

              {sortedProducts.length > 0 ? (
                <m.div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-7 lg:gap-8"
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                >
                  {sortedProducts.map((product: Product) => (
                    <m.div key={product.id} variants={cardVariants}>
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        basePrice={product.basePrice}
                        images={product.images}
                        variants={product.variants}
                      />
                    </m.div>
                  ))}
                </m.div>
              ) : (
                <EmptyState
                  icon={<Filter className="w-7 h-7 text-muted-foreground" />}
                  title={fa.products.emptyTitle}
                  description={fa.products.emptyDescription}
                  action={
                    <Button variant="outline" onClick={resetFilters}>
                      {fa.products.resetFilters}
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </Container>
      </MotionConfig>
    </LazyMotion>
  )

}

export default function ProductsPage() {
  return (
    <QueryProvider>
      <ProductsPageContent />
    </QueryProvider>
  )
}
