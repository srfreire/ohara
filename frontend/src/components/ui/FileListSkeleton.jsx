const FileListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800 animate-pulse"
        >
          {/* Icon skeleton */}
          <div className="w-8 h-8 bg-secondary-200 dark:bg-secondary-700 rounded" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
            <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default FileListSkeleton
