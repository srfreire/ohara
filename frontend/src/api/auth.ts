import api_client from './client'
import type { User } from '../types/api'

export const login_with_google = (): void => {
  window.location.href = `${api_client.defaults.baseURL}/auth/login`
}

export const handle_auth_callback = async (): Promise<User | null> => {
  try {
    const url_params = new URLSearchParams(window.location.search)

    // JWT is now in HttpOnly cookie, only extract user info from URL
    const id = url_params.get('id') || url_params.get('user_id')
    const email = url_params.get('email')

    if (id && email) {
      const user_data: User = {
        id,
        email,
        name: url_params.get('name') || '',
        avatar_url: url_params.get('avatar_url') || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem('user', JSON.stringify(user_data))
      return user_data
    }

    const stored_user = localStorage.getItem('user')
    if (stored_user) {
      return JSON.parse(stored_user) as User
    }

    return null
  } catch (error) {
    console.error('Auth callback error:', error)
    throw error
  }
}

export const get_current_user = (): User | null => {
  try {
    const user = localStorage.getItem('user')
    return user ? (JSON.parse(user) as User) : null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export const refresh_token = async (): Promise<void> => {
  try {
    // Token is refreshed and set in HttpOnly cookie by backend
    await api_client.get('/auth/refresh')
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

export const logout = (): void => {
  localStorage.removeItem('user')
  // Cookie will be cleared by setting maxAge to 0 or by backend logout endpoint
  window.location.href = '/'
}

export const is_authenticated = (): boolean => {
  // Check if user info exists (JWT is in HttpOnly cookie, not accessible to JS)
  const user = localStorage.getItem('user')
  return !!user
}
