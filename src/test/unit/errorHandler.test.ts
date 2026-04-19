import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { parseApiError, ApiException } from '@/services/errorHandler'

function makeAxiosError(status: number, data?: object) {
    const err = new axios.AxiosError('error', undefined, undefined, undefined, {
        status,
        data: data ?? {},
        headers: {},
        config: { headers: {} as never },
        statusText: String(status),
    })
    return err
}

describe('parseApiError', () => {
    it('returns status 0 for network errors', () => {
        const err = new axios.AxiosError('Network Error')
        err.code = 'ERR_NETWORK'
        const result = parseApiError(err)
        expect(result.status).toBe(0)
        expect(result.message).toMatch(/reach the server/i)
    })

    it('maps 401 to Unauthorized message', () => {
        const result = parseApiError(makeAxiosError(401))
        expect(result.status).toBe(401)
        expect(result.message).toMatch(/unauthorized/i)
    })

    it('maps 403 to permission message', () => {
        const result = parseApiError(makeAxiosError(403))
        expect(result.status).toBe(403)
        expect(result.message).toMatch(/permission/i)
    })

    it('maps 404 to not found message', () => {
        const result = parseApiError(makeAxiosError(404))
        expect(result.status).toBe(404)
        expect(result.message).toMatch(/not found/i)
    })

    it('maps 429 to rate limit message', () => {
        const result = parseApiError(makeAxiosError(429))
        expect(result.status).toBe(429)
        expect(result.message).toMatch(/too many requests/i)
    })

    it('maps 503 to circuit breaker message', () => {
        const result = parseApiError(makeAxiosError(503))
        expect(result.status).toBe(503)
        expect(result.message).toMatch(/temporarily unavailable/i)
    })

    it('maps 422 with field errors', () => {
        const result = parseApiError(
            makeAxiosError(422, { message: 'Validation failed.', errors: { email: ['invalid'] } }),
        )
        expect(result.status).toBe(422)
        expect(result.errors).toEqual({ email: ['invalid'] })
    })

    it('maps 500+ to generic server error', () => {
        const result = parseApiError(makeAxiosError(500))
        expect(result.status).toBe(500)
        expect(result.message).toMatch(/server error/i)
    })

    it('returns ApiException instance for plain Error', () => {
        const result = parseApiError(new Error('boom'))
        expect(result).toBeInstanceOf(ApiException)
        expect(result.message).toBe('boom')
    })

    it('returns ApiException for unknown input', () => {
        const result = parseApiError('totally unknown')
        expect(result).toBeInstanceOf(ApiException)
        expect(result.status).toBe(0)
    })
})
