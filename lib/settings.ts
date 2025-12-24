import { prisma } from "@/lib/prisma"

const DEFAULT_SHIPPING_COST = 0

function parseShippingCost(value: string | null | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : DEFAULT_SHIPPING_COST
}

export async function getFlatShippingCost(): Promise<number> {
  const setting = await prisma.settings.findUnique({
    where: { key: "shipping_cost" },
  })

  if (setting?.value) {
    return parseShippingCost(setting.value)
  }

  return parseShippingCost(
    process.env.FLAT_SHIPPING_COST ?? process.env.NEXT_PUBLIC_FLAT_SHIPPING_COST
  )
}
