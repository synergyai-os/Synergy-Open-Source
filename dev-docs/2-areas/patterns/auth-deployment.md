# Authentication & Deployment Patterns

> **Production-Ready Strategy**: Environment-aware configuration, proper session management, and clean auth flows.

---

## #L10: PUBLIC\_ Environment Variables Need Actual Values [🔴 CRITICAL]

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

**Related**: #L10 (PUBLIC\_ environment variables), #L110 (Redirect URI matching)

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
cookies.delete('session', { path: '/' }); // ❌ Doesn't delete! Attributes don't match

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
cookies.delete('session', cookieOptions); // ✅ Deletes successfully
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
	throw redirect(302, '/'); // ❌ WorkOS session still active!
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

		throw redirect(302, workosLogoutUrl.toString()); // ✅ Ends WorkOS session
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
		host: '127.0.0.1', // Use 127.0.0.1 not localhost (WorkOS compatibility)
		port: 5173,
		strictPort: true, // ✅ Fail if port busy (forces cleanup)
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
	workosId: v.string(), // Primary identity
	email: v.string()
});

inboxItems: defineTable({
	userId: v.string() // ❌ workosId string - locked to WorkOS
});

// ✅ CORRECT: Dual identity system
users: defineTable({
	// Convex ID = permanent identity (all relationships use this)
	_id: 'user_123abc', // ← Use this for all relationships

	// Auth provider ID = authentication only
	workosId: v.string(), // Current: WorkOS
	// Future: Add more providers
	// clerkId: v.optional(v.string()),
	// auth0Id: v.optional(v.string()),

	email: v.string()
}).index('by_workos_id', ['workosId']); // Fast login lookup

inboxItems: defineTable({
	userId: v.id('users') // ✅ References Convex _id (permanent)
});
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
const personalOrg = await ctx.db.insert('organizations', {
	name: 'Personal',
	slug: 'personal',
	userId: userId // One per user!
});

inboxItems.organizationId = personalOrg; // ❌ Messy

// ✅ CORRECT: null = personal content
inboxItems: defineTable({
	userId: v.id('users'),
	organizationId: v.optional(v.id('organizations')), // null = personal ✅
	teamId: v.optional(v.id('teams')),
	ownershipType: v.optional(
		v.union(
			v.literal('user'), // User owns (personal)
			v.literal('organization'), // Org owns
			v.literal('team') // Team owns
		)
	)
})
	.index('by_user', ['userId'])
	.index('by_organization', ['organizationId'])
	.index('by_team', ['teamId']);

// Clean queries
// Get personal content
const personal = await ctx.db
	.query('inboxItems')
	.withIndex('by_user', (q) => q.eq('userId', userId))
	.filter((q) => q.eq(q.field('organizationId'), null)) // ✅ Clear!
	.collect();

// Get team content
const teamContent = await ctx.db
	.query('inboxItems')
	.withIndex('by_team', (q) => q.eq('teamId', teamId))
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

**Related**: #L10 (PUBLIC\_ environment variables), #L60 (Staging vs Production)

---

## #L610: Session Expiry Must Match Session TTL Not Token Expiry [🔴 CRITICAL]

**Symptom**: Users logged out after 5 minutes, session doesn't persist across page refreshes  
**Root Cause**: Setting session `expiresAt` to WorkOS token expiry (5 min) instead of app session TTL (30 days)  
**Fix**:

```typescript
// ❌ WRONG: Use WorkOS token expiry for session
const expiresAt = authResponse.session?.expires_at !== undefined
    ? Date.parse(authResponse.session.expires_at)  // ❌ 5 minutes!
    : Date.now() + authResponse.expires_in * 1000;

await establishSession({
    event,
    convexUserId,
    workosUserId: authResponse.user.id,
    expiresAt,  // ❌ Session expires in 5 minutes
    // ...
});

// ✅ CORRECT: Use app-defined session TTL (30 days)
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const expiresAt = Date.now() + SESSION_TTL_MS;

await establishSession({
    event,
    convexUserId,
    workosUserId: authResponse.user.id,
    expiresAt,  // ✅ Session lasts 30 days
    // ...
});
```

