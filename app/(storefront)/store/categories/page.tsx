"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { SkeletonCard } from "@/components/ui/skeleton-kit"
import { EmptyState } from "@/components/ui/empty-state"
import { FolderOpen } from "lucide-react"

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
      <PageContainer className="py-12" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-12" dir="rtl">
      <SectionHeader
        title="دسته‌بندی‌ها"
        subtitle="برای هر سلیقه، یک انتخاب"
      />

      {categories?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {categories?.map((category: any) => (
            <Link key={category.id} href={`/store/products?category=${category.slug}`}>
              <StyledCard variant="elevated" className="overflow-hidden hover:border-primary/30">
                {category.image && (
                  <div className="aspect-video relative bg-muted">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 space-y-2">
                  <h3 className="text-subtitle font-semibold">{category.name}</h3>
                  {category.description && (
                    <p className="text-body text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <p className="text-caption text-primary">
                    {category._count?.products || 0} محصول
                  </p>
                </div>
              </StyledCard>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={<FolderOpen className="w-6 h-6 text-muted-foreground" />}
            title="دسته‌بندی یافت نشد"
            description="هنوز دسته‌بندی‌ای اضافه نشده است."
          />
        </div>
      )}
    </PageContainer>
  )
}
