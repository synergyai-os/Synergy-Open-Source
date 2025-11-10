# Authentication & Deployment Patterns

> **Production-Ready Strategy**: Environment-aware configuration, proper session management, and clean auth flows.

---

## #L10: PUBLIC_ Environment Variables Need Actual Values [🔴 CRITICAL]

**Symptom**: Build succeeds but runtime shows placeholder strings in client-side code, auth fails with "Invalid client ID"  
**Root Cause**: Vite bakes `PUBLIC_*` variables into client-side JavaScript at build time. They need actual values, not references or placeholders.  
**Fix**:

```bash
# ❌ WRONG: Placeholders or references in .env for PUBLIC_ variables
# .env
PUBLIC_WORKOS_CLIENT_ID=<your_client_id_here>  # ❌ Baked as literal string

# ✅ CORRECT: Actual values in .env.local for PUBLIC_ variables
# .env.local (not committed to git)
PUBLIC_WORKOS_CLIENT_ID=client_01K9KZHJAB3NETZ1Z9MANRBGXQ  # ✅ Actual value
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
PUBLIC_POSTHOG_KEY=phc_your_actual_key

# Server-side variables also go in .env.local for simplicity
WORKOS_API_KEY=sk_staging_your_actual_key  # ✅ Actual value
WORKOS_CLIENT_ID=client_01K9KZHJAB3NETZ1Z9MANRBGXQ
WORKOS_COOKIE_PASSWORD=your_32_char_random_string
```

**Why**: `PUBLIC_*` variables are replaced at build time by Vite's string replacement. The `.env.local` file is read during build and provides the actual values. It's automatically ignored by git (via `.gitignore`).

**Apply when**: 
- Using any `PUBLIC_*` environment variables
- Setting up new projects with secrets management
- Deploying to Vercel/production (use Vercel Environment Variables UI for actual values)

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

## #L360: Dual Identity System for Provider Flexibility [🟢 REFERENCE]

**Symptom**: Need to migrate auth providers but all relationships reference provider-specific IDs  
**Root Cause**: Using auth provider ID (e.g., `workosId`) as primary identity for relationships  
**Fix**:

```typescript
// ❌ WRONG: Use provider ID everywhere
users: defineTable({
  workosId: v.string(),  // Primary identity
  email: v.string(),
})

inboxItems: defineTable({
  userId: v.string(),  // ❌ workosId string - locked to WorkOS
})

// ✅ CORRECT: Dual identity system
users: defineTable({
  // Convex ID = permanent identity (all relationships use this)
  _id: "user_123abc",  // ← Use this for all relationships
  
  // Auth provider ID = authentication only
  workosId: v.string(),  // Current: WorkOS
  // Future: Add more providers
  // clerkId: v.optional(v.string()),
  // auth0Id: v.optional(v.string()),
  
  email: v.string(),
})
  .index("by_workos_id", ["workosId"])  // Fast login lookup

inboxItems: defineTable({
  userId: v.id("users"),  // ✅ References Convex _id (permanent)
})
```

**Migration Path**:
```typescript
// Switching from WorkOS to Clerk
1. Add clerkId field to users table
2. User logs in with Clerk → lookup by email
3. Update user record with clerkId
4. Keep workosId for reference
5. All relationships still work (they use userId)
```

**Why**: Auth providers come and go. Your user's identity should be permanent and provider-independent. The Convex `_id` never changes, while provider IDs are just authentication credentials.

**Apply when**:
- Designing auth system from scratch
- Planning for multi-auth provider support
- Long-term product strategy (5+ years)

**Related**: #L410 (Personal workspace pattern)

---

## #L410: Personal Workspace Pattern (Null = Personal) [🟢 REFERENCE]

**Symptom**: Need to distinguish personal content from org/team content in queries  
**Root Cause**: Creating fake "Personal" organizations adds complexity and confusing queries  
**Fix**:

```typescript
// ❌ WRONG: Create fake organization for personal content
// Forces complex queries and unnecessary records
const personalOrg = await ctx.db.insert("organizations", {
  name: "Personal",
  slug: "personal",
  userId: userId,  // One per user!
});

inboxItems.organizationId = personalOrg;  // ❌ Messy

// ✅ CORRECT: null = personal content
inboxItems: defineTable({
  userId: v.id("users"),
  organizationId: v.optional(v.id("organizations")),  // null = personal ✅
  teamId: v.optional(v.id("teams")),
  ownershipType: v.optional(
    v.union(
      v.literal("user"),         // User owns (personal)
      v.literal("organization"), // Org owns
      v.literal("team"),         // Team owns
    )
  ),
})
  .index("by_user", ["userId"])
  .index("by_organization", ["organizationId"])
  .index("by_team", ["teamId"])

// Clean queries
// Get personal content
const personal = await ctx.db
  .query("inboxItems")
  .withIndex("by_user", q => q.eq("userId", userId))
  .filter(q => q.eq(q.field("organizationId"), null))  // ✅ Clear!
  .collect();

// Get team content
const teamContent = await ctx.db
  .query("inboxItems")
  .withIndex("by_team", q => q.eq("teamId", teamId))
  .collect();
```

