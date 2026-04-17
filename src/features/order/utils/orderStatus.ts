import type { OrderStatus } from '@/features/order/types/order.types'

/** Statuses that are terminal — polling should stop. */
export const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set([
    'CONFIRMED',
    'PAYMENT_FAILED',
    'CANCELLED',
])

/** Statuses that indicate the order is still being processed. */
export const PENDING_STATUSES: ReadonlySet<OrderStatus> = new Set([
    'AWAITING_PAYMENT',
])

export function isTerminal(status: OrderStatus): boolean {
    return TERMINAL_STATUSES.has(status)
}

export function isPending(status: OrderStatus): boolean {
    return PENDING_STATUSES.has(status)
}
