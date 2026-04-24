import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import GuestRoute from '@/features/auth/components/GuestRoute'
import RequireRole from '@/features/auth/components/RequireRole'

const router = createBrowserRouter([
    {
        path: '/',
        lazy: () => import('@/app/layouts/RootLayout').then((m) => ({ Component: m.default })),
        children: [
            // ── Authenticated + USER role ────────────────────────────────────
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <RequireRole roles={['USER', 'ADMIN']} />,
                        children: [
                            {
                                index: true,
                                lazy: () => import('@/features/product/pages/ProductListPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'products/:id',
                                lazy: () => import('@/features/product/pages/ProductDetailPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'cart',
                                lazy: () => import('@/features/cart/pages/CartPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'orders',
                                lazy: () => import('@/features/order/pages/OrderListPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'orders/:id',
                                lazy: () => import('@/features/order/pages/OrderDetailPage').then((m) => ({ Component: m.default })),
                            },
                        ],
                    },
                ],
            },
            // ── Guest-only routes ────────────────────────────────────────────
            {
                element: <GuestRoute />,
                children: [
                    {
                        path: 'login',
                        lazy: () => import('@/features/auth/pages/LoginPage').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: 'register',
                        lazy: () => import('@/features/auth/pages/RegisterPage').then((m) => ({ Component: m.default })),
                    },
                ],
            },
        ],
    },
    // ── Admin routes ─────────────────────────────────────────────────────────
    {
        path: '/admin',
        lazy: () => import('@/app/layouts/AdminLayout').then((m) => ({ Component: m.default })),
        children: [
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <RequireRole roles={['ADMIN']} redirectTo="/" />,
                        children: [
                            {
                                index: true,
                                lazy: () => import('@/features/product/pages/admin/AdminProductListPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'products',
                                lazy: () => import('@/features/product/pages/admin/AdminProductListPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'products/new',
                                lazy: () => import('@/features/product/pages/admin/AdminProductFormPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'products/:id/edit',
                                lazy: () => import('@/features/product/pages/admin/AdminProductFormPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'categories',
                                lazy: () => import('@/features/product/pages/admin/AdminCategoryPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'orders',
                                lazy: () => import('@/features/order/pages/admin/AdminOrderListPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'orders/:id',
                                lazy: () => import('@/features/order/pages/OrderDetailPage').then((m) => ({ Component: m.default })),
                            },
                            {
                                path: 'notifications',
                                lazy: () => import('@/features/notification/pages/AdminNotificationPage').then((m) => ({ Component: m.default })),
                            },
                        ],
                    },
                ],
            },
        ],
    },
])

export default router

