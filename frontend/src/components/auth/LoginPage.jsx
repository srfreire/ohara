import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/auth-context'
import { login_with_google } from '../../api/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const { is_authenticated, login } = useAuth()
  const [is_loading, set_is_loading] = useState(false)

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (is_authenticated) {
      navigate('/dashboard')
    }
  }, [is_authenticated, navigate])

  // Handle OAuth callback
  useEffect(() => {
    // Check if we're returning from OAuth callback
    const url_params = new URLSearchParams(window.location.search)
    const access_token = url_params.get('access_token')
    const user_email = url_params.get('email')
    const user_name = url_params.get('name')
    const user_id = url_params.get('id')
    const avatar_url = url_params.get('avatar_url')

    if (access_token) {
      // Store token in localStorage
      localStorage.setItem('access_token', access_token)

      // Store user data
      const user_data = {
        id: user_id,
        email: user_email,
        name: user_name,
        avatar_url: avatar_url
      }

      // Update auth context
      login(user_data)

      // Redirect to dashboard
      navigate('/dashboard')
    }
  }, [login, navigate])

  const handle_google_login = () => {
    set_is_loading(true)
    // Redirect to backend OAuth endpoint
    login_with_google()
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Hero Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/hero.jpg)',
        }}
      >
        {/* Overlay for better contrast - adapts to theme */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>


      {/* Login Card - Right Side */}
      <div className="relative z-10 ml-auto flex items-center mr-8">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-primary-200/20 dark:border-secondary-600/30">
            {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="src/assets/icon.png"
                alt="Ohara Icon"
                className="w-12 h-12 mr-3 rounded-md"
              />
              <h1 className="text-4xl font-bold text-text-light font-sora">
                OHARA
              </h1>
            </div>
            <p className="text-text-dark text-lg font-reddit-sans">
              File Repository & Chat Assistant
            </p>
          </div>

          {/* Login Content */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-text-muted mb-6 font-reddit-sans">
                Sign in to access your files and chat with our AI assistant
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handle_google_login}
              disabled={is_loading}
              className="w-full bg-secondary-100 dark:bg-secondary-700 dark:hover:bg-secondary-700 hover:bg-secondary-200 text-text-light font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-reddit-sans font-medium">
                {is_loading ? 'Redirecting...' : 'Continue with Google'}
              </span>
            </button>

            {/* Terms */}
            <p className="text-xs text-text-muted text-center font-reddit-sans">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage