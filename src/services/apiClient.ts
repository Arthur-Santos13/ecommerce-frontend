import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
    baseURL: BASE_URL,
    // Must be below the gateway response-timeout (10 s) so Axios surfaces the
    // error before the gateway closes the connection with a 504.
    timeout: 9_000,
    headers: {
        'Content-Type': 'application/json',
    },
})
