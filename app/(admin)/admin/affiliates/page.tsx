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
  })

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="????????"
        subtitle="?????? ???? ???????? ? ?????? ???????"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StyledCard variant="elevated">
          <CardHeader>
            <CardTitle>???? ????????</CardTitle>
          </CardHeader>
          <CardContent>
            {affiliates.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <DataTable
                    columns={[
                      { key: "name", header: "???" },
                      { key: "code", header: "??" },
                      { key: "orders", header: "?????" },
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
                          {affiliate._count.referredOrdersAsAffiliate} ?????
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
                      subtitle={`??: ${affiliate.affiliateCode}`}
                      meta={`${affiliate._count.referredOrdersAsAffiliate} ?????`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<UsersRound className="h-6 w-6 text-muted-foreground" />}
                title="??????? ???? ???"
                description="???? ??????? ??? ???? ???."
              />
            )}
          </CardContent>
        </StyledCard>

        <StyledCard variant="elevated">
          <CardHeader>
            <CardTitle>?????????</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <DataTable
                    columns={[
                      { key: "affiliate", header: "??????" },
                      { key: "level", header: "???" },
                      { key: "date", header: "?????" },
                      { key: "amount", header: "????" },
                      { key: "status", header: "?????" },
                    ]}
                    data={commissions.slice(0, 10)}
                    renderRow={(commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-semibold">
                          {commission.affiliate.name || commission.affiliate.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          ??? {commission.level}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(commission.createdAt)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(commission.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {commission.status === "pending" && "?? ??????"}
                          {commission.status === "available" && "???? ??????"}
                          {commission.status === "paid" && "?????? ???"}
                          {commission.status === "void" && "???? ???"}
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
                      subtitle={`??? ${commission.level} • ${formatDate(commission.createdAt)}`}
                      meta={formatPrice(commission.amount)}
                    >
                      <div className="text-caption text-muted-foreground">
                        {commission.status === "pending" && "?? ??????"}
                        {commission.status === "available" && "???? ??????"}
                        {commission.status === "paid" && "?????? ???"}
                        {commission.status === "void" && "???? ???"}
                      </div>
                    </ListCard>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<UsersRound className="h-6 w-6 text-muted-foreground" />}
                title="???????? ???? ???"
                description="???? ???????? ??? ???? ???."
              />
            )}
          </CardContent>
        </StyledCard>
      </div>
    </PageContainer>
  )
}
