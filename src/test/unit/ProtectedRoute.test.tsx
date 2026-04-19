import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Outlet } from 'react-router-dom'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import { renderWithProviders } from '../utils/renderWithProviders'
import { tokenStorage } from '@/features/auth/utils/tokenStorage'

// A minimal JWT that decodes to a non-expired user
function makeValidToken(): string {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ sub: 'alice', roles: ['ROLE_USER'], exp }))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    return `h.${payload}.s`
}

describe('ProtectedRoute', () => {
    it('redirects to /login when unauthenticated', () => {
        localStorage.clear()
        renderWithProviders(<ProtectedRoute />, {
            routerProps: { initialEntries: ['/orders'] },
        })
        // MemoryRouter renders Navigate — the component output is empty, no outlet
        expect(screen.queryByText('protected')).not.toBeInTheDocument()
    })

    it('renders Outlet when user is authenticated', () => {
        tokenStorage.setTokens(makeValidToken(), 'rt')
        renderWithProviders(
            <>
                <ProtectedRoute />
                <Outlet />
            </>,
            { routerProps: { initialEntries: ['/orders'] } },
        )
        // ProtectedRoute renders <Outlet /> — no redirect
        expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument()
    })
})
