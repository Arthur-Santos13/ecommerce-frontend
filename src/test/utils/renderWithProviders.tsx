import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ThemeProvider } from '@/app/context/ThemeContext'

interface Options extends Omit<RenderOptions, 'wrapper'> {
    routerProps?: MemoryRouterProps
}

export function renderWithProviders(ui: ReactElement, { routerProps, ...options }: Options = {}) {
    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <ThemeProvider>
                <AuthProvider>
                    <MemoryRouter {...routerProps}>{children}</MemoryRouter>
                </AuthProvider>
            </ThemeProvider>
        )
    }
    return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