**Content Ownership Rules**:
| `ownershipType` | `organizationId` | Stays When User Leaves? |
|-----------------|------------------|------------------------|
| `"user"` | `null` | ❌ Moves with user |
| `"organization"` | `"org_123"` | ✅ Stays in org |
| `"team"` | `"org_123"` + `teamId` | ✅ Stays in team |

**Why**: `null` is semantically correct for "no organization" and keeps queries simple. Creating fake organizations pollutes the data model and complicates permission checks.

**Apply when**:
- Designing multi-tenancy from scratch
- Supporting both personal and organization content
- Need clean "my stuff" vs "team stuff" queries

**Related**: #L360 (Dual identity), #L460 (Account linking)

---

## #L460: Account Linking for Multi-Account Support [🟢 REFERENCE]

**Symptom**: Users need to switch between personal and work accounts (Slack-style)  
**Root Cause**: One email = one account, no way to link multiple identities  
**Fix**:

```typescript
// Each email creates separate user record
// randy@personal.com → user_123
// randy@work.com     → user_456

// Link accounts together
accountLinks: defineTable({
  primaryUserId: v.id("users"),     // Main account
  linkedUserId: v.id("users"),      // Linked account
  linkType: v.optional(v.string()), // "work", "personal"
  verifiedAt: v.number(),
  createdAt: v.number(),
})
  .index("by_primary", ["primaryUserId"])
  .index("by_linked", ["linkedUserId"])

// Session structure
{
  "wos-session": "jwt_token",
  "wos-user": {
    "userId": "user_123",  // Active account
    "linkedAccounts": [
      { "userId": "user_456", "email": "randy@work.com" }
    ]
  }
}

// Account switcher UI (CMD+K)
┌─────────────────────────────────────┐
│  ● Randy (Personal)         CMD+1   │  ← Active
│    randy@personal.com               │
│                                     │
│  ○ Randy @ Work             CMD+2   │
│    randy@work.com                   │
└─────────────────────────────────────┘
```

**Linking Flow**:
1. User logged in with account A
2. User tries to login with account B
3. System detects existing session
4. Prompt: "Link account B to account A?"
5. User confirms → create `accountLinks` record
6. Both accounts show in switcher

**Switching**:
- Update `activeAccountId` in session cookie
- No new WorkOS authentication needed
- Instant context switch

**Why**: Users often have multiple work identities (personal email, work email, contractor email). Account linking enables seamless switching like Slack, without logging out.

**Apply when**:
- Building B2B products (users have work + personal)
- Supporting contractors with multiple clients
- Users request "switch accounts" feature

**Related**: #L360 (Dual identity), #L410 (Personal workspace)

---

---

## #L510: Deploy Convex to Correct Environment [🔴 CRITICAL]

**Symptom**: Auth works end-to-end but users not appearing in Convex database, logs show "Server Error" or "Could not find function"  
**Root Cause**: Convex functions deployed to DEV, not PROD (or vice versa)  
**Fix**:

```bash
# ❌ WRONG: Using grep with multiple matches
CONVEX_DEPLOY_KEY=$(grep CONVEX_DEPLOY_KEY .env | cut -d= -f2)
# If .env has:
# CONVEX_DEPLOY_KEY=dev:blissful-lynx-970
# CONVEX_DEPLOY_KEY_PROD=prod:prestigious-whale-251
# ↑ Grabs the first one (DEV)! ❌

# ✅ CORRECT: Explicit production deployment
CONVEX_DEPLOY_KEY="prod:prestigious-whale-251|your_key_here" npx convex deploy --yes

# ✅ BEST: Structure .env properly
# .env (committed, default = production)
CONVEX_DEPLOY_KEY=prod:prestigious-whale-251|...

# .env.local (not committed, override for local dev)
CONVEX_DEPLOY_KEY=dev:blissful-lynx-970|...
```

**How to verify:**
```bash
# Check which deployment it's using
npx convex deploy --yes
# Look for: "Deploying to https://[deployment-name].convex.cloud..."

# List functions in production
CONVEX_DEPLOY_KEY="prod:..." npx convex run --help
# Should show your latest functions

# Test a specific mutation
CONVEX_DEPLOY_KEY="prod:..." npx convex run users:syncUserFromWorkOS '{"workosId":"test","email":"test@example.com","emailVerified":true}'
```

**Why**: Vercel deploys your SvelteKit app automatically (from GitHub), but **Convex functions must be manually deployed**. They're separate systems:
- **SvelteKit (Vercel)**: Auto-deploys on git push
- **Convex (Convex Dashboard)**: Manual `npx convex deploy` required

**Common mistakes:**
- Deploying Convex to DEV but running app in PROD
- Using wrong `CONVEX_DEPLOY_KEY` from `.env`
- Forgetting to deploy Convex after schema changes
- `.env` has multiple keys, grep grabs wrong one

**Apply when**:
- Setting up new auth system
- Any Convex schema changes
- Adding new Convex functions
- Production deployment

**Related**: #L10 (PUBLIC_ environment variables), #L60 (Staging vs Production)

---

**Last Updated**: 2025-11-10  
**Pattern Count**: 11  
**Validated**: WorkOS AuthKit, SvelteKit, Vite, Convex  
**Format Version**: 2.0

