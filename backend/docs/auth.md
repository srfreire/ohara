# Authentication

## Overview
Ohara uses a **multi-layered authentication system** with three methods:

| Method | Use Case | Validation |
|--------|----------|------------|
| Google OAuth 2.0 | User login | Passport + Google API |
| JWT + Redis Sessions | Session management | Cookie + Redis lookup |
| API Keys | Admin/server-to-server | Header check |

## Architecture

```
src/modules/auth/
├── auth.module.ts           # Module config, exports
├── auth.service.ts          # Core auth logic
├── controllers/
│   └── auth.controller.ts   # Auth endpoints
├── services/
│   └── session.service.ts   # Redis session management
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── api-key.guard.ts
│   ├── api-key-or-jwt.guard.ts
│   └── google-auth.guard.ts
└── strategies/
    ├── jwt.strategy.ts
    └── google.strategy.ts
```

## Endpoints

| Endpoint | Guard | Description |
|----------|-------|-------------|
| `GET /v2/auth/login` | GoogleAuthGuard | Redirects to Google OAuth |
| `GET /v2/auth/callback` | GoogleAuthGuard | OAuth callback, sets cookie |
| `GET /v2/auth/refresh` | JwtAuthGuard | Rotates session + token |
| `GET /v2/auth/logout` | JwtAuthGuard | Deletes current session |
| `GET /v2/auth/logout-all` | JwtAuthGuard | Deletes all user sessions |

### Other Module Endpoints

**Users:**
- `GET /v2/users` - `ApiKeyOrJwtGuard` (admin access to list all users)
- `GET /v2/users/:id` - `JwtAuthGuard` (users can only view their own profile)
- `POST /v2/users` - `ApiKeyGuard` (admin only)
- `PUT /v2/users/:id` - `ApiKeyOrJwtGuard` (own or admin)
- `DELETE /v2/users/:id` - `ApiKeyOrJwtGuard` (own or admin)

**Comments & Reactions:**
- All endpoints use `JwtAuthGuard`
- `PUT` and `DELETE` validate ownership (users can only modify their own)

## JWT Token

- **Storage**: HttpOnly cookie (`access_token`)
- **Algorithm**: HS256
- **Payload**: `{ id, email, session_id }`
- **Expiration**: 7 days (JWT) / 2 hours (cookie maxAge)

**Cookie Flags**:
```typescript
{
  httpOnly: true,      // XSS protection
  secure: true,        // HTTPS only (production)
  sameSite: 'strict',  // CSRF protection
  maxAge: 7200000,     // 2 hours
  path: '/',
}
```

**Extraction**: HttpOnly cookie `access_token`

## Redis Sessions

Sessions are stored in Redis for **immediate revocation** capability.

**Session Data**:
```typescript
{
  user_id: string,
  email: string,
  created_at: number,
}
```

**Redis Keys**:

1. **`session:{session_id}`** (String)
   - Stores the session data as JSON
   - TTL: 2 hours (auto-expires)
   - Used for: Validating sessions on each request
   - Example: `session:550e8400-e29b-41d4-a716-446655440000`

2. **`user_sessions:{user_id}`** (Set)
   - Redis Set containing all `session_id` values for a user
   - No TTL (managed manually)
   - Used for: `logout-all` functionality to find all user sessions
   - Example: `user_sessions:123e4567-e89b-12d3-a456-426614174000`
   - Contains: `["session-id-1", "session-id-2", "session-id-3"]`

**How logout-all works**:
1. Get all session IDs from `user_sessions:{user_id}` set
2. Delete each `session:{session_id}` key
3. Delete the `user_sessions:{user_id}` set itself

**Session Lifecycle**:
1. **Create**: On login/refresh → UUID generated, stored with TTL, added to user's session set
2. **Validate**: Every request → JwtStrategy checks Redis for `session:{session_id}`
3. **Delete**: On logout → Remove from `user_sessions:{user_id}` set, delete `session:{session_id}`
4. **Delete All**: On logout-all → Get all IDs from set, delete all sessions, delete set


## Guards

### JwtAuthGuard
Validates JWT and session. Used on protected routes.

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
async protected(@Req() req) {
  // req.user = { id, email, session_id }
}
```

**Validation Flow**:
1. Extract JWT from cookie
2. Verify signature with JWT_SECRET
3. Validate `session_id` exists in Redis
4. Verify session belongs to user
5. Attach user to request

### ApiKeyGuard
Validates `x-api-key` header against `ADMIN_API_KEY`.

```typescript
@UseGuards(ApiKeyGuard)
@Post('admin-only')
async adminOnly() { ... }
```

### ApiKeyOrJwtGuard
Accepts either API key OR JWT. Useful for hybrid access.

```typescript
@UseGuards(ApiKeyOrJwtGuard)
@Get('flexible')
async flexible(@Req() req) {
  if (req.user.is_admin) { /* API key */ }
  else { /* JWT user */ }
}
```

### GoogleAuthGuard
Handles OAuth flow. Only used on login/callback.

## Authentication Flows

### Login Flow
```
User → GET /v2/auth/login
  → GoogleAuthGuard redirects to Google
  → User approves
  → Google → GET /v2/auth/callback
  → GoogleStrategy extracts profile
  → AuthService:
      → Find/create user in Supabase
      → Store OAuth tokens
      → Create session in Redis:
          → Generate UUID session_id
          → Store in session:{session_id} (TTL: 2h)
          → Add session_id to user_sessions:{user_id} set
      → Sign JWT with session_id
  → Set JWT in HttpOnly cookie
  → Redirect to frontend with user info
```

### Request Flow
```
Browser → Protected endpoint
  → Cookie sent automatically
  → JwtAuthGuard:
      → Extract JWT from cookie
      → Verify signature
      → Validate session in Redis
      → Attach user to request
  → Controller executes
```

### Logout Flow
```
User → GET /v2/auth/logout
  → JwtAuthGuard validates current session
  → AuthService.logout(session_id)
      → Delete from Redis
  → Clear cookie (maxAge: 0)
  → Token immediately invalid
```

### Token Refresh Flow
```
User → GET /v2/auth/refresh
  → JwtAuthGuard validates current session
  → AuthService.refresh_token():
      → Delete old session (from both keys)
      → Create new session (new UUID, same user)
      → Sign new JWT
  → Set new cookie
  → Old token invalidated
```

## API Keys

For admin/server-to-server access:
- **Header**: `x-api-key: <ADMIN_API_KEY>`
- **Bypasses**: JWT validation, ownership checks
- **Use**: Internal services, admin scripts

## Security Summary

| Feature | Protection |
|---------|------------|
| HttpOnly cookie | XSS - JS can't read token |
| Secure flag | Network - HTTPS only |
| SameSite: strict | CSRF - No cross-site cookies |
| Redis sessions | Revocation - Immediate logout |
| Session validation | Replay - Stolen tokens invalidated |
| 2-hour session TTL | Expiry - Abandoned sessions cleaned |

## Environment Variables

```bash
JWT_SECRET=<strong-secret>
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-client-secret>
GOOGLE_CALLBACK_URL=<backend-url>/v2/auth/callback
ADMIN_API_KEY=<admin-key>
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
```

## Frontend Integration

**Axios Config**:
```typescript
axios.defaults.withCredentials = true;
```

**Fetch Config**:
```typescript
fetch(url, { credentials: 'include' });
```

**Auth Check**: Verify user info in localStorage (token inaccessible due to HttpOnly).

## Module Exports

AuthModule exports for use by other modules:
- `AuthService` - Auth operations
- `SessionService` - Session management
- `JwtModule` - Token signing/verification