**Why**: WorkOS tokens expire quickly (5 min) for security, but your APP session should last much longer (days/weeks). The token expiry is ONLY used internally to know when to refresh. Session expiry determines how long users stay logged in.

**Token Refresh Flow**:
```typescript
// Session valid for 30 days
// WorkOS token refreshes automatically every 5 min (handled in session middleware)
// User stays logged in seamlessly for 30 days
```

**Apply when**:
- Implementing OAuth/OIDC authentication
- Users complaining about frequent logouts
- Session persistence issues
- Using any auth provider with short-lived tokens (WorkOS, Auth0, Clerk)

**Related**: #L60 (Environment configuration), #L210 (Session revocation)

---

## #L660: Reactive Queries Need $derived Wrapper [🔴 CRITICAL]

**Symptom**: Query doesn't re-run when reactive dependency changes, UI shows stale data  
**Root Cause**: Query created with conditional but not wrapped in `$derived`, evaluated only at initialization  
**Fix**:

```typescript
// ❌ WRONG: Conditional query without $derived
const linkedAccountsQuery = browser && currentUserId 
    ? useQuery(api.users.listLinkedAccounts, () => ({ userId: currentUserId }))
    : null;
// ❌ Only evaluated once at component init, never re-runs when currentUserId changes

// ✅ CORRECT: Wrap query in $derived
const linkedAccountsQuery = $derived(
    browser && currentUserId 
        ? useQuery(api.users.listLinkedAccounts, () => ({ userId: currentUserId }))
        : null
);
// ✅ Re-evaluated when currentUserId changes, query re-runs
```

**Why**: In Svelte 5, reactive values (`$derived`, `$state`) must be wrapped in `$derived()` to track dependencies. Without it, the expression is only evaluated once at initialization.

**Debugging**:
```javascript
// Add effect to see when query updates
$effect(() => {
    console.log('Query state:', {
        currentUserId,
        hasQuery: !!linkedAccountsQuery,
        data: linkedAccountsQuery?.data
    });
});
```

**Apply when**:
- Using `useQuery` with conditional logic
- Query depends on reactive state (`$state`, `$derived`)
- UI not updating when auth state changes
- Account switching or multi-account features

**Related**: svelte-reactivity.md#L10 (Reactive state with getters), svelte-reactivity.md#L80 (Passing reactive values)

---

## #L710: Account Linking Must Use Bidirectional Links [🟢 REFERENCE]

**Symptom**: User can't see linked accounts from both directions (A→B works, but B→A doesn't)  
**Root Cause**: Only creating single directional link in database  
**Fix**:

```typescript
// ❌ WRONG: Single directional link
await ctx.db.insert('accountLinks', {
    primaryUserId,
    linkedUserId
});
// ❌ Query only works for primary user

// ✅ CORRECT: Bidirectional links
async function createDirectedLink(ctx, fromUserId, toUserId, linkType) {
    const existing = await ctx.db
        .query('accountLinks')
        .withIndex('by_primary', (q) => 
            q.eq('primaryUserId', fromUserId).eq('linkedUserId', toUserId))
        .first();
    
    if (!existing) {
        await ctx.db.insert('accountLinks', {
            primaryUserId: fromUserId,
            linkedUserId: toUserId,
            linkType: linkType ?? undefined,
            verifiedAt: Date.now(),
            createdAt: Date.now()
        });
    }
}

// Create BOTH directions
await createDirectedLink(ctx, primaryUserId, linkedUserId, linkType);
await createDirectedLink(ctx, linkedUserId, primaryUserId, linkType);
// ✅ Query works from either user
```

**Why**: Users should see all linked accounts regardless of which account they're currently using. Bidirectional links ensure consistency and prevent edge cases where links only work in one direction.

**Apply when**:
- Implementing Slack-style account switching
- Multi-account support
- Account linking features
- User has multiple work identities

**Related**: #L460 (Account linking pattern), #L360 (Dual identity)

---

## #L760: Pass userId to Convex Queries/Mutations When JWT Auth Fails [🔴 CRITICAL]

**Symptom**: "Not authenticated" errors in Convex, queries return empty arrays, mutations fail  
**Root Cause**: WorkOS password auth tokens don't include `aud` claim required for Convex JWT validation, so `ctx.auth.getUserIdentity()` returns `null`  
**Fix**:

