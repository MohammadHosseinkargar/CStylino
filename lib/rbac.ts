import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

const messages = {
  unauthorized: "احراز هویت انجام نشده است.",
  forbidden: "دسترسی مجاز نیست.",
  blocked: "حساب کاربری شما مسدود است.",
}

type GuardResult =
  | { ok: true; user: { id: string; role: UserRole; isBlocked: boolean } }
  | { ok: false; response: NextResponse }

async function requireRole(roles: UserRole[]): Promise<GuardResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: messages.unauthorized },
        { status: 401 }
      ),
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isBlocked: true },
  })

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: messages.unauthorized },
        { status: 401 }
      ),
    }
  }

  if (user.isBlocked) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: messages.blocked },
        { status: 403 }
      ),
    }
  }

  if (!roles.includes(user.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: messages.forbidden },
        { status: 403 }
      ),
    }
  }

  return { ok: true, user }
}

export async function requireAdmin() {
  return requireRole([UserRole.admin])
}

export async function requireAffiliate() {
  return requireRole([UserRole.affiliate, UserRole.admin])
}
