import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance
const api_client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to get JWT token from localStorage
const get_jwt_token = () => {
  return localStorage.getItem('access_token')
}

// Request interceptor - Add JWT Bearer token authentication
api_client.interceptors.request.use(
  (config) => {
    // Add JWT Bearer token from localStorage
    const token = get_jwt_token()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api_client.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - Clear auth and redirect to login
          toast.error('Session expired. Please login again.')
          // Clear localStorage
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
          break

        case 403:
          toast.error('You do not have permission to perform this action.')
          break

        case 404:
          toast.error(data.message || 'Resource not found.')
          break

        case 500:
          toast.error('Server error. Please try again later.')
          break

        default:
          toast.error(data.message || 'An error occurred.')
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('Network error. Please check your connection.')
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.')
    }

    return Promise.reject(error)
  }
)

// Helper function to handle API calls with loading state
export const api_call = async (promise, options = {}) => {
  const {
    show_success = false,
    success_message = 'Success!',
    show_error = true,
    silent = false
  } = options

  try {
    const response = await promise
    if (show_success && !silent) {
      toast.success(success_message)
    }
    return response.data
  } catch (error) {
    if (!show_error || silent) {
      // Error already handled by interceptor, just rethrow
      throw error
    }
    throw error
  }
}

export default api_client
