import { useCallback, useEffect, useState } from 'react'
import { parseApiError } from '@/services'
import { ErrorState, Skeleton } from '@/shared'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import type { CategoryResponse, PageResponse, ProductFilter, ProductResponse } from '../types/product.types'
import { categoryService } from '../services/categoryService'
import { productService } from '../services/productService'
import '@/app/styles/product.css'

const SORT_OPTIONS = [
    { label: 'Name A–Z', value: 'name,asc' },
    { label: 'Name Z–A', value: 'name,desc' },
    { label: 'Price low–high', value: 'price,asc' },
    { label: 'Price high–low', value: 'price,desc' },
]

const DEFAULT_FILTER: ProductFilter = { page: 0, size: 20, sort: 'name,asc' }

export default function ProductListPage() {
    const [page, setPage] = useState<PageResponse<ProductResponse> | null>(null)
    const [filter, setFilter] = useState<ProductFilter>(DEFAULT_FILTER)
    const [categories, setCategories] = useState<CategoryResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        categoryService.findAll().then(setCategories).catch(() => setCategories([]))
    }, [])

    const fetchProducts = useCallback((f: ProductFilter) => {
        setLoading(true)
        setError(null)
        productService
            .findAll(f)
            .then(setPage)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchProducts(filter)
    }, [filter, fetchProducts])

    function handleApply(f: ProductFilter) {
        setFilter((prev) => ({ ...prev, ...f, page: 0 }))
    }

    function handleReset() {
        setFilter(DEFAULT_FILTER)
    }

    function handlePageChange(p: number) {
        setFilter((prev) => ({ ...prev, page: p }))
    }

    function handleSortChange(sort: string) {
        setFilter((prev) => ({ ...prev, sort, page: 0 }))
    }

    return (
        <div className="product-list-page">
            <aside className="product-list-page__sidebar">
                <ProductFilters
                    filter={filter}
                    categories={categories}
                    onApply={handleApply}
                    onReset={handleReset}
                />
            </aside>

            <main className="product-list-page__main">
                <div className="product-list-page__toolbar">
                    <p className="product-list-page__count">
                        {page
                            ? `${page.totalElements} product${page.totalElements !== 1 ? 's' : ''}`
                            : ''}
                    </p>
                    <div className="product-list-page__sort">
                        <label htmlFor="sort-select" className="product-filters__label">
                            Sort by
                        </label>
                        <select
                            id="sort-select"
                            className="product-filters__select"
                            value={filter.sort ?? 'name,asc'}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && !page && (
                    <ul className="product-grid" aria-busy="true" aria-label="Loading products">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <li key={i} className="product-card product-card--skeleton">
                                <div className="product-card__body">
                                    <Skeleton height="0.75rem" width="40%" />
                                    <Skeleton height="1.125rem" />
                                    <Skeleton height="0.875rem" />
                                    <Skeleton height="0.875rem" width="70%" />
                                </div>
                                <div className="product-card__footer">
                                    <Skeleton height="1rem" width="5rem" />
                                    <Skeleton height="1rem" width="4rem" />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {error && (
                    <ErrorState
                        message={error}
                        onRetry={() => fetchProducts(filter)}
                    />
                )}
                {!loading && !error && page && (
                    <>
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
