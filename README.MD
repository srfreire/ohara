# OHARA

```
  ..*#:=@..                                      ..@=:#+
  .%.. ..@            . ..............           .@.  ..#...
.@.... .:+.    ......#@%============%@@......    .*..  ...@.
@.     ..@     ..*@+=====================@%..    .@..     .@
%....*..  :@..:@+===========================@=..@:. ..#. ..%
......%=.  .+@=========#@%+-====-=%@@=========@+.  .=%......
       .@... .%*====@+=================@#==+*#. ...@.
       ..-@..  .@#%======================+@@.  ..@%..
       .*+=+@..:@==========================+#..@+==@..
      .+*====+@+============================-@*=====%.
    ...%===+=@-==-=#@@@@@@%%%%%%%%%@@@@@%+-===@=+===*=...
   ...@+++=+*@%###%%%%@@@@@@@@@@@@@@@@%%%%##%#@@++=++@...
......#*@@@%*==================================*%@@@*+#.....
...%@=========%@@%+......................=#@@@+=======-@@...
..#+=======%.........+=..............=+:........@========%..
....+@%====@... .+@@@@@@@@-.    ..@@@@@@@@%..  .@-===%@*....
.....@++++*@....@@@@@@@@@@@%    -@@@@@@@@@@@....@*++++@.....
   ..#+++++*=..:@@@@@@@@@@@@.. .@@@@@@@@@@@@+...%+++++@.
   ...@+++++@...@@@@@@@@@@@@.. .@@@@@@@@@@@@=..@+++++*-..
   ...@++++++@..@@@@@@@@@@@*.   :@@@@@@@@@@@...#+++++@...
    ...@*+++++#..:@@@@@@@@..    ..@@@@@@@@+..:%+*+++@....
      ..@*****+@........ ...@@@@......:.....+#*****#=.
       ..@*****%@-.       ..@@@@.        ..@%*****#=.
       ...@***@...#*...     ....     ...:@...@#**@...
       ....*@..  .@**@#.            .+@**@.  ..@@....
         .@..  .@****@...%%@@@@@@@%...@@***@.  ..@.
       .@ .  .%#@***@%.@.%...--. .%.@.-@***@@#.  ..@.
......%=.  .+%....*@@:*.@..:=##+:..@.-+@@%....%=.  .+#......
%....#..  :@.   .....@.##.   --.  .#@.#......  .@:. ..%. ..%
@.     ..@.          :#....#@@@@#:...=#          .@..     .@
.@.... .:=.           .@..        ..@:.          .*..  ...@.
  .%.. ..@            ...@%......%@...           .@.  ..#...
  ..*#:-@..               . ......               ..@-:#*
```

## 🌟 Overview

**OHARA** is an AI-powered document management and research platform designed to help you organize, analyze, and interact with your PDF documents. It combines powerful document management with intelligent AI assistance to enhance your research workflow.

## ✨ Key Features

### 📄 Document Management
- **Smart Organization**: Organize documents into folders and collections
- **File Explorer**: Browse and navigate through your document library
- **Storage Integration**: Seamless integration with Supabase for secure storage
- **Multi-level Hierarchy**: Support for nested folders and structured collections

### 🔍 Advanced PDF Viewer
- **Built-in PDF Reader**: High-performance PDF rendering with PDF.js
- **Smart Search**: Search within documents with automatic scroll to results
- **Citation Support**: Click citations to automatically navigate to referenced pages
- **Navigation Tools**: Breadcrumb navigation and file explorer integration

### 🤖 AI-Powered Assistant
- **Context-Aware Chat**: AI assistant that understands your documents
- **Document-Specific Conversations**: Ask questions about the document you're viewing
- **Streaming Responses**: Real-time AI responses for better interactivity
- **Multiple Models**: Support for OpenAI and Baseten models
- **Tool Integration**: Access to specialized tools:
  - Document retrieval and search
  - Email operations (Gmail)
  - PDF generation
  - AI brainstorming

### 💬 Collaboration Features
- **Comments System**: Add comments and annotations to documents
- **Reactions**: Express feedback with emoji reactions
- **Threaded Discussions**: Reply to comments for structured conversations
- **Real-time Updates**: Stay in sync with your team

### 🔐 Authentication & Security
- **Google OAuth 2.0**: Secure authentication with your Google account
- **JWT Tokens**: Industry-standard token-based authentication
- **User Profiles**: Personalized experience for each user
- **API Key Support**: Secure API access for integrations

## 🏗️ Architecture

