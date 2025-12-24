import { prisma } from "@/lib/prisma"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Users } from "lucide-react"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="???????"
        subtitle="?????? ??????? ???????."
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>???? ???????</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "name", header: "?????" },
                    { key: "email", header: "?????" },
                    { key: "date", header: "?????" },
                    { key: "role", header: "???" },
                  ]}
                  data={users}
                  renderRow={(user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold">
                        {user.name || "???? ???"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                          {user.role === "admin" && "????"}
                          {user.role === "affiliate" && "??????"}
                          {user.role === "customer" && "?????"}
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                />
              </div>
              <div className="md:hidden space-y-4">
                {users.map((user) => (
                  <ListCard
                    key={user.id}
                    title={user.name || "???? ???"}
                    subtitle={user.email}
                    meta={formatDate(user.createdAt)}
                  >
                    <div className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                      {user.role === "admin" && "????"}
                      {user.role === "affiliate" && "??????"}
                      {user.role === "customer" && "?????"}
                    </div>
                  </ListCard>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Users className="h-6 w-6 text-muted-foreground" />}
              title="?????? ???? ???"
              description="???? ?????? ??? ???? ???."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
