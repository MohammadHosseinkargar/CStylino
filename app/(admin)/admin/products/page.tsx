import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DeleteProductButton } from "@/components/admin/delete-product-button"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { ADMIN_PAGE_SIZE, LOW_STOCK_THRESHOLD } from "@/lib/constants"

const formatNumber = (value: number) => new Intl.NumberFormat("fa-IR").format(value)

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی ترین" },
  { value: "price-desc", label: "بیشترین قیمت" },
  { value: "price-asc", label: "کمترین قیمت" },
]

const sortMap: Record<string, any> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "price-desc": { basePrice: "desc" },
  "price-asc": { basePrice: "asc" },
}

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    searchParams.set(key, String(value))
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; sort?: string }
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : ""
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest"
  const rawPage = typeof searchParams?.page === "string" ? searchParams.page : "1"
  const page = Math.max(Number.parseInt(rawPage, 10) || 1, 1)

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {}

  const orderBy = sortMap[sort] || sortMap.newest

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: { select: { stockOnHand: true, stockReserved: true } },
        category: { select: { name: true } },
      },
      orderBy,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.max(Math.ceil(totalCount / ADMIN_PAGE_SIZE), 1)
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="محصولات"
        subtitle="مدیریت محصولات فروشگاه"
        actions={
          <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
            <form method="get" className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="w-full sm:w-64">
                <Input name="q" defaultValue={q} placeholder="جستجوی محصول..." />
              </div>
              <select
                name="sort"
                defaultValue={sort}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background sm:w-48"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline" className="w-full sm:w-auto">
                جستجو
              </Button>
            </form>
            <Link href="/admin/products/new">
              <Button className="btn-editorial w-full sm:w-auto">
                <Plus className="w-5 h-5 ml-2" />
                افزودن محصول
              </Button>
            </Link>
          </div>
        }
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>لیست محصولات</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "name", header: "نام" },
                    { key: "category", header: "دسته بندی" },
                    { key: "price", header: "قیمت" },
                    { key: "stock", header: "موجودی" },
                    { key: "actions", header: "عملیات" },
                  ]}
                  data={products}
                  renderRow={(product) => {
                    const totalStock = product.variants.reduce(
                      (sum, v) => sum + (v.stockOnHand - v.stockReserved),
                      0
                    )
                    const isLowStock = totalStock <= LOW_STOCK_THRESHOLD

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-semibold">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.category?.name || "بدون دسته بندی"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(product.basePrice)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="persian-number">{formatNumber(totalStock)}</span>
                            {isLowStock && (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                کمبود موجودی
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button size="sm" variant="outline">
                              ویرایش
                            </Button>
                          </Link>
                          <DeleteProductButton productId={product.id} />
                        </TableCell>
                      </TableRow>
                    )
                  }}
                />
              </div>
              <div className="md:hidden space-y-4">
                {products.map((product) => {
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + (v.stockOnHand - v.stockReserved),
                    0
                  )
                  const isLowStock = totalStock <= LOW_STOCK_THRESHOLD

                  return (
                    <ListCard
                      key={product.id}
                      title={product.name}
                      subtitle={product.category?.name || "بدون دسته بندی"}
                      meta={formatPrice(product.basePrice)}
                      actions={
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button size="sm" variant="outline">
                              ویرایش
                            </Button>
                          </Link>
                          <DeleteProductButton productId={product.id} />
                        </div>
                      }
                    >
                      <div className="text-caption text-muted-foreground">
                        موجودی: {formatNumber(totalStock)}
                      </div>
                      {isLowStock && (
                        <div className="inline-flex w-fit text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                          کمبود موجودی
                        </div>
                      )}
                    </ListCard>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    صفحه {formatNumber(page)} از {formatNumber(totalPages)}
                  </div>
                  <div className="flex items-center gap-2">
                    {page > 1 ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={buildQueryString({ q, sort, page: page - 1 })}>قبلی</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        قبلی
                      </Button>
                    )}
                    {pageNumbers.map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        asChild
                        size="sm"
                        variant={pageNumber === page ? "default" : "outline"}
                      >
                        <Link href={buildQueryString({ q, sort, page: pageNumber })}>
                          {pageNumber}
                        </Link>
                      </Button>
                    ))}
                    {page < totalPages ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={buildQueryString({ q, sort, page: page + 1 })}>بعدی</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        بعدی
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="محصولی ثبت نشده"
              description="هنوز محصولی ثبت نشده است."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
