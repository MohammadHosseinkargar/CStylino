"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/storefront/product-card"
import { Filter, X, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

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
    stock: number
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
      <div className="editorial-container py-20 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editorial-container py-8 md:py-12 lg:py-20 px-4 md:px-0" dir="rtl">
      {/* Header - Editorial */}
      <div className="mb-8 md:mb-16">
        <h1 className="text-2xl md:text-hero font-bold mb-3 md:mb-4">محصولات</h1>
        <p className="text-sm md:text-body text-muted-foreground max-w-2xl leading-relaxed">
          مجموعه کامل محصولات ما را کاوش کنید
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar - Premium */}
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

        {/* Products Grid - Editorial */}
        <div className="lg:col-span-3">
          {/* Mobile Filter Toggle */}
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
            <div className="text-center py-20">
              <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Filter className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-title font-bold mb-3">محصولی یافت نشد</h3>
              <p className="text-body text-muted-foreground mb-8 leading-relaxed">
                لطفاً فیلترهای خود را تغییر دهید
              </p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
