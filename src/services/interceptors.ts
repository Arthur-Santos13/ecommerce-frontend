import { apiClient } from './apiClient'

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

    // ── Response: pass through; error handling delegated to errorHandler ─
    apiClient.interceptors.response.use(
        (response) => response,
        (error) => Promise.reject(error),
    )
}
