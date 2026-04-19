import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import ProductCard from '@/features/product/components/ProductCard'
import { renderWithProviders } from '../utils/renderWithProviders'
import type { ProductResponse } from '@/features/product/types/product.types'

const base: ProductResponse = {
    id: 'prod-001',
    name: 'Notebook Pro',
    description: 'Intel Core i7',
    price: 4999.9,
    sku: 'NB-001',
    version: 1,
    quantityInStock: 10,
    reservedQuantity: 2,
    availableQuantity: 8,
    category: { id: 'cat-1', name: 'Eletrônicos', description: null },
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
}

describe('ProductCard', () => {
    it('renders product name and price', () => {
        renderWithProviders(<ProductCard product={base} />)
        expect(screen.getByText('Notebook Pro')).toBeInTheDocument()
        expect(screen.getByText(/R\$\s*4\.999,90/)).toBeInTheDocument()
    })

    it('renders category name when present', () => {
        renderWithProviders(<ProductCard product={base} />)
        expect(screen.getByText('Eletrônicos')).toBeInTheDocument()
    })

    it('shows in-stock badge with quantity when available', () => {
        renderWithProviders(<ProductCard product={base} />)
        expect(screen.getByText('8 in stock')).toBeInTheDocument()
    })

    it('shows out-of-stock badge when availableQuantity is 0', () => {
        renderWithProviders(<ProductCard product={{ ...base, availableQuantity: 0 }} />)
        expect(screen.getByText('Out of stock')).toBeInTheDocument()
    })

    it('links to the product detail page', () => {
        renderWithProviders(<ProductCard product={base} />)
        expect(screen.getByRole('link')).toHaveAttribute('href', '/products/prod-001')
    })

    it('renders description when provided', () => {
        renderWithProviders(<ProductCard product={base} />)
        expect(screen.getByText('Intel Core i7')).toBeInTheDocument()
    })

    it('does not render description element when null', () => {
        renderWithProviders(<ProductCard product={{ ...base, description: null }} />)
        expect(screen.queryByText('Intel Core i7')).not.toBeInTheDocument()
    })

    it('does not render category element when null', () => {
        renderWithProviders(<ProductCard product={{ ...base, category: null }} />)
        expect(screen.queryByText('Eletrônicos')).not.toBeInTheDocument()
    })
})
