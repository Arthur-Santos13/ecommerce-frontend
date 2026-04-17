import { apiClient } from './apiClient'
import { parseApiError } from './errorHandler'

const TOKEN_KEY = 'access_token'

export function setupInterceptors(): void {
    // ── Request: inject JWT ────────────────────────────────────────────
    apiClient.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(TOKEN_KEY)
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => Promise.reject(error),
    )

    // ── Response: normalise errors into ApiException ───────────────────
    apiClient.interceptors.response.use(
        (response) => response,
        (error) => Promise.reject(parseApiError(error)),
}
