import api_client from './client'
import type { ApiSuccessResponse, AuthTokenResponse, User } from '../types/api'

export const login_with_google = (): void => {
  window.location.href = `${api_client.defaults.baseURL}/auth/login`
}

export const handle_auth_callback = async (): Promise<User | null> => {
  try {
    const url_params = new URLSearchParams(window.location.search)
    const access_token = url_params.get('access_token')

    if (access_token) {
      localStorage.setItem('access_token', access_token)


      const user_data: User = {
        id: url_params.get('id') || url_params.get('user_id') || '',
        email: url_params.get('email') || '',
        name: url_params.get('name') || '',
        avatar_url: url_params.get('avatar_url') || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (user_data.id && user_data.email) {
        localStorage.setItem('user', JSON.stringify(user_data))
        return user_data
      }
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

export const refresh_token = async (): Promise<string> => {
  try {
    const response = await api_client.get<ApiSuccessResponse<AuthTokenResponse>>('/auth/refresh')
    return response.data.data.access_token
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

export const logout = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  window.location.href = '/'
}

export const is_authenticated = (): boolean => {
  const token = localStorage.getItem('access_token')
  return !!token
}
