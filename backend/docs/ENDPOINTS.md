# API Endpoints

Base URL: `/v2`

## Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/login` | GoogleAuthGuard | Initiate Google OAuth (redirects to Google) |
| GET | `/auth/callback` | GoogleAuthGuard | OAuth callback, sets cookie |
| GET | `/auth/refresh` | Cookie (JwtAuthGuard) | Refresh JWT + rotate session |
| GET | `/auth/logout` | Cookie (JwtAuthGuard) | Logout current session |
| GET | `/auth/logout-all` | Cookie (JwtAuthGuard) | Logout all user sessions |

**Redis Session Storage:**
- Sessions stored in Redis with 2-hour TTL
- Key `session:{session_id}` stores session data
- Key `user_sessions:{user_id}` (Set) tracks all sessions per user for logout-all

## Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Cookie/API | List all users (admin access) |
| GET | `/users/:id` | Cookie | Get own user profile (users can only view their own) |
| POST | `/users` | API | Create user (admin only) |
| PUT | `/users/:id` | Cookie/API | Update user (own or admin) |
| DELETE | `/users/:id` | Cookie/API | Delete user (own or admin) |

## Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/documents` | Cookie/API | List all documents (shared resource) |
| GET | `/documents/:id` | Cookie/API | Get document by ID (shared resource) |
| GET | `/documents/:id/url` | Cookie/API | Get signed URL (shared resource) |

**Note:** Documents are shared resources accessible to all authenticated users.

## Folders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/folders` | Cookie/API | List all folders (shared resource) |
| GET | `/folders/:id` | Cookie/API | Get folder by ID (shared resource) |
| POST | `/folders` | Cookie/API | Create folder (shared resource) |
| PUT | `/folders/:id` | Cookie/API | Update folder (shared resource) |
| DELETE | `/folders/:id` | Cookie/API | Delete folder (shared resource) |

**Note:** Folders are shared resources accessible to all authenticated users.

## Collections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/collections` | Cookie | List user's collections |
| GET | `/collections/:id` | Cookie | Get collection by ID |
| POST | `/collections` | Cookie | Create collection |
| PUT | `/collections/:id` | Cookie | Update collection |
| DELETE | `/collections/:id` | Cookie | Delete collection |

## Items
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/collections/:id/items` | Cookie | List items in collection |
| POST | `/collections/:id/items` | Cookie | Add item to collection |
| DELETE | `/collections/:id/items/:itemId` | Cookie | Remove item |

## Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/comments` | Cookie | List comments |
| POST | `/comments` | Cookie | Create comment |
| PUT | `/comments/:id` | Cookie | Update own comment only |
| DELETE | `/comments/:id` | Cookie | Delete own comment only |

## Reactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reactions` | Cookie | List reactions |
| POST | `/reactions` | Cookie | Create reaction |
| PUT | `/reactions/:id` | Cookie | Update own reaction only |
| DELETE | `/reactions/:id` | Cookie | Delete own reaction only |

## Agent
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/agent/stream` | Cookie | Stream chat with AI agent |

---

**Auth Types:**
- **Cookie**: HttpOnly cookie `access_token` (JWT + Redis session)
- **API**: Header `x-api-key: <key>` (admin access)
- **Cookie/API**: Accepts either authentication method
