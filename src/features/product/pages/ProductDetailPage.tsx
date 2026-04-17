import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { parseApiError } from '@/services'
import type { ProductResponse } from '../types/product.types'
import { productService } from '../services/productService'
import '@/app/styles/product.css'

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<ProductResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        productService
            .findById(id)
            .then(setProduct)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <p className="product-detail__status">Loading…</p>
    if (error) return <p className="product-detail__status product-detail__status--error">{error}</p>
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
