import { useEffect, useState } from 'react'
import { parseApiError } from '@/services'
import ProductCard from '../components/ProductCard'
import type { PageResponse, ProductFilter, ProductResponse } from '../types/product.types'
import { productService } from '../services/productService'
import '@/app/styles/product.css'

const DEFAULT_FILTER: ProductFilter = { page: 0, size: 20, sort: 'name,asc' }

export default function ProductListPage() {
    const [page, setPage] = useState<PageResponse<ProductResponse> | null>(null)
    const [filter, setFilter] = useState<ProductFilter>(DEFAULT_FILTER)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        productService
            .findAll(filter)
            .then(setPage)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [filter])

    function handlePageChange(p: number) {
        setFilter((prev) => ({ ...prev, page: p }))
    }

    return (
        <div className="product-list-page">
            <main className="product-list-page__main">
                {loading && <p className="product-list-page__status">Loading…</p>}
                {error && <p className="product-list-page__status product-list-page__status--error">{error}</p>}
                {!loading && !error && page && (
                    <>
                        <p className="product-list-page__count">
                            {page.totalElements} product{page.totalElements !== 1 ? 's' : ''}
                        </p>
                        {page.content.length === 0 ? (
                            <p className="product-list-page__status">No products found.</p>
                        ) : (
                            <ul className="product-grid">
                                {page.content.map((p) => (
                                    <li key={p.id}>
                                        <ProductCard product={p} />
                                    </li>
                                ))}
                            </ul>
                        )}
                        {page.totalPages > 1 && (
                            <nav className="product-pagination" aria-label="Pagination">
                                <button
                                    className="product-pagination__btn"
                                    disabled={page.page === 0}
                                    onClick={() => handlePageChange(page.page - 1)}
                                >
                                    ← Prev
                                </button>
                                <span className="product-pagination__info">
                                    {page.page + 1} / {page.totalPages}
                                </span>
                                <button
                                    className="product-pagination__btn"
                                    disabled={page.last}
                                    onClick={() => handlePageChange(page.page + 1)}
                                >
                                    Next →
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
