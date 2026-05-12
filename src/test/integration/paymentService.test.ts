import { describe, it, expect, beforeEach } from 'vitest'
import { paymentService } from '@/features/payment/services/paymentService'
import { orderService } from '@/features/order/services/orderService'
import { setupInterceptors } from '@/services/interceptors'
import { tokenStorage } from '@/features/auth/utils/tokenStorage'
import { mockOrder, MOCK_CUSTOMER_ID } from '../mocks/handlers'

setupInterceptors()

function seedToken() {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ sub: 'testuser', roles: ['ROLE_USER'], exp }))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    tokenStorage.setTokens(`h.${payload}.s`, 'rt-fake')
}

describe('paymentService — async flow', () => {
    beforeEach(() => {
        seedToken()
    })

    it('findByOrderId returns awaiting PIX payload after a PIX checkout', async () => {
        await orderService.create({
            customerId: MOCK_CUSTOMER_ID,
            items: [{ productId: mockOrder.items[0].productId, quantity: 1 }],
            paymentMethod: 'PIX',
        })
        const p = await paymentService.findByOrderId(mockOrder.id)
        expect(p.method).toBe('PIX')
        expect(p.status).toBe('AWAITING_PAYMENT')
        expect(p.paymentInstructions).toBeTruthy()
        expect(p.externalTransactionId).toBeTruthy()
    })

    it('findByOrderId returns paid card payload without offline instructions', async () => {
        await orderService.create({
            customerId: MOCK_CUSTOMER_ID,
            items: [{ productId: mockOrder.items[0].productId, quantity: 1 }],
            paymentMethod: 'CREDIT_CARD',
        })
        const p = await paymentService.findByOrderId(mockOrder.id)
        expect(p.method).toBe('CREDIT_CARD')
        expect(p.status).toBe('PAID')
        expect(p.paymentInstructions).toBeNull()
        expect(p.externalTransactionId).toBeNull()
    })
})
