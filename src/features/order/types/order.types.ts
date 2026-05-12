export type OrderStatus = 'AWAITING_PAYMENT' | 'CONFIRMED' | 'PAYMENT_FAILED' | 'CANCELLED'

/** Mirrors backend `order-service` / `payment-service` enum names. */
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_SLIP'

export interface OrderItemRequest {
    productId: string
    quantity: number
}

export interface OrderRequest {
    customerId: string
    items: OrderItemRequest[]
    /** Optional; backend defaults to CREDIT_CARD when omitted. */
    paymentMethod?: PaymentMethod
}

export interface OrderItemResponse {
    id: string
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    subtotal: number
}

export interface OrderResponse {
    id: string
    customerId: string
    status: OrderStatus
    /** How the customer chose to pay (omitted on legacy API responses). */
    paymentMethod?: PaymentMethod
    totalAmount: number
    items: OrderItemResponse[]
    failureReason: string | null
    createdAt: string
    updatedAt: string
}
