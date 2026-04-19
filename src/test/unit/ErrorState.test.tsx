import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorState } from '@/shared/components/ErrorState'
import { renderWithProviders } from '../utils/renderWithProviders'

describe('ErrorState', () => {
    it('renders the error message', () => {
        renderWithProviders(<ErrorState message="Something went wrong" />)
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('shows retry button when onRetry is provided', () => {
        renderWithProviders(<ErrorState message="Error" onRetry={() => { }} />)
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('does not show retry button when onRetry is omitted', () => {
        renderWithProviders(<ErrorState message="Error" />)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('calls onRetry when the button is clicked', async () => {
        const onRetry = vi.fn()
        renderWithProviders(<ErrorState message="Error" onRetry={onRetry} />)
        await userEvent.click(screen.getByRole('button', { name: /try again/i }))
        expect(onRetry).toHaveBeenCalledTimes(1)
    })
})
