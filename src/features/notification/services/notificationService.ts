import { apiClient } from '@/services'
import type { NotificationRecord } from '../types/notification.types'

export const notificationService = {
    findAll(): Promise<NotificationRecord[]> {
        return apiClient.get<NotificationRecord[]>('/api/v1/notifications').then((r) => r.data)
    },

    findByRecipient(recipientId: string): Promise<NotificationRecord[]> {
        return apiClient
            .get<NotificationRecord[]>('/api/v1/notifications', { params: { recipientId } })
            .then((r) => r.data)
    },
}
