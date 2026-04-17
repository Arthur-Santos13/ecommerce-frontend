import { useCallback, useEffect, useRef, useState } from 'react'
import { orderService } from '@/features/order/services/orderService'
import type { OrderResponse } from '@/features/order/types/order.types'
import { isTerminal } from '@/features/order/utils/orderStatus'
import { useNotificationStore } from '@/store/notificationStore'

const DEFAULT_INTERVAL_MS = 5_000
const MAX_POLLS = 24 // stop after 2 minutes at 5s interval

interface UseOrderPollingOptions {
    /** Polling interval in milliseconds. Default: 5000 */
    intervalMs?: number
}

interface UseOrderPollingResult {
    order: OrderResponse | null
    loading: boolean
    error: string | null
    polling: boolean
    refresh: () => void
}

/**
 * Fetches an order by id and automatically polls while it is in a pending
 * (non-terminal) status. Polling stops when the status becomes terminal or
 * after MAX_POLLS attempts.
 */
export function useOrderPolling(
    id: string | undefined,
    options: UseOrderPollingOptions = {},
): UseOrderPollingResult {
    const { intervalMs = DEFAULT_INTERVAL_MS } = options

    const [order, setOrder] = useState<OrderResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [polling, setPolling] = useState(false)

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const pollCountRef = useRef(0)
    const mountedRef = useRef(true)
    const prevStatusRef = useRef<string | null>(null)

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const fetchOrder = useCallback(
        async (isInitial = false) => {
            if (!id) return
            try {
                const data = await orderService.findById(id)
                if (!mountedRef.current) return

                const prevStatus = prevStatusRef.current
                prevStatusRef.current = data.status
                if (prevStatus !== null && prevStatus !== data.status) {
                    const push = useNotificationStore.getState().push
                    if (data.status === 'CONFIRMED') {
                        push('success', 'Order confirmed! Your payment was accepted.')
                    } else if (data.status === 'PAYMENT_FAILED') {
                        push('error', 'Payment failed. Please contact support.')
                    } else if (data.status === 'CANCELLED') {
                        push('warning', 'Order cancelled.')
                    }
                }

                setOrder(data)
                setError(null)

                if (isTerminal(data.status) || pollCountRef.current >= MAX_POLLS) {
                    setPolling(false)
                    clearTimer()
                } else {
                    setPolling(true)
                    pollCountRef.current += 1
                    timerRef.current = setTimeout(() => void fetchOrder(), intervalMs)
                }
            } catch (err) {
                if (!mountedRef.current) return
                const msg = err instanceof Error ? err.message : 'Failed to load order'
                setError(msg)
                setPolling(false)
                clearTimer()
            } finally {
                if (mountedRef.current && isInitial) setLoading(false)
            }
        },
        [id, intervalMs, clearTimer],
    )

    // Manual refresh: reset counter and re-fetch
    const refresh = useCallback(() => {
        clearTimer()
        pollCountRef.current = 0
        void fetchOrder()
    }, [clearTimer, fetchOrder])

    useEffect(() => {
        mountedRef.current = true
        pollCountRef.current = 0
        prevStatusRef.current = null
        setLoading(true)
        setPolling(false)
        void fetchOrder(true)

        return () => {
            mountedRef.current = false
            clearTimer()
        }
    }, [id, fetchOrder, clearTimer])

    return { order, loading, error, polling, refresh }
}
