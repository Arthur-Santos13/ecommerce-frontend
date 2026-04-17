import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

/**
 * Redirects authenticated users away from public-only pages (login, register).
 */
export default function GuestRoute() {
    const { user } = useAuthContext()

    if (user) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
