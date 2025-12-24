import { prisma } from "@/lib/prisma"
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

const getCommissionStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return "در انتظار"
    case "available":
      return "قابل برداشت"
    case "paid":
      return "پرداخت‌شده"
    case "void":
      return "باطل‌شده"
    default:
      return "در انتظار"
  }
}

export default async function AdminAffiliatesPage() {
  const affiliates = await prisma.user.findMany({
    where: {
      role: "affiliate",
    },
    include: {
      _count: {
        select: {
          referredOrdersAsAffiliate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const commissions = await prisma.commission.findMany({
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
  })

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="همکاران فروش"
        subtitle="مرور عملکرد و وضعیت کمیسیون همکاران"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StyledCard variant="elevated">
          <CardHeader>
            <CardTitle>همکاران فعال</CardTitle>
          </CardHeader>
          <CardContent>
            {affiliates.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <DataTable
                    columns={[
                      { key: "name", header: "نام" },
                      { key: "code", header: "کد معرف" },
                      { key: "orders", header: "سفارش‌ها" },
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
                          {affiliate._count.referredOrdersAsAffiliate} سفارش
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
                      subtitle={`کد معرف: ${affiliate.affiliateCode}`}
                      meta={`${affiliate._count.referredOrdersAsAffiliate} سفارش`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<UsersRound className="h-6 w-6 text-muted-foreground" />}
                title="همکاری یافت نشد"
                description="فعلاً همکار فروشی ثبت نشده است."
              />
            )}
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader>
            <CardTitle>کمیسیون‌ها</CardTitle>
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
                    data={commissions.slice(0, 10)}
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
                  {commissions.slice(0, 10).map((commission) => (
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
                description="فعلاً گزارشی از کمیسیون‌ها وجود ندارد."
              />
            )}
          </CardContent>
        </StyledCard>
      </div>
    </PageContainer>
  )
}
