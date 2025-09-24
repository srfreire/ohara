# Ohara Frontend

A modern file repository interface with integrated AI chat assistant.

## Features

- 🎨 **Dark/Light Mode**: Toggle between themes with persistent storage
- 📁 **File Explorer**: Navigate folders and files with a tree structure
- 👁️ **File Viewer**: Preview different file types (Markdown, JSON, JavaScript, etc.)
- 🤖 **AI Chat Assistant**: Interactive sidebar chat with mock responses
- 🎯 **Responsive Design**: Built with Tailwind CSS
- 🌈 **Modular Colors**: Easily customizable color palette

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development

The application will be available at `http://localhost:5174`

**Default credentials:** Click "Continue with Google" (mock login)

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login page
│   ├── dashboard/     # File explorer, viewer, and dashboard
│   ├── chat/          # Chat agent component
│   └── layout/        # Header and layout components
├── utils/
│   ├── theme.jsx      # Theme provider and utilities
│   └── mock-data.js   # Mock file system data
├── App.jsx            # Main application with routing
└── main.jsx           # Application entry point
```

## Customization

### Colors

Edit the CSS variables in `src/index.css` or use the theme utilities in `src/utils/theme.jsx`:

```javascript
import { applyCustomColors } from './utils/theme.jsx'

// Apply custom colors
applyCustomColors({
  primary: {
    500: '#your-primary-color',
    // ... other shades
  }
})
```

### Mock Data

Update `src/utils/mock-data.js` to modify the file structure and chat responses.

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons