import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

// PATCH - Update category (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = categoryUpdateSchema.parse(body)

    // If slug is being updated, check if it's already taken
    if (validatedData.slug) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: params.id },
        },
      })

      if (existingCategory) {
        return NextResponse.json(
          { error: "این اسلاگ قبلاً استفاده شده است" },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        image: validatedData.image === "" ? null : validatedData.image,
      },
    })

    return NextResponse.json({ category })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      )
    }

    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی دسته‌بندی" },
      { status: 500 }
    )
  }
}

// DELETE - Delete category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      )
    }

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      )
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "نمی‌توان دسته‌بندی با محصول را حذف کرد. ابتدا محصولات را حذف یا منتقل کنید." },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      )
    }

    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی" },
      { status: 500 }
    )
  }
}

