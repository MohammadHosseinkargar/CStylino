import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { EmptyState } from "@/components/ui/empty-state"
import { ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ADMIN_PAGE_SIZE } from "@/lib/constants"

const getOrderStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "processing":
      return "در حال پردازش"
    case "shipped":
      return "ارسال شد"
    case "delivered":
      return "تحویل شد"
    case "canceled":
      return "لغو شد"
    case "refunded":
      return "بازپرداخت شد"
    case "returned":
      return "مرجوع شد"
    default:
      return "نامشخص"
  }
}

const formatNumber = (value: number) => new Intl.NumberFormat("fa-IR").format(value)

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی ترین" },
  { value: "amount-desc", label: "بیشترین مبلغ" },
  { value: "amount-asc", label: "کمترین مبلغ" },
]

const sortMap: Record<string, any> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "amount-desc": { totalAmount: "desc" },
  "amount-asc": { totalAmount: "asc" },
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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; sort?: string }
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : ""
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest"
  const rawPage = typeof searchParams?.page === "string" ? searchParams.page : "1"
  const page = Math.max(Number.parseInt(rawPage, 10) || 1, 1)

  const where: Prisma.OrderWhereInput = q
    ? {
        OR: [
          { customerName: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { shippingPhone: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { user: { email: { contains: q, mode: Prisma.QueryMode.insensitive } } },
          { user: { name: { contains: q, mode: Prisma.QueryMode.insensitive } } },
        ],
      }
    : {}

  const orderBy = sortMap[sort] || sortMap.newest

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
        _count: { select: { items: true } },
      },
      orderBy,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.max(Math.ceil(totalCount / ADMIN_PAGE_SIZE), 1)
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="سفارش ها"
        subtitle="مدیریت سفارش ها و وضعیت آنها"
        actions={
          <form method="get" className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input name="q" defaultValue={q} placeholder="جستجوی سفارش..." />
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
        }
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>لیست سفارش ها</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "customer", header: "مشتری" },
                    { key: "contact", header: "تماس" },
                    { key: "date", header: "تاریخ" },
                    { key: "amount", header: "مبلغ" },
                    { key: "status", header: "وضعیت" },
                    { key: "action", header: "" },
                  ]}
                  data={orders}
                  renderRow={(order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold">
                        {order.customerName || order.user.name || order.user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.shippingPhone}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getOrderStatusLabel(order.status)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          مشاهده جزئیات
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}
                />
              </div>
              <div className="md:hidden space-y-4">
                {orders.map((order) => (
                  <ListCard
                    key={order.id}
                    title={order.customerName || order.user.name || order.user.email}
                    subtitle={`${formatDate(order.createdAt)} | ${formatNumber(order._count.items)} قلم`}
                    meta={formatPrice(order.totalAmount)}
                    actions={
                      <Link href={`/admin/orders/${order.id}`} className="text-primary text-sm">
                        مشاهده جزئیات
                      </Link>
                    }
                  >
                    <div className="text-caption text-muted-foreground">
                      {order.shippingProvince}، {order.shippingCity} - {order.shippingAddress}
                    </div>
                    <div className="text-caption text-muted-foreground">
                      {getOrderStatusLabel(order.status)}
                    </div>
                  </ListCard>
                ))}
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
                          {formatNumber(pageNumber)}
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
              icon={<ShoppingBag className="h-6 w-6 text-muted-foreground" />}
              title="سفارشی ثبت نشده"
              description="هنوز سفارشی ثبت نشده است"
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
