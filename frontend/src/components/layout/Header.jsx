import { useTheme } from '../../utils/theme.jsx'
import { Sun, Moon, LogOut, User } from 'lucide-react'

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  const handle_logout = () => {
    console.log('Logging out...')
    // In a real app, this would clear auth tokens and redirect
    window.location.href = '/'
  }

  return (
    <header className="h-16 bg-background-surface border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between px-6">
      {/* Logo/Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold text-primary-600">
          OHARA
        </h1>
        <span className="text-text-muted text-sm">
          File Repository
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-text-light transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
            <User className="w-5 h-5 text-text-light" />
          </div>
          <span className="text-text-light font-medium">User</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handle_logout}
          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors duration-200"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

export default Header