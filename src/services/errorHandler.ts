import axios, { AxiosError } from 'axios'

export interface ApiError {
    status: number
    message: string
    errors?: Record<string, string[]>
}

export class ApiException extends Error {
    readonly status: number
    readonly errors?: Record<string, string[]>

    constructor({ status, message, errors }: ApiError) {
        super(message)
        this.name = 'ApiException'
        this.status = status
        this.errors = errors
    }
}

export function parseApiError(error: unknown): ApiException {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>
        const status = axiosError.response?.status ?? 0
        const data = axiosError.response?.data

        if (status === 0 || axiosError.code === 'ERR_NETWORK') {
            return new ApiException({
                status: 0,
                message: 'Unable to reach the server. Check your connection.',
            })
        }

        if (status === 401) {
            return new ApiException({ status, message: 'Unauthorized. Please log in again.' })
        }

        if (status === 403) {
            return new ApiException({ status, message: 'You do not have permission to perform this action.' })
        }

        if (status === 404) {
            return new ApiException({ status, message: 'The requested resource was not found.' })
        }

        if (status === 429) {
            return new ApiException({ status, message: 'Too many requests. Please slow down and try again shortly.' })
        }

        if (status === 422 || status === 400) {
            return new ApiException({
                status,
                message: data?.message ?? 'Validation failed.',
                errors: data?.errors,
            })
        }

        if (status === 503) {
            return new ApiException({ status, message: 'Service temporarily unavailable. Please try again in a moment.' })
        }

        if (status >= 500) {
            return new ApiException({
                status,
                message: 'An unexpected server error occurred. Please try again later.',
            })
        }

        return new ApiException({
            status,
            message: data?.message ?? 'An unexpected error occurred.',
        })
    }

    if (error instanceof Error) {
        return new ApiException({ status: 0, message: error.message })
    }

    return new ApiException({ status: 0, message: 'An unknown error occurred.' })
}
