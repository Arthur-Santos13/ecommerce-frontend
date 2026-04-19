import { Outlet } from 'react-router-dom'
import { ToastContainer } from '@/features/notification'
import '@/app/styles/notification.css'

export default function AuthLayout() {
    return (
        <>
            <Outlet />
            <ToastContainer />
        </>
    )
}
