import { create } from 'zustand'
import type { Notification, NotificationType } from '@/features/notification/types/notification.types'

interface NotificationStore {
    notifications: Notification[]
    push: (type: NotificationType, message: string) => void
    dismiss: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],

    push: (type, message) =>
        set((state) => ({
            notifications: [
                ...state.notifications,
                { id: crypto.randomUUID(), type, message },
            ],
        })),

    dismiss: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
}))
