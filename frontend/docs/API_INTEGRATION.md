# Ohara Backend API Documentation

Base URL: ⁠ http://localhost:8000/v1 ⁠

## Authentication

This API uses *Bearer Token* authentication with JWT tokens obtained via Google OAuth.

### How to Get Your JWT Token

1.⁠ ⁠*Login via Google OAuth*
   - Open in your browser: ⁠ http://localhost:8000/v1/auth/login ⁠
   - You'll be redirected to Google login
   - After successful login, Google redirects back with your JWT token
   - *Save the ⁠ access_token ⁠ from the response!*

2.⁠ ⁠*Use the Token in Requests*
   - Include it in the ⁠ Authorization ⁠ header:
   
⁠    Authorization: Bearer <your_jwt_token>
    ⁠

### Auth Endpoints

#### Google OAuth Login
⁠ http
GET /auth/login
 ⁠
Redirects to Google OAuth consent screen. *Must be opened in browser.*

#### OAuth Callback
⁠ http
GET /auth/callback
 ⁠
Handles Google OAuth callback. Returns JWT token.

*Response:*
⁠ json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
 ⁠

*Important:* Save the ⁠ access_token ⁠ value!

#### Refresh Token
⁠ http
GET /auth/refresh
 ⁠
Get a new JWT token. Requires existing valid JWT.

*Headers:*

Authorization: Bearer <jwt_token>


*Response:*
⁠ json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
 ⁠

---

## Users

### Get All Users
⁠ http
GET /users
 ⁠

*Response:*
⁠ json
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
 ⁠

### Get User by ID
⁠ http
GET /users/:id
 ⁠

*Response:*
⁠ json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
 ⁠

### Create User
⁠ http
POST /users
 ⁠

