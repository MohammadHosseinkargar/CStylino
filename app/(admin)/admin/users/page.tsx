import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ADMIN_PAGE_SIZE } from "@/lib/constants"
import { UserManagement } from "@/components/admin/user-management"

const formatNumber = (value: number) => new Intl.NumberFormat("fa-IR").format(value)

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی ترین" },
  { value: "name-asc", label: "نام (الف-ی)" },
  { value: "name-desc", label: "نام (ی-الف)" },
]

const sortMap: Record<string, any> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "name-asc": { name: "asc" },
  "name-desc": { name: "desc" },
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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; sort?: string }
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : ""
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest"
  const rawPage = typeof searchParams?.page === "string" ? searchParams.page : "1"
  const page = Math.max(Number.parseInt(rawPage, 10) || 1, 1)

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {}

  const orderBy = sortMap[sort] || sortMap.newest

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.max(Math.ceil(totalCount / ADMIN_PAGE_SIZE), 1)
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="کاربران"
        subtitle="مدیریت کاربران ثبت شده"
        actions={
          <form method="get" className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input name="q" defaultValue={q} placeholder="جستجوی کاربران..." />
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
          <CardTitle>لیست کاربران</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <>
              <UserManagement users={users} showHeader={false} showSearch={false} />

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
              icon={<Users className="h-6 w-6 text-muted-foreground" />}
              title="کاربری ثبت نشده"
              description="هنوز کاربری ثبت نشده است."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
