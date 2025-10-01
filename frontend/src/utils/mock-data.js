// Mock file system data structure
export const mock_file_system = {
  folders: [
    {
      id: '1',
      name: 'Documents',
      user_id: 'user-123',
      parent_id: null,
      path: '/Documents',
      created_at: '2024-01-15T10:30:00.000Z',
      updated_at: '2024-01-15T10:30:00.000Z',
    },
    {
      id: '2',
      name: 'Projects',
      user_id: 'user-123',
      parent_id: null,
      path: '/Projects',
      created_at: '2024-01-10T09:15:00.000Z',
      updated_at: '2024-01-20T14:22:00.000Z',
    },
    {
      id: '3',
      name: 'React Apps',
      user_id: 'user-123',
      parent_id: '2',
      path: '/Projects/React Apps',
      created_at: '2024-01-12T11:45:00.000Z',
      updated_at: '2024-01-18T16:30:00.000Z',
    },
    {
      id: '4',
      name: 'Reports',
      user_id: 'user-123',
      parent_id: '1',
      path: '/Documents/Reports',
      created_at: '2024-01-08T08:20:00.000Z',
      updated_at: '2024-01-25T13:10:00.000Z',
    },
    {
      id: '5',
      name: 'Images',
      user_id: 'user-123',
      parent_id: null,
      path: '/Images',
      created_at: '2024-01-05T15:00:00.000Z',
      updated_at: '2024-01-28T10:45:00.000Z',
    }
  ],
  files: [
    {
      id: '1',
      name: 'README.md',
      title: 'README.md',
      user_id: 'user-123',
      folder_id: '2',
      content: `# OHARA - Advanced File Management System

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Component Structure](#component-structure)
- [API Integration](#api-integration)
- [Styling Guidelines](#styling-guidelines)
- [Testing Strategy](#testing-strategy)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Project Overview

OHARA is a state-of-the-art file management system built with modern React technologies. This comprehensive application provides an intuitive interface for managing files and folders, featuring real-time chat assistance, advanced file preview capabilities, and a responsive design that works seamlessly across all devices.

The project leverages the latest web technologies to deliver a fast, reliable, and user-friendly experience. Built with performance and scalability in mind, OHARA can handle large file systems while maintaining smooth interactions and responsive UI elements.

### Key Objectives
- **Intuitive User Experience**: Provide a clean, modern interface that makes file management effortless
- **Real-time Collaboration**: Enable users to interact with an AI assistant for file-related queries
- **Cross-platform Compatibility**: Ensure consistent experience across desktop, tablet, and mobile devices
- **Performance Excellence**: Deliver fast load times and smooth animations throughout the application
- **Accessibility First**: Follow WCAG guidelines to make the application accessible to all users

## ✨ Features

### 🗂️ File System Management
- **Hierarchical Folder Structure**: Navigate through nested folders with ease
- **Drag & Drop Support**: Intuitive file operations with visual feedback
- **Bulk Operations**: Select and manage multiple files simultaneously
- **Search Functionality**: Quickly find files and folders using powerful search filters
- **File Preview**: View content of various file types without opening external applications

### 🎨 User Interface
- **Modern React Frontend**: Built with React 18 and the latest hooks
- **Responsive Design**: Tailwind CSS ensures perfect display on all screen sizes
- **Dark/Light Mode Support**: Toggle between themes based on user preference
- **Smooth Animations**: Framer Motion powers engaging transitions and micro-interactions
- **Card-based Layout**: Clean, modern design with rounded corners and shadows

### 💬 Real-time Chat Integration
- **AI Assistant**: Get help with file management and system navigation
- **Context-aware Responses**: AI understands your current file context
- **Message History**: Access previous conversations and responses
- **Typing Indicators**: Real-time feedback during AI response generation

### 🔧 Advanced Functionality
- **File Type Recognition**: Automatic detection and appropriate handling of different file formats
- **Keyboard Shortcuts**: Power user features for faster navigation
- **Customizable Views**: Switch between list and grid layouts
- **Progressive Loading**: Lazy load content for better performance
- **Offline Support**: Basic functionality available without internet connection

## 🛠️ Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (version 16.0 or higher)
- npm (version 8.0 or higher) or yarn (version 1.22 or higher)
- Git for version control

### Installation

1. **Clone the Repository**
   \`\`\`bash
   git clone https://github.com/your-org/ohara.git
   cd ohara
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your specific configuration
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open Your Browser**
   Navigate to \`http://localhost:5173\` to see the application running.

### Build for Production

\`\`\`bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview
\`\`\`

## 🏗️ Architecture

The application follows a modular, component-based architecture with clear separation of concerns:

### Frontend Architecture
- **Component Layer**: Reusable UI components with single responsibilities
- **State Management**: React hooks and context for state handling
- **Routing**: React Router for client-side navigation
- **Styling**: Tailwind CSS utility-first approach
- **Build System**: Vite for fast development and optimized builds

### File Structure
\`\`\`
src/
├── components/          # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── chat/           # Chat system components
│   ├── layout/         # Layout and navigation components
│   └── common/         # Shared utility components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and helpers
├── styles/             # Global styles and Tailwind config
├── assets/             # Static assets (images, icons)
└── types/              # TypeScript type definitions
\`\`\`

## 🧩 Component Structure

### Dashboard Components
- **Dashboard.jsx**: Main container managing application state
- **FileExplorer.jsx**: File system navigation with dual view modes
- **FileViewer.jsx**: Content display with sticky headers and type-specific rendering
- **Header.jsx**: Application header with branding and navigation

### Chat Components
- **ChatAgent.jsx**: AI assistant interface with collapsible sidebar
- **MessageList.jsx**: Scrollable message container with auto-scroll
- **MessageInput.jsx**: Text input with keyboard shortcuts and send functionality

### Layout Components
- **ResponsiveLayout.jsx**: Adaptive layout for different screen sizes
- **Sidebar.jsx**: Collapsible navigation sidebar
- **Modal.jsx**: Reusable modal component for dialogs and forms

## 🔌 API Integration

### Mock Data Layer
Currently using a comprehensive mock data system for development:
- **File System Simulation**: Realistic folder/file hierarchy
- **Chat Message History**: Sample conversations with AI assistant
- **User Preferences**: Theme and layout settings

### Future API Integration
Planning for REST API integration with the following endpoints:
- \`GET /api/files\` - Retrieve file listing
- \`POST /api/files/upload\` - Upload new files
- \`DELETE /api/files/:id\` - Remove files
- \`POST /api/chat/message\` - Send chat messages
- \`GET /api/user/preferences\` - User settings

## 🎨 Styling Guidelines

### Design System
- **Color Palette**: Carefully selected colors for accessibility and aesthetics
- **Typography**: Consistent font sizing and hierarchy
- **Spacing**: 8px grid system for consistent layouts
- **Components**: Reusable design tokens and patterns

### Tailwind Configuration
Custom Tailwind configuration includes:
- Extended color palette for brand consistency
- Custom animations and transitions
- Responsive breakpoints optimized for the application
- Dark mode utilities and color schemes

### CSS Architecture
- **Utility-first Approach**: Tailwind classes for rapid development
- **Component Styles**: Encapsulated styles for complex components
- **Theme Variables**: CSS custom properties for dynamic theming
- **Animation Library**: Smooth transitions and micro-interactions

## 🧪 Testing Strategy

### Testing Pyramid
- **Unit Tests**: Component-level testing with Jest and React Testing Library
- **Integration Tests**: Feature testing across component boundaries
- **E2E Tests**: Full user journey testing with Playwright
- **Visual Regression**: Screenshot comparison for UI consistency

### Test Coverage Goals
- **Components**: 90%+ coverage for all React components
- **Utilities**: 100% coverage for utility functions
- **Hooks**: Complete testing of custom React hooks
- **Integration**: Critical user flows covered by integration tests

## ⚡ Performance Optimizations

### React Optimizations
- **Lazy Loading**: Code splitting with React.lazy()
- **Memoization**: React.memo() for expensive components
- **Virtual Scrolling**: Efficient rendering of large file lists
- **Bundle Optimization**: Tree shaking and code splitting

### Asset Optimization
- **Image Optimization**: WebP format with fallbacks
- **Font Loading**: Optimal web font loading strategies
- **CSS Optimization**: PurgeCSS for unused style removal
- **JavaScript Minification**: Terser for production builds

### Caching Strategies
- **Service Worker**: Offline functionality and asset caching
- **HTTP Caching**: Appropriate cache headers for static assets
- **Memory Caching**: Intelligent component and data caching
- **CDN Integration**: Global content delivery for optimal performance

## 🚀 Deployment

### Production Deployment Options

#### Vercel (Recommended)
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

#### Netlify
\`\`\`bash
npm run build
# Deploy dist/ folder to Netlify
\`\`\`

#### Docker Deployment
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
\`\`\`

### Environment Configuration
- **Development**: Local development with hot reloading
- **Staging**: Pre-production testing environment
- **Production**: Optimized build with performance monitoring

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Make your changes following our coding standards
4. Add tests for new functionality
5. Commit your changes (\`git commit -m 'Add amazing feature'\`)
6. Push to the branch (\`git push origin feature/amazing-feature\`)
7. Open a Pull Request

### Coding Standards
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Automatic code formatting on commit
- **Naming Conventions**: Use camelCase for variables, PascalCase for components
- **File Organization**: Group related files in appropriate directories

### Pull Request Process
1. Update documentation for any new features
2. Ensure all tests pass and coverage requirements are met
3. Update the README.md if needed
4. Request review from at least two maintainers
5. Address any feedback before merging

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Third-party Licenses
- React: MIT License
- Tailwind CSS: MIT License
- Lucide Icons: ISC License
- Additional dependencies listed in package.json

---

**Built with ❤️ by the OHARA Team**

For questions, issues, or feature requests, please open an issue on GitHub or contact our development team.`,
      file_type: 'markdown',
      size: 15360,
      created_at: '2024-01-15T10:30:00.000Z',
      updated_at: '2024-01-20T14:22:00.000Z',
    },
    {
      id: '2',
      name: 'package.json',
      title: 'package.json',
      user_id: 'user-123',
      folder_id: '3',
      content: `{
  "name": "react-app-example",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "tailwindcss": "^3.3.3"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`,
      file_type: 'json',
      size: 512,
      created_at: '2024-01-12T11:45:00.000Z',
      updated_at: '2024-01-18T16:30:00.000Z',
    },
    {
      id: '3',
      name: 'quarterly-report.pdf',
      title: 'quarterly-report.pdf',
      user_id: 'user-123',
      folder_id: '4',
      content: 'This is a PDF file containing the quarterly business report with charts and financial data.',
      file_type: 'pdf',
      size: 2048000,
      created_at: '2024-01-08T08:20:00.000Z',
      updated_at: '2024-01-25T13:10:00.000Z',
    },
    {
      id: '4',
      name: 'config.js',
      title: 'config.js',
      user_id: 'user-123',
      folder_id: '3',
      content: `// Application configuration
export const config = {
  api: {
    base_url: 'https://api.example.com',
    timeout: 5000,
    retry_attempts: 3
  },
  features: {
    dark_mode: true,
    chat_enabled: true,
    file_preview: true
  },
  theme: {
    primary_color: '#3b82f6',
    secondary_color: '#64748b'
  }
};

export default config;`,
      file_type: 'javascript',
      size: 384,
      created_at: '2024-01-14T09:30:00.000Z',
      updated_at: '2024-01-19T11:20:00.000Z',
    },
    {
      id: '5',
      name: 'notes.txt',
      title: 'notes.txt',
      user_id: 'user-123',
      folder_id: '1',
      content: `Meeting Notes - January 2024

Project Kickoff:
- Define user requirements
- Set up development environment
- Create initial wireframes
- Plan sprint cycles

Technical Decisions:
- React for frontend framework
- Tailwind for styling
- Vite for build tool
- Component-based architecture

Next Steps:
- Implement authentication
- Build file system interface
- Add chat functionality
- User testing phase`,
      file_type: 'text',
      size: 256,
      created_at: '2024-01-16T14:15:00.000Z',
      updated_at: '2024-01-22T16:45:00.000Z',
    },
    {
      id: '6',
      name: 'hero.png',
      title: 'hero.png',
      user_id: 'user-123',
      folder_id: '5',
      content: '/hero.png',
      file_type: 'image',
      size: 2800000, // Approximately 2.8MB to match the actual file
      created_at: '2024-01-05T15:00:00.000Z',
      updated_at: '2024-01-28T10:45:00.000Z',
    }
  ]
}

