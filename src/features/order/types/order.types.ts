export type OrderStatus = 'AWAITING_PAYMENT' | 'CONFIRMED' | 'PAYMENT_FAILED' | 'CANCELLED'

export interface OrderItemRequest {
    productId: string
    quantity: number
}

export interface OrderRequest {
    customerId: string
    items: OrderItemRequest[]
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
    totalAmount: number
    items: OrderItemResponse[]
    failureReason: string | null
    createdAt: string
    updatedAt: string
}