*Body:*
⁠ json
{
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
 ⁠

### Update User
⁠ http
PUT /users/:id
 ⁠

*Body:*
⁠ json
{
  "email": "newemail@example.com",
  "name": "New Name",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
 ⁠

### Delete User
⁠ http
DELETE /users/:id
 ⁠

*Response:*
⁠ json
{
  "message": "User deleted successfully"
}
 ⁠

---

## Collections

### Get All Collections
⁠ http
GET /collections
 ⁠

*Query Parameters:*
•⁠  ⁠Requires authenticated user (via JWT)

*Response:*
⁠ json
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
 ⁠

### Get Collection by ID
⁠ http
GET /collections/:id
 ⁠

*Response:*
⁠ json
{
  "id": "uuid",
  "name": "My Collection",
  "user_id": "uuid",
  "description": "Collection description",
  "visibility": "private",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
 ⁠

### Create Collection
⁠ http
POST /collections
 ⁠

*Body:*
⁠ json
{
  "name": "My New Collection",
  "user_id": "uuid",
  "description": "Optional description",
  "visibility": "private"
}
 ⁠

*Visibility options:* ⁠ private ⁠, ⁠ unlisted ⁠, ⁠ public ⁠ (default: ⁠ private ⁠)

### Update Collection
⁠ http
PUT /collections/:id
 ⁠

*Requires:* JWT authentication

*Body:*
⁠ json
{
  "name": "Updated Collection Name",
  "description": "Updated description",
  "visibility": "public"
}
 ⁠

### Delete Collection
⁠ http
DELETE /collections/:id
 ⁠

*Requires:* JWT authentication

*Response:*
⁠ json
{
  "message": "Collection deleted successfully"
}
 ⁠

---

## Items

### Get Items by Collection
⁠ http
GET /collections/:id/items
 ⁠

*Response:*
⁠ json
[
  {
    "id": "uuid",
    "document_id": "uuid",
    "collection_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
 ⁠

### Add Item to Collection
⁠ http
POST /collections/:id/items
 ⁠

*Body:*
⁠ json
{
  "document_id": "uuid"
}
 ⁠

### Delete Item from Collection
⁠ http
DELETE /collections/:id/items/:itemId
 ⁠

*Response:*
⁠ json
{
  "message": "Item deleted successfully"
}
 ⁠

---

## Documents

### Get All Documents
⁠ http
GET /documents
 ⁠

*Query Parameters:*
•⁠  ⁠⁠ limit ⁠ (optional, default: 25, max: 100)
•⁠  ⁠⁠ offset ⁠ (optional, default: 0)
•⁠  ⁠⁠ folder_id ⁠ (optional, UUID)

*Example:*

GET /documents?limit=50&offset=0&folder_id=uuid


*Response:*
⁠ json
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
 ⁠

### Get Document by ID
⁠ http
GET /documents/:id
 ⁠

*Response:*
⁠ json
{
  "id": "uuid",
  "title": "Document Title",
  "storage_path": "/path/to/document",
  "nessie_id": "nessie_identifier",
  "folder_id": "uuid",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
 ⁠

---

## Folders

### Get All Folders
⁠ http
GET /folders
 ⁠

*Query Parameters:*
•⁠  ⁠⁠ limit ⁠ (optional, default: 25, max: 100)
•⁠  ⁠⁠ offset ⁠ (optional, default: 0)
•⁠  ⁠⁠ parent_id ⁠ (optional, UUID)

*Example:*

GET /folders?limit=50&offset=0&parent_id=uuid


*Response:*
⁠ json
[
  {
    "id": "uuid",
    "name": "Folder Name",
    "parent_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
 ⁠

### Get Folder by ID
⁠ http
GET /folders/:id
 ⁠

*Response:*
⁠ json
{
  "id": "uuid",
  "name": "Folder Name",
  "parent_id": "uuid",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
 ⁠

---

## Comments

### Get All Comments
⁠ http
GET /comments
 ⁠

*Query Parameters:*
•⁠  ⁠⁠ limit ⁠ (optional, default: 25, max: 100)
•⁠  ⁠⁠ offset ⁠ (optional, default: 0)
•⁠  ⁠⁠ documentId ⁠ (optional, UUID)

*Example:*

GET /comments?limit=50&offset=0&documentId=uuid


*Response:*
⁠ json
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
 ⁠

### Create Comment
⁠ http
POST /comments
 ⁠

*Body:*
⁠ json
{
  "user_id": "uuid",
  "parent_comment_id": "uuid",
  "document_id": "uuid",
  "content": "This is my comment",
  "start_offset": 0,
  "end_offset": 100
}
 ⁠

*Notes:*
•⁠  ⁠⁠ parent_comment_id ⁠ is optional (for replies)
•⁠  ⁠⁠ document_id ⁠ is optional
•⁠  ⁠⁠ start_offset ⁠ must be less than ⁠ end_offset ⁠
•⁠  ⁠Default offsets are 0 if not provided

### Update Comment
⁠ http
PUT /comments/:id
 ⁠

*Body:*
⁠ json
{
  "content": "Updated comment text",
  "start_offset": 10,
  "end_offset": 150
}
 ⁠

### Delete Comment
⁠ http
DELETE /comments/:id
 ⁠

*Response:*
⁠ json
{
  "message": "Comment deleted successfully"
}
 ⁠

---

## Reactions

### Get All Reactions
⁠ http
GET /reactions
 ⁠

*Query Parameters:*
•⁠  ⁠⁠ limit ⁠ (optional, default: 25, max: 100)
•⁠  ⁠⁠ offset ⁠ (optional, default: 0)
•⁠  ⁠⁠ commentId ⁠ (optional, UUID)

*Example:*

GET /reactions?limit=50&offset=0&commentId=uuid


*Response:*
⁠ json
[
  {
    "id": "uuid",
    "comment_id": "uuid",
    "user_id": "uuid",
    "reaction_type": "like",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
 ⁠

### Create Reaction
⁠ http
POST /reactions
 ⁠

*Body:*
⁠ json
{
  "comment_id": "uuid",
  "user_id": "uuid",
  "reaction_type": "like"
}
 ⁠

*Reaction types:* ⁠ like ⁠, ⁠ love ⁠, ⁠ insight ⁠, ⁠ question ⁠, ⁠ flag ⁠

### Update Reaction
⁠ http
PUT /reactions/:id
 ⁠

*Body:*
⁠ json
{
  "reaction_type": "love"
}
 ⁠

### Delete Reaction
⁠ http
DELETE /reactions/:id
 ⁠

*Response:*
⁠ json
{
  "message": "Reaction deleted successfully"
}
 ⁠

---

## Error Responses

All endpoints may return error responses in the following format:

⁠ json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
 ⁠

Common status codes:
•⁠  ⁠⁠ 400 ⁠ - Bad Request (validation errors)
•⁠  ⁠⁠ 401 ⁠ - Unauthorized (missing/invalid JWT)
•⁠  ⁠⁠ 404 ⁠ - Not Found
•⁠  ⁠⁠ 500 ⁠ - Internal Server Error

---

## Testing with cURL

### Example: Create a User
⁠ bash
curl -X POST http://localhost:8000/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
 ⁠

### Example: Get All Collections (with auth)
⁠ bash
curl -X GET http://localhost:8000/v1/collections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
 ⁠

### Example: Create a Comment
⁠ bash
curl -X POST http://localhost:8000/v1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-here",
    "document_id": "uuid-here",
    "content": "Great document!",
    "start_offset": 0,
    "end_offset": 50
  }'
 ⁠