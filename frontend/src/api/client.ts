import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import type { ApiSuccessResponse, ApiListResponse, ApiDeleteResponse, ApiErrorResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_VERSION = 'v2'

const api_client: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const get_jwt_token = (): string | null => {
  return localStorage.getItem('access_token')
}


api_client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

api_client.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      const error_data = data as ApiErrorResponse

      switch (status) {
        case 401:
          toast.error('Session expired. Please login again.')
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
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
      toast.error('Network error. Please check your connection.')
    } else {
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
      throw error
    }
    throw error
  }
}


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
