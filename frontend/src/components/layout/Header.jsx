import { LogOut, User, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../utils/theme'
import { useAuth } from '../../contexts/auth-context'

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const handle_logout = () => {
    logout()
  }

  return (
    <header className="h-16 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg flex items-center justify-between px-6">
      {/* Logo/Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <img
            src="src/assets/icon.png"
            alt="OHARA"
            className="w-8 h-8 rounded-md"
          />
          <h1 className="text-2xl font-bold text-primary-600 font-sora">
            OHARA
          </h1>
        </div>
        <span className="text-text-muted text-sm font-reddit-sans">
          File Repository
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-text-light transition-colors duration-200"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-700">
            <User className="w-5 h-5 text-text-light" />
          </div>
          <span className="text-text-light font-medium font-reddit-sans">
            {user?.name || 'User'}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handle_logout}
          className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-primary-600 dark:text-primary-400"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

export default Header