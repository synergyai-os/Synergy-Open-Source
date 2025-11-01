# Axon Architecture & Tech Stack

## Overview

Axon is a full-stack application built with modern web technologies, designed for both web and mobile platforms. The architecture follows a hybrid authentication model with server-side validation and client-side state management.

## Tech Stack

### Frontend
- **Framework**: SvelteKit 5 (with TypeScript)
- **UI Components**: Bits UI (headless components) + Tailwind CSS 4
- **Mobile**: Capacitor 7 (iOS support configured)
- **State Management**: Convex Svelte (reactive queries/mutations)
- **Build Tool**: Vite 7

### Backend
- **Database & Backend**: Convex (serverless, real-time database)
- **Authentication**: Convex Auth (JWT-based)
- **Email Service**: Resend

### Development Tools
- **Testing**: Vitest (unit tests) + Playwright (E2E tests)
- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript

## Authentication Architecture

### 🔐 Authentication Model: **Hybrid (Server-Side Validated)**

Axon uses a **hybrid authentication approach** that combines:
- **Server-side validation** (primary security layer)
- **Client-side state management** (UX layer)

### Authentication Flow

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   Mobile)   │
└──────┬──────┘
       │
       │ 1. User submits credentials
       ▼
┌─────────────────────────────────┐
│  SvelteKit Client              │
│  - useAuth() hook              │
│  - signIn('password', {...})  │
└──────────────┬──────────────────┘
               │
               │ 2. POST /api/auth
               ▼
┌─────────────────────────────────┐
│  hooks.server.ts                │
│  - handleAuth middleware        │
│  - Validates request            │
└──────────────┬──────────────────┘
               │
               │ 3. Forwards to Convex
               ▼
┌─────────────────────────────────┐
│  Convex Backend                 │
│  - auth.addHttpRoutes()         │
│  - Password provider validates  │
│  - Creates JWT token            │
└──────────────┬──────────────────┘
               │
               │ 4. Returns JWT token
               ▼
┌─────────────────────────────────┐
│  SvelteKit Server               │
│  - Stores token in HTTP-only    │
│    cookie (secure)              │
│  - Returns auth state           │
└──────────────┬──────────────────┘
               │
               │ 5. Auth state available
               ▼
┌─────────────────────────────────┐
│  Client Components              │
│  - useAuth().isAuthenticated    │
│  - Real-time auth state         │
└─────────────────────────────────┘
```

### Security Layers

1. **Server-Side Validation (Primary)**
   - All authentication requests are validated server-side
   - JWT tokens stored in HTTP-only cookies (prevent XSS)
   - Token validation happens in `hooks.server.ts` middleware
   - Convex backend validates all authenticated requests

2. **Client-Side State (UX)**
   - `useAuth()` hook provides reactive auth state
   - Used for UI rendering (show/hide buttons, conditional routes)
   - **Never trusted for authorization decisions**
   - Always validated server-side before accessing protected resources

### Key Files

#### Authentication Setup

**`convex/auth.ts`** - Backend authentication configuration
```typescript
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password], // Email/password auth
});
```

**`convex/http.ts`** - HTTP routes for authentication
```typescript
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http); // Adds /api/auth/* routes
export default http;
```

**`src/hooks.server.ts`** - SvelteKit server hooks
```typescript
import { sequence } from '@sveltejs/kit/hooks';
import { createConvexAuthHooks } from '@mmailaender/convex-auth-svelte/sveltekit/server';

const { handleAuth } = createConvexAuthHooks();
export const handle = sequence(handleAuth);
```
- Handles all POST requests to `/api/auth`
- Manages JWT token storage in secure cookies
- Validates authentication state on every request

**`src/routes/+layout.server.ts`** - Load auth state
```typescript
import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';

const { getAuthState } = createConvexAuthHandlers();

export const load: LayoutServerLoad = async (event) => {
  return { authState: await getAuthState(event) };
};
```
- Loads authentication state on every page load
- Available to all pages via `data.authState`

**`src/routes/+layout.svelte`** - Client-side auth setup
```typescript
import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

setupConvexAuth({ getServerState: () => data.authState });
```
- Initializes Convex client with auth state
- Makes `useAuth()` hook available throughout the app

## Implementing Authentication Across Pages

### Client-Side: Display Auth State

Use the `useAuth()` hook in any Svelte component:

```typescript
<script lang="ts">
  import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

  const auth = useAuth();
  const isAuthenticated = $derived(auth.isAuthenticated);
  const isLoading = $derived(auth.isLoading);
  const { signIn, signOut } = auth;
</script>

{#if isLoading}
  <p>Loading...</p>
{:else if isAuthenticated}
  <p>You are signed in!</p>
  <button onclick={() => signOut()}>Sign Out</button>
{:else}
  <p>Please sign in</p>
  <a href="/login">Login</a>
{/if}
```

### Server-Side: Protect Routes

#### Option 1: Global Route Protection (Recommended for Production)

Protect routes in `src/hooks.server.ts`:

```typescript
import { sequence, redirect } from '@sveltejs/kit/hooks';
import {
  createConvexAuthHooks,
  createRouteMatcher
} from '@mmailaender/convex-auth-svelte/sveltekit/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/register',
  '/about',
  // Note: '/api/auth' is automatically handled
]);

const { handleAuth, isAuthenticated } = createConvexAuthHooks();

