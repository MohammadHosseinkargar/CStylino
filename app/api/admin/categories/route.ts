import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { requireAdmin } from "@/lib/rbac"

const categorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  nameEn: z.string().optional(),
  slug: z.string().min(1, "اسلاگ الزامی است"),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

// GET - List all categories (admin only)
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    )
  }
}

// POST - Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
    }

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "این اسلاگ قبلاً استفاده شده است" },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        image: validatedData.image || null,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "خطا در ایجاد دسته‌بندی" },
      { status: 500 }
    )
  }
}

