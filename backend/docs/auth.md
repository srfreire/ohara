# Authentication

## Overview
Ohara uses a **multi-layered authentication system** with three methods:

### 1. Google OAuth 2.0 (Primary)
- Users log in via Google accounts
- **Endpoint**: `GET /v2/auth/login` - Redirects to Google OAuth consent
- **Callback**: `GET /v2/auth/callback` - Handles OAuth response
- JWT set in **HttpOnly cookie** named `access_token`
- User info (id, email, name, avatar) passed via URL query params
- Frontend extracts user info only (token is in secure cookie)

### 2. JWT Tokens (Session Management)
- **Storage**: HttpOnly cookie (`access_token`)
- **Algorithm**: HS256 (HMAC-SHA256)
- **Expiration**: 2 hours
- **Payload**: `{ id: string, email: string }`
- **Cookie Flags**:
  - `httpOnly: true` - JavaScript cannot access (XSS protection)
  - `secure: true` - HTTPS only in production
  - `sameSite: 'strict'` - Maximum CSRF protection (cookies never sent on cross-site requests)
  - `maxAge: 7200000` - 2 hours in milliseconds
- **Refresh**: `GET /v2/auth/refresh` - Issues new token in cookie
- **Backward Compatible**: Also accepts `Authorization: Bearer <token>` header

### 3. API Keys (Admin/Server-to-Server)
- **Header**: `x-api-key: <admin_api_key>`
- Full admin privileges
- Bypasses ownership checks

## Guards
- **JwtAuthGuard**: Validates JWT (cookie → header fallback)
- **ApiKeyGuard**: Validates API keys
- **ApiKeyOrJwtGuard**: Accepts either method
- **GoogleAuthGuard**: Handles OAuth flow

## Authentication Flow
```
1. User clicks "Login with Google"
2. Frontend → GET /v2/auth/login
3. Backend redirects to Google OAuth consent
4. User approves
5. Google → Backend callback with auth code
6. Backend exchanges code for tokens
7. Backend creates/updates user in database
8. Backend generates JWT
9. Backend sets JWT in HttpOnly cookie
10. Backend redirects to frontend with user info in URL
11. Frontend extracts user info, stores in localStorage
12. Browser auto-sends cookie with all API requests
```

## Security Features
✅ **HttpOnly Cookie**: JavaScript cannot access token (XSS protection)
✅ **Secure Flag**: HTTPS-only transmission in production
✅ **SameSite: strict**: Maximum CSRF protection (no cross-site cookie sending)
✅ **No Token in URL**: Prevents history/log leaks
✅ **Auto-sent by Browser**: No manual token management needed
✅ **2-hour Expiration**: Limited window for token misuse

### SameSite: strict Implications
- Cookies are **never sent** on cross-site requests (links from external sites)
- User must navigate directly to your domain for cookies to be sent
- **Note**: OAuth callback from Google is same-site after initial redirect
- Stronger CSRF protection than 'lax' mode

## CORS Configuration
- **Origin**: `FRONTEND_URL` environment variable
- **Credentials**: Enabled (`credentials: true`)
- Required for cookies to work cross-origin

## Frontend Requirements
- **Axios**: `withCredentials: true` in config
- **Fetch**: `credentials: 'include'` in requests
- **Storage**: Only store user info in localStorage (not token)
- **Auth Check**: Verify user info exists (token check impossible due to HttpOnly)
