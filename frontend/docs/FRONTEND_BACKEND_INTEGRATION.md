# Frontend-Backend Integration Documentation

**Version**: 3.0 (Port 3000, JWT-only, SSE-enabled)
**Last Updated**: 2025-10-01
**Status**: ✅ Complete and Ready for Testing

---

## Overview

This document describes the complete frontend-backend integration for the Ohara application, including authentication, API communication, real-time chat streaming, and data synchronization.

## Architecture Summary

- **Base URL**: `http://localhost:3000`
- **Authentication**: JWT Bearer tokens only (no API keys)
- **Token Storage**: localStorage
- **Real-time Features**: Server-Sent Events (SSE) for chat streaming
- **Proxy**: Vite dev server with endpoint-specific proxies

---

## Authentication Flow

### 1. Google OAuth Login

**Flow:**
```
User clicks "Continue with Google"
  ↓
Frontend redirects to: /auth/google
  ↓
Backend handles OAuth with Google
  ↓
Backend redirects back to: /?access_token=xxx&email=...&name=...&id=...
  ↓
Frontend extracts token and user data from URL params
  ↓
Store in localStorage: access_token, user
  ↓
Redirect to /dashboard
```

**Implementation**: `src/components/auth/LoginPage.jsx:19-44`

**Code:**
```javascript
useEffect(() => {
  const url_params = new URLSearchParams(window.location.search)
  const access_token = url_params.get('access_token')
  const user_email = url_params.get('email')
  const user_name = url_params.get('name')
  const user_id = url_params.get('id')

  if (access_token) {
    localStorage.setItem('access_token', access_token)
    const user_data = { id: user_id, email: user_email, name: user_name }
    login(user_data)
    navigate('/dashboard')
  }
}, [login, navigate])
```

### 2. JWT Token Management

**Storage**: localStorage (keys: `access_token`, `user`)

**API Client Configuration**: `src/api/client.js:14-27`

```javascript
const get_jwt_token = () => {
  return localStorage.getItem('access_token')
}

api_client.interceptors.request.use(
  (config) => {
    const token = get_jwt_token()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

### 3. Session Expiration Handling

**Implementation**: `src/api/client.js:29-51`

```javascript
api_client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.')
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }
    return Promise.reject(error)
  }
)
```

---

## API Endpoints

All endpoints use JWT Bearer authentication via `Authorization: Bearer <token>` header.

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow

### Users
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Folders
- `GET /folders` - List folders (query: `parent_id`, `limit`, `offset`)
- `POST /folders` - Create folder
- `GET /folders/:id` - Get folder by ID
- `PATCH /folders/:id` - Update folder
- `DELETE /folders/:id` - Delete folder

### Documents
- `GET /documents` - List documents (query: `folder_id`, `limit`, `offset`)
- `POST /documents` - Create document
- `GET /documents/:id` - Get document by ID
- `PATCH /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

### Collections
- `GET /collections` - List user collections
- `POST /collections` - Create collection
- `GET /collections/:id` - Get collection by ID
- `POST /collections/:id/documents` - Add document to collection
- `DELETE /collections/:id/documents/:doc_id` - Remove document

### Comments
- `GET /comments` - List comments (query: `document_id`)
- `POST /comments` - Create comment
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Reactions
- `GET /reactions` - List reactions (query: `target_type`, `target_id`)
- `POST /reactions` - Add reaction
- `DELETE /reactions/:id` - Remove reaction

### Agent (Chat)
- `POST /agent/stream` - Stream chat messages via SSE

---

## Server-Sent Events (SSE) Chat Streaming

### Implementation

**Service**: `src/api/agent.js`

**Usage Example**:
```javascript
import { stream_chat } from '../../api/agent'

const abort_fn = stream_chat(messages, {
  model: 'gpt-4.1',
  on_token: (token) => {
    // Called for each token received
    console.log('Token:', token)
  },
  on_done: () => {
    // Called when stream completes
    console.log('Stream finished')
  },
  on_error: (error) => {
    // Called on error
    console.error('Stream error:', error)
  }
})

// To cancel the stream:
abort_fn()
```

### Request Format

```json
POST /agent/stream
Content-Type: application/json
Authorization: Bearer <token>

{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "model": "gpt-4.1"
}
```

### Response Format (SSE)

```
data: {"type": "token", "content": "Hello"}

data: {"type": "token", "content": "!"}

data: {"type": "done"}
```

### Implementation Details

**Key Components**:
1. **Fetch API** with ReadableStream (not Axios - better streaming support)
2. **TextDecoder** for chunk decoding
3. **AbortController** for cancellation
4. **Line-by-line parsing** for SSE format

