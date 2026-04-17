import { useEffect } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import type { Notification } from '../types/notification.types'

const DURATION: Record<string, number> = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
}

interface ToastProps {
    notification: Notification
}

export function Toast({ notification }: ToastProps) {
    const dismiss = useNotificationStore((s) => s.dismiss)

    useEffect(() => {
        const timer = setTimeout(
            () => dismiss(notification.id),
            DURATION[notification.type] ?? 4000,
        )
        return () => clearTimeout(timer)
    }, [notification.id, notification.type, dismiss])

    return (
        <div
            className={`toast toast--${notification.type}`}
            role={notification.type === 'error' ? 'alert' : 'status'}
            aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
        >
            <span className="toast__message">{notification.message}</span>
            <button
                className="toast__close"
                onClick={() => dismiss(notification.id)}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    )
}
