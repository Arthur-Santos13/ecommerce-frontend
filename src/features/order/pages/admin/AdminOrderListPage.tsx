import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { parseApiError } from '@/services'
import { ErrorState } from '@/shared'
import type { OrderResponse, OrderStatus } from '../../types/order.types'
import { orderService } from '../../services/orderService'
import '@/app/styles/admin.css'

const STATUS_BADGE: Record<OrderStatus, string> = {
    AWAITING_PAYMENT: 'badge--warning',
    CONFIRMED: 'badge--success',
    PAYMENT_FAILED: 'badge--danger',
    CANCELLED: 'badge--muted',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
    AWAITING_PAYMENT: 'Awaiting payment',
    CONFIRMED: 'Confirmed',
    PAYMENT_FAILED: 'Payment failed',
    CANCELLED: 'Cancelled',
}

const ALL = 'ALL'
type FilterValue = OrderStatus | typeof ALL

export default function AdminOrderListPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterValue>(ALL)

    const fetchOrders = useCallback(() => {
        setLoading(true)
        setError(null)
        orderService
            .findAll()
            .then(setOrders)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const visible =
        filter === ALL ? orders : orders.filter((o) => o.status === filter)

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Orders</h1>
                    <p className="admin-page__subtitle">{orders.length} total</p>
                </div>

                <select
                    className="admin-form__select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterValue)}
                    aria-label="Filter by status"
                >
                    <option value={ALL}>All statuses</option>
                    {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                        </option>
                    ))}
                </select>
            </div>

            {error && <ErrorState message={error} onRetry={fetchOrders} />}

            {loading && !orders.length && <p className="admin-empty">Loading orders…</p>}

            {!loading && !error && visible.length === 0 && (
                <p className="admin-empty">No orders found.</p>
            )}

            {visible.length > 0 && (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Created</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((o) => (
                                <tr key={o.id}>
                                    <td>
                                        <code title={o.id}>{o.id.slice(0, 8)}…</code>
                                    </td>
                                    <td>
                                        <code title={o.customerId}>{o.customerId.slice(0, 8)}…</code>
                                    </td>
                                    <td>
                                        <span className={`badge ${STATUS_BADGE[o.status]}`}>
                                            {STATUS_LABEL[o.status]}
                                        </span>
                                    </td>
                                    <td>
                                        {o.totalAmount.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        })}
                                    </td>
                                    <td>
                                        {new Date(o.createdAt).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td>
                                        <div className="admin-table__actions">
                                            <Link
                                                to={`/admin/orders/${o.id}`}
                                                className="btn btn--secondary btn--sm"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
