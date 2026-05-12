import type { PaymentMethod } from '@/features/order/types/order.types'

export type PaymentStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'AWAITING_PAYMENT'
    | 'PAID'
    | 'FAILED'
    | 'REFUNDED'

export interface PaymentResponse {
    id: string
    orderId: string
    customerId: string
    amount: number
    status: PaymentStatus
    method: PaymentMethod
    failureReason: string | null
    externalTransactionId: string | null
    paymentInstructions: string | null
    createdAt: string
    updatedAt: string
}
