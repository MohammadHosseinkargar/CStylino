import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { productSchema, variantSchema } from "@/lib/validations"
import { z } from "zod"
import { requireAdmin } from "@/lib/rbac"

const adminVariantSchema = variantSchema.extend({
  priceOverride: z.number().int().positive().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
    }

    const body = await request.json()
    const { variants, ...productData } = body

    const validatedProduct = productSchema.parse(productData)

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required." },
        { status: 400 }
      )
    }

    const validatedVariants = variants.map((variant: any) => {
      const { id: _id, ...rest } = variant
      return adminVariantSchema.parse(rest)
    })

    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedProduct.slug },
    })

    if (existingProduct) {
      return NextResponse.json({ error: "Slug already exists." }, { status: 400 })
    }

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          ...validatedProduct,
          variants: {
            create: validatedVariants.map((variant) => ({
              size: variant.size,
              color: variant.color,
              colorHex: variant.colorHex,
              stockOnHand: variant.stockOnHand,
              sku: variant.sku,
              priceOverride: variant.priceOverride ?? null,
            })),
          },
        },
        include: {
          category: true,
          variants: true,
        },
      })

      const initialMovements = createdProduct.variants
        .filter((variant) => variant.stockOnHand > 0)
        .map((variant) => ({
          productId: createdProduct.id,
          variantId: variant.id,
          delta: variant.stockOnHand,
          reason: "initial_stock" as const,
          createdByUserId: guard.user.id,
        }))

      if (initialMovements.length > 0) {
        await tx.stockMovement.createMany({ data: initialMovements })
      }

      return createdProduct
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate value detected." }, { status: 400 })
    }

    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 })
  }
}
export const dynamic = "force-dynamic"
