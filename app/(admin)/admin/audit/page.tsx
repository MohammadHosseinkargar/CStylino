import { prisma } from "@/lib/prisma"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { formatDateTime } from "@/lib/utils"
import { ScrollText } from "lucide-react"
import { Prisma } from "@prisma/client"

const entityTypes = [
  { value: "", label: "همه" },
  { value: "order", label: "سفارش" },
  { value: "settings", label: "تنظیمات" },
  { value: "user", label: "کاربر" },
  { value: "payout", label: "تسویه" },
]

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams?: {
    actor?: string
    entityType?: string
    startDate?: string
    endDate?: string
  }
}) {
  const actor = searchParams?.actor || ""
  const entityType = searchParams?.entityType || ""
  const startDate = searchParams?.startDate || ""
  const endDate = searchParams?.endDate || ""

  const where: Prisma.AuditLogWhereInput = {}

  if (actor) {
    where.actorUserId = actor
  }

  if (entityType) {
    where.entityType = entityType
  }

  if (startDate || endDate) {
    const createdAt: Prisma.DateTimeFilter = {}
    if (startDate) {
      const parsed = new Date(startDate)
      if (!Number.isNaN(parsed.getTime())) {
        createdAt.gte = parsed
      }
    }
    if (endDate) {
      const parsed = new Date(endDate)
      if (!Number.isNaN(parsed.getTime())) {
        parsed.setHours(23, 59, 59, 999)
        createdAt.lte = parsed
      }
    }
    if (Object.keys(createdAt).length > 0) {
      where.createdAt = createdAt
    }
  }

  const [logs, actors] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        actorUser: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "admin" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true },
    }),
  ])

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="گزارش تغییرات"
        subtitle="ردیابی تغییرات حساس توسط مدیران"
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>فیلترها</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4" method="get">
            <select
              name="actor"
              defaultValue={actor}
              className="h-12 rounded-xl border border-border/60 bg-background px-3 text-sm"
            >
              <option value="">همه مدیران</option>
              {actors.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
            <select
              name="entityType"
              defaultValue={entityType}
              className="h-12 rounded-xl border border-border/60 bg-background px-3 text-sm"
            >
              {entityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <Input type="date" name="startDate" defaultValue={startDate} />
            <Input type="date" name="endDate" defaultValue={endDate} />
            <Button type="submit" variant="outline" className="md:col-span-4">
              اعمال فیلتر
            </Button>
          </form>
        </CardContent>
      </StyledCard>

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>ثبت تغییرات</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "actor", header: "مدیر" },
                    { key: "action", header: "رویداد" },
                    { key: "entity", header: "موجودیت" },
                    { key: "entityId", header: "شناسه" },
                    { key: "createdAt", header: "زمان" },
                  ]}
                  data={logs}
                  renderRow={(log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-semibold">
                        {log.actorUser?.name || log.actorUser?.email || "—"}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.entityType}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.entityId || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  )}
                />
              </div>
              <div className="md:hidden space-y-4">
                {logs.map((log) => (
                  <ListCard
                    key={log.id}
                    title={log.action}
                    subtitle={log.entityType}
                    meta={formatDateTime(log.createdAt)}
                  >
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">مدیر</span>
                        <span>{log.actorUser?.name || log.actorUser?.email || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">شناسه</span>
                        <span>{log.entityId || "—"}</span>
                      </div>
                    </div>
                  </ListCard>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<ScrollText className="h-6 w-6 text-muted-foreground" />}
              title="گزارشی ثبت نشده است"
              description="هنوز تغییری ثبت نشده یا فیلترها نتیجه‌ای ندارند."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
