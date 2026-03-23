const ORDER_STATUSES = Object.freeze([
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "PREPARED",
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
  "CANCELLED",
]);

const ORDER_TRANSITIONS = Object.freeze({
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["PREPARED"],
  PREPARED: ["PICKED_UP"],
  PICKED_UP: ["ON_THE_WAY", "DELIVERED"],
  ON_THE_WAY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
});

class OrderService {
  static normalizeStatus(status) {
    if (!status) return null;
    return String(status).trim().toUpperCase().replace(/[\s-]+/g, "_");
  }

  static getValidStatuses() {
    return [...ORDER_STATUSES];
  }

  static assertValidStatus(status) {
    const normalized = OrderService.normalizeStatus(status);
    if (!normalized || !ORDER_STATUSES.includes(normalized)) {
      throw new Error(`Invalid order status: ${status}`);
    }
    return normalized;
  }

  static canTransition(fromStatus, toStatus) {
    const from = OrderService.normalizeStatus(fromStatus);
    const to = OrderService.normalizeStatus(toStatus);

    if (!from || !to || !ORDER_TRANSITIONS[from]) {
      return false;
    }

    return ORDER_TRANSITIONS[from].includes(to);
  }

  static updateStatus(order, nextStatus, options = {}) {
    const targetStatus = OrderService.assertValidStatus(nextStatus);
    const currentStatus = OrderService.normalizeStatus(order.status);

    if (!currentStatus) {
      throw new Error("Order has no current status");
    }

    if (currentStatus === targetStatus) {
      throw new Error(`Order is already ${targetStatus}`);
    }

    if (!OrderService.canTransition(currentStatus, targetStatus)) {
      throw new Error(`Invalid order status transition from ${currentStatus} to ${targetStatus}`);
    }

    order.status = targetStatus;

    if (targetStatus === "CANCELLED") {
      if (options.cancelledBy) {
        order.cancelledBy = options.cancelledBy;
      }
      if (options.cancellationReason !== undefined) {
        order.cancellationReason = options.cancellationReason;
      }
    }

    return order;
  }
}

module.exports = {
  OrderService,
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
};
