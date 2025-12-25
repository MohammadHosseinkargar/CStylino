import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        variants: {
          orderBy: [
            { size: "asc" },
            { color: "asc" },
          ],
        },
      },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      )
    }

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        variants: {
          take: 1,
        },
      },
    })

    return NextResponse.json({
      product,
      relatedProducts,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "خطا در دریافت محصول" },
      { status: 500 }
    )
  }
}

