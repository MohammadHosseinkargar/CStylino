import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { createAuditLog, getRequestIp } from "@/lib/audit"
import { UserRole } from "@prisma/client"
import { z } from "zod"

const updateUserSchema = z
  .object({
    role: z.nativeEnum(UserRole).optional(),
    isBlocked: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.isBlocked !== undefined, {
    message: "هیچ تغییری ارسال نشده است.",
  })

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) {
      return guard.response
    }

    const body = await request.json()
    const payload = updateUserSchema.parse(body)

    if (params.id === guard.user.id && payload.isBlocked === true) {
      return NextResponse.json(
        { error: "امکان مسدود کردن حساب خودتان وجود ندارد." },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true, isBlocked: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "کاربر موردنظر پیدا نشد." },
        { status: 404 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        role: payload.role ?? existing.role,
        isBlocked:
          payload.isBlocked !== undefined ? payload.isBlocked : existing.isBlocked,
      },
      select: { id: true, role: true, isBlocked: true },
    })

    const ip = getRequestIp(request)
    if (payload.role !== undefined && payload.role !== existing.role) {
      await createAuditLog({
        actorUserId: guard.user.id,
        action: "user.role_update",
        entityType: "user",
        entityId: updated.id,
        before: { role: existing.role },
        after: { role: updated.role },
        ip,
      })
    }

    if (
      payload.isBlocked !== undefined &&
      payload.isBlocked !== existing.isBlocked
    ) {
      await createAuditLog({
        actorUserId: guard.user.id,
        action: "user.block_toggle",
        entityType: "user",
        entityId: updated.id,
        before: { isBlocked: existing.isBlocked },
        after: { isBlocked: updated.isBlocked },
        ip,
      })
    }

    return NextResponse.json({ user: updated })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "خطا در بروزرسانی کاربر." },
      { status: 500 }
    )
  }
}
export const dynamic = "force-dynamic"
