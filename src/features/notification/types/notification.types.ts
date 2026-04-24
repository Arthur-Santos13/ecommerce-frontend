export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
    id: string
    type: NotificationType
    message: string
}

// ── Backend notification history types ────────────────────────────────────────

export type BackendNotificationType = 'ORDER_CREATED' | 'PAYMENT_CONFIRMED' | 'PAYMENT_FAILED'
export type NotificationChannel = 'EMAIL' | 'SMS'
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED'

export interface NotificationRecord {
    id: string
    recipientId: string
    recipientEmail: string | null
    type: BackendNotificationType
    channel: NotificationChannel
    status: NotificationStatus
    subject: string | null
    body: string | null
    errorMessage: string | null
    createdAt: string
    updatedAt: string
}
