import type { AuthUser } from '../types/auth.types'

interface JwtPayload {
    sub: string
    roles: string[]
    exp: number
}

function getOrCreateCustomerId(username: string): string {
    const key = `customerId:${username}`
    const existing = localStorage.getItem(key)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(key, id)
    return id
}

export function decodeToken(token: string): AuthUser | null {
    try {
        const [, payload] = token.split('.')
        const decoded: JwtPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        const nowSec = Math.floor(Date.now() / 1000)
        if (decoded.exp < nowSec) return null
        return {
            id: getOrCreateCustomerId(decoded.sub),
            username: decoded.sub,
            roles: decoded.roles,
            exp: decoded.exp,
        }
    } catch {
        return null
    }
}

export function isTokenExpired(token: string): boolean {
    const user = decodeToken(token)
    return user === null
}
