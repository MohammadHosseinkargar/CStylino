import { OrderStatus } from "@prisma/client"

// Allowed transitions:
// pending -> processing, canceled
// processing -> shipped, canceled
// shipped -> delivered, refunded
// delivered -> returned, refunded
// returned -> refunded
// canceled/refunded -> (terminal)
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "canceled"],
  processing: ["shipped", "canceled"],
  shipped: ["delivered", "refunded"],
  delivered: ["returned", "refunded"],
  returned: ["refunded"],
  canceled: [],
  refunded: [],
}

export const ORDER_STATUS_LABELS_FA: Record<OrderStatus, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شد",
  delivered: "تحویل شد",
  canceled: "لغو شد",
  returned: "مرجوع شد",
  refunded: "بازپرداخت شد",
}

export function getOrderStatusLabelFa(status: OrderStatus) {
  return ORDER_STATUS_LABELS_FA[status] ?? status
}

export function isValidOrderStatusTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
) {
  const allowed = ORDER_STATUS_TRANSITIONS[fromStatus] ?? []
  return allowed.includes(toStatus)
}

export function getOrderStatusTransitionError(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
) {
  return `تغییر وضعیت از «${getOrderStatusLabelFa(fromStatus)}» به «${getOrderStatusLabelFa(toStatus)}» مجاز نیست.`
}

export function shouldRestockForTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
) {
  const refundLike =
    toStatus === OrderStatus.canceled ||
    toStatus === OrderStatus.refunded ||
    toStatus === OrderStatus.returned
  const stockReduced =
    fromStatus === OrderStatus.processing ||
    fromStatus === OrderStatus.shipped ||
    fromStatus === OrderStatus.delivered

  return refundLike && stockReduced
}
