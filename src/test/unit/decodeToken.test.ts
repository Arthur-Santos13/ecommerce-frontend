import { describe, it, expect, beforeEach } from 'vitest'
import { decodeToken, isTokenExpired } from '@/features/auth/utils/decodeToken'

// Build a JWT with a given payload (no real signing — just base64)
function makeToken(payload: object): string {
    const encoded = btoa(JSON.stringify(payload))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    return `header.${encoded}.sig`
}

describe('decodeToken', () => {
    beforeEach(() => localStorage.clear())

    it('returns AuthUser for a valid, non-expired token', () => {
        const exp = Math.floor(Date.now() / 1000) + 3600
        const token = makeToken({ sub: 'alice', roles: ['ROLE_USER'], exp })

        const user = decodeToken(token)

        expect(user).not.toBeNull()
        expect(user!.username).toBe('alice')
        expect(user!.roles).toContain('ROLE_USER')
        expect(user!.exp).toBe(exp)
    })

    it('returns null for an expired token', () => {
        const exp = Math.floor(Date.now() / 1000) - 1
        const token = makeToken({ sub: 'alice', roles: [], exp })
        expect(decodeToken(token)).toBeNull()
    })

    it('returns null for a malformed token', () => {
        expect(decodeToken('not.a.jwt')).toBeNull()
    })

    it('generates a stable customerId for the same username', () => {
        const exp = Math.floor(Date.now() / 1000) + 3600
        const token = makeToken({ sub: 'bob', roles: [], exp })

        const first = decodeToken(token)
        const second = decodeToken(token)

        expect(first!.id).toBe(second!.id)
    })

    it('generates distinct customerIds for different usernames', () => {
        const exp = Math.floor(Date.now() / 1000) + 3600
        const t1 = makeToken({ sub: 'user1', roles: [], exp })
        const t2 = makeToken({ sub: 'user2', roles: [], exp })

        expect(decodeToken(t1)!.id).not.toBe(decodeToken(t2)!.id)
    })
})

describe('isTokenExpired', () => {
    beforeEach(() => localStorage.clear())

    it('returns false for a valid token', () => {
        const exp = Math.floor(Date.now() / 1000) + 3600
        expect(isTokenExpired(makeToken({ sub: 'u', roles: [], exp }))).toBe(false)
    })

    it('returns true for an expired token', () => {
        const exp = Math.floor(Date.now() / 1000) - 1
        expect(isTokenExpired(makeToken({ sub: 'u', roles: [], exp }))).toBe(true)
    })
})
