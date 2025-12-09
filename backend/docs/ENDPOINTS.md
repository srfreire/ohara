# API Endpoints

Base URL: `/v2`

## Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/login` | None | Initiate Google OAuth |
| GET | `/auth/callback` | None | OAuth callback |
| GET | `/auth/refresh` | JWT | Refresh JWT token |

## Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | JWT/API | List all users |
| GET | `/users/:id` | JWT/API | Get user by ID |
| POST | `/users` | JWT/API | Create user |
| PUT | `/users/:id` | JWT/API | Update user (own or admin) |
| DELETE | `/users/:id` | JWT/API | Delete user (own or admin) |

## Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/documents` | JWT/API | List documents |
| GET | `/documents/:id` | JWT/API | Get document by ID |
| GET | `/documents/:id/url` | JWT/API | Get signed URL |

## Folders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/folders` | JWT/API | List folders |
| GET | `/folders/:id` | JWT/API | Get folder by ID |
| POST | `/folders` | JWT/API | Create folder |
| PUT | `/folders/:id` | JWT/API | Update folder |
| DELETE | `/folders/:id` | JWT/API | Delete folder |

## Collections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/collections` | JWT | List user's collections |
| GET | `/collections/:id` | JWT | Get collection by ID |
| POST | `/collections` | JWT | Create collection |
| PUT | `/collections/:id` | JWT | Update collection |
| DELETE | `/collections/:id` | JWT | Delete collection |

## Items
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/collections/:id/items` | JWT | List items in collection |
| POST | `/collections/:id/items` | JWT | Add item to collection |
| DELETE | `/collections/:id/items/:itemId` | JWT | Remove item |

## Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/comments` | JWT | List comments |
| POST | `/comments` | JWT | Create comment |
| PUT | `/comments/:id` | JWT | Update comment |
| DELETE | `/comments/:id` | JWT | Delete comment |

## Reactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reactions` | JWT | List reactions |
| POST | `/reactions` | JWT | Create reaction |
| PUT | `/reactions/:id` | JWT | Update reaction |
| DELETE | `/reactions/:id` | JWT | Delete reaction |

## Agent
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/agent/stream` | JWT | Stream chat with AI agent |

---

**Auth Types:**
- **JWT**: Requires `Authorization: Bearer <token>` header
- **API**: Requires `x-api-key: <key>` header
- **JWT/API**: Accepts either authentication method
