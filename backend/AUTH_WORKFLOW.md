# Authentication Workflow - Ohara API

This document explains the complete authentication and authorization workflow in the Ohara backend API.

## Table of Contents
- [Overview](#overview)
- [Authentication Methods](#authentication-methods)
- [Google OAuth 2.0 Flow](#google-oauth-20-flow)
- [JWT Token Management](#jwt-token-management)
- [API Key Authentication](#api-key-authentication)
- [Guards and Security](#guards-and-security)
- [Database Schema](#database-schema)
- [Examples](#examples)

---

## Overview

Ohara implements a **multi-layered authentication system** with three distinct methods:

1. **Google OAuth 2.0** - Primary user authentication via Google accounts
2. **JWT Tokens** - Session management after OAuth authentication
3. **API Keys** - Server-to-server and admin authentication

### Key Components

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Auth Controller│◄────►│  Auth Service    │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│   Strategies    │      │  Users Service   │
│ - Google OAuth  │      │                  │
│ - JWT           │      │  Supabase Client │
└─────────────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│     Guards      │
│ - JwtAuthGuard  │
│ - ApiKeyGuard   │
│ - Hybrid        │
└─────────────────┘
```

---

## Authentication Methods

### 1. Google OAuth 2.0 (Primary)
- **Purpose**: Initial user authentication
- **Flow**: Redirect-based OAuth 2.0
- **Scope**: `email`, `profile`
- **Token Storage**: Access & refresh tokens stored in `user_auth_tokens` table

### 2. JWT Tokens
- **Purpose**: API session management
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 2 hours (configurable via `JWT_EXPIRES_IN`)
- **Payload**: `{ id: string, email: string }`
- **Header**: `Authorization: Bearer <jwt_token>`

### 3. API Keys
- **Purpose**: Server-to-server communication, admin access
- **Header**: `x-api-key: <admin_api_key>`
- **Privileges**: Full admin access (bypasses ownership checks)

---

## Google OAuth 2.0 Flow

### Step-by-Step Process

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Google
    participant Supabase

    User->>Frontend: Click "Login with Google"
    Frontend->>Backend: GET /v1/auth/login
    Backend->>Google: Redirect to OAuth consent
    Google->>User: Show consent screen
    User->>Google: Approve permissions
    Google->>Backend: Callback with auth code
    Backend->>Google: Exchange code for tokens
    Google->>Backend: Return access_token & refresh_token
    Backend->>Supabase: Check if user exists
    alt New User
        Backend->>Supabase: Create user record
        Backend->>Supabase: Store OAuth tokens
    else Existing User
        Backend->>Supabase: Update OAuth tokens
    end
    Backend->>Backend: Generate JWT
    Backend->>Frontend: Redirect with JWT & user data
    Frontend->>User: Logged in successfully
```

### 1. Initiate Login (`GET /v1/auth/login`)

**Controller**: `auth.controller.ts`
```typescript
@Get('login')
@UseGuards(GoogleAuthGuard)
async login() {
  // Triggers GoogleAuthGuard which redirects to Google OAuth
}
```

**What happens**:
- `GoogleAuthGuard` intercepts the request
- User is redirected to Google OAuth consent screen
- Google callback URL: `http://localhost:8000/v1/auth/callback`

---

### 2. Google Strategy Validation

**File**: `strategies/google.strategy.ts`

```typescript
async validate(
  access_token: string,
  refresh_token: string,
  profile: any,
  done: VerifyCallback,
): Promise<any> {
  const { id, emails, displayName, photos } = profile;
  
  const user = {
    source_user_id: id,              // Google user ID
    email: emails[0].value,          // user@gmail.com
    name: displayName,               // "John Doe"
    avatar_url: photos[0]?.value,    // Profile picture URL
    access_token,                    // Google access token
    refresh_token,                   // Google refresh token
  };
  
  done(null, user);
}
```

**OAuth Configuration**:
- **Client ID**: `GOOGLE_CLIENT_ID` (from `.env`)
- **Client Secret**: `GOOGLE_CLIENT_SECRET`
- **Callback URL**: `GOOGLE_CALLBACK_URL`
- **Scopes**: `['email', 'profile']`

---

### 3. OAuth Callback Handler (`GET /v1/auth/callback`)

**Controller**: `auth.controller.ts`
```typescript
@Get('callback')
@UseGuards(GoogleAuthGuard)
async callback(@Req() req: any, @Res() res: Response) {
  const result = await this.auth_service.handle_google_callback(req.user);
  
  // Redirect to frontend with tokens
  const redirect_url = `${frontend_url}/?access_token=${result.access_token}&id=${result.user.id}&email=${result.user.email}&name=${result.user.name}&avatar_url=${result.user.avatar_url}`;
  
  return res.redirect(redirect_url);
}
```

**Service**: `auth.service.ts`
```typescript
async handle_google_callback(google_user: any) {
  // 1. Check if user exists
  let user = await this.users_service.find_by_email(google_user.email);
  
  if (!user) {
    // 2a. Create new user
    user = await this.users_service.create({
      email: google_user.email,
      name: google_user.name,
      avatar_url: google_user.avatar_url,
    });
    
    // 2b. Store Google OAuth tokens
    await this.supabase.from('user_auth_tokens').insert({
      user_id: user.id,
      source: 'google',
      source_user_id: google_user.source_user_id,
      access_token: google_user.access_token,
      refresh_token: google_user.refresh_token,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } else {
    // 3. Update existing user's tokens
    await this.supabase.from('user_auth_tokens')
      .upsert({
        user_id: user.id,
        source: 'google',
        source_user_id: google_user.source_user_id,
        access_token: google_user.access_token,
        refresh_token: google_user.refresh_token,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      })
      .eq('user_id', user.id)
      .eq('source', 'google');
  }
  
  // 4. Generate JWT token
  const payload = { id: user.id, email: user.email };
  const jwt_token = this.jwt_service.sign(payload);
  
  return {
    access_token: jwt_token,
    user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url }
  };
}
```

**Result**: User is redirected to frontend with:
- `access_token` - JWT for API requests
- `id` - User UUID
- `email` - User email
- `name` - Display name
- `avatar_url` - Profile picture URL

---

## JWT Token Management

### Token Structure

**Payload**:
```json
{
  "id": "f0abc07a-6781-4490-a35a-94c68dc95157",
  "email": "user@example.com",
  "iat": 1709640000,
  "exp": 1709647200
}
```

**Configuration**:
- **Secret**: `JWT_SECRET` (from `.env`)
- **Expiration**: `JWT_EXPIRES_IN` (default: `2h`)
- **Algorithm**: HS256

---

### JWT Strategy

**File**: `strategies/jwt.strategy.ts`

```typescript
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config_service: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config_service.get<string>('JWT_SECRET'),
    });
  }
  
  async validate(payload: any) {
    if (!payload.id || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    
    return { id: payload.id, email: payload.email };
  }
}
```

**How it works**:
1. Extracts JWT from `Authorization: Bearer <token>` header
2. Verifies signature using `JWT_SECRET`
3. Checks expiration
4. Validates payload structure
5. Attaches `{ id, email }` to `request.user`

---

### Token Refresh (`GET /v1/auth/refresh`)

**Purpose**: Generate a new JWT before the current one expires

**Endpoint**:
```http
GET /v1/auth/refresh
Authorization: Bearer <current_jwt_token>
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Service Logic**:
```typescript
async refresh_token(user_id: string, email: string) {
  const payload = { id: user_id, email };
  const jwt_token = this.jwt_service.sign(payload);
  
  return { access_token: jwt_token };
}
```

**Note**: The refresh endpoint requires a valid (non-expired) JWT. For true refresh token rotation, implement a separate refresh token mechanism.

---

## API Key Authentication

### Purpose
- **Server-to-server** communication
- **Admin operations** (bypassing user-specific authorization)
- **Automated scripts** and background jobs

### Configuration
**Environment Variable**: `ADMIN_API_KEY` (from `.env`)

**Example**: `ohara_admin_secret_key_2025`

### Usage

**HTTP Header**:
```http
GET /v1/users
x-api-key: ohara_admin_secret_key_2025
```

**Guard Implementation**: `guards/api-key.guard.ts`

```typescript
canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  const api_key = request.headers['x-api-key'];
  const valid_api_key = this.config_service.get<string>('ADMIN_API_KEY');
  
  if (!api_key || api_key !== valid_api_key) {
    throw new UnauthorizedException('Invalid or missing API key');
  }
  
  return true;
}
```

### API Key Privileges
When using API key authentication:
- `request.user = { is_admin: true }`
- Bypasses ownership checks (e.g., can update any user's data)
- Full read/write access to all resources

---

## Guards and Security

### Available Guards

| Guard | Authentication | Use Case | Location |
|-------|---------------|----------|----------|
| `JwtAuthGuard` | JWT only | User-specific endpoints | `guards/jwt-auth.guard.ts` |
| `ApiKeyGuard` | API key only | Admin-only endpoints | `guards/api-key.guard.ts` |
| `ApiKeyOrJwtGuard` | JWT **OR** API key | Flexible access (users or admins) | `guards/api-key-or-jwt.guard.ts` |
| `GoogleAuthGuard` | Google OAuth | OAuth flow initiation | `guards/google-auth.guard.ts` |

---

### Guard: `JwtAuthGuard`

**Usage**:
```typescript
@Get('comments')
@UseGuards(JwtAuthGuard)
async find_all() {
  // Only authenticated users with valid JWT
}
```

**Behavior**:
- Requires `Authorization: Bearer <jwt>` header
- Rejects requests without valid JWT
- Attaches `{ id, email }` to `request.user`

---

### Guard: `ApiKeyOrJwtGuard` (Hybrid)

**File**: `guards/api-key-or-jwt.guard.ts`

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  
  // 1. Check for API key first
  const api_key = request.headers['x-api-key'];
  const valid_api_key = this.config_service.get<string>('ADMIN_API_KEY');
  
  if (api_key && api_key === valid_api_key) {
    request.user = { is_admin: true };
    return true;
  }
  
  // 2. Check for JWT token
  const auth_header = request.headers.authorization;
  if (auth_header && auth_header.startsWith('Bearer ')) {
    const token = auth_header.substring(7);
    
    try {
      const payload = await this.jwt_service.verifyAsync(token, {
        secret: this.config_service.get<string>('JWT_SECRET'),
      });
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }
  
  throw new UnauthorizedException(
    'Missing authentication: provide either x-api-key or Bearer token',
  );
}
```

**Usage**:
```typescript
@Get('users')
@UseGuards(ApiKeyOrJwtGuard)
async find_all() {
  // Accepts both JWT (users) and API key (admins)
}
```

**Endpoints using this guard**:
- `GET /v1/users` - User management
- `GET /v1/documents` - Document access
- `GET /v1/folders` - Folder hierarchy

---

### Authorization Logic (Ownership Checks)

Example from `users.controller.ts`:

```typescript
@Patch(':id')
@UseGuards(ApiKeyOrJwtGuard)
async patch(@Param('id') id: string, @Body() patch_operations: UserPatchArray, @Req() req: any) {
  // Allow if admin (API key) or if user is updating themselves
  if (!req.user.is_admin && req.user.id !== id) {
    throw new ForbiddenException('You can only update your own account');
  }
  
  return this.users_service.patch(id, patch_operations);
}
```

**Logic**:
1. If `req.user.is_admin === true` (API key), allow access
2. If `req.user.id === id` (user owns the resource), allow access
3. Otherwise, throw `403 Forbidden`

---

## Database Schema

### Users Table (`users`)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### OAuth Tokens Table (`user_auth_tokens`)

```sql
CREATE TABLE user_auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,              -- 'google'
  source_user_id TEXT NOT NULL,      -- Google user ID
  access_token TEXT NOT NULL,        -- Google access token
  refresh_token TEXT,                -- Google refresh token
  expires_at TIMESTAMPTZ,            -- Token expiration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, source)
);
```

**Purpose**:
- Store Google OAuth tokens for future API calls to Google services
- Allows token refresh without re-authentication
- One record per user per OAuth provider

---

## Examples

### Example 1: User Login Flow

**Step 1**: Frontend redirects to backend
```javascript
window.location.href = 'http://localhost:3000/v1/auth/login';
```

**Step 2**: User authenticates with Google
- Google consent screen appears
- User approves permissions

**Step 3**: Backend redirects back to frontend
```
http://localhost:5173/?access_token=eyJhbG...&id=f0abc07a-6781-4490-a35a-94c68dc95157&email=user@gmail.com&name=John%20Doe&avatar_url=https://...
```

**Step 4**: Frontend stores JWT and makes API requests
```javascript
const access_token = new URLSearchParams(window.location.search).get('access_token');
localStorage.setItem('access_token', access_token);

// Make authenticated requests
fetch('http://localhost:3000/v1/documents', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

---

### Example 2: API Request with JWT

```http
GET /v1/comments?documentId=e0e4ace4-e76c-46aa-9e83-2ac4014c9b57&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYwYWJjMDdhLTY3ODEtNDQ5MC1hMzVhLTk0YzY4ZGM5NTE1NyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwOTY0MDAwMCwiZXhwIjoxNzA5NjQ3MjAwfQ.xxx
```

**Backend Processing**:
1. `JwtAuthGuard` intercepts request
2. Extracts and verifies JWT
3. Attaches `{ id: "f0abc07a...", email: "user@example.com" }` to `request.user`
4. Controller accesses user data via `@Req() req: any` → `req.user`

---

### Example 3: Admin API Request with API Key

```http
GET /v1/users
x-api-key: ohara_admin_secret_key_2025
```

**Backend Processing**:
1. `ApiKeyOrJwtGuard` checks `x-api-key` header first
2. Validates against `ADMIN_API_KEY` environment variable
3. Sets `request.user = { is_admin: true }`
4. Grants full access (bypasses ownership checks)

---

### Example 4: Token Refresh

```http
GET /v1/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYwYWJjMDdhLTY3ODEtNDQ5MC1hMzVhLTk0YzY4ZGM5NTE1NyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwOTY0NzIwMCwiZXhwIjoxNzA5NjU0NDAwfQ.yyy"
}
```

**Frontend updates token**:
```javascript
const response = await fetch('http://localhost:3000/v1/auth/refresh', {
  headers: { 'Authorization': `Bearer ${old_token}` }
});
const { access_token } = await response.json();
localStorage.setItem('access_token', access_token);
```

---

## Security Best Practices

### Current Implementation
✅ JWT tokens have expiration (2 hours)  
✅ Google OAuth tokens stored securely in database  
✅ API key validated on every request  
✅ Ownership checks prevent unauthorized access  
✅ Password strategy avoids storing passwords  
✅ HTTPS enforced in production (via environment config)  

### Recommendations for Production

1. **Environment Variables**
   - Store `JWT_SECRET`, `ADMIN_API_KEY`, and OAuth credentials securely
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault)
   - Rotate keys periodically

2. **Token Security**
   - Implement refresh token rotation
   - Use shorter JWT expiration (15-30 minutes)
   - Implement token revocation (blacklist)

3. **API Key Security**
   - Rotate admin API keys regularly
   - Use multiple API keys with different scopes
   - Log all API key usage for auditing

4. **OAuth Security**
   - Validate OAuth state parameter (CSRF protection)
   - Use PKCE (Proof Key for Code Exchange) for mobile apps
   - Implement OAuth token refresh before expiration

5. **HTTPS**
   - Enforce HTTPS in production
   - Use HSTS headers
   - Implement certificate pinning for mobile apps

6. **Rate Limiting**
   - Implement rate limiting on auth endpoints
   - Use exponential backoff for failed login attempts
   - Monitor for brute force attacks

---

## Troubleshooting

### Issue: "Unauthorized" on valid JWT

**Possible Causes**:
- JWT expired (check `exp` claim)
- Wrong `JWT_SECRET` on server
- Malformed `Authorization` header (must be `Bearer <token>`)

**Solution**:
```bash
# Decode JWT to check expiration
node -e "console.log(JSON.parse(Buffer.from('PASTE_PAYLOAD_HERE', 'base64').toString()))"

# Refresh token
curl -H "Authorization: Bearer <old_token>" http://localhost:3000/v1/auth/refresh
```

---

### Issue: "Invalid or missing API key"

**Possible Causes**:
- Wrong header name (must be `x-api-key`)
- API key doesn't match `ADMIN_API_KEY` in `.env`

**Solution**:
```bash
# Check environment variable
echo $ADMIN_API_KEY

# Test with curl
curl -H "x-api-key: ohara_admin_secret_key_2025" http://localhost:3000/v1/users
```

---

### Issue: "403 Forbidden - Can only update own account"

**Cause**: User trying to modify another user's resource

**Solution**:
- Use API key for admin access
- Or ensure JWT user ID matches resource owner ID

---

## Summary

| Aspect | Details |
|--------|---------|
| **Primary Auth** | Google OAuth 2.0 |
| **Session Management** | JWT (2 hour expiration) |
| **Admin Access** | API Key (`x-api-key` header) |
| **Token Storage** | LocalStorage (frontend), Supabase (OAuth tokens) |
| **Guards** | `JwtAuthGuard`, `ApiKeyGuard`, `ApiKeyOrJwtGuard` |
| **Authorization** | Ownership checks + admin bypass |
| **Security** | HS256 JWT, HTTPS, token expiration |

---

## Related Files

```
backend/src/modules/auth/
├── auth.module.ts                  # Auth module configuration
├── auth.service.ts                 # OAuth & JWT logic
├── controllers/
│   └── auth.controller.ts          # Login, callback, refresh endpoints
├── strategies/
│   ├── google.strategy.ts          # Google OAuth strategy
│   └── jwt.strategy.ts             # JWT validation strategy
└── guards/
    ├── google-auth.guard.ts        # OAuth guard
    ├── jwt-auth.guard.ts           # JWT guard
    ├── api-key.guard.ts            # API key guard
    └── api-key-or-jwt.guard.ts     # Hybrid guard
```

---

**For more information**:
- Swagger Documentation: `http://localhost:3000/api/docs`
- Project README: `backend/README.md`
- Environment Setup: `backend/.env.example`
