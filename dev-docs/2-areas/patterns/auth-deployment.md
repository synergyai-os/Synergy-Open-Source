# Authentication & Deployment Patterns

> **Production-Ready Strategy**: Environment-aware configuration, proper session management, and clean auth flows.

---

## #L10: PUBLIC_ Environment Variables Need Actual Values [🔴 CRITICAL]

**Symptom**: Build succeeds but runtime shows `op://...` strings in client-side code, auth fails with "Invalid client ID"  
**Root Cause**: Vite bakes `PUBLIC_*` variables into client-side JavaScript at build time. It reads `.env` literally and doesn't execute `op run`.  
**Fix**:

```bash
# ❌ WRONG: 1Password references in .env for PUBLIC_ variables
# .env
PUBLIC_WORKOS_CLIENT_ID=op://SYOS/WorkOS-Production/client-id  # ❌ Baked as literal string

# ✅ CORRECT: Actual values in .env.local for PUBLIC_ variables
# .env.local (not committed to git)
PUBLIC_WORKOS_CLIENT_ID=client_01K9KZHJAB3NETZ1Z9MANRBGXQ  # ✅ Actual value
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
PUBLIC_POSTHOG_KEY=phc_your_actual_key

# Server-side variables can still use 1Password references
WORKOS_API_KEY=op://SYOS/WorkOS-Production/api-key  # ✅ OK for server
```

**Why**: `PUBLIC_*` variables are replaced at build time by Vite's string replacement. The `op run` command only injects environment variables at runtime, but by then Vite has already replaced `PUBLIC_*` with literal strings from `.env`.

**Apply when**: 
- Using any `PUBLIC_*` environment variables with 1Password
- Setting up new projects with secrets management
- Deploying to Vercel/production (use Vercel UI for actual values)

**Related**: #L60 (Staging vs Production credentials)

---

## #L60: Separate Staging and Production Credentials [🟡 IMPORTANT]

**Symptom**: Production deployment fails with "Invalid redirect URI" or auth errors  
**Root Cause**: Using staging credentials in production environment, or vice versa  
**Fix**:

```bash
# ❌ WRONG: Same credentials for all environments
# .env.local (local dev)
WORKOS_CLIENT_ID=client_01K9STAGING123  # ❌ Staging ID
WORKOS_REDIRECT_URI=https://myapp.com/auth/callback  # ❌ Production URL

# ✅ CORRECT: Environment-specific credentials
# .env.local (local dev - use Staging)
WORKOS_CLIENT_ID=client_01K9STAGING123
WORKOS_API_KEY=sk_staging_abc123
WORKOS_REDIRECT_URI=http://127.0.0.1:5173/auth/callback

# Vercel Environment Variables (production - use Production)
WORKOS_CLIENT_ID=client_01K9PROD456
WORKOS_API_KEY=sk_prod_xyz789
WORKOS_REDIRECT_URI=https://myapp.com/auth/callback
```

**WorkOS Dashboard Setup**:
- **Staging Environment**: Configure `http://127.0.0.1:5173/auth/callback`
- **Production Environment**: Configure `https://myapp.com/auth/callback`
- Each environment has different Client ID and API Key

**Why**: Auth providers like WorkOS maintain separate environments with different credentials and allowed redirect URIs. Mixing them causes security errors.

**Apply when**:
- Setting up authentication
- Deploying to production
- Configuring CI/CD pipelines

**Related**: #L10 (PUBLIC_ environment variables), #L110 (Redirect URI matching)

---

## #L110: Match All Domain Variations in Redirect URIs [🟡 IMPORTANT]

**Symptom**: Auth works on `myapp.com` but fails on `www.myapp.com` with "Invalid redirect URI"  
**Root Cause**: Your app redirects to `www.` version, but only non-www is configured in auth provider  
**Fix**:

```typescript
// In WorkOS Dashboard → Redirects, add BOTH:
https://myapp.com/auth/callback        ✅
https://www.myapp.com/auth/callback    ✅

// Also configure DNS/CDN to redirect one to the other (recommended):
// Vercel/Cloudflare: www.myapp.com → myapp.com (canonical)
```

**Debug Steps**:
1. Open DevTools → Network tab
2. Click login button
3. Find redirect to auth provider (e.g., `api.workos.com`)
4. Check `redirect_uri` parameter in URL
5. Add that exact URL to auth provider's allowed redirects

**Why**: Auth providers validate redirect URIs exactly. Even `www.` vs non-`www.` is a different origin.

**Apply when**:
- Setting up OAuth/OIDC authentication
- Domain configuration changes
- Getting "Invalid redirect URI" errors

**Related**: #L60 (Staging vs Production)

---

## #L160: Cookie Deletion Must Match Creation Attributes [🔴 CRITICAL]

**Symptom**: Logout appears to work (redirects) but user is still logged in, cookies persist  
**Root Cause**: Cookie deletion fails when attributes don't exactly match creation  
**Fix**:

