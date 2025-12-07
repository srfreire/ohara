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