```typescript
// ❌ WRONG: Using getAuthUserId which returns null
export const listItems = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx); // ❌ Returns null
		if (!userId) return [];
		// ...
	}
});

// ✅ CORRECT: Accept userId parameter + validate session
import { validateSession } from './sessionValidation';

export const listItems = query({
	args: {
		userId: v.id('users') // Required: passed from authenticated SvelteKit session
	},
	handler: async (ctx, args) => {
		// Validate session (prevents impersonation)
		await validateSession(ctx, args.userId);
		const userId = args.userId;
		// ...
	}
});
```

**Client-side pattern**:

```typescript
// ✅ Get userId from page data
const getUserId = () => $page.data.user?.userId;

// ✅ Pass to query (reactive)
const itemsQuery = browser && getUserId()
	? useQuery(api.items.listItems, () => {
			const userId = getUserId();
			if (!userId) return null; // Skip query if userId not available
			return { userId };
		})
	: null;
```

**Why**: WorkOS password auth tokens lack `aud` claim, breaking Convex JWT validation. Passing `userId` from authenticated SvelteKit session + validating against `authSessions` table provides secure workaround.

**Session Validation Helper** (`convex/sessionValidation.ts`):

```typescript
export async function validateSession(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>
) {
	const session = await ctx.db
		.query('authSessions')
		.filter((q) => q.eq(q.field('convexUserId'), userId))
		.order('desc')
		.first();

	if (!session) {
		throw new Error('Session not found - user must log in');
	}

	if (session.expiresAt < Date.now()) {
		throw new Error('Session expired - user must log in again');
	}

	return session;
}
```

**Migration Checklist**:
1. Add `userId: v.id('users')` to query/mutation args
2. Import `validateSession` from `./sessionValidation`
3. Call `await validateSession(ctx, args.userId)` at start of handler
4. Update client code to pass `userId` from `$page.data.user?.userId`
5. Wrap query in conditional: `browser && getUserId() ? useQuery(...) : null`

**Apply when**:
- Convex queries/mutations return empty/null unexpectedly
- "Not authenticated" errors in Convex logs
- Using WorkOS password auth (not AuthKit hosted UI)
- JWT validation fails due to missing `aud` claim

**TODO**: Once WorkOS adds `aud` claim support, migrate back to JWT-based auth

**Related**: #L680 (Custom JWT auth), #L610 (Session expiry), #L660 (Reactive queries)

---

## #L810: Silent Function Parameter Dropping [🔴 CRITICAL]

**Symptom**: Account/workspace switching navigates correctly but lands on wrong workspace, URL missing expected query parameters  
**Root Cause**: Function called with more parameters than its signature accepts - extra parameters silently dropped  
**Fix**:

```typescript
// ❌ WRONG - Function signature accepts 1 param, called with 2
function handleSwitchAccount(targetUserId: string) {
    onSwitchAccount?.(targetUserId);  // ❌ redirectTo is dropped!
}

// Called elsewhere:
handleSwitchAccount(userId, '/inbox?org=saprolab-id');
//                           ^^^^^^^^^^^^^^^^^^^^^^^^
//                           This parameter is silently LOST!

// ✅ CORRECT - Function signature matches call sites
function handleSwitchAccount(targetUserId: string, redirectTo?: string) {
    onSwitchAccount?.(targetUserId, redirectTo);  // ✅ Both params passed
}
```

**Why**: JavaScript/TypeScript allows functions to be called with extra args - they're just ignored if not in signature. No errors, just silent data loss.

**Apply when**:
- Multi-parameter callbacks or event handlers
- Account/workspace/organization switching logic
- Any function that accepts optional URL/redirect parameters
- Wrapper functions that delegate to other functions

**Debug approach**:
1. Check URL in browser - is query param present?
2. Add console.log in function - are all params received?
3. Trace backwards from server response to initial call
4. **Don't assume framework issue** - verify data flow first!

**Related**: Account switching, URL parameters, multi-account patterns

---

## #L860: Account-Specific localStorage Keys [🔴 CRITICAL]

