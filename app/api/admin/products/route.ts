import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { productSchema, variantSchema } from "@/lib/validations"
import { z } from "zod"

const adminVariantSchema = variantSchema.extend({
  priceOverride: z.number().int().positive().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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

    const product = await prisma.product.create({
      data: {
        ...validatedProduct,
        variants: {
          create: validatedVariants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            stock: variant.stock,
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
