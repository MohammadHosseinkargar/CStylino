import Link from "next/link"
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
import { ShoppingBag } from "lucide-react"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="Orders"
        subtitle="Manage customer orders and statuses."
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>Order list</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "customer", header: "Customer" },
                    { key: "contact", header: "Contact" },
                    { key: "date", header: "Date" },
                    { key: "amount", header: "Total" },
                    { key: "status", header: "Status" },
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
                      <TableCell className="text-muted-foreground capitalize">
                        {order.status}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          View details
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
                    subtitle={`${formatDate(order.createdAt)} • ${order.items.length} items`}
                    meta={formatPrice(order.totalAmount)}
                    actions={
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary text-sm"
                      >
                        View details
                      </Link>
                    }
                  >
                    <div className="text-caption text-muted-foreground">
                      {order.shippingProvince}? {order.shippingCity} - {order.shippingAddress}
                    </div>
                    <div className="text-caption text-muted-foreground capitalize">
                      {order.status}
                    </div>
                  </ListCard>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6 text-muted-foreground" />}
              title="No orders found"
              description="Orders will appear here once customers place them."
            />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
