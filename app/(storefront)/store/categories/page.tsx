"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="container py-12" dir="rtl">
      <h1 className="text-4xl font-bold mb-8">دسته‌بندی‌ها</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories?.map((category: any) => (
          <Link key={category.id} href={`/store/products?category=${category.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              {category.image && (
                <div className="aspect-video relative bg-gray-100">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-muted-foreground text-sm mb-2">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-primary">
                  {category._count?.products || 0} محصول
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

