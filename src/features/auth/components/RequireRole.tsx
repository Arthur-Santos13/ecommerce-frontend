import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

interface RequireRoleProps {
    /** At least one of these roles must be present. */
    roles: string[]
    /** Where to redirect when the role check fails. Default: '/'. */
    redirectTo?: string
}

/**
 * Route guard that renders nested routes only when the authenticated user
 * holds at least one of the required roles. Redirects otherwise.
 */
export default function RequireRole({ roles, redirectTo = '/' }: RequireRoleProps) {
    const { user } = useAuthContext()
    const location = useLocation()

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    const hasRole = roles.some((r) => user.roles.includes(r))
    if (!hasRole) {
        return <Navigate to={redirectTo} replace />
    }

    return <Outlet />
}
