// Mock file system data structure
export const mock_file_system = {
  folders: [
    {
      id: '1',
      name: 'Documents',
      parent_id: null,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Projects',
      parent_id: null,
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-20T14:22:00Z',
    },
    {
      id: '3',
      name: 'React Apps',
      parent_id: '2',
      created_at: '2024-01-12T11:45:00Z',
      updated_at: '2024-01-18T16:30:00Z',
    },
    {
      id: '4',
      name: 'Reports',
      parent_id: '1',
      created_at: '2024-01-08T08:20:00Z',
      updated_at: '2024-01-25T13:10:00Z',
    },
    {
      id: '5',
      name: 'Images',
      parent_id: null,
      created_at: '2024-01-05T15:00:00Z',
      updated_at: '2024-01-28T10:45:00Z',
    }
  ],
  files: [
    {
      id: '1',
      name: 'README.md',
      folder_id: '2',
      content: `# Project Overview

This is a comprehensive project documentation file that explains the architecture and implementation details.

## Features

- Modern React frontend with hooks
- Responsive design using Tailwind CSS
- Dark/Light mode support
- File system navigation
- Real-time chat integration

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Architecture

The application follows a modular component structure with clear separation of concerns.`,
      file_type: 'markdown',
      size: 1024,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:22:00Z',
    },
    {
      id: '2',
      name: 'package.json',
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
      created_at: '2024-01-12T11:45:00Z',
      updated_at: '2024-01-18T16:30:00Z',
    },
    {
      id: '3',
      name: 'quarterly-report.pdf',
      folder_id: '4',
      content: 'This is a PDF file containing the quarterly business report with charts and financial data.',
      file_type: 'pdf',
      size: 2048000,
      created_at: '2024-01-08T08:20:00Z',
      updated_at: '2024-01-25T13:10:00Z',
    },
    {
      id: '4',
      name: 'config.js',
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
      created_at: '2024-01-14T09:30:00Z',
      updated_at: '2024-01-19T11:20:00Z',
    },
    {
      id: '5',
      name: 'notes.txt',
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
      created_at: '2024-01-16T14:15:00Z',
      updated_at: '2024-01-22T16:45:00Z',
    },
    {
      id: '6',
      name: 'hero-image.jpg',
      folder_id: '5',
      content: 'Binary image data - Beautiful landscape photo used as hero image',
      file_type: 'image',
      size: 1536000,
      created_at: '2024-01-05T15:00:00Z',
      updated_at: '2024-01-28T10:45:00Z',
    }
  ]
}

// Mock chat messages
export const mock_chat_messages = [
  {
    id: '1',
    type: 'user',
    content: 'Hello! Can you help me understand this project structure?',
    timestamp: '2024-01-29T10:30:00Z',
  },
  {
    id: '2',
    type: 'assistant',
    content: "Hello! I'd be happy to help you understand the project structure. I can see you have several folders including Documents, Projects, and Images. What specific aspect would you like me to explain?",
    timestamp: '2024-01-29T10:30:15Z',
  },
  {
    id: '3',
    type: 'user',
    content: 'What files are in the React Apps folder?',
    timestamp: '2024-01-29T10:31:00Z',
  },
  {
    id: '4',
    type: 'assistant',
    content: "The React Apps folder contains two files: 'package.json' and 'config.js'. The package.json defines the project dependencies and scripts, while config.js contains application configuration settings including API endpoints and theme colors.",
    timestamp: '2024-01-29T10:31:20Z',
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