import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ThemeProvider } from '@/app/context/ThemeContext'
import router from '@/app/router'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RouterProvider router={router} fallbackElement={null} />
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
