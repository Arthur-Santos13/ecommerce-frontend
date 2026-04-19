import { describe, it, expect, beforeEach } from 'vitest'
import { tokenStorage } from '@/features/auth/utils/tokenStorage'

describe('tokenStorage', () => {
    beforeEach(() => localStorage.clear())

    it('returns null when no token is stored', () => {
        expect(tokenStorage.getAccessToken()).toBeNull()
        expect(tokenStorage.getRefreshToken()).toBeNull()
    })

    it('stores and retrieves both tokens', () => {
        tokenStorage.setTokens('access-abc', 'refresh-xyz')
        expect(tokenStorage.getAccessToken()).toBe('access-abc')
        expect(tokenStorage.getRefreshToken()).toBe('refresh-xyz')
    })

    it('clears both tokens', () => {
        tokenStorage.setTokens('access-abc', 'refresh-xyz')
        tokenStorage.clear()
        expect(tokenStorage.getAccessToken()).toBeNull()
        expect(tokenStorage.getRefreshToken()).toBeNull()
    })

    it('overwrites tokens on a second setTokens call', () => {
        tokenStorage.setTokens('old-access', 'old-refresh')
        tokenStorage.setTokens('new-access', 'new-refresh')
        expect(tokenStorage.getAccessToken()).toBe('new-access')
        expect(tokenStorage.getRefreshToken()).toBe('new-refresh')
    })
})
