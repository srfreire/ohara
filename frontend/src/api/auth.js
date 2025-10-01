import api_client from './client'

/**
 * Redirect to Google OAuth login
 * This will redirect the user to the backend OAuth flow
 */
export const login_with_google = () => {
  window.location.href = `${api_client.defaults.baseURL}/auth/login`
}

/**
 * Handle OAuth callback
 * Backend handles the OAuth code and returns JWT + user data
 * @param {string} code - OAuth code from Google (if needed)
 */
export const handle_auth_callback = async (code) => {
  try {
    // Backend automatically handles the callback
    // Check if backend redirected with access_token in URL
    const url_params = new URLSearchParams(window.location.search)
    const access_token = url_params.get('access_token')

    if (access_token) {
      // Store token in localStorage
      localStorage.setItem('access_token', access_token)

      // Extract user data if present in URL
      const user_data = {
        id: url_params.get('id') || url_params.get('user_id'),
        email: url_params.get('email'),
        name: url_params.get('name'),
      }

      if (user_data.id && user_data.email) {
        localStorage.setItem('user', JSON.stringify(user_data))
        return user_data
      }
    }

    // If no URL params, check if we already have a token
    const stored_user = localStorage.getItem('user')
    if (stored_user) {
      return JSON.parse(stored_user)
    }

    return null
  } catch (error) {
    console.error('Auth callback error:', error)
    throw error
  }
}

/**
 * Get current authenticated user from localStorage
 */
export const get_current_user = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Refresh JWT token
 */
export const refresh_token = async () => {
  try {
    const response = await api_client.get('/auth/refresh')
    return response.data
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

/**
 * Logout user
 * Clear localStorage and redirect to login
 */
export const logout = () => {
  // Clear localStorage
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')

  // Redirect to login
  window.location.href = '/'
}

/**
 * Check if user is authenticated
 * by checking for access token in localStorage
 */
export const is_authenticated = () => {
  const token = localStorage.getItem('access_token')
  return !!token
}
