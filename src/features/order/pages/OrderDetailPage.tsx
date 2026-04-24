import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { parseApiError } from '@/services'
import { ErrorState, Skeleton } from '@/shared'
import { orderService } from '../services/orderService'
import { useOrderPolling } from '@/hooks/useOrderPolling'
import { useNotificationStore } from '@/store/notificationStore'
import '@/app/styles/order.css'

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')
    const { order, loading, error, polling, refresh } = useOrderPolling(id)
    const push = useNotificationStore((s) => s.push)
    const [cancelling, setCancelling] = useState(false)
    const [cancelError, setCancelError] = useState<string | null>(null)

    async function handleCancel() {
        if (!order) return
        setCancelling(true)
        setCancelError(null)
        try {
            await orderService.cancel(order.id)
            push('success', 'Order cancelled successfully.')
            refresh()
        } catch (err) {
            const msg = parseApiError(err).message
            setCancelError(msg)
            push('error', `Failed to cancel order: ${msg}`)
        } finally {
            setCancelling(false)
        }
    }

    if (loading)
        return (
            <div className="order-detail">
                <div className="order-detail__skeleton-breadcrumb">
                    <Skeleton height="0.875rem" width="5rem" />
                    <Skeleton height="0.875rem" width="3rem" />
                </div>
                <div className="order-detail__card" aria-busy="true" aria-label="Loading order">
                    <div className="order-detail__skeleton-header">
                        <div className="order-detail__skeleton-header-left">
                            <Skeleton height="1.125rem" width="12rem" />
                            <Skeleton height="0.8125rem" width="8rem" />
                        </div>
                        <Skeleton height="1.25rem" width="7rem" borderRadius="12px" />
                    </div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="order-detail__skeleton-row">
                            <Skeleton height="0.875rem" width="45%" />
                            <Skeleton height="0.875rem" width="8%" />
                            <Skeleton height="0.875rem" width="5%" />
                            <Skeleton height="0.875rem" width="8%" />
                        </div>
                    ))}
                </div>
            </div>
        )

    if (error)
        return (
            <div className="order-detail">
                <ErrorState message={error} onRetry={refresh} />
            </div>
        )
    if (!order) return null

    const canCancel = order.status === 'AWAITING_PAYMENT'

    return (
        <div className="order-detail">
            <nav className="order-detail__breadcrumb" aria-label="Breadcrumb">
                <Link
                    to={isAdmin ? '/admin/orders' : '/orders'}
                    className="order-detail__breadcrumb-link"
                >
                    {isAdmin ? 'Orders' : 'My Orders'}
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
                    <div className="order-detail__status-wrap">
                        {polling && (
                            <span
                                className="order-detail__polling-indicator"
                                aria-label="Checking for status updates"
                                title="Checking for status updates…"
                            />
                        )}
                        <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>

                {order.status === 'AWAITING_PAYMENT' && (
                    <div className="order-detail__awaiting-notice">
                        <strong>Awaiting payment confirmation.</strong> Your order was received and
                        is being processed. This page updates automatically.
                    </div>
                )}

                {order.status === 'CONFIRMED' && (
                    <div className="order-detail__confirmed-notice">
                        <strong>Order confirmed!</strong> Your payment was accepted and the order
                        is being prepared.
                    </div>
                )}

                {order.status === 'CANCELLED' && (
                    <div className="order-detail__cancelled-notice">
                        <strong>Order cancelled.</strong> This order has been cancelled and no
                        charge was made.
                    </div>
                )}

                {order.status === 'PAYMENT_FAILED' && (
                    <div className="order-detail__failure">
                        <strong>Payment failed.</strong>
                        {order.failureReason ? ` Reason: ${order.failureReason}` : ''}
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

                {(canCancel || !polling) && (
                    <div className="order-detail__actions">
                        {cancelError && (
                            <p className="order-detail__cancel-error">{cancelError}</p>
                        )}
                        {!polling && (
                            <button
                                className="order-detail__refresh-btn"
                                onClick={refresh}
                            >
                                Refresh
                            </button>
                        )}
                        {canCancel && (
                            <button
                                className="order-detail__cancel-btn"
                                disabled={cancelling}
                                onClick={() => void handleCancel()}
                            >
                                {cancelling ? 'Cancelling…' : 'Cancel Order'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

