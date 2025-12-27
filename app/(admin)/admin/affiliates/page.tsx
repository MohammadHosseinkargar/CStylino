import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Prisma, UserRole } from "@prisma/client"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { EmptyState } from "@/components/ui/empty-state"
import { UsersRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ADMIN_PAGE_SIZE } from "@/lib/constants"

const formatNumber = (value: number) => new Intl.NumberFormat("fa-IR").format(value)

const getCommissionStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "available":
      return "قابل برداشت"
    case "paid":
      return "پرداخت شده"
    case "void":
      return "باطل شده"
    default:
      return "در انتظار"
  }
}

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی ترین" },
]

const sortMap: Record<string, any> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
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

export default async function AdminAffiliatesPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; sort?: string }
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : ""
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest"
  const rawPage = typeof searchParams?.page === "string" ? searchParams.page : "1"
  const page = Math.max(Number.parseInt(rawPage, 10) || 1, 1)

  const where: Prisma.UserWhereInput = {
    role: UserRole.affiliate,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { affiliateCode: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  }

  const orderBy = sortMap[sort] || sortMap.newest

  const [affiliates, totalCount, commissions] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            referredOrdersAsAffiliate: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.user.count({ where }),
    prisma.commission.findMany({
      where: {
        affiliate: {
          role: "affiliate",
        },
      },
      include: {
        affiliate: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const totalPages = Math.max(Math.ceil(totalCount / ADMIN_PAGE_SIZE), 1)
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="همکاران فروش"
        subtitle="مدیریت همکاران فروش و کمیسیون ها"
        actions={
          <form method="get" className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input name="q" defaultValue={q} placeholder="جستجوی همکاران..." />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StyledCard variant="elevated">
          <CardHeader>
            <CardTitle>همکاران فروش</CardTitle>
          </CardHeader>
          <CardContent>
            {affiliates.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <DataTable
                    columns={[
                      { key: "name", header: "نام" },
                      { key: "code", header: "کد همکاری" },
                      { key: "orders", header: "سفارش ها" },
                    ]}
                    data={affiliates}
                    renderRow={(affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell className="font-semibold">
                          {affiliate.name || affiliate.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {affiliate.affiliateCode}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatNumber(affiliate._count.referredOrdersAsAffiliate)} سفارش
                        </TableCell>
                      </TableRow>
                    )}
                  />
                </div>
                <div className="md:hidden space-y-4">
                  {affiliates.map((affiliate) => (
                    <ListCard
                      key={affiliate.id}
                      title={affiliate.name || affiliate.email}
                      subtitle={`کد همکاری: ${affiliate.affiliateCode}`}
                      meta={`${formatNumber(affiliate._count.referredOrdersAsAffiliate)} سفارش`}
                    />
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
                icon={<UsersRound className="h-6 w-6 text-muted-foreground" />}
                title="همکاری ثبت نشده"
                description="هنوز همکاری ثبت نشده است."
              />
            )}
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader>
            <CardTitle>کمیسیون ها</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <DataTable
                    columns={[
                      { key: "affiliate", header: "همکار" },
                      { key: "level", header: "سطح" },
                      { key: "date", header: "تاریخ" },
                      { key: "amount", header: "مبلغ" },
                      { key: "status", header: "وضعیت" },
                    ]}
                    data={commissions}
                    renderRow={(commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-semibold">
                          {commission.affiliate.name || commission.affiliate.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          سطح {commission.level}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(commission.createdAt)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(commission.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getCommissionStatusLabel(commission.status)}
                        </TableCell>
                      </TableRow>
                    )}
                  />
                </div>
                <div className="md:hidden space-y-4">
                  {commissions.map((commission) => (
                    <ListCard
                      key={commission.id}
                      title={commission.affiliate.name || commission.affiliate.email}
                      subtitle={`سطح ${commission.level}`}
                      meta={formatPrice(commission.amount)}
                    >
                      <div className="text-caption text-muted-foreground">
                        {getCommissionStatusLabel(commission.status)}
                      </div>
                    </ListCard>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<UsersRound className="h-6 w-6 text-muted-foreground" />}
                title="کمیسیونی ثبت نشده"
                description="هنوز کمیسیونی ثبت نشده است."
              />
            )}
          </CardContent>
        </StyledCard>
      </div>
    </PageContainer>
  )
}
