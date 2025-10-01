# Ohara Backend

NestJS backend with Supabase, dual authentication (API Key + Google OAuth JWT), and comprehensive REST API.

## Features

- **Dual Authentication System**
  - API Key authentication for admin operations (Users, Folders, Documents)
  - JWT Bearer token authentication for user operations (Collections, Comments, Reactions)
- **Google OAuth Integration** - Seamless user authentication
- **Supabase Database** - PostgreSQL with real-time capabilities
- **Zod Validation** - Runtime type checking and validation
- **Modular Architecture** - Clean separation of concerns

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/v1/auth/callback

# JWT
JWT_SECRET=your-secret-key-here

# Admin API Key
ADMIN_API_KEY=ohara_admin_secret_key_2025

# Server
PORT=8000
```

### 3. Database Setup

Run the SQL initialization script in your Supabase SQL editor:
```bash
# Located in: /sql/init.sql
```

This creates all necessary tables:
- `users` - User accounts
- `collections` - User document collections
- `items` - Collection items
- `documents` - Document metadata
- `folders` - Folder hierarchy
- `comments` - Document comments
- `reactions` - Comment reactions

## Running the App

### Development Mode
```bash
npm run start:dev
```
Server runs at: `http://localhost:8000/v1`

### Production Mode
```bash
npm run build
npm run start:prod
```

## Authentication

### For Admins (API Key)
Use the API Key in the `x-api-key` header for admin operations:
```bash
curl -H "x-api-key: ohara_admin_secret_key_2025" \
  http://localhost:8000/v1/users
```

**Admin Endpoints:**
- All `/users` endpoints (GET, POST, GET by ID)
- All `/folders` endpoints
- All `/documents` endpoints

### For Users (JWT Bearer Token)
1. Login via Google OAuth:
   - Open `http://localhost:8000/v1/auth/login` in browser
   - Complete Google login
   - Save the returned `access_token`

2. Use the token in requests:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/v1/collections
```

**User Endpoints:**
- All `/collections` endpoints
- All `/comments` endpoints
- All `/reactions` endpoints
- All `/items` endpoints
- `PUT /users/:id` - Update own account
- `DELETE /users/:id` - Delete own account

## API Endpoints

Base URL: `/api/v1`

### Authentication
- `GET /auth/login` - Google OAuth login (browser only)
- `GET /auth/callback` - OAuth callback handler
- `GET /auth/refresh` - Refresh JWT token

### Users (Admin: API Key | Self: JWT)
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin only)
- `POST /users` - Create user (Admin only)
- `PUT /users/:id` - Update user (Admin or self)
- `DELETE /users/:id` - Delete user (Admin or self)

### Collections (Requires JWT)
- `GET /collections` - Get all collections
- `GET /collections/:id` - Get collection by ID
- `POST /collections` - Create collection
- `PUT /collections/:id` - Update collection
- `DELETE /collections/:id` - Delete collection

### Items (Requires JWT)
- `GET /collections/:id/items` - Get items in collection
- `POST /collections/:id/items` - Add item to collection
- `DELETE /collections/:id/items/:itemId` - Remove item

### Documents (Admin: API Key)
- `GET /documents` - Get all documents (pagination supported)
- `GET /documents/:id` - Get document by ID

### Folders (Admin: API Key)
- `GET /folders` - Get all folders (pagination supported)
- `GET /folders/:id` - Get folder by ID
- `POST /folders` - Create folder
- `PUT /folders/:id` - Update folder
- `DELETE /folders/:id` - Delete folder

### Comments (Requires JWT)
- `GET /comments?documentId=...` - Get comments (pagination supported)
- `POST /comments` - Create comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Reactions (Requires JWT)
- `GET /reactions?commentId=...` - Get reactions (pagination supported)
- `POST /reactions` - Create reaction
- `PUT /reactions/:id` - Update reaction
- `DELETE /reactions/:id` - Delete reaction

**Reaction Types:** `like`, `love`, `insight`, `question`, `flag`

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # Authentication (Google OAuth, JWT)
│   │   │   ├── guards/     # Auth guards (API Key, JWT, combined)
│   │   │   ├── strategies/ # Passport strategies
│   │   │   └── controllers/
│   │   ├── users/          # User management
│   │   ├── collections/    # User collections
│   │   ├── items/          # Collection items
│   │   ├── documents/      # Document metadata
│   │   ├── folders/        # Folder hierarchy
│   │   ├── comments/       # Document comments
│   │   └── reactions/      # Comment reactions
│   ├── common/
│   │   ├── errors/         # Error handling
│   │   └── validation/     # Zod validation pipes
│   ├── lib/
│   │   └── supabase.client.ts  # Supabase client
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── .env                    # Environment variables
├── API.md                  # Full API documentation
└── README.md               # This file
```

## Architecture

The project follows a **3-layer architecture** per module:

1. **Models** (`/models`) - TypeScript types and Zod validation schemas
2. **Services** (`/services`) - Business logic and database queries
3. **Controllers** (`/controllers`) - REST endpoints with validation

### Authentication Guards

- **`ApiKeyGuard`** - Validates `x-api-key` header against `ADMIN_API_KEY`
- **`JwtAuthGuard`** - Validates JWT Bearer token from Google OAuth
- **`ApiKeyOrJwtGuard`** - Accepts either API Key (admin) or JWT (user)
- **`GoogleAuthGuard`** - Handles Google OAuth flow

## Tech Stack

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[Passport](https://www.passportjs.org/)** - Authentication middleware
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## Development

### Code Style
- **Variables/Functions**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `ALL_CAPS`
- **Files**: `kebab-case.ts`

### Naming Conventions
- Database tables: `snake_case` plural (e.g., `users`, `collections`)
- Foreign keys: `<singular>_id` (e.g., `user_id`, `collection_id`)
- API routes: `kebab-case` plural (e.g., `/user-accounts`, `/collections`)

### Commit Format
```
vX.Y.Z type[scope]: message
```
Example: `v1.3.0 feat[auth]: implement dual authentication strategy`

## Documentation

- **[API.md](API.md)** - Complete API documentation with examples
- **[/sql/init.sql](../sql/init.sql)** - Database schema and initialization

## License

OSIX Tech © 2025
