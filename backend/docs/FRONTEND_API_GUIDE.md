# Frontend API Guide - Ohara Backend

## Base Configuration

- **Base URL:** `http://localhost:3000`
- **Authentication:** JWT tokens (Bearer token in Authorization header)
- **Content-Type:** `application/json`

## Authentication

All endpoints except `/auth/login` and `/auth/callback` require authentication.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Authentication Endpoints

### Google OAuth Login

**Endpoint:** `GET /auth/login`

**Authentication:** None

**Description:** Initiates Google OAuth flow. Redirects to Google login page.

---

### Google OAuth Callback

**Endpoint:** `GET /auth/callback`

**Authentication:** None

**Query Parameters:**
- `code` (string, required) - OAuth authorization code from Google

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### Refresh Token

**Endpoint:** `GET /auth/refresh`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "access_token": "new_jwt_token_here"
}
```

---

## User Endpoints

### List All Users

**Endpoint:** `GET /users`

**Authentication:** Required (API Key only)

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Get User by ID

**Endpoint:** `GET /users/:id`

**Authentication:** Required (API Key only)

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z"
}
```

---

### Create User

**Endpoint:** `POST /users`

**Authentication:** Required (API Key only)

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response:** User object

---

### Update User

**Endpoint:** `PUT /users/:id`

**Authentication:** Required (JWT or API Key)

**Note:** Users can only update their own account unless using API Key.

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "name": "Updated Name",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response:** Updated user object

---

### Delete User

**Endpoint:** `DELETE /users/:id`

**Authentication:** Required (JWT or API Key)

**Note:** Users can only delete their own account unless using API Key.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Collection Endpoints

### List Collections

**Endpoint:** `GET /collections`

**Authentication:** Required (JWT)

**Description:** Returns all collections for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My Collection",
    "user_id": "uuid",
    "description": "Collection description",
    "visibility": "private",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Get Collection by ID

**Endpoint:** `GET /collections/:id`

**Authentication:** Required (JWT)

**Response:** Collection object

---

### Create Collection

**Endpoint:** `POST /collections`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "My Collection",
  "user_id": "uuid",
  "description": "Optional description",
  "visibility": "private"
}
```

**Visibility Options:** `private`, `unlisted`, `public`

**Response:** Created collection object

---

### Update Collection

**Endpoint:** `PUT /collections/:id`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "Updated Collection Name",
  "description": "Updated description",
  "visibility": "public"
}
```

**Response:** Updated collection object

---

### Delete Collection

