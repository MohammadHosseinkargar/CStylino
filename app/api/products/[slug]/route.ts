import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { normalizeProductImages } from "@/lib/product-image.server"
import { LruCache } from "@/lib/lru-cache"

const PRODUCT_TTL_MS = 60_000
const productCache = new LruCache<any>(200)
const cacheHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const cacheKey = params.slug
    const cached = productCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { headers: cacheHeaders })
    }

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

    const normalizedProduct = {
      ...product,
      images: normalizeProductImages(product.images),
    }

    const normalizedRelatedProducts = relatedProducts.map((item) => ({
      ...item,
      images: normalizeProductImages(item.images),
    }))

    const responsePayload = {
      product: normalizedProduct,
      relatedProducts: normalizedRelatedProducts,
    }

    productCache.set(cacheKey, responsePayload, PRODUCT_TTL_MS)

    return NextResponse.json(responsePayload, { headers: cacheHeaders })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "خطا در دریافت محصول" },
      { status: 500 }
    )
  }
}

