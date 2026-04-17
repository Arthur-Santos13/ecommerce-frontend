import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthUser, LoginRequest } from '../types/auth.types'
import { authService } from '../services/authService'
import { decodeToken } from '../utils/decodeToken'
import { tokenStorage } from '../utils/tokenStorage'

interface AuthContextValue {
  user: AuthUser | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