**Endpoint:** `DELETE /collections/:id`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "message": "Collection deleted successfully"
}
```

---

## Item Endpoints

Items belong to collections. All item endpoints are nested under collections.

### List Items in Collection

**Endpoint:** `GET /collections/:id/items`

**Authentication:** Required (JWT)

**Response:**
```json
[
  {
    "id": "uuid",
    "collection_id": "uuid",
    "document_id": "uuid",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Add Item to Collection

**Endpoint:** `POST /collections/:id/items`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "document_id": "uuid"
}
```

**Response:** Created item object

---

### Remove Item from Collection

**Endpoint:** `DELETE /collections/:id/items/:itemId`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "message": "Item deleted successfully"
}
```

---

## Document Endpoints

### List Documents

**Endpoint:** `GET /documents`

**Authentication:** Required (API Key only)

**Query Parameters:**
- `user_id` (string, optional) - Filter by user
- `limit` (number, optional) - Limit results
- `offset` (number, optional) - Offset for pagination

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Document Title",
    "content": "Document content...",
    "user_id": "uuid",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Get Document by ID

**Endpoint:** `GET /documents/:id`

**Authentication:** Required (API Key only)

**Response:** Document object

---

## Folder Endpoints

### List Folders

**Endpoint:** `GET /folders`

**Authentication:** Required (API Key only)

**Query Parameters:**
- `user_id` (string, optional) - Filter by user
- `parent_id` (string, optional) - Filter by parent folder

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Folder Name",
    "user_id": "uuid",
    "parent_id": "uuid",
    "path": "/parent/folder",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Get Folder by ID

**Endpoint:** `GET /folders/:id`

**Authentication:** Required (API Key only)

**Response:** Folder object

---

### Create Folder

**Endpoint:** `POST /folders`

**Authentication:** Required (API Key only)

**Request Body:**
```json
{
  "name": "New Folder",
  "user_id": "uuid",
  "parent_id": "uuid",
  "path": "/parent/new-folder"
}
```

**Response:** Created folder object

---

### Update Folder

**Endpoint:** `PUT /folders/:id`

**Authentication:** Required (API Key only)

**Request Body:**
```json
{
  "name": "Updated Folder Name",
  "parent_id": "uuid",
  "path": "/parent/updated-folder"
}
```

**Response:** Updated folder object

---

### Delete Folder

**Endpoint:** `DELETE /folders/:id`

**Authentication:** Required (API Key only)

**Response:**
```json
{
  "message": "Folder deleted successfully"
}
```

---

## Comment Endpoints

### List Comments

**Endpoint:** `GET /comments`

**Authentication:** Required (JWT)

**Query Parameters:**
- `document_id` (string, optional) - Filter by document
- `user_id` (string, optional) - Filter by user

**Response:**
```json
[
  {
    "id": "uuid",
    "document_id": "uuid",
    "user_id": "uuid",
    "content": "Comment text",
    "parent_comment_id": "uuid",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Create Comment

**Endpoint:** `POST /comments`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "document_id": "uuid",
  "user_id": "uuid",
  "content": "Comment text",
  "parent_comment_id": "uuid"
}
```

**Response:** Created comment object

---

### Update Comment

**Endpoint:** `PUT /comments/:id`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response:** Updated comment object

---

### Delete Comment

**Endpoint:** `DELETE /comments/:id`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Reaction Endpoints

### List Reactions

**Endpoint:** `GET /reactions`

**Authentication:** Required (JWT)

**Query Parameters:**
- `document_id` (string, optional) - Filter by document
- `comment_id` (string, optional) - Filter by comment
- `user_id` (string, optional) - Filter by user

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "document_id": "uuid",
    "comment_id": "uuid",
    "reaction_type": "like",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Create Reaction

**Endpoint:** `POST /reactions`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "user_id": "uuid",
  "document_id": "uuid",
  "comment_id": "uuid",
  "reaction_type": "like"
}
```

**Note:** Either `document_id` or `comment_id` must be provided.

**Response:** Created reaction object

---

### Update Reaction

**Endpoint:** `PUT /reactions/:id`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "reaction_type": "love"
}
```

**Response:** Updated reaction object

---

### Delete Reaction

**Endpoint:** `DELETE /reactions/:id`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "message": "Reaction deleted successfully"
}
```

---

## Agent Endpoints

### Stream Chat

**Endpoint:** `POST /agent/stream`

**Authentication:** Required (JWT)

**Description:** Streams AI agent responses via Server-Sent Events (SSE).

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ],
  "model": "gpt-4.1"
}
```

**Response:** Server-Sent Events stream

**Example SSE Stream:**
```
data: {"type": "token", "content": "Hello"}
data: {"type": "token", "content": "!"}
data: {"type": "done"}
```

---

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Error message description",
  "error": "Bad Request"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Frontend Integration Examples

### Setting up Axios Client

```javascript
import axios from 'axios';

const api_client = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api_client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api_client;
```

---

### Authentication Flow

```javascript
// 1. Redirect to Google OAuth
window.location.href = 'http://localhost:3000/auth/login';

// 2. Handle callback (redirect URL will contain code)
const url_params = new URLSearchParams(window.location.search);
const code = url_params.get('code');

// Backend handles this automatically and returns JWT
// Store the token
const { access_token } = response.data;
localStorage.setItem('access_token', access_token);

// 3. Use token for subsequent requests
const collections = await api_client.get('/collections');
```

---

### Creating a Collection

```javascript
const create_collection = async (name, description, visibility = 'private') => {
  try {
    const response = await api_client.post('/collections', {
      name,
      user_id: current_user.id,
      description,
      visibility,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create collection:', error.response.data);
    throw error;
  }
};
```

---

### Handling SSE Stream

```javascript
const stream_chat = async (messages) => {
  const response = await fetch('http://localhost:3000/agent/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify({ messages }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'token') {
          // Append token to UI
          console.log(data.content);
        }
      }
    }
  }
};
```

---

## Notes

- All timestamps are in ISO 8601 format
- UUIDs are used for all resource IDs
- API Key authentication is for internal/admin use only
- JWT tokens should be refreshed periodically using `/auth/refresh`
- Rate limiting may be applied in production
