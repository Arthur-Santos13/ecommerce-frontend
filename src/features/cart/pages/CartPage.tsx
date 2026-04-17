import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { orderService } from '@/features/order/services/orderService'
import { parseApiError } from '@/services'
import '@/app/styles/cart.css'

export default function CartPage() {
    const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCartStore()
    const { user } = useAuthContext()
    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)
    const [orderError, setOrderError] = useState<string | null>(null)

    async function handlePlaceOrder() {
        if (!user || items.length === 0) return
        setSubmitting(true)
        setOrderError(null)
        try {
            const order = await orderService.create({
                customerId: user.id,
                items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            })
            clearCart()
            navigate(`/orders/${order.id}`)
        } catch (err) {
            setOrderError(parseApiError(err).message)
        } finally {
            setSubmitting(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="cart cart--empty">
                <h1 className="cart__title">Your Cart</h1>
                <p className="cart__empty-msg">Your cart is empty.</p>
                <Link to="/" className="cart__continue-link">
                    Continue Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="cart">
            <div className="cart__header">
                <h1 className="cart__title">Your Cart</h1>
                <span className="cart__count">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            </div>

            <ul className="cart__list">
                {items.map((item) => (
                    <li key={item.productId} className="cart__item">
                        <div className="cart__item-info">
                            <Link to={`/products/${item.productId}`} className="cart__item-name">
                                {item.name}
                            </Link>
                            <span className="cart__item-price">
                                {item.price.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                })}
                            </span>
                        </div>

                        <div className="cart__item-controls">
                            <button
                                className="cart__qty-btn"
                                aria-label="Decrease quantity"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                                −
                            </button>
                            <span className="cart__qty">{item.quantity}</span>
                            <button
                                className="cart__qty-btn"
                                aria-label="Increase quantity"
                                disabled={item.quantity >= item.availableQuantity}
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                                +
                            </button>

                            <span className="cart__item-subtotal">
                                {(item.price * item.quantity).toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                })}
                            </span>

                            <button
                                className="cart__remove-btn"
                                aria-label={`Remove ${item.name}`}
                                onClick={() => removeItem(item.productId)}
                            >
                                Remove
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="cart__footer">
                <button className="cart__clear-btn" onClick={clearCart} disabled={submitting}>
                    Clear Cart
                </button>
                <div className="cart__checkout">
                    {orderError && <p className="cart__order-error">{orderError}</p>}
                    <div className="cart__total">
                        <span className="cart__total-label">Total</span>
                        <span className="cart__total-price">
                            {totalPrice.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </span>
                    </div>
                    <button
                        className="cart__place-order-btn"
                        disabled={submitting}
                        onClick={() => void handlePlaceOrder()}
                    >
                        {submitting ? 'Placing Order…' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    )
}


if (items.length === 0) {
    return (
        <div className="cart cart--empty">
            <h1 className="cart__title">Your Cart</h1>
            <p className="cart__empty-msg">Your cart is empty.</p>
            <Link to="/" className="cart__continue-link">
                Continue Shopping
            </Link>
        </div>
    )
}

return (
    <div className="cart">
        <div className="cart__header">
            <h1 className="cart__title">Your Cart</h1>
            <span className="cart__count">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </div>

        <ul className="cart__list">
            {items.map((item) => (
                <li key={item.productId} className="cart__item">
                    <div className="cart__item-info">
                        <Link to={`/products/${item.productId}`} className="cart__item-name">
                            {item.name}
                        </Link>
                        <span className="cart__item-price">
                            {item.price.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </span>
                    </div>

                    <div className="cart__item-controls">
                        <button
                            className="cart__qty-btn"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                            −
                        </button>
                        <span className="cart__qty">{item.quantity}</span>
                        <button
                            className="cart__qty-btn"
                            aria-label="Increase quantity"
                            disabled={item.quantity >= item.availableQuantity}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                            +
                        </button>

                        <span className="cart__item-subtotal">
                            {(item.price * item.quantity).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </span>

                        <button
                            className="cart__remove-btn"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeItem(item.productId)}
                        >
                            Remove
                        </button>
                    </div>
                </li>
            ))}
        </ul>

        <div className="cart__footer">
            <button className="cart__clear-btn" onClick={clearCart}>
                Clear Cart
            </button>
            <div className="cart__total">
                <span className="cart__total-label">Total</span>
                <span className="cart__total-price">
                    {totalPrice.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })}
                </span>
            </div>
        </div>
    </div>
)
}

