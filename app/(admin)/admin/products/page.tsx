import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">محصولات</h1>
          <p className="text-sm md:text-base text-muted-foreground">مدیریت محصولات فروشگاه</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="btn-editorial w-full sm:w-auto">
            <Plus className="w-5 h-5 ml-2" />
            افزودن محصول
          </Button>
        </Link>
      </div>

      <Card className="card-editorial">
        <CardHeader>
          <CardTitle>لیست محصولات</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border/40 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.category?.name || "بدون دسته‌بندی"} • {product.variants.length} نوع
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-bold">{formatPrice(product.basePrice)}</div>
                    <div className="text-xs text-muted-foreground">
                      موجود: {product.variants.reduce((sum, v) => sum + v.stock, 0)} عدد
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              هنوز محصولی اضافه نشده است
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

