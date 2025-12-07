# OHARA Frontend

A modern React application for document management, collaboration, and AI-powered assistance.

## Overview

OHARA Frontend is a single-page application (SPA) built with React and Vite that provides an intuitive interface for managing documents, organizing them into collections, collaborating through comments and reactions, and interacting with an AI chat assistant.

## Tech Stack

### Core
- **React 18** - UI library with hooks and modern patterns
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TypeScript/JavaScript** - Mixed TS/JS codebase for type safety where needed

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS Variables** - Theme system with light/dark mode
- **Custom Animations** - Smooth transitions and micro-interactions

### State Management
- **React Context** - Authentication and theme state
- **Zustand** - Global state for collections
- **React Hooks** - Local component state

### API & Data
- **Axios** - HTTP client with interceptors
- **Custom API Client** - Centralized API configuration with JWT authentication

### UI Components & Features
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **React PDF** - PDF viewing capabilities
- **PDF.js** - PDF rendering engine

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API client and endpoint functions
│   │   ├── client.ts   # Axios instance and interceptors
│   │   ├── auth.ts     # Authentication endpoints
│   │   ├── documents.ts
│   │   ├── folders.ts
│   │   ├── collections.ts
│   │   ├── comments.ts
│   │   ├── reactions.ts
│   │   └── agent.ts
│   ├── components/     # React components
│   │   ├── auth/       # Login and protected routes
│   │   ├── dashboard/  # Main dashboard and file views
│   │   ├── chat/       # AI chat agent
│   │   ├── collections/# Collection management
│   │   ├── comments/   # Comment system
│   │   ├── reactions/  # Reaction picker
│   │   ├── pdf/        # PDF viewer
│   │   ├── layout/     # Header and layout components
│   │   └── ui/         # Reusable UI components
│   ├── contexts/       # React contexts
│   │   └── auth-context.jsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useCursorPagination.ts
│   │   └── useInfiniteScroll.ts
│   ├── stores/         # Zustand stores
│   │   └── collections-store.js
│   ├── types/          # TypeScript type definitions
│   │   └── api.ts
│   ├── utils/          # Utility functions
│   │   ├── theme.jsx
│   │   └── toast.js
│   ├── assets/         # Images and icons
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles and CSS variables
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## Features

### Authentication
- Google OAuth 2.0 integration
- JWT token-based authentication
- Protected routes
- Automatic token refresh
- Session management

### Document Management
- Browse and view documents
- Folder hierarchy navigation
- PDF viewer integration
- File upload and management
- Document metadata

### Collections
- Create and manage collections
- Add documents to collections
- Collection visibility settings (private/unlisted/public)
- Zustand-powered state management

### Comments & Reactions
- Add comments to documents
- Threaded comment replies
- React to comments (like, love, insight, question, flag)
- Comment sections with real-time updates

### AI Chat Assistant
- Context-aware chat interface
- Document-specific queries
- Citation support with highlighting
- Collapsible sidebar
- Streaming responses

### Theme System
- Light and dark mode
- Custom color palette (Forest Green theme)
- Smooth theme transitions with View Transitions API
- CSS custom properties for easy theming

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions
- Custom scrollbars

## Getting Started

### Prerequisites
- Node.js 16+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

The development server includes:
- Hot Module Replacement (HMR)
- API proxy to backend (configurable in vite.config.js)
- Fast refresh for React components

### Building

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### API Proxy

The Vite dev server proxies `/v2` requests to the backend (configured in `vite.config.js`):

```javascript
server: {
  proxy: {
    '/v2': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    },
  }
}
```

## API Integration

### API Client

The frontend uses a centralized API client (`src/api/client.ts`) with:
- Base URL configuration
- JWT authentication via request interceptors
- Global error handling via response interceptors
- Automatic redirect on 401 (unauthorized)
- Toast notifications for errors

### API Endpoints

All API endpoints follow the v2 API specification with cursor-based pagination:

- **Auth**: `/v2/auth/*`
- **Documents**: `/v2/documents/*`
- **Folders**: `/v2/folders/*`
- **Collections**: `/v2/collections/*`
- **Comments**: `/v2/comments/*`
- **Reactions**: `/v2/reactions/*`
- **Agent**: `/v2/agent/*`

### Response Format

All API responses follow a standard format:

```typescript
{
  success: true,
  data: T | T[],
  pagination?: {
    next_cursor: string | null,
    has_more: boolean,
    limit: number
  }
}
```

## Styling Guide

### Tailwind Classes

The project uses Tailwind CSS with custom configuration:
- Custom color palette (primary, secondary, background, text)
- Custom font families (Sora for headings, Reddit Sans for body)
- Dark mode support via `dark:` variant
- Custom animations

### CSS Variables

Theme colors are defined as CSS custom properties in `src/index.css`:

```css
:root {
  --color-primary-600: #4a7c54;   /* Forest green */
  --color-secondary-500: 154 133 104;  /* Warm earth */
  --color-background-light: #fdfdfc;
  --color-text-light: #2e2820;
}
```

### Custom Animations

Available CSS animations:
- `animate-fade-in-up`
- `animate-fade-in`
- `animate-slide-in-left`
- `animate-slide-in-right`
- `animate-slide-out-right`
- `animate-expand-from-button`

## State Management

### Authentication Context

Global authentication state managed via React Context (`src/contexts/auth-context.jsx`):

```javascript
const { user, is_authenticated, login, logout } = useAuth()
```

### Theme Context

Theme state with View Transitions API support:

```javascript
const { isDarkMode, toggleTheme, theme } = useTheme()
```

### Collections Store (Zustand)

Global collections state:

```javascript
const {
  collections,
  fetch_collections,
  create_collection_action,
  add_item,
  remove_item
} = useCollectionsStore()
```

## Custom Hooks

### useCursorPagination

Handles cursor-based pagination for API v2:

```typescript
const {
  data,
  loading,
  has_more,
  fetch_next_page
} = useCursorPagination(fetchFunction, options)
```

### useInfiniteScroll

Implements infinite scroll with intersection observer:

```typescript
const { ref, loading } = useInfiniteScroll(callback, options)
```

## Code Style

### Naming Conventions
- **Variables/Functions**: `snake_case` (e.g., `fetch_documents`, `user_id`)
- **Components**: `PascalCase` (e.g., `FileExplorer`, `ChatAgent`)
- **Files**: Component files match component names, utilities use `kebab-case` or `snake_case`

### File Organization
- One component per file
- Related components grouped in directories
- Index files for clean imports
- Co-located styles when needed

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern browsers with ES2020 support

## Performance Optimizations

- Code splitting with React.lazy
- Route-based code splitting
- Image optimization
- Vite's fast HMR
- Minimal bundle size
- Efficient re-renders with proper hooks usage

## Contributing

1. Follow the existing code style
2. Use TypeScript for new API-related files
3. Keep components focused and minimal
4. Test in both light and dark modes
5. Ensure responsive design
6. Run linter before committing

## License

See the root LICENSE file for details.

## Related Documentation

- [Backend API Documentation](../backend/README.md)
- [API v2 Specification](../backend/docs/API.md)
- [Project Overview](../README.md)