**Code**: `src/api/agent.js:17-120`

```javascript
const response = await fetch(`${API_BASE_URL}/agent/stream`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`,
  },
  body: JSON.stringify({ messages, model }),
  signal: controller.signal,
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value, { stream: true })
  const lines = chunk.split('\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6).trim())
      if (data.type === 'token') {
        on_token(data.content)
      } else if (data.type === 'done') {
        on_done()
        return
      }
    }
  }
}
```

### Chat Component Integration

**Component**: `src/components/chat/ChatAgent.jsx:24-120`

**Features**:
- Token-by-token rendering
- Typing indicator
- Message history
- Abort on unmount
- Error handling with fallback messages

---

## Data Structures

### Folder Object
```javascript
{
  id: 'folder-uuid',
  name: 'My Folder',
  user_id: 'user-uuid',
  parent_id: 'parent-folder-uuid', // or null for root
  path: '/My Folder',
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z'
}
```

### Document Object
```javascript
{
  id: 'doc-uuid',
  title: 'My Document',
  name: 'document.pdf',
  file_type: 'pdf',
  size: 1024000,
  user_id: 'user-uuid',
  folder_id: 'folder-uuid', // optional
  content: 'Document content...',
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z'
}
```

### Chat Message Object
```javascript
{
  id: 'msg-uuid',
  role: 'user', // or 'assistant'
  type: 'user', // legacy field, same as role
  content: 'Message text',
  timestamp: '2024-01-15T10:30:00.000Z'
}
```

---

## Vite Proxy Configuration

**File**: `vite.config.js:7-49`

```javascript
server: {
  proxy: {
    '/auth': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/agent': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/users': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/collections': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/documents': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/folders': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/comments': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/reactions': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  }
}
```

**Why Multiple Proxies?**
- Each endpoint is explicitly proxied to port 3000
- `changeOrigin: true` handles CORS
- `secure: false` allows self-signed certificates in dev

---

## Loading States and UX

### Components Created

1. **LoadingSpinner** (`src/components/ui/LoadingSpinner.jsx`)
   - Sizes: sm, md, lg
   - Usage: Inline loading indicators

2. **FileListSkeleton** (`src/components/ui/FileListSkeleton.jsx`)
   - List view loading state
   - Configurable count

3. **FileGridSkeleton** (`src/components/ui/FileGridSkeleton.jsx`)
   - Grid view loading state
   - Configurable count

4. **PageLoader** (`src/components/ui/PageLoader.jsx`)
   - Full-page loading screen
   - Used during authentication checks

### Toast Notifications

**Library**: react-hot-toast
**Configuration**: `src/utils/toast.js`

**Usage**:
```javascript
import { toast_success, toast_error, toast_info } from '../utils/toast'

toast_success('Document uploaded successfully!')
toast_error('Failed to delete folder')
toast_info('Processing your request...')
```

**Features**:
- Auto-dismiss after 4 seconds
- Top-right positioning
- Dark mode support
- Custom styling with Tailwind classes

---

## Graceful Degradation

### Mock Data Fallback

**Location**: `src/utils/mock-data.js`

**Strategy**: FileExplorer checks if API data exists and falls back to mock data

**Implementation**: `src/components/dashboard/FileExplorer.jsx:28`

```javascript
const use_mock_data = !folders || folders.length === 0

const get_root_folders_data = () => {
  if (use_mock_data) return get_root_folders()
  return folders.filter(folder => !folder.parent_id)
}
```

**Benefits**:
- Frontend works without backend for UI development
- Seamless transition to real API when available
- No UI breaking changes

---

## Testing the Integration

### Prerequisites

1. **Backend running** on port 3000
2. **Frontend dev server** running (`npm run dev`)
3. **Google OAuth configured** in backend

### Test Steps

#### 1. Authentication Flow
```bash
# Start frontend
cd frontend
npm run dev

# Visit http://localhost:5173
# Click "Continue with Google"
# Verify OAuth flow
# Check localStorage for access_token
```

#### 2. API Calls
```javascript
// Open browser console on /dashboard
localStorage.getItem('access_token') // Should return token

// Network tab should show:
// - GET /folders
// - GET /documents
// - Authorization: Bearer <token> headers
```

#### 3. Chat Streaming
```javascript
// In ChatAgent component
// Type a message and send
// Network tab should show:
// - POST /agent/stream
// - EventStream type
// - Streaming response chunks

// Console should log:
// "Streaming token: Hello"
// "Streaming token: !"
```

#### 4. Error Handling
```bash
# Test 401 handling:
localStorage.setItem('access_token', 'invalid_token')
# Reload page, make API call
# Should see "Session expired" toast
# Should redirect to login
```

### Common Issues

**Issue**: CORS errors
**Fix**: Ensure backend has CORS configured for `http://localhost:5173`

**Issue**: 401 errors
**Fix**: Check JWT token is valid and not expired

**Issue**: SSE not streaming
**Fix**: Verify backend sends correct SSE format: `data: <json>\n\n`

**Issue**: Proxy not working
**Fix**: Restart Vite dev server after changing `vite.config.js`

---

## File Reference

### Core Files Modified/Created

| File | Purpose | Status |
|------|---------|--------|
| `.env` | Base URL configuration | ✅ Updated |
| `vite.config.js` | Proxy configuration | ✅ Updated |
| `src/api/client.js` | HTTP client with JWT | ✅ Updated |
| `src/api/auth.js` | Authentication service | ✅ Updated |
| `src/api/agent.js` | SSE streaming service | ✅ Created |
| `src/api/documents.js` | Documents CRUD | ✅ Created |
| `src/api/folders.js` | Folders CRUD | ✅ Created |
| `src/api/collections.js` | Collections CRUD | ✅ Created |
| `src/contexts/auth-context.jsx` | Auth state management | ✅ Updated |
| `src/components/auth/LoginPage.jsx` | OAuth callback handling | ✅ Updated |
| `src/components/auth/ProtectedRoute.jsx` | Route protection | ✅ Created |
| `src/components/chat/ChatAgent.jsx` | Real-time chat UI | ✅ Updated |
| `src/components/dashboard/Dashboard.jsx` | Main app container | ✅ Updated |
| `src/components/dashboard/FileExplorer.jsx` | File/folder browser | ✅ Updated |
| `src/components/dashboard/FileViewer.jsx` | Document viewer | ✅ Updated |
| `src/components/layout/Header.jsx` | Navigation with logout | ✅ Updated |
| `src/components/ui/LoadingSpinner.jsx` | Loading indicator | ✅ Created |
| `src/components/ui/FileListSkeleton.jsx` | List loading state | ✅ Created |
| `src/components/ui/FileGridSkeleton.jsx` | Grid loading state | ✅ Created |
| `src/components/ui/PageLoader.jsx` | Full page loader | ✅ Created |
| `src/utils/toast.js` | Toast configuration | ✅ Created |
| `src/utils/mock-data.js` | Fallback data | ✅ Updated |
| `src/App.jsx` | Root component | ✅ Updated |
| `package.json` | Dependencies | ✅ Updated |

---

## Migration Notes

### From Previous Versions

**v1.0 (Port 8000, /api/v1 path)**
- Base URL: `http://localhost:8000/api/v1`
- Single `/api` proxy

**v2.0 (Port 8000, /v1 path, Dual Auth)**
- Base URL: `http://localhost:8000/v1`
- JWT + API Key authentication
- Single `/v1` proxy

**v3.0 (Current - Port 3000, JWT only, SSE)**
- Base URL: `http://localhost:3000`
- JWT Bearer only (removed API Key)
- localStorage for token storage
- Multiple endpoint-specific proxies
- SSE chat streaming
- Updated data structures

---

## Security Considerations

### Current Implementation

✅ **Good:**
- JWT Bearer tokens for authentication
- Token stored in localStorage (not cookies)
- Automatic token injection via interceptor
- Session expiration handling
- HTTPS-ready (production)

⚠️ **Considerations:**

1. **XSS Vulnerability**: localStorage is vulnerable to XSS attacks
   - **Mitigation**: Ensure no user-generated content is rendered unsafely
   - **Future**: Consider httpOnly cookies for production

2. **Token Expiration**: No automatic refresh mechanism
   - **Current**: User must re-login on expiration
   - **Future**: Implement refresh token flow

3. **CORS**: Dev server uses proxy
   - **Production**: Backend must whitelist frontend domain

---

## Production Checklist

- [ ] Update `VITE_API_BASE_URL` to production API URL
- [ ] Enable HTTPS
- [ ] Configure CORS on backend
- [ ] Consider httpOnly cookies for tokens
- [ ] Implement token refresh mechanism
- [ ] Add error tracking (Sentry, etc.)
- [ ] Add analytics
- [ ] Test OAuth callback with production domain
- [ ] Minify and bundle with `npm run build`
- [ ] Test SSE streaming under production load

---

## Support

**Issues**: Report to development team
**Documentation**: Keep this file updated with changes
**Last Verified**: 2025-10-01

---

**End of Documentation**
