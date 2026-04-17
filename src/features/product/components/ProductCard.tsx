import { Link } from 'react-router-dom'
import type { ProductResponse } from '../types/product.types'

interface Props {
    product: ProductResponse
}

export default function ProductCard({ product }: Props) {
    const inStock = product.availableQuantity > 0

    return (
        <Link to={`/products/${product.id}`} className="product-card">
            <div className="product-card__body">
                {product.category && (
                    <span className="product-card__category">{product.category.name}</span>
                )}
                <h3 className="product-card__name">{product.name}</h3>
                {product.description && (
                    <p className="product-card__description">{product.description}</p>
                )}
            </div>
            <div className="product-card__footer">
                <span className="product-card__price">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className={`product-card__badge${inStock ? '' : ' product-card__badge--out'}`}>
                    {inStock ? `${product.availableQuantity} in stock` : 'Out of stock'}
                </span>
            </div>
        </Link>
    )
}
