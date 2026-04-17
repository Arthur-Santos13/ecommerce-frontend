import { useAuthContext } from '../context/AuthContext'

/**
 * Returns true if the current user has all of the specified roles.
 */
export function useHasRole(...roles: string[]): boolean {
    const { user } = useAuthContext()
    if (!user) return false
    return roles.every((r) => user.roles.includes(r))
}
