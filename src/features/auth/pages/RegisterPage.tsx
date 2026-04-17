import { Link } from 'react-router-dom'
import '@/app/styles/auth.css'

/**
 * Registration page — implemented in Phase 3 (auth).
 * Full form (username, email, password) will be connected to the backend
 * once a register endpoint is available. For now it links back to login.
 */
export default function RegisterPage() {
    return (
        <div className="auth-page">
            <div className="auth-form">
                <h1 className="auth-form__title">Create account</h1>
                <p className="auth-form__footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
