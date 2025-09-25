/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    // Ensure dark mode background classes are always generated
    'dark:bg-secondary-800/90',
    'dark:bg-secondary-900/80',
    'dark:bg-secondary-900/60',
    'dark:bg-secondary-900/40',
    'dark:border-secondary-600/50',
    // Button states
    'dark:bg-secondary-700',
    'dark:hover:bg-secondary-600',
    'dark:hover:bg-secondary-700',
    'dark:hover:bg-secondary-800',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sora': ['Sora', 'sans-serif'],
        'reddit-sans': ['Reddit Sans', 'sans-serif'],
      },
      colors: {
        // Primary colors - easily customizable
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
        },
        // Secondary colors
        secondary: {
          50: 'rgb(var(--color-secondary-50) / <alpha-value>)',
          100: 'rgb(var(--color-secondary-100) / <alpha-value>)',
          200: 'rgb(var(--color-secondary-200) / <alpha-value>)',
          300: 'rgb(var(--color-secondary-300) / <alpha-value>)',
          400: 'rgb(var(--color-secondary-400) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600) / <alpha-value>)',
          700: 'rgb(var(--color-secondary-700) / <alpha-value>)',
          800: 'rgb(var(--color-secondary-800) / <alpha-value>)',
          900: 'rgb(var(--color-secondary-900) / <alpha-value>)',
          950: 'rgb(var(--color-secondary-950) / <alpha-value>)',
        },
        // Background and text colors
        background: {
          light: 'var(--color-background-light)',
          dark: 'var(--color-background-dark)',
          surface: 'var(--color-background-surface)',
        },
        text: {
          light: 'var(--color-text-light)',
          dark: 'var(--color-text-dark)',
          muted: 'var(--color-text-muted)',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

