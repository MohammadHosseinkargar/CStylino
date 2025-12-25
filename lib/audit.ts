import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"

export type AuditPayload = {
  actorUserId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  before?: Prisma.JsonValue | null
  after?: Prisma.JsonValue | null
  ip?: string | null
}

export async function createAuditLog(payload: AuditPayload) {
  return prisma.auditLog.create({
    data: {
      actorUserId: payload.actorUserId ?? null,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId ?? null,
      before: payload.before ?? undefined,
      after: payload.after ?? undefined,
      ip: payload.ip ?? null,
    },
  })
}

export function getRequestIp(request?: NextRequest) {
  if (!request) {
    return null
  }
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null
  }
  return request.headers.get("x-real-ip")
}
