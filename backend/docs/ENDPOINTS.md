# Ohara API v2.0 - Endpoint Documentation

## API Version: 2.0.0

**Base URL:** `http://localhost:3000/v2`  
**Production:** `https://api.ohara.osix.tech/v2`

## Breaking Changes from v1

- All endpoints now prefixed with `/v2/`
- **Cursor-based pagination only** (offset pagination removed)
- **Standardized response format** for all endpoints
- All responses include `X-API-Version: 2.0` header
- Query parameter `offset` removed from all list endpoints

---

## Standard Response Format

### Success Response (Single Resource)
```json
{
  "success": true,
  "data": { /* resource object */ }
}
```

### Success Response (List with Pagination)
```json
{
  "success": true,
  "data": [ /* array of resources */ ],
  "pagination": {
    "next_cursor": "base64_encoded_cursor_or_null",
    "has_more": true,
    "limit": 25
  }
}
```

### Success Response (DELETE/UPDATE operations)
```json
{
  "success": true,
  "data": null,
  "message": "Resource deleted successfully"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2025-11-08T12:00:00.000Z"
}
```

---

## Authentication

All endpoints except `/v2/auth/login` and `/v2/auth/callback` require authentication via:
- **JWT Token:** `Authorization: Bearer <token>`
- **API Key:** `x-api-key: <api_key>` (admin only)

### Endpoints

#### `GET /v2/auth/login`
Initiate Google OAuth login flow

**Response:** 302 Redirect to Google OAuth

---

#### `GET /v2/auth/callback`
Google OAuth callback handler

**Response:** 302 Redirect to frontend with tokens

---

#### `GET /v2/auth/refresh`
Refresh JWT token

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token"
  }
}
```

---

## Users

### `GET /v2/users`
List all users with cursor pagination

**Query Parameters:**
- `limit` (optional): 1-100, default 25
- `cursor` (optional): Base64 cursor for pagination
- `sort_by` (optional): `created_at` | `email` | `name`, default `created_at`
- `order` (optional): `asc` | `desc`, default `desc`

**Response:** Paginated list of users

---

### `GET /v2/users/:id`
Get user by ID

**Response:** Single user object

---

### `POST /v2/users`
Create new user

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://..."
}
```

**Response:** Created user object

---

### `PUT /v2/users/:id`
Full update user (requires ownership or admin)

**Body:** User update object

**Response:** Updated user object

---

### `PATCH /v2/users/:id`
Partial update user (JSON Patch RFC 6902)

**Body:**
```json
[
  { "op": "replace", "path": "/name", "value": "New Name" }
]
```

**Response:** Updated user object

---

### `DELETE /v2/users/:id`
Delete user (requires ownership or admin)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

---

## Collections

