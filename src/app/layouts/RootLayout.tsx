import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { ToastContainer } from '@/features/notification'
import '@/app/styles/layout.css'
import '@/app/styles/notification.css'

export default function RootLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className={`layout${sidebarOpen ? ' layout--sidebar-open' : ''}`}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div
                    className="layout__overlay"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
            <main className="layout__main">
                <button
                    className="layout__menu-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                    aria-expanded={sidebarOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
                <Outlet />
            </main>
            <ToastContainer />
        </div>
    )
}