```typescript
// ❌ WRONG: Mismatched attributes
// Setting cookie
cookies.set('session', token, {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
});

// Deleting cookie (missing attributes!)
cookies.delete('session', { path: '/' });  // ❌ Doesn't delete! Attributes don't match

// ✅ CORRECT: Exact same attributes
const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
};

// Setting
cookies.set('session', token, cookieOptions);

// Deleting (reuse same options)
cookies.delete('session', cookieOptions);  // ✅ Deletes successfully
```

**Why**: Browsers use all cookie attributes (path, domain, httpOnly, secure, sameSite) as part of the cookie's identity. Mismatched attributes mean you're trying to delete a different cookie.

**Apply when**:
- Implementing logout functionality
- Managing session cookies
- Debugging "sticky" cookies

**Related**: #L210 (Session revocation)

---

## #L210: Revoke Sessions on Auth Provider [🟡 IMPORTANT]

**Symptom**: Local cookies cleared but user auto-logs back in when clicking login  
**Root Cause**: Auth provider still has active session, local logout only clears local state  
**Fix**:

```typescript
// ❌ WRONG: Only clear local cookies
export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete('wos-session', cookieOptions);
  cookies.delete('wos-user', cookieOptions);
  throw redirect(302, '/');  // ❌ WorkOS session still active!
};

// ✅ CORRECT: Clear local + revoke provider session
export const GET: RequestHandler = async ({ cookies, url }) => {
  const sessionToken = cookies.get('wos-session');
  
  // Clear local cookies
  cookies.delete('wos-session', cookieOptions);
  cookies.delete('wos-user', cookieOptions);
  
  // Revoke session on WorkOS
  if (sessionToken) {
    const payload = JSON.parse(Buffer.from(sessionToken.split('.')[1], 'base64').toString());
    const sessionId = payload.sid;
    
    const workosLogoutUrl = new URL('https://api.workos.com/user_management/sessions/logout');
    workosLogoutUrl.searchParams.set('session_id', sessionId);
    workosLogoutUrl.searchParams.set('return_to', `${url.origin}/`);
    
    throw redirect(302, workosLogoutUrl.toString());  // ✅ Ends WorkOS session
  }
  
  throw redirect(302, '/');
};
```

**Why**: OAuth/OIDC providers maintain their own sessions. Clearing local cookies only removes local state - the provider's session remains active and will auto-login on next attempt.

**Apply when**:
- Implementing logout with OAuth/OIDC
- Using WorkOS, Auth0, Clerk, or similar
- Need true "sign out" (not just local clear)

**Related**: #L160 (Cookie deletion)

---

## #L260: Check All Imports After Deleting Files [🔴 CRITICAL]

**Symptom**: Build succeeds locally but fails in CI/Vercel with "Could not load [deleted-file]"  
**Root Cause**: Files importing from deleted module, missed during refactoring  
**Fix**:

```bash
# ❌ WRONG: Delete file, assume build will catch it
rm src/lib/server/auth.ts  # ❌ What imports this?

# ✅ CORRECT: Search for imports before deleting
# 1. Search for all imports
grep -r "from.*lib/server/auth" src/

# 2. Review each import
# src/routes/admin/+page.server.ts:2:import { createClient } from '$lib/server/auth';
# src/routes/api/data/+server.ts:5:import { validateUser } from '$lib/server/auth';

# 3. Update or remove imports
# 4. THEN delete the file
rm src/lib/server/auth.ts

# 5. Verify build succeeds
npm run build
```

**Automated Check**:
```bash
# Add to pre-commit hook or CI
# Check for unresolved imports
npm run build 2>&1 | grep "Could not resolve"
if [ $? -eq 0 ]; then
  echo "❌ Build failed: Unresolved imports"
  exit 1
fi
```

**Why**: TypeScript/ESLint may not catch all import errors during development (especially in rarely-visited routes). Production builds fail loudly.

**Apply when**:
- Deleting shared utilities or server files
- Refactoring authentication/auth files
- Removing deprecated modules

**Common Missed Imports**:
- Server routes (`+page.server.ts`, `+server.ts`)
- Rarely-visited routes (admin, docs, etc.)
- Dynamic routes with parameters
- Build-time utilities

**Related**: #L60 (Environment setup)

---

## #L310: Lock Dev Server Port for Consistency [🟢 REFERENCE]

**Symptom**: Dev server starts on random ports (5173, 5174, 5175), breaking auth redirects  
**Root Cause**: Vite's `strictPort: false` tries next available port when default is busy  
**Fix**:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '127.0.0.1',  // Use 127.0.0.1 not localhost (WorkOS compatibility)
    port: 5173,
    strictPort: true,   // ✅ Fail if port busy (forces cleanup)
    fs: {
      allow: ['..']
    }
  }
});
```

**Why**: Auth providers require exact redirect URIs. If your app runs on `http://127.0.0.1:5175` but you configured `http://127.0.0.1:5173/auth/callback`, auth fails.

**Apply when**:
- Setting up OAuth/OIDC development
- Multiple dev servers on same machine
- Consistent local testing

**Related**: #L110 (Redirect URIs)

---

**Last Updated**: 2025-11-09  
**Pattern Count**: 7  
**Validated**: WorkOS AuthKit, SvelteKit, Vite  
**Format Version**: 2.0

