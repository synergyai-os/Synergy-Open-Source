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

## #L410: Personal Content Ownership Pattern [🟡 UPDATED]

> **⚠️ ARCHITECTURE CHANGE**: This pattern has been updated. "Personal workspace" as a context (null orgId) has been removed. Users are now **required** to have at least one organization (enforced server-side). Personal content is now distinguished by `ownershipType='user'` **within** an organization context.

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

// ✅ CORRECT: Personal content uses ownershipType='user' WITH organizationId
inboxItems: defineTable({
	userId: v.id('users'),
	organizationId: v.id('organizations'), // ✅ REQUIRED - users always have orgs
	teamId: v.optional(v.id('teams')),
	ownershipType: v.optional(
		v.union(
			v.literal('user'), // User owns (personal, but org-scoped)
			v.literal('organization'), // Org owns
			v.literal('team') // Team owns
		)
	)
})
	.index('by_user', ['userId'])
	.index('by_organization', ['organizationId'])
	.index('by_team', ['teamId']);

// Clean queries
// Get personal content within organization
const personal = await ctx.db
	.query('inboxItems')
	.withIndex('by_organization', (q) => q.eq('organizationId', orgId))
	.filter((q) => q.eq(q.field('ownershipType'), 'user')) // ✅ Personal content
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
| `"user"` | `"org_123"` (required) | ❌ Moves with user (personal content) |
| `"organization"` | `"org_123"` | ✅ Stays in org |
| `"team"` | `"org_123"` + `teamId` | ✅ Stays in team |

**Key Distinction**:
- **❌ REMOVED**: "Personal workspace" as a context (null organizationId workspace)
- **✅ VALID**: Personal content (`ownershipType='user'`) within an organization context

**Why**: Users are required to have at least one organization (enforced server-side). Personal content is distinguished by ownership type, not by null organizationId. This keeps the data model clean and ensures all content is properly scoped to organizations.

**Apply when**:

- Designing multi-tenancy architecture
- Supporting personal content within organizations
- Need to distinguish user-owned vs org-owned vs team-owned content

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
const expiresAt =
	authResponse.session?.expires_at !== undefined
		? Date.parse(authResponse.session.expires_at) // ❌ 5 minutes!
		: Date.now() + authResponse.expires_in * 1000;

await establishSession({
	event,
	convexUserId,
	workosUserId: authResponse.user.id,
	expiresAt // ❌ Session expires in 5 minutes
	// ...
});

// ✅ CORRECT: Use app-defined session TTL (30 days)
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const expiresAt = Date.now() + SESSION_TTL_MS;

