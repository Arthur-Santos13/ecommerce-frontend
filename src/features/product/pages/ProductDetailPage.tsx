import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { parseApiError } from '@/services'
import { ErrorState, Skeleton } from '@/shared'
import { useCartStore } from '@/store/cartStore'
import type { ProductResponse } from '../types/product.types'
import { productService } from '../services/productService'
import '@/app/styles/product.css'

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<ProductResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const addItem = useCartStore((s) => s.addItem)

    const [added, setAdded] = useState(false)

    const fetchProduct = useCallback(() => {
        if (!id) return
        setLoading(true)
        setError(null)
        productService
            .findById(id)
            .then(setProduct)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {
        fetchProduct()
    }, [fetchProduct])

    if (loading)
        return (
            <div className="product-detail">
                <div className="product-detail__skeleton-breadcrumb">
                    <Skeleton height="0.875rem" width="4rem" />
                    <Skeleton height="0.875rem" width="8rem" />
                </div>
                <div className="product-detail__card">
                    <div className="product-detail__header">
                        <div className="product-detail__skeleton-header">
                            <Skeleton height="0.75rem" width="5rem" />
                            <Skeleton height="1.375rem" width="14rem" />
                            <Skeleton height="0.75rem" width="6rem" />
                        </div>
                        <Skeleton height="1.5rem" width="6rem" borderRadius="12px" />
                    </div>
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Skeleton height="0.875rem" />
                        <Skeleton height="0.875rem" width="80%" />
                    </div>
                    <div className="product-detail__skeleton-pricing">
                        <Skeleton height="1.75rem" width="6rem" />
                        <Skeleton height="2.25rem" width="8rem" borderRadius="6px" />
                    </div>
                </div>
            </div>
        )

    if (error)
        return (
            <div className="product-detail">
                <ErrorState message={error} onRetry={fetchProduct} />
            </div>
        )
    if (!product) return null

    const inStock = product.availableQuantity > 0

    return (
        <div className="product-detail">
            <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
                <Link to="/" className="product-detail__breadcrumb-link">
                    Products
                </Link>
                <span className="product-detail__breadcrumb-sep" aria-hidden="true">/</span>
                <span>{product.name}</span>
            </nav>

            <div className="product-detail__card">
                <div className="product-detail__header">
                    <div>
                        {product.category && (
                            <span className="product-detail__category">{product.category.name}</span>
                        )}
                        <h1 className="product-detail__title">{product.name}</h1>
                        <p className="product-detail__sku">SKU: {product.sku}</p>
                    </div>
                    <span
                        className={`product-detail__badge${inStock ? '' : ' product-detail__badge--out'}`}
                    >
                        {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>

                {product.description && (
                    <p className="product-detail__description">{product.description}</p>
                )}

                <div className="product-detail__pricing">
                    <span className="product-detail__price">
                        {product.price.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        })}
                    </span>
                    <button
                        className={`product-detail__add-to-cart${added ? ' product-detail__add-to-cart--added' : ''}`}
                        disabled={!inStock || added}
                        onClick={() => {
                            addItem({
                                productId: product.id,
                                name: product.name,
                                price: product.price,
                                availableQuantity: product.availableQuantity,
                            })
                            setAdded(true)
                            setTimeout(() => setAdded(false), 1500)
                        }}
                    >
                        {added ? 'Added!' : (inStock ? 'Add to Cart' : 'Out of Stock')}
                    </button>
                </div>

                <dl className="product-detail__inventory">
                    <div className="product-detail__inventory-row">
                        <dt>In stock</dt>
                        <dd>{product.quantityInStock}</dd>
                    </div>
                    <div className="product-detail__inventory-row">
                        <dt>Reserved</dt>
                        <dd>{product.reservedQuantity}</dd>
                    </div>
                    <div className="product-detail__inventory-row">
                        <dt>Available</dt>
                        <dd>{product.availableQuantity}</dd>
                    </div>
                </dl>

                <div className="product-detail__meta">
                    <p>Created: {new Date(product.createdAt).toLocaleDateString('pt-BR')}</p>
                    <p>Updated: {new Date(product.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
        </div>
    )
}
