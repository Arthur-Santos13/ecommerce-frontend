import { NavLink } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { useTheme } from '@/app/context/ThemeContext'
import '@/app/styles/sidebar.css'

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { user, logout } = useAuthContext()
    const totalItems = useCartStore((s) => s.totalItems)
    const { theme, toggleTheme } = useTheme()

    return (
        <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
            <button
                className="sidebar__close-btn"
                onClick={onClose}
                aria-label="Close menu"
            >
                ✕
            </button>

            {/* Brand */}
            <div className="sidebar__brand">
                <NavLink to="/" className="sidebar__brand-name">
                    ShopCommerce
                </NavLink>
                <span className="sidebar__brand-sub">E-Commerce</span>
            </div>

            {/* User */}
            {user && (
                <div className="sidebar__user">
                    <div className="sidebar__user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar__user-info">
                        <span className="sidebar__user-name">{user.username}</span>
                        <span className="sidebar__user-role">{user.roles[0] ?? 'USER'}</span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            {user && (
                <nav className="sidebar__nav" aria-label="Main navigation">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                        }
                    >
                        <IconProducts />
                        Products
                    </NavLink>
                    <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                            `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                        }
                    >
                        <IconCart />
                        Cart
                        {totalItems > 0 && (
                            <span className="sidebar__nav-badge">{totalItems}</span>
                        )}
                    </NavLink>
                    <NavLink
                        to="/orders"
                        className={({ isActive }) =>
                            `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                        }
                    >
                        <IconOrders />
                        Orders
                    </NavLink>
                </nav>
            )}

            {/* Bottom actions */}
            <div className="sidebar__footer">
                <button
                    className="sidebar__footer-btn"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <IconSun /> : <IconMoon />}
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                {user && (
                    <button
                        className="sidebar__footer-btn sidebar__footer-btn--signout"
                        onClick={() => void logout()}
                    >
                        <IconSignOut />
                        Sign out
                    </button>
                )}
            </div>
        </aside>
    )
}

// ── Inline SVG Icons ──────────────────────────────────────────────────────────

function IconProducts() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="7" height="7" rx="1" />
            <rect x="15" y="3" width="7" height="7" rx="1" />
            <rect x="2" y="14" width="7" height="7" rx="1" />
            <rect x="15" y="14" width="7" height="7" rx="1" />
        </svg>
    )
}

function IconCart() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    )
}

function IconOrders() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    )
}

function IconSun() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    )
}

function IconMoon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}

function IconSignOut() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    )
}
