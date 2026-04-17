import { NavLink } from 'react-router-dom'
import '@/app/styles/header.css'

export default function Header() {
    return (
        <header className="header">
            <div className="header__inner">
                <NavLink to="/" className="header__logo">
                    ShopCommerce
                </NavLink>

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

                <div className="header__actions">
                    <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                            `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                        }
                    >
                        Cart
                    </NavLink>
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                        }
                    >
                        Login
                    </NavLink>
                </div>
            </div>
        </header>
    )
}
