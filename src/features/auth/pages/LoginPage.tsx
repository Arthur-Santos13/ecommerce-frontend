import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import '@/app/styles/auth.css'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { ApiException } from '@/services/errorHandler'
import { useTheme } from '@/app/context/ThemeContext'

export default function LoginPage() {
    const { login } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    const { theme, toggleTheme } = useTheme()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
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
            <button
                className="auth-page__theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>

            <div className="auth-page__brand">
                <span className="auth-page__brand-name">ShopCommerce</span>
                <p className="auth-page__brand-subtitle">E-Commerce &mdash; Sign in to your account</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {error && <p className="auth-form__error" role="alert">{error}</p>}

                <div className="auth-form__field">
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
                </div>

                <div className="auth-form__field">
                    <div className="auth-form__field-header">
                        <label className="auth-form__label" htmlFor="password">Password</label>
                        <a href="#" className="auth-form__forgot">Forgot password?</a>
                    </div>
                    <div className="auth-form__input-wrapper">
                        <input
                            id="password"
                            className="auth-form__input auth-form__input--with-toggle"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="auth-form__pw-toggle"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <IconEyeOff /> : <IconEye />}
                        </button>
                    </div>
                </div>

                <button className="auth-form__submit" type="submit" disabled={loading}>
                    {loading ? 'Signing in\u2026' : 'Sign in'}
                </button>

                <p className="auth-form__footer">
                    Don&apos;t have an account? <Link to="/register">Create account</Link>
                </p>
            </form>
        </div>
    )
}

function IconEye() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
function IconEyeOff() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    )
}
function IconSun() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    )
}
function IconMoon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}

