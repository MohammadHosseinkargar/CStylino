import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/admin/product-form"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true },
  })

  if (!product) {
    notFound()
  }

  const initialData = {
    id: product.id,
    name: product.name,
    nameEn: product.nameEn,
    slug: product.slug,
    description: product.description,
    descriptionEn: product.descriptionEn,
    basePrice: product.basePrice,
    categoryId: product.categoryId,
    images: product.images,
    isActive: product.isActive,
    featured: product.featured,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex,
      stockOnHand: variant.stockOnHand,
      stockReserved: variant.stockReserved,
      sku: variant.sku,
      priceOverride: variant.priceOverride ?? null,
    })),
  }

  return <ProductForm initialData={initialData} />
}
