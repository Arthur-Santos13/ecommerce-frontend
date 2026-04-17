import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { parseApiError } from '@/services'
import { orderService } from '../services/orderService'
import type { OrderResponse } from '../types/order.types'
import '@/app/styles/order.css'

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [order, setOrder] = useState<OrderResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        orderService
            .findById(id)
            .then(setOrder)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <p className="order-detail__status">Loading order…</p>
    if (error) return <p className="order-detail__status order-detail__status--error">{error}</p>
    if (!order) return null

    return (
        <div className="order-detail">
            <nav className="order-detail__breadcrumb" aria-label="Breadcrumb">
                <Link to="/orders" className="order-detail__breadcrumb-link">
                    My Orders
                </Link>
                <span className="order-detail__breadcrumb-sep" aria-hidden="true">/</span>
                <span>#{order.id.slice(0, 8).toUpperCase()}</span>
            </nav>

            <div className="order-detail__card">
                <div className="order-detail__header">
                    <div>
                        <h1 className="order-detail__title">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </h1>
                        <p className="order-detail__date">
                            Placed on {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                        {order.status.replace('_', ' ')}
                    </span>
                </div>

                {order.failureReason && (
                    <div className="order-detail__failure">
                        <strong>Failure reason:</strong> {order.failureReason}
                    </div>
                )}

                <table className="order-detail__table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th className="order-detail__table-num">Unit price</th>
                            <th className="order-detail__table-num">Qty</th>
                            <th className="order-detail__table-num">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <Link
                                        to={`/products/${item.productId}`}
                                        className="order-detail__product-link"
                                    >
                                        {item.productName}
                                    </Link>
                                </td>
                                <td className="order-detail__table-num">
                                    {item.unitPrice.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    })}
                                </td>
                                <td className="order-detail__table-num">{item.quantity}</td>
                                <td className="order-detail__table-num">
                                    {item.subtotal.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="order-detail__total-row">
                            <td colSpan={3}>Total</td>
                            <td className="order-detail__table-num">
                                {order.totalAmount.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                })}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

