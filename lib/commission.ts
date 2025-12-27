import { prisma } from "@/lib/prisma"
import { CommissionStatus, OrderStatus, Prisma, PrismaClient } from "@prisma/client"

export interface CommissionSettings {
  level1Percentage: number // Default: 10
  level2Percentage: number // Default: 5
}

export async function getCommissionSettings(): Promise<CommissionSettings> {
  const level1 = await prisma.settings.findUnique({
    where: { key: "commission_level1_percentage" },
  })
  const level2 = await prisma.settings.findUnique({
    where: { key: "commission_level2_percentage" },
  })

  return {
    level1Percentage: level1 ? parseInt(level1.value) : 10,
    level2Percentage: level2 ? parseInt(level2.value) : 5,
  }
}

export async function createCommissionsForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      refAffiliate: {
        include: {
          parentAffiliate: true,
        },
      },
    },
  })

  if (!order || !order.refAffiliateId) {
    return
  }

  // Check if commissions already exist (idempotent)
  const existingCommissions = await prisma.commission.findMany({
    where: { orderId: order.id },
  })

  if (existingCommissions.length > 0) {
    // Commissions already created, skip
    return
  }

  const settings = await getCommissionSettings()

  // Level 1 Commission (direct affiliate)
  const level1Amount = Math.floor(
    (order.totalAmount * settings.level1Percentage) / 100
  )

  await prisma.commission.create({
    data: {
      affiliateId: order.refAffiliateId,
      orderId: order.id,
      level: 1,
      percentage: settings.level1Percentage,
      amount: level1Amount,
      status: CommissionStatus.pending,
    },
  })

  // Level 2 Commission (parent affiliate)
  if (order.refAffiliate?.parentAffiliateId) {
    const level2Amount = Math.floor(
      (order.totalAmount * settings.level2Percentage) / 100
    )

    await prisma.commission.create({
      data: {
        affiliateId: order.refAffiliate.parentAffiliateId,
        orderId: order.id,
        level: 2,
        percentage: settings.level2Percentage,
        amount: level2Amount,
        status: CommissionStatus.pending,
      },
    })
  }
}

export async function updateCommissionsOnOrderStatusChange(
  orderId: string,
  newStatus: OrderStatus,
  db: Prisma.TransactionClient | PrismaClient = prisma
) {
  if (newStatus === OrderStatus.delivered) {
    // Mark commissions as available
    await db.commission.updateMany({
      where: { orderId, status: CommissionStatus.pending },
      data: { status: CommissionStatus.available },
    })
  } else if (
    newStatus === OrderStatus.canceled ||
    newStatus === OrderStatus.refunded ||
    newStatus === OrderStatus.returned
  ) {
    // Mark commissions as void
    await db.commission.updateMany({
      where: { orderId },
      data: { status: CommissionStatus.void },
    })
  }
}
