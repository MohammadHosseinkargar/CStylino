import { prisma } from "@/lib/prisma"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { DeleteProductButton } from "@/components/admin/delete-product-button"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { StyledCard } from "@/components/ui/styled-card"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { ListCard } from "@/components/ui/list-card"
import { EmptyState } from "@/components/ui/empty-state"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <PageContainer className="space-y-6 md:space-y-8 py-6" dir="rtl">
      <SectionHeader
        title="???????"
        subtitle="?????? ??????? ???????"
        actions={
          <Link href="/admin/products/new">
            <Button className="btn-editorial w-full sm:w-auto">
              <Plus className="w-5 h-5 ml-2" />
              ?????? ?????
            </Button>
          </Link>
        }
      />

      <StyledCard variant="elevated">
        <CardHeader>
          <CardTitle>???? ???????</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <>
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "name", header: "?????" },
                    { key: "category", header: "????" },
                    { key: "price", header: "????" },
                    { key: "stock", header: "??????" },
                    { key: "actions", header: "" },
                  ]}
                  data={products}
                  renderRow={(product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-semibold">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category?.name || "???? ????????"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(product.basePrice)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button size="sm" variant="outline">
                            ??????
                          </Button>
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </TableCell>
                    </TableRow>
                  )}
                />
              </div>
              <div className="md:hidden space-y-4">
                {products.map((product) => (
                  <ListCard
                    key={product.id}
                    title={product.name}
                    subtitle={product.category?.name || "???? ????????"}
                    meta={formatPrice(product.basePrice)}
                    actions={
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button size="sm" variant="outline">
                            ??????
                          </Button>
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    }
                  >
                    <div className="text-caption text-muted-foreground">
                      ??????: {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                    </div>
                  </ListCard>
                ))}
              </div>
            </>
          ) : (
            <EmptyState title="?????? ???? ???" description="???? ?????? ??? ???? ???." />
          )}
        </CardContent>
      </StyledCard>
    </PageContainer>
  )
}
