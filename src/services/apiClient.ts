import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
    headers: {
        'Content-Type': 'application/json',
    },
})
