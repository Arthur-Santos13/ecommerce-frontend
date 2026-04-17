import { createPortal } from 'react-dom'
import { useNotificationStore } from '@/store/notificationStore'
import { Toast } from './Toast'

export function ToastContainer() {
    const notifications = useNotificationStore((s) => s.notifications)

    if (notifications.length === 0) return null

    return createPortal(
        <div className="toast-container" aria-label="Notifications">
            {notifications.map((n) => (
                <Toast key={n.id} notification={n} />
            ))}
        </div>,
        document.body,
    )
}
