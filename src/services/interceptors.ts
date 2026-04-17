import axios from 'axios'
import { apiClient } from './apiClient'
import { parseApiError } from './errorHandler'
import { tokenStorage } from '@/features/auth/utils/tokenStorage'
import { authService } from '@/features/auth/services/authService'
import { useNotificationStore } from '@/store/notificationStore'

let isRefreshing = false
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function flushQueue(token: string | null, error: unknown) {
    pendingQueue.forEach((cb) => (token ? cb.resolve(token) : cb.reject(error)))
    pendingQueue = []
}

export function setupInterceptors(): void {
    // ── Request: inject JWT ────────────────────────────────────────────
    apiClient.interceptors.request.use(
        (config) => {
            const token = tokenStorage.getAccessToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => Promise.reject(error),
    )

    // ── Response: auto-refresh on 401, normalise all errors ───────────
    apiClient.interceptors.response.use(
        (response) => response,
        async (error) => {
            const original = error.config

            if (axios.isAxiosError(error) && error.response?.status === 401 && !original._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        pendingQueue.push({
                            resolve: (token) => {
                                original.headers.Authorization = `Bearer ${token}`
                                resolve(apiClient(original))
                            },
                            reject,
                        })
                    })
                }

                original._retry = true
                isRefreshing = true

                try {
                    const data = await authService.refresh()
                    flushQueue(data.token, null)
                    original.headers.Authorization = `Bearer ${data.token}`
                    return apiClient(original)
                } catch (refreshError) {
                    flushQueue(null, refreshError)
                    tokenStorage.clear()
                    useNotificationStore.getState().push('error', 'Session expired. Please sign in again.')
                    window.location.href = '/login'
                    return Promise.reject(parseApiError(refreshError))
                } finally {
                    isRefreshing = false
                }
            }

            return Promise.reject(parseApiError(error))
        },
    )
}
