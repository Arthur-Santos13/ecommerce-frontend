import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AuthUser, LoginRequest } from '../types/auth.types'
import { authService } from '../services/authService'
import { decodeToken } from '../utils/decodeToken'
import { tokenStorage } from '../utils/tokenStorage'
import { useNotificationStore } from '@/store/notificationStore'

const REFRESH_BUFFER_SEC = 60 // refresh this many seconds before exp

interface AuthContextValue {
    user: AuthUser | null
    login: (credentials: LoginRequest) => Promise<void>
    logout: () => Promise<void>
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const token = tokenStorage.getAccessToken()
        return token ? decodeToken(token) : null
    })

    const login = useCallback(async (credentials: LoginRequest) => {
        const response = await authService.login(credentials)
        const decoded = decodeToken(response.token)
        setUser(decoded)
    }, [])

    const logout = useCallback(async () => {
        await authService.logout()
        setUser(null)
    }, [])

    const refreshSession = useCallback(async () => {
        try {
            const response = await authService.refresh()
            const decoded = decodeToken(response.token)
            setUser(decoded)
        } catch {
            await authService.logout()
            setUser(null)
            useNotificationStore.getState().push('error', 'Your session has expired. Please sign in again.')
        }
    }, [])

    // Proactive token refresh — REFRESH_BUFFER_SEC before expiry
    useEffect(() => {
        if (!user?.exp) return
        const nowSec = Math.floor(Date.now() / 1000)
        const delayMs = (user.exp - nowSec - REFRESH_BUFFER_SEC) * 1000
        if (delayMs <= 0) return
        const timer = setTimeout(() => void refreshSession(), delayMs)
        return () => clearTimeout(timer)
    }, [user?.exp, refreshSession])

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshSession }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
    return ctx
}
