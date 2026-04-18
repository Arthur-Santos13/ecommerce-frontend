import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { parseApiError } from '@/services'
import { ErrorState, Skeleton } from '@/shared'
import { orderService } from '../services/orderService'
import type { OrderResponse } from '../types/order.types'
import '@/app/styles/order.css'

export default function OrderListPage() {
    const { user } = useAuthContext()
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const loadedOnce = useRef(false)

    const fetchOrders = useCallback((isRefresh = false) => {
        if (!user?.id) return
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        setError(null)
        orderService
            .findByCustomer(user.id)
            .then((data) => {
                setOrders(data)
                loadedOnce.current = true
            })
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => {
                setLoading(false)
                setRefreshing(false)
            })
    }, [user])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    if (loading && !loadedOnce.current)
        return (
            <div className="order-list">
                <div className="order-list__heading">
                    <div><Skeleton height="1.5rem" width="8rem" /></div>
                </div>
                <ul className="order-list__list" aria-busy="true" aria-label="Loading orders">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} className="order-list__skeleton-item">
                            <div className="order-list__skeleton-main">
                                <Skeleton height="1rem" width="6rem" />
                                <Skeleton height="0.8125rem" width="5rem" />
                            </div>
                            <div className="order-list__skeleton-meta">
                                <Skeleton height="1.25rem" width="5.5rem" borderRadius="12px" />
                                <Skeleton height="1rem" width="4rem" />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )

    if (error) return <ErrorState message={error} onRetry={() => fetchOrders()} />

    return (
        <div className="order-list">
            <div className="order-list__heading">
                <h1 className="order-list__title">My Orders</h1>
                <button
                    className="order-list__refresh-btn"
                    disabled={refreshing}
                    onClick={() => fetchOrders(true)}
                >
                    {refreshing ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

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
                                    {order.status.replace(/_/g, ' ')}
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

