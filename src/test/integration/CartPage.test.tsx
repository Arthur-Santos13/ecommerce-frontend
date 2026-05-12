import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartPage from '@/features/cart/pages/CartPage'
import { renderWithProviders } from '../utils/renderWithProviders'
import { tokenStorage } from '@/features/auth/utils/tokenStorage'
import { useCartStore } from '@/store/cartStore'
import { getLastCheckoutPaymentMethod, mockProduct, MOCK_CUSTOMER_ID } from '../mocks/handlers'

function makeToken(): string {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ sub: 'testuser', roles: ['ROLE_USER'], exp }))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    return `h.${payload}.s`
}

function seedAuth() {
    tokenStorage.setTokens(makeToken(), 'rt-fake')
    localStorage.setItem(`customerId:testuser`, MOCK_CUSTOMER_ID)
}

describe('CartPage — integration', () => {
    beforeEach(() => {
        seedAuth()
        useCartStore.getState().clearCart()
        useCartStore.getState().addItem({
            productId: mockProduct.id,
            name: mockProduct.name,
            price: mockProduct.price,
            availableQuantity: mockProduct.availableQuantity,
        })
    })

    it('sends selected paymentMethod in POST /orders when placing order', async () => {
        const user = userEvent.setup()
        renderWithProviders(<CartPage />, { routerProps: { initialEntries: ['/cart'] } })

        await user.click(screen.getByRole('radio', { name: /^PIX$/i }))
        await user.click(screen.getByRole('button', { name: /place order/i }))

        await waitFor(() => {
            expect(getLastCheckoutPaymentMethod()).toBe('PIX')
        })
    })
})
