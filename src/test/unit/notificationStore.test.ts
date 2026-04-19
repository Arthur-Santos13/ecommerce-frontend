import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from '@/store/notificationStore'

describe('notificationStore', () => {
    beforeEach(() => useNotificationStore.setState({ notifications: [] }))

    it('starts with an empty list', () => {
        expect(useNotificationStore.getState().notifications).toHaveLength(0)
    })

    it('push() adds a notification with a unique id', () => {
        useNotificationStore.getState().push('success', 'Done!')
        const { notifications } = useNotificationStore.getState()
        expect(notifications).toHaveLength(1)
        expect(notifications[0].type).toBe('success')
        expect(notifications[0].message).toBe('Done!')
        expect(notifications[0].id).toBeTruthy()
    })

    it('push() accumulates multiple notifications', () => {
        useNotificationStore.getState().push('info', 'First')
        useNotificationStore.getState().push('error', 'Second')
        expect(useNotificationStore.getState().notifications).toHaveLength(2)
    })

    it('dismiss() removes only the target notification', () => {
        useNotificationStore.getState().push('info', 'Keep me')
        useNotificationStore.getState().push('error', 'Remove me')
        const { notifications } = useNotificationStore.getState()
        const removeId = notifications[1].id
        useNotificationStore.getState().dismiss(removeId)
        const remaining = useNotificationStore.getState().notifications
        expect(remaining).toHaveLength(1)
        expect(remaining[0].message).toBe('Keep me')
    })

    it('push() assigns unique ids to each notification', () => {
        useNotificationStore.getState().push('info', 'A')
        useNotificationStore.getState().push('info', 'B')
        const { notifications } = useNotificationStore.getState()
        expect(notifications[0].id).not.toBe(notifications[1].id)
    })
})
