"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/storefront/product-card"
import { Filter, X, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { SkeletonCard } from "@/components/ui/skeleton-kit"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"

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
    sort: "newest"
  })

  const { data, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.append("category", filters.category)
      if (filters.minPrice) params.append("minPrice", filters.minPrice)
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice)
      if (filters.size) params.append("size", filters.size)
      if (filters.color) params.append("color", filters.color)
      if (filters.sort) params.append("sort", filters.sort)

      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error("Failed to fetch products")
      return res.json()
    },
  })

  // Placeholder filters content - in real app, fetch these dynamically
  const FilterContent = () => (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="category" className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>دسته‌بندی</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {['مانتو', 'پالتو', 'شلوار', 'شومیز', 'اکسسوری'].map((cat) => (
                <div key={cat} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id={`cat-${cat}`} 
                    checked={filters.category === cat}
                    onCheckedChange={(checked) => setFilters({...filters, category: checked ? cat : ""})}
                  />
                  <label htmlFor={`cat-${cat}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {cat}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>قیمت</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 px-2">
               <Slider defaultValue={[0, 100]} max={100} step={1} className="mb-4" />
               <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>۰ تومان</span>
                  <span>۱۰ میلیون تومان</span>
               </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  return (
    <PageContainer className="py-8 md:py-12" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-4xl font-display mb-2">محصولات</h1>
           <p className="text-muted-foreground">نمایش {data?.length || 0} محصول</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden flex-1">
                <Filter className="mr-2 h-4 w-4" /> فیلترها
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="text-right">
                <SheetTitle>فیلترها</SheetTitle>
              </SheetHeader>
              <div className="mt-8">
                <FilterContent />
              </div>
              <div className="mt-8 flex gap-2">
                 <Button className="flex-1" onClick={() => {}}>اعمال</Button>
                 <Button variant="outline" className="flex-1" onClick={() => setFilters({category: "", minPrice: "", maxPrice: "", size: "", color: "", sort: "newest"})}>حذف فیلترها</Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <Select value={filters.sort} onValueChange={(val) => setFilters({...filters, sort: val})}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="مرتب‌سازی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="price_asc">ارزان‌ترین</SelectItem>
              <SelectItem value="price_desc">گران‌ترین</SelectItem>
              <SelectItem value="popular">پرفروش‌ترین</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block col-span-1 space-y-8 sticky top-24 h-fit">
          <div className="rounded-2xl border border-border/50 p-6 bg-card/50 backdrop-blur-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">فیلترها</h3>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => setFilters({category: "", minPrice: "", maxPrice: "", size: "", color: "", sort: "newest"})}>
                  پاک کردن
                </Button>
             </div>
             <FilterContent />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="col-span-1 md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : data?.length === 0 ? (
            <EmptyState
              title="محصولی یافت نشد"
              description="با تغییر فیلترها دوباره تلاش کنید"
              action={
                <Button onClick={() => setFilters({category: "", minPrice: "", maxPrice: "", size: "", color: "", sort: "newest"})}>
                  پاک کردن فیلترها
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.map((product: Product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
