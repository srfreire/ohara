const FileGridSkeleton = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-4 rounded-lg bg-secondary-50 dark:bg-secondary-800 animate-pulse"
        >
          {/* Icon skeleton */}
          <div className="w-16 h-16 mb-3 bg-secondary-200 dark:bg-secondary-700 rounded" />

          {/* Name skeleton */}
          <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-20" />
        </div>
      ))}
    </div>
  )
}

export default FileGridSkeleton
