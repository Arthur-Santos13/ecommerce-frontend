import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { parseApiError } from '@/services'
import { ErrorState } from '@/shared'
import type { ProductResponse } from '../../types/product.types'
import { productService } from '../../services/productService'
import '@/app/styles/admin.css'

export default function AdminProductListPage() {
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmId, setConfirmId] = useState<string | null>(null)

    const fetchProducts = useCallback(() => {
        setLoading(true)
        setError(null)
        productService
            .findAll({ size: 100, sort: 'name,asc' })
            .then((page) => setProducts(page.content))
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    async function handleDelete(id: string) {
        setDeletingId(id)
        try {
            await productService.delete(id)
            setProducts((prev) => prev.filter((p) => p.id !== id))
        } catch (err) {
            setError(parseApiError(err).message)
        } finally {
            setDeletingId(null)
            setConfirmId(null)
        }
    }

    async function handleRestore(id: string) {
        try {
            const restored = await productService.restore(id)
            setProducts((prev) => prev.map((p) => (p.id === id ? restored : p)))
        } catch (err) {
            setError(parseApiError(err).message)
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Products</h1>
                    <p className="admin-page__subtitle">{products.length} total</p>
                </div>
                <Link to="/admin/products/new" className="btn btn--primary">
                    + New Product
                </Link>
            </div>

            {error && <ErrorState message={error} onRetry={fetchProducts} />}

            {loading && !products.length && (
                <p className="admin-empty">Loading products…</p>
            )}

            {!loading && !error && products.length === 0 && (
                <p className="admin-empty">No products found.</p>
            )}

            {products.length > 0 && (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>
                                        <code>{p.sku}</code>
                                    </td>
                                    <td>{p.category?.name ?? '—'}</td>
                                    <td>
                                        {p.price.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        })}
                                    </td>
                                    <td>
                                        <span
                                            className={`stock-value ${p.availableQuantity <= 3 ? 'stock-value--low' : 'stock-value--ok'}`}
                                        >
                                            {p.availableQuantity}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-table__actions">
                                            <Link
                                                to={`/admin/products/${p.id}/edit`}
                                                className="btn btn--secondary btn--sm"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn--danger btn--sm"
                                                onClick={() => setConfirmId(p.id)}
                                                disabled={deletingId === p.id}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirm delete modal */}
            {confirmId && (
                <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="admin-modal">
                        <h2 className="admin-modal__title">Delete product?</h2>
                        <p className="admin-modal__body">
                            This will soft-delete the product. It can be restored later.
                        </p>
                        <div className="admin-modal__actions">
                            <button
                                className="btn btn--secondary"
                                onClick={() => setConfirmId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn--danger"
                                disabled={deletingId === confirmId}
                                onClick={() => void handleDelete(confirmId)}
                            >
                                {deletingId === confirmId ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
