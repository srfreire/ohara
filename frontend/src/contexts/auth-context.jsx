import { createContext, useContext, useState, useEffect } from 'react'
import { is_authenticated, logout as api_logout } from '../api/auth'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, set_user] = useState(null)
  const [is_loading, set_is_loading] = useState(true)
  const [is_auth, set_is_auth] = useState(false)

  useEffect(() => {
    check_auth()
  }, [])

  const check_auth = () => {
    try {
      const authenticated = is_authenticated()
      set_is_auth(authenticated)

      if (authenticated) {
        const stored_user = localStorage.getItem('user')
        if (stored_user) {
          set_user(JSON.parse(stored_user))
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      set_is_auth(false)
      set_user(null)
    } finally {
      set_is_loading(false)
    }
  }

  const login = (user_data) => {
    set_user(user_data)
    set_is_auth(true)
    localStorage.setItem('user', JSON.stringify(user_data))
  }

  const logout = () => {
    set_user(null)
    set_is_auth(false)
    api_logout()
  }

  const value = {
    user,
    is_authenticated: is_auth,
    is_loading,
    login,
    logout,
    check_auth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
