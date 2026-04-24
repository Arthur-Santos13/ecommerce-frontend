import { useCallback, useEffect, useState } from 'react'
import { parseApiError } from '@/services'
import { ErrorState } from '@/shared'
import type {
    NotificationRecord,
    NotificationStatus,
    NotificationChannel,
    BackendNotificationType,
} from '../types/notification.types'
import { notificationService } from '../services/notificationService'
import '@/app/styles/admin.css'

const STATUS_BADGE: Record<NotificationStatus, string> = {
    PENDING: 'badge--warning',
    SENT: 'badge--success',
    FAILED: 'badge--danger',
}

const CHANNEL_BADGE: Record<NotificationChannel, string> = {
    EMAIL: 'badge--info',
    SMS: 'badge--muted',
}

const TYPE_LABEL: Record<BackendNotificationType, string> = {
    ORDER_CREATED: 'Order created',
    PAYMENT_CONFIRMED: 'Payment confirmed',
    PAYMENT_FAILED: 'Payment failed',
}

const ALL = 'ALL'
type StatusFilter = NotificationStatus | typeof ALL

export default function AdminNotificationPage() {
    const [records, setRecords] = useState<NotificationRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<StatusFilter>(ALL)

    const fetchRecords = useCallback(() => {
        setLoading(true)
        setError(null)
        notificationService
            .findAll()
            .then(setRecords)
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchRecords()
    }, [fetchRecords])

    const visible =
        filter === ALL ? records : records.filter((r) => r.status === filter)

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Notification History</h1>
                    <p className="admin-page__subtitle">{records.length} total</p>
                </div>

                <select
                    className="admin-form__select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as StatusFilter)}
                    aria-label="Filter by status"
                >
                    <option value={ALL}>All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="SENT">Sent</option>
                    <option value="FAILED">Failed</option>
                </select>
            </div>

            {error && <ErrorState message={error} onRetry={fetchRecords} />}

            {loading && !records.length && (
                <p className="admin-empty">Loading notifications…</p>
            )}

            {!loading && !error && visible.length === 0 && (
                <p className="admin-empty">No notifications found.</p>
            )}

            {visible.length > 0 && (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Recipient</th>
                                <th>Type</th>
                                <th>Channel</th>
                                <th>Status</th>
                                <th>Subject</th>
                                <th>Sent at</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((n) => (
                                <tr key={n.id}>
                                    <td title={n.recipientId}>
                                        {n.recipientEmail ?? (
                                            <code>{n.recipientId.slice(0, 8)}…</code>
                                        )}
                                    </td>
                                    <td>{TYPE_LABEL[n.type]}</td>
                                    <td>
                                        <span className={`badge ${CHANNEL_BADGE[n.channel]}`}>
                                            {n.channel}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${STATUS_BADGE[n.status]}`}>
                                            {n.status}
                                        </span>
                                    </td>
                                    <td>{n.subject ?? '—'}</td>
                                    <td>
                                        {new Date(n.createdAt).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
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