// Mock chat messages
export const mock_chat_messages = [
  {
    id: '1',
    type: 'user',
    role: 'user',
    content: 'Hello! Can you help me understand this project structure?',
    timestamp: '2024-01-29T10:30:00.000Z',
  },
  {
    id: '2',
    type: 'assistant',
    role: 'assistant',
    content: "Hello! I'd be happy to help you understand the project structure. I can see you have several folders including Documents, Projects, and Images. What specific aspect would you like me to explain?",
    timestamp: '2024-01-29T10:30:15.000Z',
  },
  {
    id: '3',
    type: 'user',
    role: 'user',
    content: 'What files are in the React Apps folder?',
    timestamp: '2024-01-29T10:31:00.000Z',
  },
  {
    id: '4',
    type: 'assistant',
    role: 'assistant',
    content: "The React Apps folder contains two files: 'package.json' and 'config.js'. The package.json defines the project dependencies and scripts, while config.js contains application configuration settings including API endpoints and theme colors.",
    timestamp: '2024-01-29T10:31:20.000Z',
  }
]

// Helper functions
export const get_folder_by_id = (id) => {
  return mock_file_system.folders.find(folder => folder.id === id)
}

export const get_file_by_id = (id) => {
  return mock_file_system.files.find(file => file.id === id)
}

export const get_files_in_folder = (folder_id) => {
  return mock_file_system.files.filter(file => file.folder_id === folder_id)
}

export const get_subfolders = (parent_id) => {
  return mock_file_system.folders.filter(folder => folder.parent_id === parent_id)
}

export const get_root_folders = () => {
  return mock_file_system.folders.filter(folder => folder.parent_id === null)
}

export const format_file_size = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const get_folder_path = (folder_id) => {
  if (!folder_id) return []

  const path = []
  let current_folder = get_folder_by_id(folder_id)

  while (current_folder) {
    path.unshift(current_folder)
    current_folder = current_folder.parent_id ? get_folder_by_id(current_folder.parent_id) : null
  }

  return path
}

export const get_file_icon = (file_type) => {
  const icons = {
    markdown: 'FileText',
    json: 'Code',
    javascript: 'Code',
    pdf: 'FileType',
    text: 'FileText',
    image: 'Image',
    default: 'File'
  }

  return icons[file_type] || icons.default
}