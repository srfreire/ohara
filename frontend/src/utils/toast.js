import toast from 'react-hot-toast'

const toast_config = {
  success: {
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#fff',
      fontFamily: 'Reddit Sans, sans-serif',
      borderRadius: '0.75rem',
      padding: '1rem 1.5rem',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  },
  error: {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#fff',
      fontFamily: 'Reddit Sans, sans-serif',
      borderRadius: '0.75rem',
      padding: '1rem 1.5rem',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  },
  loading: {
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontFamily: 'Reddit Sans, sans-serif',
      borderRadius: '0.75rem',
      padding: '1rem 1.5rem',
    },
  },
}

export const toast_success = (message) => {
  return toast.success(message, toast_config.success)
}

export const toast_error = (message) => {
  return toast.error(message, toast_config.error)
}

export const toast_loading = (message) => {
  return toast.loading(message, toast_config.loading)
}

export const toast_promise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    },
    {
      success: toast_config.success,
      error: toast_config.error,
      loading: toast_config.loading,
    }
  )
}

export default toast
