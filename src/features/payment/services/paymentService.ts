import { apiClient } from '@/services'
import type { PaymentResponse } from '../types/payment.types'

export const paymentService = {
    findByOrderId(orderId: string): Promise<PaymentResponse> {
        return apiClient.get<PaymentResponse>(`/api/v1/payments/order/${orderId}`).then((r) => r.data)
    },
}
