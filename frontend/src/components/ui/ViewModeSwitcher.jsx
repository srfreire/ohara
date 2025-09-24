import { Grid, List } from 'lucide-react'

const ViewModeSwitcher = ({ view_mode, on_view_mode_change, className = '' }) => {
  return (
    <div className={`inline-flex rounded-lg bg-secondary-100 dark:bg-secondary-800 p-1 ${className}`}>
      <button
        onClick={() => on_view_mode_change('icon')}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
          view_mode === 'icon'
            ? 'bg-white dark:bg-secondary-700 text-text-light shadow-sm'
            : 'text-text-muted hover:text-text-light'
        }`}
        aria-label="Icon view"
      >
        <Grid className="w-4 h-4" />
        <span>Icon</span>
      </button>

      <button
        onClick={() => on_view_mode_change('list')}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
          view_mode === 'list'
            ? 'bg-white dark:bg-secondary-700 text-text-light shadow-sm'
            : 'text-text-muted hover:text-text-light'
        }`}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
        <span>List</span>
      </button>
    </div>
  )
}

export default ViewModeSwitcher