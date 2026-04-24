import { NavLink } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { useTheme } from '@/app/context/ThemeContext'
import '@/app/styles/sidebar.css'

interface AdminSidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const { user, logout } = useAuthContext()
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
                <NavLink to="/admin" className="sidebar__brand-name">
                    ShopCommerce
                </NavLink>
                <span className="sidebar__brand-sub sidebar__brand-sub--admin">Admin Panel</span>
            </div>

            {/* User */}
            {user && (
                <div className="sidebar__user">
                    <div className="sidebar__user-avatar sidebar__user-avatar--admin">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar__user-info">
                        <span className="sidebar__user-name">{user.username}</span>
                        <span className="sidebar__user-role sidebar__user-role--admin">ADMIN</span>
                    </div>
                </div>
            )}

            {/* Admin Navigation */}
            {user && (
                <nav className="sidebar__nav" aria-label="Admin navigation">
                    <span className="sidebar__nav-section">Catalog</span>
                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) =>
                            `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                        }
                    >
                        <IconProducts />
                        Products
                    </NavLink>
                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) =>
                            `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                        }
                    >
                        <IconCategories />
                        Categories
                    </NavLink>

                    <span className="sidebar__nav-section">Operations</span>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                        }
                    >
                        <IconOrders />
                        Orders
                    </NavLink>
                    <NavLink
                        to="/admin/notifications"
                        className={({ isActive }) =>
                            `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                        }
                    >
                        <IconNotifications />
                        Notifications
                    </NavLink>

                    <span className="sidebar__nav-section">Store</span>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
                        }
                    >
                        <IconStorefront />
                        Back to Store
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

// ── Icons ─────────────────────────────────────────────────────────────────────

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

function IconCategories() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h7" />
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

function IconNotifications() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    )
}

function IconStorefront() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
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
