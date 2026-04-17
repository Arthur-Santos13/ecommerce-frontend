import type { AuthUser } from '../types/auth.types'

interface JwtPayload {
    sub: string
    roles: string[]
    exp: number
}

export function decodeToken(token: string): AuthUser | null {
    try {
        const [, payload] = token.split('.')
        const decoded: JwtPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        const nowSec = Math.floor(Date.now() / 1000)
        if (decoded.exp < nowSec) return null
        return { username: decoded.sub, roles: decoded.roles, exp: decoded.exp }
    } catch {
        return null
    }
}

export function isTokenExpired(token: string): boolean {
    const user = decodeToken(token)
    return user === null
}
