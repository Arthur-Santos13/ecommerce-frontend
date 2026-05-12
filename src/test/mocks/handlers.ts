import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:8080'

// ── JWT helpers ──────────────────────────────────────────────────────────────
// A real-looking (but fake) JWT with exp far in the future
export const FAKE_TOKEN =
    'eyJhbGciOiJIUzI1NiJ9.' +
    btoa(JSON.stringify({ sub: 'testuser', roles: ['ROLE_USER'], exp: 9999999999 }))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_') +
    '.fake-sig'

export const MOCK_CUSTOMER_ID = 'cust-0001-0000-0000-000000000001'

// ── Fixtures ─────────────────────────────────────────────────────────────────
export const mockProduct = {
    id: 'prod-0001-0000-0000-000000000001',
    name: 'Notebook Pro 16',
    description: 'Intel Core i7, 16 GB RAM',
    price: 4999.9,
    sku: 'NB-PRO-16',
    version: 1,
    quantityInStock: 25,
    reservedQuantity: 0,
    availableQuantity: 25,
    category: { id: 'cat-0001', name: 'Eletrônicos', description: null },
    createdAt: '2026-04-01T10:00:00',
    updatedAt: '2026-04-01T10:00:00',
}

export const mockOrder = {
    id: 'order-0001-0000-0000-000000000001',
    customerId: MOCK_CUSTOMER_ID,
    status: 'AWAITING_PAYMENT' as const,
    paymentMethod: 'CREDIT_CARD' as const,
    totalAmount: 4999.9,
    items: [
        {
            id: 'item-0001',
            productId: mockProduct.id,
            productName: 'Notebook Pro 16',
            unitPrice: 4999.9,
            quantity: 1,
            subtotal: 4999.9,
        },
    ],
    failureReason: null,
    createdAt: '2026-04-18T10:00:00',
    updatedAt: '2026-04-18T10:00:00',
}

/** Last `paymentMethod` from `POST /orders` — drives GET order + payment mocks in tests. */
let lastOrderPaymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_SLIP' = 'CREDIT_CARD'

export function resetCheckoutMocks() {
    lastOrderPaymentMethod = 'CREDIT_CARD'
}

export function getLastCheckoutPaymentMethod() {
    return lastOrderPaymentMethod
}

export const mockPaymentAwaitingPix = {
    id: 'pay-0001-0000-0000-000000000001',
    orderId: mockOrder.id,
    customerId: MOCK_CUSTOMER_ID,
    amount: mockOrder.totalAmount,
    status: 'AWAITING_PAYMENT' as const,
    method: 'PIX' as const,
    failureReason: null,
    externalTransactionId: 'sim-pix-mock',
    paymentInstructions: '00020126580014br.gov.bcb.pix0136mockpix5204000053039865802BR5925Test',
    createdAt: '2026-04-18T10:05:00',
    updatedAt: '2026-04-18T10:05:00',
}

// ── Default handlers ─────────────────────────────────────────────────────────
export const handlers = [
    // Auth
    http.post(`${BASE}/api/v1/auth/login`, () =>
        HttpResponse.json({ token: FAKE_TOKEN, refreshToken: 'rt-fake', username: 'testuser', roles: ['ROLE_USER'] }),
    ),
    http.post(`${BASE}/api/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),
    http.post(`${BASE}/api/v1/auth/refresh`, () =>
        HttpResponse.json({ token: FAKE_TOKEN, refreshToken: 'rt-fake-new' }),
    ),

    // Products
    http.get(`${BASE}/api/v1/products`, () =>
        HttpResponse.json({
            content: [mockProduct],
            page: 0,
            size: 10,
            totalElements: 1,
            totalPages: 1,
            last: true,
        }),
    ),
    http.get(`${BASE}/api/v1/products/:id`, ({ params }) =>
        HttpResponse.json({ ...mockProduct, id: params.id as string }),
    ),

    // Orders
    http.get(`${BASE}/api/v1/orders`, () =>
        HttpResponse.json([{ ...mockOrder, paymentMethod: lastOrderPaymentMethod }]),
    ),
    http.post(`${BASE}/api/v1/orders`, async ({ request }) => {
        let body: Record<string, unknown> = {}
        try {
            body = (await request.json()) as Record<string, unknown>
        } catch {
            /* no body */
        }
        const pm = (body.paymentMethod as typeof lastOrderPaymentMethod) ?? 'CREDIT_CARD'
        lastOrderPaymentMethod = pm
        return HttpResponse.json(
            {
                ...mockOrder,
                paymentMethod: pm,
                customerId: (body.customerId as string) ?? mockOrder.customerId,
            },
            { status: 201 },
        )
    }),
    http.get(`${BASE}/api/v1/orders/:id`, ({ params }) =>
        HttpResponse.json({
            ...mockOrder,
            id: params.id as string,
            paymentMethod: lastOrderPaymentMethod,
        }),
    ),
    http.patch(`${BASE}/api/v1/orders/:id/cancel`, ({ params }) =>
        HttpResponse.json({ ...mockOrder, id: params.id as string, status: 'CANCELLED' }),
    ),

    // Payments (order-scoped)
    http.get(`${BASE}/api/v1/payments/order/:orderId`, ({ params }) => {
        const orderId = params.orderId as string
        const method = lastOrderPaymentMethod
        const offline = method === 'PIX' || method === 'BANK_SLIP'
        const slipLine = '34191.79001 01043.510047 91020.150008 1 8435005999.90'
        return HttpResponse.json({
            ...mockPaymentAwaitingPix,
            orderId,
            method,
            paymentInstructions: offline
                ? method === 'BANK_SLIP'
                    ? slipLine
                    : mockPaymentAwaitingPix.paymentInstructions
                : null,
            externalTransactionId: offline ? mockPaymentAwaitingPix.externalTransactionId : null,
            status: offline ? ('AWAITING_PAYMENT' as const) : ('PAID' as const),
        })
    }),
]
