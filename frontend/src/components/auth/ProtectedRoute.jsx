import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'

const ProtectedRoute = ({ children }) => {
  const { is_authenticated, is_loading } = useAuth()

  if (is_loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-text-muted font-reddit-sans">Loading...</p>
        </div>
      </div>
    )
  }

  if (!is_authenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
