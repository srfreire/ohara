# Ohara Backend API Documentation

Base URL: `http://localhost:8000/v1`

## Authentication

This API uses **dual authentication** depending on the resource:

### 1. API Key Authentication (Admin Endpoints)
For admin-managed resources (Users, Folders, Documents), you need an **API Key**.

**Header:**
```
x-api-key: ohara_admin_secret_key_2025
```

**Admin Endpoints:**
- All `/users` endpoints (except PUT/DELETE your own account)
- All `/folders` endpoints
- All `/documents` endpoints

### 2. JWT Bearer Token Authentication (User Endpoints)
For user-managed resources (Collections, Comments, Reactions, Items), you need a **JWT token** from Google OAuth.

**Header:**
```
Authorization: Bearer <your_jwt_token>
```

**User Endpoints:**
- All `/collections` endpoints
- All `/comments` endpoints
- All `/reactions` endpoints
- All `/items` endpoints
- `PUT /users/:id` - Update your own account
- `DELETE /users/:id` - Delete your own account

---

## How to Get Your JWT Token

1. **Login via Google OAuth**
   - Open in your browser: `http://localhost:8000/v1/auth/login`
   - You'll be redirected to Google login
   - After successful login, Google redirects back with your JWT token
   - **Save the `access_token` from the response!**

2. **Use the Token in Requests**
   - Include it in the `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

---

## Auth Endpoints

### Google OAuth Login
```http
GET /auth/login
```
Redirects to Google OAuth consent screen. **Must be opened in browser.**

### OAuth Callback
```http
GET /auth/callback
```
Handles Google OAuth callback. Returns JWT token.

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

**Important:** Save the `access_token` value!

### Refresh Token
```http
GET /auth/refresh
```
Get a new JWT token. Requires existing valid JWT.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Users

**Authentication:**
- GET/POST: Requires **API Key** (Admin only)
- PUT/DELETE: Requires **API Key** (Admin) OR **JWT** (User can update/delete themselves)

### Get All Users
```http
GET /users
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
```

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get User by ID
```http
GET /users/:id
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Create User
```http
POST /users
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### Update User
```http
PUT /users/:id
```

**Headers (Admin):**
```
x-api-key: ohara_admin_secret_key_2025
Content-Type: application/json
```

**OR Headers (User updating themselves):**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (all fields optional):**
```json
{
  "email": "newemail@example.com",
  "name": "New Name",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

### Delete User
```http
DELETE /users/:id
```

**Headers (Admin):**
```
x-api-key: ohara_admin_secret_key_2025
```

**OR Headers (User deleting themselves):**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Collections

**Authentication:** Requires **JWT Bearer Token**

### Get All Collections
```http
GET /collections
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My Collection",
    "user_id": "uuid",
    "description": "Collection description",
    "visibility": "private",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Collection by ID
```http
GET /collections/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Collection",
  "user_id": "uuid",
  "description": "Collection description",
  "visibility": "private",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Create Collection
```http
POST /collections
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "My New Collection",
  "user_id": "uuid",
  "description": "Optional description",
  "visibility": "private"
}
```

**Visibility options:** `private`, `unlisted`, `public` (default: `private`)

### Update Collection
```http
PUT /collections/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Collection Name",
  "description": "Updated description",
  "visibility": "public"
}
```

### Delete Collection
```http
DELETE /collections/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Collection deleted successfully"
}
```

---

## Items

**Authentication:** Requires **JWT Bearer Token**

### Get Items by Collection
```http
GET /collections/:id/items
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "document_id": "uuid",
    "collection_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Add Item to Collection
```http
POST /collections/:id/items
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "document_id": "uuid"
}
```

### Delete Item from Collection
```http
DELETE /collections/:id/items/:itemId
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Item deleted successfully"
}
```

---

## Documents

**Authentication:** Requires **API Key** (Admin only)

### Get All Documents
```http
GET /documents
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
```

**Query Parameters:**
- `limit` (optional, default: 25, max: 100)
- `offset` (optional, default: 0)
- `folder_id` (optional, UUID)

**Example:**
```
GET /documents?limit=50&offset=0&folder_id=uuid
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Document Title",
    "storage_path": "/path/to/document",
    "nessie_id": "nessie_identifier",
    "folder_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Document by ID
