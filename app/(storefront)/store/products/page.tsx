"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/storefront/product-card"
import { Filter, X, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { SkeletonCard } from "@/components/ui/skeleton-kit"
import { EmptyState } from "@/components/ui/empty-state"

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  variants: Array<{
    id: string
    size: string
    color: string
    colorHex: string
    stockOnHand: number
    stockReserved: number
  }>
}

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    size: "",
    color: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.append("category", filters.category)
      if (filters.minPrice) params.append("minPrice", filters.minPrice)
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice)
      if (filters.size) params.append("size", filters.size)
      if (filters.color) params.append("color", filters.color)

      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error("Failed to fetch products")
      return res.json()
    },
  })

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
      <SectionHeader
        title="محصولات"
        subtitle="مجموعه کامل محصولات ما را کاوش کنید"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
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
              <h2 className="text-title font-bold">فیلترها</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold mb-4 text-foreground">
                محدوده قیمت
              </label>
              <div className="space-y-3">
                <Input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  placeholder="حداقل قیمت"
                  className="persian-number"
                />
                <Input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  placeholder="حداکثر قیمت"
                  className="persian-number"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8 lg:hidden">
              <Button
                variant="outline"
                className="btn-editorial"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 ml-2" />
                فیلترها
              </Button>
            {data?.products && (
              <p className="text-caption text-muted-foreground persian-number">
                {data.products.length} محصول
              </p>
            )}
          </div>

          {data?.products?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
              {data.products.map((product: Product) => (
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
              title="محصولی یافت نشد"
              description="لطفاً فیلترهای خود را تغییر دهید"
              action={
                <Button
                  variant="outline"
                  className="btn-editorial"
                  onClick={() =>
                    setFilters({
                      category: "",
                      minPrice: "",
                      maxPrice: "",
                      size: "",
                      color: "",
                    })
                  }
                >
                  پاک کردن فیلترها
                </Button>
              }
            />
          )}
        </div>
      </div>
    </PageContainer>
  )
}
