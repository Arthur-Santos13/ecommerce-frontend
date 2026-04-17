import { Outlet } from 'react-router-dom'
import Header from './Header'
import '@/app/styles/layout.css'

export default function RootLayout() {
    return (
        <div className="layout">
            <Header />
            <main className="layout__main">
                <Outlet />
            </main>
            <footer className="layout__footer">
                &copy; {new Date().getFullYear()} ShopCommerce. All rights reserved.
            </footer>
            )
}