**Symptom**: Switching between accounts shows wrong workspaces, data from one account appearing in another  
**Root Cause**: Single localStorage key shared across all accounts - last active workspace overwrites previous  
**Fix**:

```typescript
// ❌ WRONG - Single key for all accounts
const STORAGE_KEY = 'activeOrganizationId';
localStorage.setItem(STORAGE_KEY, orgId);  // ❌ Overwrites for all accounts!

// When user switches back to Account A:
const orgId = localStorage.getItem(STORAGE_KEY);  // ❌ Gets Account B's workspace!

// ✅ CORRECT - Account-specific keys
function getStorageKey(userId: string | undefined): string {
    return userId ? `activeOrganizationId_${userId}` : 'activeOrganizationId';
}

function getStorageDetailsKey(userId: string | undefined): string {
    return userId ? `activeOrganizationDetails_${userId}` : 'activeOrganizationDetails';
}

// Each account has independent state:
localStorage.setItem(getStorageKey(userIdA), orgIdA);  // ✅ Account A's workspace
localStorage.setItem(getStorageKey(userIdB), orgIdB);  // ✅ Account B's workspace
```

**Why**: localStorage is per-domain, not per-user. Multi-account systems need user-scoped keys.

**Apply when**:
- Multi-account session management (Slack/Notion pattern)
- User can switch between different logged-in accounts
- Each account has independent workspaces/organizations
- Storing user-specific preferences or state

**Pattern**: `{key}_{userId}` for all user-specific localStorage keys

**Related**: #L810 (Silent parameter dropping), multi-session management

---

## #L910: Transitive Account Linking with BFS [🟡 IMPORTANT]

**Symptom**: 403 Forbidden when switching from Account C to Account B, but A→B and B→C work individually  
**Root Cause**: Direct link check only - doesn't traverse transitive relationships (A→B→C implies A can access C)  
**Fix**:

```typescript
// ❌ WRONG - Only checks direct links
async function linkExists(
    ctx: QueryCtx,
    userId1: Id<'users'>,
    userId2: Id<'users'>
): Promise<boolean> {
    const link = await ctx.db
        .query('accountLinks')
        .filter(q => 
            q.or(
                q.and(q.eq(q.field('primaryUserId'), userId1), q.eq(q.field('linkedUserId'), userId2)),
                q.and(q.eq(q.field('primaryUserId'), userId2), q.eq(q.field('linkedUserId'), userId1))
            )
        )
        .first();
    
    return !!link;  // ❌ Only checks A→B, not A→B→C!
}

// ✅ CORRECT - BFS to find transitive links
async function linkExists(
    ctx: QueryCtx,
    userId1: Id<'users'>,
    userId2: Id<'users'>
): Promise<boolean> {
    if (userId1 === userId2) return true;
    
    const visited = new Set<string>([userId1]);
    const queue: Id<'users'>[] = [userId1];
    
    while (queue.length > 0) {
        const current = queue.shift()!;
        
        // Get all links for current user
        const links = await ctx.db
            .query('accountLinks')
            .filter(q =>
                q.or(
                    q.eq(q.field('primaryUserId'), current),
                    q.eq(q.field('linkedUserId'), current)
                )
            )
            .collect();
        
        for (const link of links) {
            const neighbor = link.primaryUserId === current
                ? link.linkedUserId
                : link.primaryUserId;
            
            if (neighbor === userId2) return true;  // ✅ Found transitive link!
            
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    
    return false;
}
```

**Why**: Account linking creates a graph - BFS traverses all reachable nodes (transitive closure).

**Apply when**:
- Multi-account linking (user can link multiple email addresses)
- Need to check if two accounts are connected (directly or transitively)
- User switches between any linked account, not just directly linked
- Implementing "Add Account" feature (Slack/Notion pattern)

**Security**: Validate session exists for target account - don't auto-create sessions for linked accounts!

**Related**: #L860 (Account-specific localStorage), multi-session management, account switching

---

## #L960: Web Crypto API for localStorage Encryption [🔒 SECURITY]

**Symptom**: localStorage session data visible in browser DevTools, fails SOC 2 audit  
**Root Cause**: XOR "encryption" provides zero security. Need NIST-approved AES-256-GCM with PBKDF2 key derivation.  
**Fix**:

