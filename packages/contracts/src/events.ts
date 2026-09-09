export const DomainEventKeys = {
  ORDER_CREATED: "order.created",
  ORDER_CONFIRMED: "order.confirmed",
  ORDER_REJECTED: "order.rejected",
  ORDER_PREPARING: "order.preparing",
  ORDER_READY: "order.ready",
  RIDER_ASSIGNED: "rider.assigned",
  ORDER_PICKED_UP: "order.picked_up",
  ORDER_ON_THE_WAY: "order.on_the_way",
  ORDER_DELIVERED: "order.delivered",
  ORDER_CANCELLED: "order.cancelled",
  PAYMENT_PAID: "payment.paid",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_REFUNDED: "payment.refunded",
  MESSAGE_CREATED: "message.created"
} as const;

export type DomainEventKey = (typeof DomainEventKeys)[keyof typeof DomainEventKeys];