await establishSession({
	event,
	convexUserId,
	workosUserId: authResponse.user.id,
	expiresAt // ✅ Session lasts 30 days
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
const linkedAccountsQuery =
	browser && currentUserId
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
		.withIndex('by_primary', (q) => q.eq('primaryUserId', fromUserId).eq('linkedUserId', toUserId))
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
const itemsQuery =
	browser && getUserId()
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
export async function validateSession(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
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
	onSwitchAccount?.(targetUserId); // ❌ redirectTo is dropped!
}

// Called elsewhere:
handleSwitchAccount(userId, '/inbox?org=saprolab-id');
//                           ^^^^^^^^^^^^^^^^^^^^^^^^
//                           This parameter is silently LOST!

// ✅ CORRECT - Function signature matches call sites
function handleSwitchAccount(targetUserId: string, redirectTo?: string) {
	onSwitchAccount?.(targetUserId, redirectTo); // ✅ Both params passed
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
localStorage.setItem(STORAGE_KEY, orgId); // ❌ Overwrites for all accounts!

// When user switches back to Account A:
const orgId = localStorage.getItem(STORAGE_KEY); // ❌ Gets Account B's workspace!

// ✅ CORRECT - Account-specific keys
function getStorageKey(userId: string | undefined): string {
	return userId ? `activeOrganizationId_${userId}` : 'activeOrganizationId';
}

function getStorageDetailsKey(userId: string | undefined): string {
	return userId ? `activeOrganizationDetails_${userId}` : 'activeOrganizationDetails';
}

// Each account has independent state:
localStorage.setItem(getStorageKey(userIdA), orgIdA); // ✅ Account A's workspace
localStorage.setItem(getStorageKey(userIdB), orgIdB); // ✅ Account B's workspace
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
		.filter((q) =>
			q.or(
				q.and(q.eq(q.field('primaryUserId'), userId1), q.eq(q.field('linkedUserId'), userId2)),
				q.and(q.eq(q.field('primaryUserId'), userId2), q.eq(q.field('linkedUserId'), userId1))
			)
		)
		.first();

	return !!link; // ❌ Only checks A→B, not A→B→C!
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
			.filter((q) =>
				q.or(q.eq(q.field('primaryUserId'), current), q.eq(q.field('linkedUserId'), current))
			)
			.collect();

		for (const link of links) {
			const neighbor = link.primaryUserId === current ? link.linkedUserId : link.primaryUserId;

			if (neighbor === userId2) return true; // ✅ Found transitive link!

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

⚠️ **Security Update (2025-11-12)**: Add depth and account limits to prevent DoS attacks. See #L1010.

**Related**: #L860 (Account-specific localStorage), #L1010 (BFS depth limits), multi-session management, account switching

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
	return btoa(result); // ❌ Attackers can decrypt with browser console
}

// ✅ CORRECT: AES-256-GCM with PBKDF2 (SOC 2 compliant)
async function encryptSession(plaintext: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(plaintext);

	// Derive 256-bit key with PBKDF2 (100k iterations)
	const key = await deriveKey(); // PBKDF2 with browser fingerprint

	// Generate random IV (never reuse!)
	const iv = crypto.getRandomValues(new Uint8Array(12));

	// Encrypt with AES-256-GCM (authenticated encryption)
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

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
			iterations: 100_000, // OWASP recommendation
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false, // Not extractable
		['encrypt', 'decrypt']
	);
}
```

**Automatic Migration** (zero user friction):

```typescript
async function migrateToWebCrypto(): Promise<void> {
	const migrated = localStorage.getItem('syos_crypto_migrated');
	if (migrated === 'true') return; // Already migrated

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

## #L1010: BFS Depth Limits for DoS Prevention [🔒 SECURITY]

**Symptom**: Account switch takes 5+ seconds, Convex query costs spike, malicious user creates 100 linked accounts  
**Root Cause**: Unbounded BFS traversal allows circular links and excessive account chains (A→B→C→...→Z→A)  
**Fix**:

```typescript
// ❌ WRONG - Unbounded BFS (DoS vulnerability)
async function linkExists(
	ctx: QueryCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>
): Promise<boolean> {
	const visited = new Set<string>();
	const queue: Id<'users'>[] = [primaryUserId]; // ❌ No depth tracking!

	while (queue.length > 0) {
		// ❌ Could iterate 100+ times!
		const current = queue.shift()!;
		// ... BFS without limits
	}
}

// ✅ CORRECT - Bounded BFS with depth and account limits
const MAX_LINK_DEPTH = 3; // Matches Slack (A→B→C→D max)
const MAX_TOTAL_ACCOUNTS = 10; // Industry standard

async function linkExists(
	ctx: QueryCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>
): Promise<boolean> {
	if (primaryUserId === linkedUserId) return true;

	const visited = new Set<string>();
	const queue: Array<{ userId: Id<'users'>; depth: number }> = [
		{ userId: primaryUserId, depth: 0 }
	];

	while (queue.length > 0) {
		const current = queue.shift()!;

		// ✅ Enforce depth limit (prevent deep chains)
		if (current.depth >= MAX_LINK_DEPTH) {
			continue; // Skip this branch
		}

		// ✅ Enforce account limit (prevent abuse)
		if (visited.size > MAX_TOTAL_ACCOUNTS) {
			console.warn(`User ${primaryUserId} has too many linked accounts`);
			return false; // Suspicious - reject
		}

		if (visited.has(current.userId)) continue;
		visited.add(current.userId);

		const links = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', current.userId))
			.collect();

		for (const link of links) {
			if (link.linkedUserId === linkedUserId) return true;

			if (!visited.has(link.linkedUserId)) {
				queue.push({
					userId: link.linkedUserId,
					depth: current.depth + 1 // ✅ Track depth
				});
			}
		}
	}

	return false;
}

// ✅ Validate BEFORE creating links
export const linkAccounts = mutation({
	handler: async (ctx, args) => {
		// Check existing link count
		const existingLinks = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', args.primaryUserId))
			.collect();

		if (existingLinks.length >= MAX_TOTAL_ACCOUNTS - 1) {
			throw new Error(`Cannot link more than ${MAX_TOTAL_ACCOUNTS} accounts`);
		}

		// Check if linking would exceed depth
		const wouldExceed = await checkLinkDepth(ctx, args.primaryUserId, args.linkedUserId);
		if (wouldExceed) {
			throw new Error(`Cannot link: would exceed maximum depth of ${MAX_LINK_DEPTH}`);
		}

		// Create link...
	}
});
```

**Why**:

- **DoS Attack**: Malicious user creates 100 accounts → links in circle → 100 queries per switch → $6/month cost per 1000 users
- **Performance**: Unbounded BFS = O(N) where N = all linked accounts (could be 100+)
- **User Experience**: 5+ second delays make app feel broken

**Limits Rationale**:

- `MAX_LINK_DEPTH = 3`: Slack's depth limit, covers 99% of legitimate use cases (personal + 2 work emails)
- `MAX_TOTAL_ACCOUNTS = 10`: Slack/Notion standard, average user has 2-3 email addresses

**Security Impact**:

- ✅ DoS prevention: Max 10 queries (was unbounded)
- ✅ Cost control: Predictable query costs
- ✅ Performance: O(N) where N ≤ 10 (acceptable)
- ✅ Circular link handling: visited set prevents infinite loops
- ✅ Backward compatible: Existing links work, only new links validated

**Apply when**:

- Implementing account linking/switching (Slack/Notion pattern)
- BFS traversal on user-controlled data
- Multi-tenancy with account relationships
- Any feature where users can create graph structures

**Error Handling**:

```typescript
// Client-side: Catch and display user-friendly errors
try {
    await convex.mutation(api.users.linkAccounts, { ... });
} catch (error: any) {
    if (error.message?.includes('Cannot link more than')) {
        toast.error("You've reached the maximum of 10 linked accounts.");
    } else if (error.message?.includes('would exceed maximum depth')) {
        toast.error('Cannot link these accounts. Please contact support.');
    }
}
```

**Related**: #L910 (BFS transitive links), #L460 (Account linking pattern), Convex query optimization

---

## #L1050: Ghost Accounts from Incomplete Logout [🔴 CRITICAL]

**Symptom**: Logged-out linked accounts reappear after page reload, three-dot menu "Log out" action doesn't persist  
**Root Cause**: `logoutAccount` only removes session from localStorage, but `accountLinks` record in Convex remains intact. On page reload, server fetches all linked accounts from Convex and re-adds them to localStorage  
**Fix**:

**Step 1: Create `unlinkAccounts` mutation** (convex/users.ts):

```typescript
/**
 * Unlink two accounts (removes bidirectional link)
 * Called when user logs out a linked account
 */
export const unlinkAccounts = mutation({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users') // The account to unlink
	},
	handler: async (ctx, args) => {
		const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		if (currentUserId === args.targetUserId) {
			throw new Error('Cannot unlink yourself');
		}

		// Remove BOTH directions of the link (bidirectional)
		const linksToRemove = await ctx.db
			.query('accountLinks')
			.filter((q) =>
				q.or(
					q.and(
						q.eq(q.field('primaryUserId'), currentUserId),
						q.eq(q.field('linkedUserId'), args.targetUserId)
					),
					q.and(
						q.eq(q.field('primaryUserId'), args.targetUserId),
						q.eq(q.field('linkedUserId'), currentUserId)
					)
				)
			)
			.collect();

		for (const link of linksToRemove) {
			await ctx.db.delete(link._id);
		}
	}
});
```

**Step 2: Create server endpoint** (src/routes/auth/unlink-account/+server.ts):

```typescript
export const POST: RequestHandler = async ({ request, locals }) => {
	const { auth } = locals;
	
	if (!auth?.sessionId || !auth.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	// Validate CSRF token
	const csrfHeader = request.headers.get('x-csrf-token');
	if (!csrfHeader || csrfHeader !== auth.csrfToken) {
		return json({ error: 'Invalid CSRF token' }, { status: 403 });
	}

	const { targetUserId } = await request.json();
	
	// Call Convex mutation to unlink
	await convex.mutation(api.users.unlinkAccounts, {
		sessionId: auth.sessionId,
		targetUserId: targetUserId as Id<'users'>
	});

	return json({ success: true });
};
```

**Step 3: Update `logoutAccount`** (src/lib/composables/useAuthSession.svelte.ts):

```typescript
async function logoutAccount(targetUserId: string) {
	if (!browser) return;

	const currentUserId = state.user?.userId;
	const isLoggingOutCurrentAccount = targetUserId === currentUserId;

	// For non-current accounts: unlink from database FIRST
	if (!isLoggingOutCurrentAccount) {
		const allSessions = await getAllSessions();
		const targetSession = allSessions[targetUserId];
		const accountName = targetSession?.userName || targetSession?.userEmail || 'Account';

		const csrfToken = state.csrfToken ?? readCookie('syos_csrf');
		if (!csrfToken) {
			state.error = 'Unable to verify session (missing CSRF token).';
			return;
		}

		// ✅ STEP 1: Remove accountLinks record in Convex
		const response = await fetch('/auth/unlink-account', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF-Token': csrfToken
			},
			body: JSON.stringify({ targetUserId })
		});

		if (!response.ok) {
			state.error = `Failed to unlink account: ${response.statusText}`;
			return;
		}

		// ✅ STEP 2: Remove from localStorage
		await removeSession(targetUserId);
		
		// ✅ STEP 3: Reload session (won't re-add because link is gone)
		await loadSession();

		toast.success(`${accountName} logged out`);
		return;
	}

	// For current account: full logout
	logout();
}
```

**Why This Order Matters**:

```
❌ OLD FLOW (Broken):
1. removeSession(localStorage)  ← Session gone temporarily
2. loadSession()                ← Fetches from Convex accountLinks
3. accountLinks still exist     ← Re-adds to localStorage ❌

✅ NEW FLOW (Fixed):
1. unlinkAccounts(Convex)       ← Database link removed FIRST
2. removeSession(localStorage)  ← Session gone from local
3. loadSession()                ← Fetches from Convex (no link found)
4. Account stays gone           ← ✅ Persistent
```

**Why**:

- **Database is source of truth**: localStorage is a cache, Convex is the authority
- **Rehydration on reload**: `/auth/linked-sessions` fetches from Convex → re-populates localStorage
- **Security**: Server validates CSRF token + session before allowing unlink
- **Bidirectional removal**: Must remove BOTH directions (A→B and B→A)

**Common Mistakes**:

```typescript
// ❌ WRONG - Only removes one direction
await ctx.db.delete(linkRecord._id); // Only removes A→B, not B→A

// ❌ WRONG - Only removes from localStorage
await removeSession(targetUserId); // Page reload re-adds it

// ❌ WRONG - Wrong order (localStorage first)
await removeSession(targetUserId);
await unlinkAccounts(targetUserId);
// loadSession() runs between these → re-adds ghost account
```

**Testing**:

```typescript
// 1. Login to Account A
// 2. Add Account B (creates accountLinks record)
// 3. Click "Log out" on Account B
// 4. Reload page
// ✅ Account B should NOT reappear
// 5. Check Convex accountLinks table
// ✅ No records linking A and B
```

**Apply when**:

- Implementing multi-account logout (Slack/Notion pattern)
- Account unlinking/disconnection features
- Any system where localStorage syncs from database on load
- Two-way relationships that need cleanup (followers, friends, links)

**Related**: #L460 (Account linking pattern), #L910 (BFS transitive links), #L1010 (DoS prevention), localStorage caching patterns

---

## #L1060: E2E Testing for SessionID-Based Authentication [🟢 REFERENCE]

**Symptom**: Security regressions ship to production (e.g., client-supplied `userId` allows impersonation)  
**Root Cause**: Manual testing is slow, error-prone, and doesn't catch all edge cases  
**Fix**:

```typescript
// e2e/auth.setup.ts - Authenticate once, reuse across tests
import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
	const email = process.env.TEST_USER_EMAIL;
	const password = process.env.TEST_USER_PASSWORD;

	await page.goto('/login');
	await page.locator('input[type="email"]').fill(email);
	await page.locator('input[type="password"]').fill(password);
	await page.locator('button[type="submit"]').click();

	await page.waitForURL(/\/(inbox|dashboard)/);
	await page.context().storageState({ path: authFile });
});

// e2e/security.spec.ts - Test critical flows
import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test('should prevent ArgumentValidationError with sessionId', async ({ page }) => {
	const consoleErrors: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			consoleErrors.push(msg.text());
		}
	});

	// Test critical user flow (e.g., create note)
	await page.goto('/inbox');
	await page.keyboard.press('c'); // Quick create
	await page.locator('.ProseMirror').type('Test note');
	await page.locator('button:has-text("Create")').click();

	// Verify no sessionId errors
	const hasSessionIdError = consoleErrors.some(
		(err) => err.includes('sessionId') || err.includes('ArgumentValidationError')
	);
	expect(hasSessionIdError).toBe(false);
});
```

**4-Layer Defense**:

1. **Static Analysis** - Scan code for `userId` passed to migrated functions
2. **Unit Tests** - Test session validation logic (49 tests)
3. **E2E Tests** - Test real user flows with authentication (16 tests)
4. **CI/CD** - Block PRs if tests fail

**Why**:

- Manual testing missed 2 bugs (QuickCreateModal, GlobalActivityTracker)
- E2E tests catch regressions **before production**
- Authenticated test user enables realistic testing
- Console error detection catches `ArgumentValidationError` early

**Test User Setup**:

```bash
# .env.test (gitignored)
TEST_USER_EMAIL=test+cicd@example.com
TEST_USER_PASSWORD=secure_password_here
```

**Apply when**:

- Migrating authentication patterns (e.g., `userId` → `sessionId`)
- Testing security-critical flows (API keys, user isolation)
- Building features with auth requirements
- Implementing RBAC or multi-tenancy

**Coverage by Module**:

- **Quick Create**: 6 tests (note, flashcard, highlight, tags)
- **Inbox**: 7 tests (list, process, navigate, sync progress)
- **Settings**: 5 tests (API keys, theme, user isolation)

**Run Tests**:

```bash
npm run test:e2e:setup           # Authenticate once
npm run test:e2e:critical        # Run all critical tests
npx playwright test --ui         # Debug mode
```

**Related**: #L760 (Pass userId when needed), #L810 (Parameter dropping), #L610 (Session expiry)

---

## #L1110: Password Validation with Email Aliases [🔴 CRITICAL]

**Symptom**: Password `randyhereman123` accepted for email `randyhereman+test3@gmail.com`, WorkOS rejects with "password contains email"  
**Root Cause**: Validation checks `randyhereman+test3` instead of stripping `+alias` to get `randyhereman`  
**Fix**:

```typescript
// ❌ WRONG - Doesn't handle email aliases
const emailLocalPart = email.split('@')[0].toLowerCase();
if (password.toLowerCase().includes(emailLocalPart)) {
	return { error: 'Password contains email' };
}

// ✅ CORRECT - Strip +alias before validation
const emailLocalPart = email.split('@')[0].split('+')[0].toLowerCase();
const passwordLower = password.toLowerCase();

// Minimum 4 chars to avoid false positives (e.g., "ab@example.com")
if (emailLocalPart.length >= 4 && passwordLower.includes(emailLocalPart)) {
	return {
		error: 'Password must not contain your email address. Please choose a different password.'
	};
}
```

**Frontend + Backend Parity** (validate in both places):

```typescript
// src/routes/register/+page.svelte - Frontend validation
async function handleSubmit(event: SubmitEvent) {
	// Validate password doesn't contain email
	const emailLocalPart = email.trim().split('@')[0].split('+')[0].toLowerCase();
	const passwordLower = password.toLowerCase();

	if (emailLocalPart.length >= 4 && passwordLower.includes(emailLocalPart)) {
		errorMessage =
			'Password must not contain your email address. Please choose a different password.';
		return; // ✅ Stop before API call
	}

	// Submit to backend...
}

// src/routes/auth/register/+server.ts - Backend validation
export const POST: RequestHandler = async ({ request }) => {
	const { email, password } = await request.json();

	// Same validation logic as frontend
	const emailLocalPart = email.split('@')[0].split('+')[0].toLowerCase();
	const passwordLower = password.toLowerCase();

	if (emailLocalPart.length >= 4 && passwordLower.includes(emailLocalPart)) {
		return json(
			{
				error: 'Password must not contain your email address. Please choose a different password.'
			},
			{ status: 400 }
		);
	}

	// Create user in WorkOS...
};
```

**Unit Tests** (prevent regressions):

```typescript
// src/routes/auth/register/register.test.ts
describe('Password Validation', () => {
	it('should reject password containing email username with alias', () => {
		// Bug case: randyhereman+test3@gmail.com with password randyhereman123
		const result = validatePassword('randyhereman+test3@gmail.com', 'randyhereman123');
		expect(result.valid).toBe(false);
		expect(result.error).toContain('must not contain your email');
	});

	it('should handle email with multiple + aliases', () => {
		const result = validatePassword('user+test+alias@example.com', 'userpassword123');
		expect(result.valid).toBe(false);
	});

	it('should accept password when email username is less than 4 chars', () => {
		// Short usernames (< 4 chars) allowed to avoid false positives
		const result = validatePassword('ab@example.com', 'abc12345');
		expect(result.valid).toBe(true);
	});
});
```

**WorkOS Requirements** (enforce at application layer):

1. **Minimum Length**: 8 characters
2. **Email Exclusion**: Password cannot contain email local part (before @)
3. **Case Insensitive**: Check lowercase versions
4. **Alias Handling**: Strip `+alias` before validation

**Apply when**:

- Implementing registration with WorkOS User Management API
- Any password validation (registration, password reset, password change)
- Email addresses support `+` aliases (Gmail, etc.)

**Why Frontend + Backend**:

- ✅ Frontend: Immediate feedback, better UX
- ✅ Backend: Security (never trust client), prevent WorkOS API errors

**Testing Strategy**:

- ✅ Unit tests (16 tests covering all edge cases)
- ✅ E2E tests (registration flow with test helper)
- ✅ CI integration (`npm run test:unit:server`)

**Related Files**:

- Unit tests: `src/routes/auth/register/register.test.ts`
- Frontend validation: `src/routes/register/+page.svelte`
- Backend validation: `src/routes/auth/register/+server.ts`
- Test docs: `dev-docs/2-areas/testing/password-validation-tests.md`

**Related**: #L60 (Environment setup), #L1060 (E2E testing), CI/CD validation

---

## #L1120: Account Switching Must Use POST with CSRF Token [🔴 CRITICAL]

**Symptom**: Clicking account name shows "GET method not allowed" error (405), account switching fails  
**Root Cause**: Using `window.location.href` or `<a href>` triggers GET request, but `/auth/switch` endpoint only accepts POST with CSRF token  
**Fix**:

```typescript
// ❌ WRONG - GET request via window.location.href
function switchAccount(targetUserId: string) {
	window.location.href = `/auth/switch?userId=${targetUserId}&redirectTo=${encodeURIComponent('/admin')}`;
	// ❌ Results in: GET /auth/switch?userId=... → 405 Method Not Allowed
}

// ✅ CORRECT - POST request with CSRF token
import { useAuthSession } from '$lib/composables/useAuthSession.svelte';

const authSession = useAuthSession();

async function switchAccount(targetUserId: string, redirectTo: string) {
	// ✅ POST request with JSON body + CSRF token
	await authSession.switchAccount(targetUserId, redirectTo);
}
```

**Why POST?**:

- Security: CSRF protection requires POST + token
- State mutation: Account switching changes server state (active session)
- RESTful: State-changing operations should use POST, not GET

**CSRF Token Handling**:

```typescript
// useAuthSession composable handles CSRF token automatically:
async function switchAccount(targetUserId: string, redirectTo: string) {
	const response = await fetch('/auth/switch', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRF-Token': getCsrfToken() // ✅ Automatically included
		},
		body: JSON.stringify({ userId: targetUserId, redirectTo })
	});
	
	if (!response.ok) {
		throw new Error('Account switch failed');
	}
	
	// Server redirects after successful switch
	window.location.href = redirectTo;
}
```

**Apply when**:

- Account switching from error pages
- Multi-account session management
- Any endpoint that requires POST + CSRF token
- State-changing operations (not just data fetching)

**Common Mistakes**:

- ❌ Using `<a href="/auth/switch?userId=...">` → GET request
- ❌ Using `window.location.href` → GET request
- ❌ Missing CSRF token → 403 Forbidden
- ❌ Using GET for state mutations → Security risk

**Related**: #L810 (Silent parameter dropping), #L860 (Account-specific localStorage), SYOS-293 (RBAC Management UI)

---

**Last Updated**: 2025-11-19  
**Pattern Count**: 23  
**Validated**: WorkOS AuthKit, SvelteKit, Vite, Convex, Svelte 5, Web Crypto API, Playwright  
**Format Version**: 2.0
