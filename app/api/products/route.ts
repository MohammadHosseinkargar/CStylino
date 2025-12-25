import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { productSchema, variantSchema } from "@/lib/validations"
import { z } from "zod"
import { requireAdmin } from "@/lib/rbac"

const querySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  featured: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = querySchema.parse(Object.fromEntries(searchParams))

    const page = parseInt(params.page || "1")
    const limit = parseInt(params.limit || "12")
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (params.category) {
      where.category = {
        slug: params.category,
        isActive: true,
      }
    }

    if (params.featured === "true") {
      where.featured = true
    }

    // Price filtering
    if (params.minPrice || params.maxPrice) {
      where.basePrice = {}
      if (params.minPrice) {
        where.basePrice.gte = parseInt(params.minPrice)
      }
      if (params.maxPrice) {
        where.basePrice.lte = parseInt(params.maxPrice)
      }
    }

    // Size and color filtering through variants
    if (params.size || params.color) {
      where.variants = {
        some: {
          ...(params.size && { size: params.size }),
          ...(params.color && { color: params.color }),
        },
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "خطا در دریافت محصولات" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
    }

    const body = await request.json()
    const { variants, ...productData } = body

    // Validate product data
    const validatedProduct = productSchema.parse(productData)

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک واریانت الزامی است" },
        { status: 400 }
      )
    }

    const validatedVariants = variants.map((v: any) => variantSchema.parse(v))

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedProduct.slug },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "این اسلاگ قبلاً استفاده شده است" },
        { status: 400 }
      )
    }

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        ...validatedProduct,
        variants: {
          create: validatedVariants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stockOnHand: v.stockOnHand,
            sku: v.sku,
            priceOverride: v.priceOverride,
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
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "خطا در ایجاد محصول" },
      { status: 500 }
    )
  }
}

