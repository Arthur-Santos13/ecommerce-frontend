import { apiClient } from '@/services/apiClient'
import type { LoginRequest, LoginResponse, RefreshRequest } from '../types/auth.types'
import { tokenStorage } from '../utils/tokenStorage'

export const authService = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
        tokenStorage.setTokens(data.token, data.refreshToken)
        return data
    },

    async refresh(): Promise<LoginResponse> {
        const refreshToken = tokenStorage.getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token available')
        const body: RefreshRequest = { refreshToken }
        const { data } = await apiClient.post<LoginResponse>('/auth/refresh', body)
        tokenStorage.setTokens(data.token, data.refreshToken)
        return data
    },

    async logout(): Promise<void> {
        const refreshToken = tokenStorage.getRefreshToken()
        if (refreshToken) {
            await apiClient.post('/auth/logout', { refreshToken }).catch(() => {
                // best-effort: always clear locally even if server call fails
            })
        }
        tokenStorage.clear()
    },
}
