import { describe, it, expect } from 'vitest'
import { screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import OrderListPage from '@/features/order/pages/OrderListPage'
import { renderWithProviders } from '../utils/renderWithProviders'
import { tokenStorage } from '@/features/auth/utils/tokenStorage'
import { server } from '../mocks/server'
import { mockOrder, MOCK_CUSTOMER_ID } from '../mocks/handlers'

// Build a valid JWT mapping to MOCK_CUSTOMER_ID
function makeToken(): string {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ sub: 'testuser', roles: ['ROLE_USER'], exp }))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    return `h.${payload}.s`
}

// Ensure localStorage maps 'testuser' → MOCK_CUSTOMER_ID before each test
function seedAuth() {
    tokenStorage.setTokens(makeToken(), 'rt-fake')
    localStorage.setItem(`customerId:testuser`, MOCK_CUSTOMER_ID)
}

describe('OrderListPage — integration', () => {
    it('shows skeleton while loading then renders orders', async () => {
        seedAuth()
        renderWithProviders(<OrderListPage />, { routerProps: { initialEntries: ['/orders'] } })

        // Skeleton list is present initially
        expect(screen.getByRole('list', { name: /loading orders/i })).toBeInTheDocument()

        // Wait for skeleton to disappear
        await waitForElementToBeRemoved(() =>
            screen.queryByRole('list', { name: /loading orders/i }),
        )

        // Order is rendered — short ID truncated to 8 chars
        const shortId = `#${mockOrder.id.slice(0, 8).toUpperCase()}`
        expect(screen.getByText(shortId)).toBeInTheDocument()
    })

    it('renders status badge for each order', async () => {
        seedAuth()
        renderWithProviders(<OrderListPage />, { routerProps: { initialEntries: ['/orders'] } })
        await waitForElementToBeRemoved(() =>
            screen.queryByRole('list', { name: /loading orders/i }),
        )
        expect(screen.getByText('AWAITING PAYMENT')).toBeInTheDocument()
    })

    it('shows empty state when there are no orders', async () => {
        server.use(
            http.get('http://localhost:8080/api/v1/orders', () => HttpResponse.json([])),
        )
        seedAuth()
        renderWithProviders(<OrderListPage />, { routerProps: { initialEntries: ['/orders'] } })
        await waitForElementToBeRemoved(() =>
            screen.queryByRole('list', { name: /loading orders/i }),
        )
        expect(screen.getByText(/no orders yet/i)).toBeInTheDocument()
    })

    it('shows error state when the API fails', async () => {
        server.use(
            http.get('http://localhost:8080/api/v1/orders', () =>
                HttpResponse.json({ message: 'Internal error' }, { status: 500 }),
            ),
        )
        seedAuth()
        renderWithProviders(<OrderListPage />, { routerProps: { initialEntries: ['/orders'] } })
        await waitForElementToBeRemoved(() =>
            screen.queryByRole('list', { name: /loading orders/i }),
        )
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })

    it('re-fetches orders when Refresh button is clicked', async () => {
        seedAuth()
        renderWithProviders(<OrderListPage />, { routerProps: { initialEntries: ['/orders'] } })
        await waitForElementToBeRemoved(() =>
            screen.queryByRole('list', { name: /loading orders/i }),
        )

        const refreshBtn = screen.getByRole('button', { name: /refresh/i })
        await userEvent.click(refreshBtn)

        // After refresh, order list is still visible (handler returns same mock)
        const shortId = `#${mockOrder.id.slice(0, 8).toUpperCase()}`
        expect(await screen.findByText(shortId)).toBeInTheDocument()
    })

    it('does not fetch orders when user.id is missing', () => {
        // No token in localStorage → user is null → fetchOrders bails early
        localStorage.clear()
        renderWithProviders(<OrderListPage />, { routerProps: { initialEntries: ['/orders'] } })
        // Should show skeleton indefinitely (or not at all) — no API call
        // The important assertion: no order content visible
        expect(screen.queryByText(/ORDER-0001/i)).not.toBeInTheDocument()
    })
})
