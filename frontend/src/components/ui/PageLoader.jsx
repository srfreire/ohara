const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800">
      <div className="text-center">
        {/* Animated logo or spinner */}
        <div className="relative">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-primary-600 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Loading message */}
        <p className="mt-6 text-text-muted font-reddit-sans text-lg">
          {message}
        </p>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  )
}

export default PageLoader