```http
GET /documents/:id
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Document Title",
  "storage_path": "/path/to/document",
  "nessie_id": "nessie_identifier",
  "folder_id": "uuid",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

## Folders

**Authentication:** Requires **API Key** (Admin only)

### Get All Folders
```http
GET /folders
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
```

**Query Parameters:**
- `limit` (optional, default: 25, max: 100)
- `offset` (optional, default: 0)
- `parent_id` (optional, UUID)

**Example:**
```
GET /folders?limit=50&offset=0&parent_id=uuid
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Folder Name",
    "parent_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Folder by ID
```http
GET /folders/:id
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Folder Name",
  "parent_id": "uuid",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Create Folder
```http
POST /folders
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
Content-Type: application/json
```

**Body:**
```json
{
  "name": "New Folder",
  "parent_id": "uuid"
}
```

**Note:** `parent_id` is optional (omit for root folder)

### Update Folder
```http
PUT /folders/:id
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Folder Name",
  "parent_id": "uuid"
}
```

### Delete Folder
```http
DELETE /folders/:id
```

**Headers:**
```
x-api-key: ohara_admin_secret_key_2025
```

**Response:**
```json
{
  "message": "Folder deleted successfully"
}
```

---

## Comments

**Authentication:** Requires **JWT Bearer Token**

### Get All Comments
```http
GET /comments
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional, default: 25, max: 100)
- `offset` (optional, default: 0)
- `documentId` (optional, UUID)

**Example:**
```
GET /comments?limit=50&offset=0&documentId=uuid
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "parent_comment_id": "uuid",
    "document_id": "uuid",
    "content": "This is a comment",
    "start_offset": 0,
    "end_offset": 100,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Comment
```http
POST /comments
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": "uuid",
  "parent_comment_id": "uuid",
  "document_id": "uuid",
  "content": "This is my comment",
  "start_offset": 0,
  "end_offset": 100
}
```

**Notes:**
- `parent_comment_id` is optional (for replies)
- `document_id` is optional
- `start_offset` must be less than `end_offset`
- Default offsets are 0 if not provided

### Update Comment
```http
PUT /comments/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "content": "Updated comment text",
  "start_offset": 10,
  "end_offset": 150
}
```

### Delete Comment
```http
DELETE /comments/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Reactions

**Authentication:** Requires **JWT Bearer Token**

### Get All Reactions
```http
GET /reactions
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional, default: 25, max: 100)
- `offset` (optional, default: 0)
- `commentId` (optional, UUID)

**Example:**
```
GET /reactions?limit=50&offset=0&commentId=uuid
```

**Response:**
```json
[
  {
    "id": "uuid",
    "comment_id": "uuid",
    "user_id": "uuid",
    "reaction_type": "like",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Reaction
```http
POST /reactions
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "comment_id": "uuid",
  "user_id": "uuid",
  "reaction_type": "like"
}
```

**Reaction types:** `like`, `love`, `insight`, `question`, `flag`

### Update Reaction
```http
PUT /reactions/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "reaction_type": "love"
}
```

### Delete Reaction
```http
DELETE /reactions/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Reaction deleted successfully"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with cURL

### Example: Get All Users (Admin)
```bash
curl -X GET http://localhost:8000/v1/users \
  -H "x-api-key: ohara_admin_secret_key_2025"
```

### Example: Update Your Own User Account
```bash
curl -X PUT http://localhost:8000/v1/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

### Example: Get All Collections (with JWT)
```bash
curl -X GET http://localhost:8000/v1/collections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example: Create a Folder (Admin)
```bash
curl -X POST http://localhost:8000/v1/folders \
  -H "x-api-key: ohara_admin_secret_key_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Folder"
  }'
```

### Example: Create a Comment (User)
```bash
curl -X POST http://localhost:8000/v1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-here",
    "document_id": "uuid-here",
    "content": "Great document!",
    "start_offset": 0,
    "end_offset": 50
  }'
```
