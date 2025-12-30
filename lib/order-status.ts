import { OrderStatus } from "@prisma/client"
import { fa } from "@/lib/copy/fa"

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
  pending: fa.orderStatus.pending,
  processing: fa.orderStatus.processing,
  shipped: fa.orderStatus.shipped,
  delivered: fa.orderStatus.delivered,
  canceled: fa.orderStatus.canceled,
  returned: fa.orderStatus.returned,
  refunded: fa.orderStatus.refunded,
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
  return fa.orderStatus.transitionError(
    getOrderStatusLabelFa(fromStatus),
    getOrderStatusLabelFa(toStatus)
  )
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