OHARA uses a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                            │
│  - PDF Viewer, Chat UI, File Explorer               │
│  - TailwindCSS, Zustand State Management            │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│  Backend (NestJS + TypeScript)                      │
│  - REST API, Authentication, Data Management        │
│  - Modular Architecture, Supabase Integration       │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│  Agent Service (Python FastAPI)                     │
│  - AI Chat, Tool Execution, LLM Integration         │
│  - OpenAI/Baseten, Stateless Microservice           │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js 20+)
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT, Passport.js, Google OAuth
- **Validation**: Zod schemas
- **Architecture**: Modular design with controllers and services

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS with typography plugin
- **State Management**: Zustand
- **PDF Rendering**: PDF.js (pdfjs-dist)
- **Routing**: React Router v6
- **UI Components**: Lucide React icons
- **Markdown**: React Markdown with GitHub Flavored Markdown

### Agent Service
- **Framework**: Python FastAPI
- **AI Models**: OpenAI, Baseten
- **Package Manager**: UV (modern Python package manager)
- **Architecture**: 3-layer stateless microservice
- **Tools**: Document retrieval, Gmail integration, PDF generation

## 🚀 Quick Start

### Prerequisites
- Node.js 20 or higher
- Python 3.11+
- PostgreSQL database
- Supabase account
- OpenAI API key (for AI features)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ohara
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration:
# - Database credentials
# - JWT secret
# - Google OAuth credentials
# - Supabase URL and keys

# Start the backend
npm run start:dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Agent Service Setup (Optional - for AI features)
```bash
cd agent
uv sync

# Configure environment variables
cp .env.example .env
# Edit .env with:
# - OPENAI_API_KEY
# - BASETEN_API_KEY (optional)
# - AGENT_PORT=8001

# Start the agent service
uv run uvicorn api.main:app --reload --host 0.0.0.0 --port 8001
```

The agent service will run on `http://localhost:8001`

## 📖 Usage

1. **Login**: Sign in with your Google account
2. **Upload Documents**: Add PDF documents to your library
3. **Organize**: Create folders and collections to structure your documents
4. **View & Read**: Open documents in the built-in PDF viewer
5. **Search**: Find specific content within your documents
6. **Ask Questions**: Use the AI assistant to analyze and understand your documents
7. **Collaborate**: Add comments and reactions to share insights

## 🗂️ Project Structure

```
ohara/
├── backend/              # NestJS backend service
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   │   ├── auth/     # Authentication
│   │   │   ├── users/    # User management
│   │   │   ├── documents/# Document management
│   │   │   ├── folders/  # Folder management
│   │   │   ├── collections/ # Collections
│   │   │   ├── comments/ # Comments system
│   │   │   ├── reactions/# Reactions
│   │   │   └── agent/    # AI agent integration
│   │   └── main.ts       # Application entry
│   └── docs/             # Backend documentation
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── auth/     # Authentication UI
│   │   │   ├── dashboard/# Main dashboard
│   │   │   ├── pdf/      # PDF viewer
│   │   │   ├── chat/     # AI chat interface
│   │   │   └── comments/ # Comments UI
│   │   ├── api/          # API client functions
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── agent/                # Python AI agent service
    ├── api/              # FastAPI routes
    ├── llm/              # LLM orchestration
    ├── tools/            # Tool implementations
    └── config/           # Configuration
```

## 📝 API Documentation

### Backend API
The backend exposes RESTful endpoints for:
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/documents/*` - Document operations
- `/api/folders/*` - Folder management
- `/api/collections/*` - Collection management
- `/api/comments/*` - Comments system
- `/api/reactions/*` - Reactions
- `/api/agent/*` - AI agent integration

See [backend/docs/README.md](backend/docs/README.md) for detailed API documentation.

### Agent API
The agent service provides:
- `POST /v1/chat/stream` - Streaming chat with AI
- `POST /v1/api/generate-chat-title` - Generate chat titles
- `GET /v1/api/agent/status` - Agent service status
- `GET /health` - Health check

See [agent/README.md](agent/README.md) for detailed agent documentation.

## 🧪 Development

### Backend Development
```bash
cd backend
npm run start:dev    # Start with hot reload
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Agent Development
```bash
cd agent
uv run uvicorn api.main:app --reload  # Start with hot reload
uv run agent         # Start server (production)
uv run chat          # Interactive terminal chat client
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Juan Freire** ([@srfreire](https://github.com/srfreire))

---

Built with ❤️ using React, NestJS, and FastAPI
