import { apiClient } from '@/services'
import type { OrderRequest, OrderResponse } from '../types/order.types'

export const orderService = {
    create(request: OrderRequest): Promise<OrderResponse> {
        return apiClient.post<OrderResponse>('/api/v1/orders', request).then((r) => r.data)
    },

    findById(id: string): Promise<OrderResponse> {
        return apiClient.get<OrderResponse>(`/api/v1/orders/${id}`).then((r) => r.data)
    },

    findByCustomer(customerId: string): Promise<OrderResponse[]> {
        return apiClient
            .get<OrderResponse[]>('/api/v1/orders', { params: { customerId } })
            .then((r) => r.data)
    },

    cancel(id: string): Promise<OrderResponse> {
        return apiClient.patch<OrderResponse>(`/api/v1/orders/${id}/cancel`).then((r) => r.data)
    },
}
