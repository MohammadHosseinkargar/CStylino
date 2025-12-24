import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { productSchema, variantSchema } from "@/lib/validations"
import { z } from "zod"

const adminVariantSchema = variantSchema.extend({
  priceOverride: z.number().int().positive().nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      const { id, ...rest } = variant
      return { id, ...adminVariantSchema.parse(rest) }
    })

    const existingSlug = await prisma.product.findFirst({
      where: {
        slug: validatedProduct.slug,
        id: { not: params.id },
      },
    })

    if (existingSlug) {
      return NextResponse.json({ error: "Slug already exists." }, { status: 400 })
    }

    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: params.id },
      select: { id: true },
    })
    const existingVariantIds = new Set(existingVariants.map((variant) => variant.id))
    const incomingIds = new Set(
      validatedVariants.filter((variant) => variant.id).map((variant) => variant.id as string)
    )

    const invalidIds = [...incomingIds].filter((id) => !existingVariantIds.has(id))
    if (invalidIds.length > 0) {
      return NextResponse.json({ error: "Invalid variant ID provided." }, { status: 400 })
    }

    const deleteIds = existingVariants
      .filter((variant) => !incomingIds.has(variant.id))
      .map((variant) => variant.id)

    if (deleteIds.length > 0) {
      const hasOrders = await prisma.orderItem.findFirst({
        where: { variantId: { in: deleteIds } },
        select: { id: true },
      })

      if (hasOrders) {
        return NextResponse.json(
          { error: "One or more variants have orders and cannot be removed." },
          { status: 400 }
        )
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: params.id },
        data: {
          ...validatedProduct,
        },
      })

      if (deleteIds.length > 0) {
        await tx.productVariant.deleteMany({
          where: {
            id: { in: deleteIds },
            productId: params.id,
          },
        })
      }

      for (const variant of validatedVariants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              size: variant.size,
              color: variant.color,
              colorHex: variant.colorHex,
              stock: variant.stock,
              sku: variant.sku,
              priceOverride: variant.priceOverride ?? null,
            },
          })
        } else {
          await tx.productVariant.create({
            data: {
              productId: params.id,
              size: variant.size,
              color: variant.color,
              colorHex: variant.colorHex,
              stock: variant.stock,
              sku: variant.sku,
              priceOverride: variant.priceOverride ?? null,
            },
          })
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate value detected." }, { status: 400 })
    }

    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    if (product._count.orderItems > 0) {
      return NextResponse.json(
        { error: "Product has orders and cannot be deleted." },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 })
  }
}
