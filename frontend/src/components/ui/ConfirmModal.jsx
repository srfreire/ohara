import { X, AlertTriangle } from 'lucide-react'

const ConfirmModal = ({
  is_open,
  on_close,
  on_confirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirm_text = 'Confirm',
  cancel_text = 'Cancel',
  variant = 'danger' // 'danger' or 'primary'
}) => {
  if (!is_open) return null

  const handle_confirm = () => {
    on_confirm()
    on_close()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={on_close}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-secondary-900 rounded-xl shadow-2xl
        border border-secondary-200 dark:border-secondary-600/50 p-6 max-w-md w-full mx-4
        animate-in fade-in zoom-in duration-200">

        {/* Close button */}
        <button
          onClick={on_close}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary-100
            dark:hover:bg-secondary-700 text-text-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4
          ${variant === 'danger'
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-primary-100 dark:bg-primary-900/30'
          }`}>
          <AlertTriangle className={`w-6 h-6
            ${variant === 'danger'
              ? 'text-red-600 dark:text-red-400'
              : 'text-primary-600 dark:text-primary-400'
            }`}
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-text-light mb-2 font-sora">
          {title}
        </h2>

        {/* Message */}
        <p className="text-text-muted mb-6 font-reddit-sans">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center space-x-3 justify-end">
          <button
            onClick={on_close}
            className="px-4 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-700
              hover:bg-secondary-200 dark:hover:bg-secondary-600 text-text-light
              transition-colors font-reddit-sans"
          >
            {cancel_text}
          </button>
          <button
            onClick={handle_confirm}
            className={`px-4 py-2 rounded-lg text-white transition-colors font-reddit-sans
              ${variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary-600 hover:bg-primary-700'
              }`}
          >
            {confirm_text}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
