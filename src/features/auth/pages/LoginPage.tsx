import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import '@/app/styles/auth.css'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { ApiException } from '@/services/errorHandler'

export default function LoginPage() {
    const { login } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await login({ username, password })
            navigate(from, { replace: true })
        } catch (err) {
            setError(err instanceof ApiException ? err.message : 'Login failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <h1 className="auth-form__title">Sign in</h1>

                {error && <p className="auth-form__error" role="alert">{error}</p>}

                <label className="auth-form__label" htmlFor="username">Username</label>
                <input
                    id="username"
                    className="auth-form__input"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label className="auth-form__label" htmlFor="password">Password</label>
                <input
                    id="password"
                    className="auth-form__input"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="auth-form__submit" type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>

                <p className="auth-form__footer">
                    Don&apos;t have an account? <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    )
}