### `GET /v2/collections`
List collections (user's own + public/unlisted)

**Query Parameters:**
- `limit`, `cursor`, `sort_by`, `order` (same as users)
- `user_id` (optional): Filter by user UUID

**Response:** Paginated list of collections

---

### `GET /v2/collections/:id`
Get collection by ID (respects visibility)

**Response:** Single collection object

---

### `POST /v2/collections`
Create collection

**Body:**
```json
{
  "name": "My Collection",
  "user_id": "uuid",
  "description": "Optional description",
  "visibility": "private" | "unlisted" | "public"
}
```

---

### `PUT /v2/collections/:id`
Update collection (requires ownership)

---

### `PATCH /v2/collections/:id`
Partial update (JSON Patch)

---

### `DELETE /v2/collections/:id`
Delete collection (requires ownership)

---

## Documents

### `GET /v2/documents`
List documents with advanced filtering

**Query Parameters:**
- `limit`, `cursor`, `sort_by`, `order`
- `folder_id` (optional): Filter by folder
- `search` (optional): Search by title
- `created_after` (optional): ISO 8601 datetime
- `created_before` (optional): ISO 8601 datetime

**Response:** Paginated list of documents

---

### `GET /v2/documents/:id`
Get document by ID

---

### `GET /v2/documents/:id/url`
Get signed URL for PDF access

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://signed-url...",
    "expires_in": 3600
  }
}
```

---

## Folders

### `GET /v2/folders`
List folders with hierarchy support

**Query Parameters:**
- `limit`, `cursor`, `sort_by`, `order`
- `parent_id` (optional): Filter by parent folder

---

### `GET /v2/folders/:id`
Get folder by ID

---

### `POST /v2/folders`
Create folder

---

### `PUT /v2/folders/:id`
Update folder

---

### `DELETE /v2/folders/:id`
Delete folder

---

## Comments

### `GET /v2/comments`
List comments with filtering

**Query Parameters:**
- `limit`, `cursor`, `sort_by`, `order`
- `documentId` (optional): Filter by document
- `user_id` (optional): Filter by user
- `parent_comment_id` (optional): Get replies

**Response:** Paginated list of comments

---

### `POST /v2/comments`
Create comment (supports threading and text annotations)

**Body:**
```json
{
  "user_id": "uuid",
  "document_id": "uuid",
  "content": "Comment text",
  "start_offset": 0,
  "end_offset": 10,
  "parent_comment_id": "uuid (optional)"
}
```

---

### `PUT /v2/comments/:id`
Update comment

---

### `PATCH /v2/comments/:id`
Partial update (JSON Patch)

---

### `DELETE /v2/comments/:id`
Delete comment

---

## Reactions

### `GET /v2/reactions`
List reactions

**Query Parameters:**
- `limit`, `cursor`, `sort_by`, `order`
- `commentId` (optional): Filter by comment
- `reaction_type` (optional): `like` | `love` | `insight` | `question` | `flag`
- `user_id` (optional): Filter by user

---

### `POST /v2/reactions`
Create reaction

**Body:**
```json
{
  "comment_id": "uuid",
  "user_id": "uuid",
  "reaction_type": "like"
}
```

---

### `PUT /v2/reactions/:id`
Update reaction type

---

### `DELETE /v2/reactions/:id`
Delete reaction

---

## Items (Collection Items)

### `GET /v2/collections/:id/items`
List items in a collection

**Query Parameters:**
- `limit`, `cursor`, `order`

---

### `POST /v2/collections/:id/items`
Add document to collection

**Body:**
```json
{
  "document_id": "uuid"
}
```

---

### `DELETE /v2/collections/:id/items/:itemId`
Remove item from collection

---

## Agent (AI Chat)

### `POST /v2/agent/stream`
Stream AI chat responses (Server-Sent Events)

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello", "timestamp": "..." }
  ],
  "model": "gpt-4.1",
  "document_id": "uuid (optional)"
}
```

**Response:** `text/event-stream` (SSE)

**Note:** This endpoint does NOT use standard response wrapping due to streaming nature.

---

## Pagination Guide

### Cursor-Based Pagination

All list endpoints support cursor pagination:

1. **First request:** Omit `cursor` parameter
2. **Subsequent requests:** Use `next_cursor` from previous response
3. **Check `has_more`:** Continue until `has_more: false`

**Example:**
```
GET /v2/users?limit=25
GET /v2/users?limit=25&cursor=eyJ0aW1lc3RhbXAiOi...
GET /v2/users?limit=25&cursor=eyJ0aW1lc3RhbXAiOi...
```

---

## Response Headers

All responses include:
- `X-API-Version: 2.0`
- `Content-Type: application/json` (except SSE)

---

## Architecture

- **Framework:** NestJS 10.3.0
- **Language:** TypeScript 5.3.3
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Google OAuth 2.0 + JWT
- **Validation:** Zod schemas
- **Documentation:** Swagger/OpenAPI at `/api/docs`

---

## Interactive Documentation

**Swagger UI:** `http://localhost:3000/api/docs`

- Live API explorer
- Authentication testing
- Request/response examples
- Schema documentation

---

## Migration from v1

If migrating from v1, update:
1. Change all endpoints from `/v1/` to `/v2/`
2. Remove `offset` query parameter
3. Update response parsing to handle standard envelope
4. Implement cursor-based pagination loop
5. Check for `X-API-Version: 2.0` header

---

**Last Updated:** 2025-11-08  
**API Version:** 2.0.0  
**Status:** ✅ Production Ready
