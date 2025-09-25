import { LogOut, User } from 'lucide-react'

const Header = () => {

  const handle_logout = () => {
    console.log('Logging out...')
    // In a real app, this would clear auth tokens and redirect
    window.location.href = '/'
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-lg flex items-center justify-between px-6">
      {/* Logo/Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <img
            src="src/assets/icon.png"
            alt="OHARA"
            className="w-8 h-8"
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
{/* User Menu */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-secondary-100">
            <User className="w-5 h-5 text-text-light" />
          </div>
          <span className="text-text-light font-medium font-reddit-sans">User</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handle_logout}
          className="p-2 rounded-lg bg-secondary-100 hover:bg-secondary-200 text-primary-600"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

export default Header