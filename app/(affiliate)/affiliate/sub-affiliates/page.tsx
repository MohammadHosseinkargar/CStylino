"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton-kit"

export default function AffiliateSubAffiliatesPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["affiliate-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const subAffiliates = dashboardData?.user?.subAffiliates || []

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="???????????"
        subtitle="???????? ?? ?? ???? ??? ?????? ???????"
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            ???? ??????????? ({subAffiliates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={5} />
          ) : subAffiliates.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "name", header: "???" },
                    { key: "code", header: "?? ????" },
                    { key: "date", header: "?????" },
                    { key: "status", header: "?????" },
                  ]}
                  data={subAffiliates}
                  renderRow={(subAffiliate: any) => (
                    <TableRow key={subAffiliate.id}>
                      <TableCell className="font-semibold">
                        {subAffiliate.name || subAffiliate.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subAffiliate.affiliateCode}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(subAffiliate.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                          ????
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                />
              </div>
              <div className="md:hidden space-y-4">
                {subAffiliates.map((subAffiliate: any) => (
                  <ListCard
                    key={subAffiliate.id}
                    title={subAffiliate.name || subAffiliate.email}
                    subtitle={`??: ${subAffiliate.affiliateCode}`}
                    meta={formatDate(subAffiliate.createdAt)}
                  >
                    <div className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                      ????
                    </div>
                  </ListCard>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Users className="h-6 w-6 text-muted-foreground" />}
              title="??????????? ???? ???"
              description="???? ??????????? ??? ???? ???."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
