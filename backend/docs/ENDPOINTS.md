# Endpoint Documentation

## Implementation Status: IN DEVELOPMENT

Backend has been migrated to NestJS with modular architecture.

## Core Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Collections
- `GET /collections` - List all collections
- `GET /collections/:id` - Get collection by ID
- `POST /collections` - Create new collection
- `PUT /collections/:id` - Update collection
- `DELETE /collections/:id` - Delete collection

### Items
- `GET /items` - List all items
- `GET /items/:id` - Get item by ID
- `POST /items` - Create new item
- `PUT /items/:id` - Update item
- `DELETE /items/:id` - Delete item

### Documents
- `GET /documents` - List all documents
- `GET /documents/:id` - Get document by ID
- `POST /documents` - Create new document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

### Folders
- `GET /folders` - List all folders
- `GET /folders/:id` - Get folder by ID
- `POST /folders` - Create new folder
- `PUT /folders/:id` - Update folder
- `DELETE /folders/:id` - Delete folder

### Comments
- `GET /comments` - List all comments
- `GET /comments/:id` - Get comment by ID
- `POST /comments` - Create new comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Reactions
- `GET /reactions` - List all reactions
- `GET /reactions/:id` - Get reaction by ID
- `POST /reactions` - Create new reaction
- `DELETE /reactions/:id` - Delete reaction

### Agent
- `POST /agent/chat` - Send message to AI agent
- `GET /agent/status` - Check agent service status

## Architecture

- **Framework:** NestJS
- **Base URL:** `http://localhost:3000`
- **Database:** PostgreSQL (via TypeORM)
- **Authentication:** JWT
- **Architecture:** Modular NestJS

## Current Modules

- AuthModule - Authentication and authorization
- UsersModule - User management
- CollectionsModule - Collection management
- ItemsModule - Item management
- DocumentsModule - Document management
- FoldersModule - Folder management
- CommentsModule - Comment management
- ReactionsModule - Reaction management
- AgentModule - AI agent integration

## Notes

- Backend migrated from Python FastAPI to NestJS
- Using modular architecture with separate controllers and services
- TypeScript compilation: PASSING
- ESLint: Configured