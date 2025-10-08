import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ohara-theme')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('ohara-theme', JSON.stringify(isDarkMode))

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleTheme = (event) => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      setIsDarkMode(prev => !prev)
      return
    }

    // Get button center coordinates for the circular transition
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2

    if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    }

    // Calculate the maximum distance to ensure the circle covers the entire viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // Store coordinates as CSS custom properties
    document.documentElement.style.setProperty('--x', `${x}px`)
    document.documentElement.style.setProperty('--y', `${y}px`)
    document.documentElement.style.setProperty('--end-radius', `${endRadius}px`)

    // Determine theme direction: true if going to dark mode, false if going to light
    const goingToDark = !isDarkMode
    document.documentElement.setAttribute('data-theme-transition', goingToDark ? 'to-dark' : 'to-light')

    // Start the view transition
    document.startViewTransition(() => {
      setIsDarkMode(prev => !prev)
    })
  }

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Color palette configuration - easily customizable
export const colorPalette = {
  // You can change these hex values to customize the entire theme
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Main secondary color
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  }
}

// Helper function to apply custom color palette
export const applyCustomColors = (customPalette) => {
  const root = document.documentElement

  // Apply primary colors
  if (customPalette.primary) {
    Object.entries(customPalette.primary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color)
    })
  }

  // Apply secondary colors
  if (customPalette.secondary) {
    Object.entries(customPalette.secondary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color)
    })
  }
}