const requireAuth: Handle = async ({ event, resolve }) => {
  // Allow public routes
  if (isPublicRoute(event.url.pathname)) {
    return resolve(event);
  }

  // Check authentication for protected routes
  if (!(await isAuthenticated(event))) {
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
  }

  return resolve(event);
};

export const handle = sequence(handleAuth, requireAuth);
```

#### Option 2: Page-Level Protection

Protect individual pages in `+page.server.ts`:

```typescript
// src/routes/dashboard/+page.server.ts
import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const { isAuthenticated } = createConvexAuthHandlers();

export const load: PageServerLoad = async (event) => {
  if (!(await isAuthenticated(event))) {
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
  }
  
  // Return page data for authenticated users
  return { user: { /* user data */ } };
};
```

### Convex Functions: Validate Authentication

Always validate authentication in Convex queries and mutations:

```typescript
// convex/users.ts
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Example: Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Client is not authenticated");
    }
    
    // Return user data
    const user = await ctx.db.get(userId);
    return user;
  }
});

// Example: Update user profile
export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Client is not authenticated");
    }
    
    // Update only the authenticated user's data
    await ctx.db.patch(userId, { name });
  }
});
```

### Server-Side Data Fetching with Auth

Use authenticated Convex client in `+page.server.ts`:

```typescript
// src/routes/profile/+page.server.ts
import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { api } from '$convex/_generated/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { createConvexHttpClient } = createConvexAuthHandlers();
  
  // Create authenticated HTTP client
  const client = await createConvexHttpClient(event);
  
  // Make authenticated query
  const user = await client.query(api.users.getCurrentUser, {});
  
  return { user };
};
```

## Security Best Practices

### ✅ Current Implementation (Secure)

1. **JWT tokens stored in HTTP-only cookies** - Prevents XSS attacks
2. **Server-side validation on every request** - Auth state checked in hooks
3. **Convex backend validates all authenticated requests** - Use `getAuthUserId()` in functions
4. **Password provider handles hashing** - Passwords never stored in plain text

### ⚠️ Recommended Enhancements for Production

1. **Add Route Protection**
   - Implement global route protection in `hooks.server.ts`
   - Use `createRouteMatcher` to define public/protected routes

2. **Validate in Convex Functions**
   - Always use `getAuthUserId()` in queries/mutations
   - Never trust client-side auth state for authorization

3. **Add Rate Limiting**
   - Protect login/register endpoints from brute force
   - Consider adding rate limiting middleware

4. **HTTPS Only (Production)**
   - Ensure all cookies are Secure (HTTPS only)
   - Set SameSite cookie attributes

5. **Session Management**
   - Consider adding session timeout
   - Implement refresh token rotation if needed

## Project Structure

```
Axon/
├── convex/              # Convex backend
│   ├── auth.ts          # Authentication configuration
│   ├── http.ts          # HTTP routes (includes auth routes)
│   ├── schema.ts        # Database schema (includes auth tables)
│   └── ...              # Other backend functions
├── src/
│   ├── hooks.server.ts           # SvelteKit server hooks (auth middleware)
│   ├── routes/
│   │   ├── +layout.server.ts     # Load auth state for all pages
│   │   ├── +layout.svelte        # Setup auth client-side
│   │   ├── +page.svelte          # Homepage
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   └── lib/             # Shared utilities
├── ios/                 # Capacitor iOS project
└── dev-docs/            # Documentation
```

## Environment Variables

### Frontend (.env.local)
```env
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Backend (set via `npx convex env set`)
```bash
# Convex Auth (auto-configured by npx @convex-dev/auth)
SITE_URL=http://localhost:5173
JWT_PRIVATE_KEY=<auto-generated>
JWKS=<auto-generated>

# Optional: Email service
RESEND_API_KEY=your-resend-api-key
```

## Development Workflow

### Running Locally

1. **Start Convex backend:**
   ```bash
   npx convex dev
   ```

2. **Start SvelteKit dev server:**
   ```bash
   npm run dev
   ```

3. **Test on iOS (with live reload):**
   ```bash
   npm run dev              # Terminal 1: Start dev server
   npm run build            # Terminal 2: Build for mobile
   npx cap sync ios         # Terminal 2: Sync to iOS
   # Then click Play in Xcode
   ```

### Authentication Testing

1. **Register a new user:**
   - Navigate to `/register`
   - Fill in name, email, password (min 8 chars)
   - Submit form

2. **Login:**
   - Navigate to `/login`
   - Enter email and password
   - Submit form

3. **Check auth state:**
   - Homepage shows auth status
   - Protected routes should redirect if not authenticated

## Mobile (Capacitor) Considerations

- Authentication works identically on iOS
- JWT tokens are stored in secure cookies (handled by Capacitor WebView)
- Live reload configured for development (`http://192.168.68.110:5173`)
- Production builds use static files from `www/` directory

## Production Deployment Checklist

- [ ] Add route protection middleware in `hooks.server.ts`
- [ ] Validate auth in all Convex queries/mutations using `getAuthUserId()`
- [ ] Set production `SITE_URL` environment variable
- [ ] Ensure HTTPS is enabled (required for secure cookies)
- [ ] Configure CORS if needed
- [ ] Add rate limiting for auth endpoints
- [ ] Test authentication flow end-to-end
- [ ] Verify mobile app authentication works

## Additional Resources

- [Convex Auth Documentation](https://docs.convex.dev/auth/convex-auth)
- [SvelteKit Authentication Guide](https://github.com/mmailaender/convex-auth-svelte)
- [Capacitor Documentation](https://capacitorjs.com/docs)

