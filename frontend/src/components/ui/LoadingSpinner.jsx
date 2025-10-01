const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const size_classes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${size_classes[size]} animate-spin rounded-full border-primary-600 border-t-transparent`}
      />
    </div>
  )
}

export default LoadingSpinner
