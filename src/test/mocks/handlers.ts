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
    http.get(`${BASE}/api/v1/orders`, () => HttpResponse.json([mockOrder])),
    http.post(`${BASE}/api/v1/orders`, () => HttpResponse.json(mockOrder, { status: 201 })),
    http.get(`${BASE}/api/v1/orders/:id`, ({ params }) =>
        HttpResponse.json({ ...mockOrder, id: params.id as string }),
    ),
    http.patch(`${BASE}/api/v1/orders/:id/cancel`, ({ params }) =>
        HttpResponse.json({ ...mockOrder, id: params.id as string, status: 'CANCELLED' }),
    ),
]