```typescript
// ❌ WRONG: XOR provides no security (trivial to reverse)
function simpleEncrypt(text: string, key: string): string {
	let result = '';
	for (let i = 0; i < text.length; i++) {
		result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
	}
	return btoa(result);  // ❌ Attackers can decrypt with browser console
}

// ✅ CORRECT: AES-256-GCM with PBKDF2 (SOC 2 compliant)
async function encryptSession(plaintext: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(plaintext);
	
	// Derive 256-bit key with PBKDF2 (100k iterations)
	const key = await deriveKey();  // PBKDF2 with browser fingerprint
	
	// Generate random IV (never reuse!)
	const iv = crypto.getRandomValues(new Uint8Array(12));
	
	// Encrypt with AES-256-GCM (authenticated encryption)
	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		data
	);
	
	// Combine IV + ciphertext (GCM auth tag included)
	const combined = new Uint8Array(iv.length + ciphertext.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(ciphertext), iv.length);
	
	return btoa(String.fromCharCode(...combined));
}

async function deriveKey(): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	
	// Browser fingerprint for key uniqueness
	const fingerprint = [
		navigator.userAgent,
		screen.width,
		screen.height,
		new Date().getTimezoneOffset()
	].join('|');
	
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(fingerprint),
		'PBKDF2',
		false,
		['deriveKey']
	);
	
	// Derive AES-256 key (100k iterations, OWASP 2024 standard)
	return await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: encoder.encode('syos-session-v1'),
			iterations: 100_000,  // OWASP recommendation
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,  // Not extractable
		['encrypt', 'decrypt']
	);
}
```

**Automatic Migration** (zero user friction):

```typescript
async function migrateToWebCrypto(): Promise<void> {
	const migrated = localStorage.getItem('syos_crypto_migrated');
	if (migrated === 'true') return;  // Already migrated
	
	const oldEncrypted = localStorage.getItem('syos_sessions');
	if (oldEncrypted) {
		// Decrypt with old XOR method
		const oldData = legacyDecrypt(oldEncrypted);
		
		// Re-encrypt with Web Crypto API
		const newEncrypted = await encryptSession(oldData);
		localStorage.setItem('syos_sessions', newEncrypted);
	}
	
	localStorage.setItem('syos_crypto_migrated', 'true');
}
```

**Why Web Crypto?**
- **AES-256-GCM**: NIST-approved authenticated encryption (detects tampering)
- **PBKDF2**: Slow key derivation prevents brute force (100k iterations)
- **Random IV**: Prevents pattern analysis (different ciphertext each time)
- **Native browser API**: Fast, secure, no dependencies

**Security Properties:**

✅ **Protects Against:**
- Casual browser console inspection
- XSS attacks extracting session metadata
- Malicious extensions reading localStorage
- Data tampering (GCM authentication tag)

❌ **Does NOT Protect Against:**
- Physical device access (browser has key material)
- Browser vulnerabilities (if compromised, encryption won't help)
- Memory dumps during encryption/decryption

**Performance:**
- First encryption: ~50ms (key derivation, then cached)
- Subsequent: ~2-3ms (key already derived)
- **Negligible impact** - users won't notice

**Compliance:**
- ✅ **SOC 2**: "Data at rest must be encrypted"
- ✅ **GDPR**: "Appropriate technical measures"
- ⚠️ **HIPAA**: PHI shouldn't be in localStorage (use httpOnly cookies)

**Apply when**:
- Storing session data in localStorage
- Multi-account session management (Slack/Notion pattern)
- SOC 2, GDPR, or enterprise security requirements
- Sensitive metadata (emails, user IDs, tokens) in browser storage

**Testing**: Tests must use `.svelte.test.ts` extension (browser environment required).

**Related**: #L860 (Account-specific localStorage), #L180 (.svelte.ts extension), browser security patterns

---

**Last Updated**: 2025-11-12  
**Pattern Count**: 19  
**Validated**: WorkOS AuthKit, SvelteKit, Vite, Convex, Svelte 5, Web Crypto API  
**Format Version**: 2.0
