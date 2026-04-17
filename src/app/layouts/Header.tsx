import { NavLink } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import '@/app/styles/header.css'

export default function Header() {
    const { user, logout } = useAuthContext()
    const totalItems = useCartStore((s) => s.totalItems)

    return (
        <header className="header">
            <div className="header__inner">
                <NavLink to="/" className="header__logo">
                    ShopCommerce
                </NavLink>

                {user && (
                    <nav className="header__nav" aria-label="Main navigation">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                            }
                        >
                            Products
                        </NavLink>
                        <NavLink
                            to="/orders"
                            className={({ isActive }) =>
                                `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                            }
                        >
                            Orders
                        </NavLink>
                    </nav>
                )}

                <div className="header__actions">
                    {user ? (
                        <>
                            <NavLink
                                to="/cart"
                                className={({ isActive }) =>
                                    `header__nav-link header__cart-link${isActive ? ' header__nav-link--active' : ''}`
                                }
                            >
                                Cart
                                {totalItems > 0 && (
                                    <span className="header__cart-badge">{totalItems}</span>
                                )}
                            </NavLink>
                            <span className="header__nav-link header__username">{user.username}</span>
                            <button
                                className="header__nav-link header__logout-btn"
                                onClick={() => void logout()}
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                            }
                        >
                            Sign in
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    )
}
