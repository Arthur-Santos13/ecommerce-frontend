import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { orderService } from '@/features/order/services/orderService'
import { server } from '../mocks/server'
import { mockOrder, MOCK_CUSTOMER_ID } from '../mocks/handlers'
import { setupInterceptors } from '@/services/interceptors'
import { tokenStorage } from '@/features/auth/utils/tokenStorage'

// Setup interceptors once (injects Auth header + correlation id)
setupInterceptors()

function seedToken() {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ sub: 'testuser', roles: ['ROLE_USER'], exp }))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    tokenStorage.setTokens(`h.${payload}.s`, 'rt-fake')
}

describe('orderService — async flow', () => {
    it('findByCustomer returns an array of orders', async () => {
        seedToken()
        const orders = await orderService.findByCustomer(MOCK_CUSTOMER_ID)
        expect(orders).toHaveLength(1)
        expect(orders[0].id).toBe(mockOrder.id)
        expect(orders[0].status).toBe('AWAITING_PAYMENT')
    })

    it('findById returns a single order', async () => {
        seedToken()
        const order = await orderService.findById(mockOrder.id)
        expect(order.customerId).toBe(MOCK_CUSTOMER_ID)
    })

    it('create returns the created order with 201', async () => {
        seedToken()
        const created = await orderService.create({
            customerId: MOCK_CUSTOMER_ID,
            items: [{ productId: mockOrder.items[0].productId, quantity: 1 }],
        })
        expect(created.id).toBe(mockOrder.id)
    })

    it('cancel returns the order with CANCELLED status', async () => {
        seedToken()
        const cancelled = await orderService.cancel(mockOrder.id)
        expect(cancelled.status).toBe('CANCELLED')
    })

    it('throws ApiException on 503 (circuit breaker)', async () => {
        server.use(
            http.get('http://localhost:8080/api/v1/orders', () =>
                new HttpResponse(null, { status: 503 }),
            ),
        )
        seedToken()
        await expect(orderService.findByCustomer(MOCK_CUSTOMER_ID)).rejects.toMatchObject({
            status: 503,
            message: expect.stringMatching(/temporarily unavailable/i),
        })
    })

    it('throws ApiException on 429 (rate limit)', async () => {
        server.use(
            http.get('http://localhost:8080/api/v1/orders', () =>
                new HttpResponse(null, { status: 429 }),
            ),
        )
        seedToken()
        await expect(orderService.findByCustomer(MOCK_CUSTOMER_ID)).rejects.toMatchObject({
            status: 429,
            message: expect.stringMatching(/too many requests/i),
        })
    })

    it('throws ApiException with status 0 on network error', async () => {
        server.use(
            http.get('http://localhost:8080/api/v1/orders', () => HttpResponse.error()),
        )
        seedToken()
        await expect(orderService.findByCustomer(MOCK_CUSTOMER_ID)).rejects.toMatchObject({
            status: 0,
        })
    })
})
