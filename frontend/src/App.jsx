import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './utils/theme.jsx'
import { AuthProvider } from './contexts/auth-context'
import LoginPage from './components/auth/LoginPage'
import Dashboard from './components/dashboard/Dashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                },
                success: {
                  style: {
                    background: '#4a7c54', // forest green (primary-600)
                    color: '#ffffff',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#4a7c54',
                  },
                },
                error: {
                  style: {
                    background: '#dc2626', // red for errors
                    color: '#ffffff',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#dc2626',
                  },
                },
              }}
            />

            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Redirect any unknown routes to login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App