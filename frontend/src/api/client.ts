import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import type { ApiSuccessResponse, ApiListResponse, ApiDeleteResponse, ApiErrorResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_VERSION = 'v2' // Updated to v2

// Create axios instance with /v2 prefix
const api_client: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to get JWT token from localStorage
const get_jwt_token = (): string | null => {
  return localStorage.getItem('access_token')
}

// Request interceptor - Add JWT Bearer token authentication
api_client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

// Response interceptor - Handle errors globally and unwrap v2 response format
api_client.interceptors.response.use(
  (response: AxiosResponse) => {
    // For v2 API, unwrap the standard response format
    // Response format: { success: true, data: ..., pagination?: ... }
    // We'll keep the full response and let individual API functions handle unwrapping
    return response
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response
      const error_data = data as ApiErrorResponse

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
          toast.error(error_data.message || 'Resource not found.')
          break

        case 500:
          toast.error('Server error. Please try again later.')
          break

        default:
          toast.error(error_data.message || 'An error occurred.')
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
interface ApiCallOptions {
  show_success?: boolean
  success_message?: string
  show_error?: boolean
  silent?: boolean
}

export const api_call = async <T>(
  promise: Promise<AxiosResponse<T>>,
  options: ApiCallOptions = {}
): Promise<T> => {
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

// Type-safe wrapper for standard v2 API responses
export const unwrap_response = <T>(response: AxiosResponse<ApiSuccessResponse<T>>): T => {
  return response.data.data
}

export const unwrap_list_response = <T>(response: AxiosResponse<ApiListResponse<T>>): { data: T[], pagination: ApiListResponse<T>['pagination'] } => {
  return {
    data: response.data.data,
    pagination: response.data.pagination
  }
}

export const unwrap_delete_response = (response: AxiosResponse<ApiDeleteResponse>): string => {
  return response.data.message
}

export default api_client
