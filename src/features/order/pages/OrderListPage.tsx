import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { parseApiError } from '@/services'
import { orderService } from '../services/orderService'
import type { OrderResponse } from '../types/order.types'
import '@/app/styles/order.css'

export default function OrderListPage() {
    const { user } = useAuthContext()
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        setLoading(true)
        orderService
            .findByCustomer(user.id)
            .then(setOrders)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [user])

    if (loading) return <p className="order-list__status">Loading orders…</p>
    if (error) return <p className="order-list__status order-list__status--error">{error}</p>

    return (
        <div className="order-list">
            <h1 className="order-list__title">My Orders</h1>

            {orders.length === 0 ? (
                <div className="order-list__empty">
                    <p>You have no orders yet.</p>
                    <Link to="/" className="order-list__shop-link">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <ul className="order-list__list">
                    {orders.map((order) => (
                        <li key={order.id} className="order-list__item">
                            <div className="order-list__item-main">
                                <Link to={`/orders/${order.id}`} className="order-list__item-id">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                </Link>
                                <span className="order-list__item-date">
                                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <div className="order-list__item-meta">
                                <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                                <span className="order-list__item-total">
                                    {order.totalAmount.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    })}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

