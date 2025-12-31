"use client"

import { useMemo, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { QueryProvider } from "@/components/query-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/storefront/product-card"
import { Filter, X, SlidersHorizontal } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { SkeletonCard } from "@/components/ui/skeleton-kit"
import { EmptyState } from "@/components/ui/empty-state"
import { Slider } from "@/components/ui/slider"
import { fa } from "@/lib/copy/fa"

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

  if (isLoading) {
    return (
      <PageContainer className="py-10 md:py-16" dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8 md:py-12 lg:py-16" dir="rtl">
      <SectionHeader title={fa.products.title} subtitle={fa.products.subtitle} />

      {showFilters && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setShowFilters(false)}
          aria-hidden="true"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-10">
        <aside
          className={cn(
            "lg:block",
            showFilters
              ? "fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background/95 backdrop-blur-xl border-l border-border/50 p-6 overflow-y-auto lg:static lg:inset-auto lg:z-auto lg:w-auto lg:max-w-none lg:border-0 lg:p-0 lg:bg-transparent"
              : "hidden"
          )}
        >
          {showFilters && (
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <h2 className="text-title font-bold">{fa.products.filters}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setShowFilters(false)}
                aria-label={fa.products.closeFilters}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">{fa.products.category}</label>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  {fa.products.resetFilters}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filters.category ? "outline" : "default"}
                  onClick={() => setFilters((prev) => ({ ...prev, category: "" }))}
                >
                  همه
                </Button>
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    size="sm"
                    variant={filters.category === category.slug ? "default" : "outline"}
                    onClick={() => setFilters((prev) => ({ ...prev, category: category.slug }))}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground">{fa.products.priceRange}</label>
              <div className="space-y-4">
                <Slider
                  min={priceBounds[0]}
                  max={priceBounds[1]}
                  step={10000}
                  value={priceRange}
                  onValueChange={(range) => setPriceRange([range[0], range[1]])}
                  onValueCommit={handlePriceCommit}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground persian-number">
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
                  className="persian-number"
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
                  className="persian-number"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground">{fa.products.size}</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filters.size ? "outline" : "default"}
                  onClick={() => setFilters((prev) => ({ ...prev, size: "" }))}
                >
                  همه
                </Button>
                {availableSizes.map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant={filters.size === size ? "default" : "outline"}
                    onClick={() => setFilters((prev) => ({ ...prev, size }))}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground">{fa.products.color}</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filters.color ? "outline" : "default"}
                  onClick={() => setFilters((prev) => ({ ...prev, color: "" }))}
                >
                  همه
                </Button>
                {availableColors.map((colorItem) => (
                  <button
                    key={colorItem.color}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 shadow-sm transition-all",
                      filters.color === colorItem.color
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border/50 hover:border-primary/50"
                    )}
                    style={{ backgroundColor: colorItem.hex }}
                    onClick={() => setFilters((prev) => ({ ...prev, color: colorItem.color }))}
                    aria-label={`${fa.products.colorFilterLabel} ${colorItem.color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="outline"
                className="btn-editorial"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 ms-2" />
                {fa.products.showFilters}
              </Button>
              <Button variant="ghost" onClick={resetFilters}>
                {fa.products.resetFilters}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {products.length > 0 && (
                <p className="text-caption text-muted-foreground persian-number">
                  {products.length} {fa.products.itemsCount}
                </p>
              )}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="newest">{fa.products.sortNewest}</option>
                <option value="price-asc">{fa.products.sortPriceAsc}</option>
                <option value="price-desc">{fa.products.sortPriceDesc}</option>
                <option value="name-asc">{fa.products.sortNameAsc}</option>
              </select>
            </div>
          </div>

          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
              {sortedProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  basePrice={product.basePrice}
                  images={product.images}
                  variants={product.variants}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Filter className="w-7 h-7 text-muted-foreground" />}
              title={fa.products.emptyTitle}
              description={fa.products.emptyDescription}
              action={
                <Button variant="outline" className="btn-editorial" onClick={resetFilters}>
                  {fa.products.resetFilters}
                </Button>
              }
            />
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default function ProductsPage() {
  return (
    <QueryProvider>
      <ProductsPageContent />
    </QueryProvider>
  )
}
