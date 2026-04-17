import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
    {
        path: '/',
        lazy: () => import('@/app/layouts/RootLayout').then((m) => ({ Component: m.default })),
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
    {
        path: '/login',
        lazy: () => import('@/features/auth/pages/LoginPage').then((m) => ({ Component: m.default })),
    },
    {
        path: '/register',
        lazy: () => import('@/features/auth/pages/RegisterPage').then((m) => ({ Component: m.default })),
    },
])

export default router
