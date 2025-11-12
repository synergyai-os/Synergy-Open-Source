# Convex Integration Patterns

> **Validated with Context7**: All patterns verified against Convex Backend documentation.

---

## #L10: Avoid Undefined in Convex Payloads [🔴 CRITICAL]

**Symptom**: Hydration fails with `undefined is not a valid Convex value`  
**Root Cause**: Convex requires JSON-serializable payloads, `undefined` not allowed  
**Fix**:

```typescript
// ❌ WRONG: Returns undefined while loading
useQuery(
	api.teams.list,
	() => (activeOrgId ? { organizationId: activeOrgId } : undefined) // ❌ undefined
);

// ✅ CORRECT: Always send serializable value (Context7 validated)
const SENTINEL_ORG_ID = '00000000000000000000000000000000';
useQuery(
	api.teams.list,
	() => ({ organizationId: activeOrgId ?? SENTINEL_ORG_ID }) // ✅ Always valid
);

// For mutations: Strip undefined fields
const args: any = { toOrgId, count };
if (fromOrgId) args.fromOrgId = fromOrgId; // ✅ Only add if defined
await mutation(api.orgs.switch, args);
```

**Why**: Convex validates all payload values must be JSON-serializable.  
**Apply when**: Passing optional values to useQuery or mutations  
**Related**: #L50 (Runtime restrictions), #L240 (Type safety)

---

## #L50: Separate "use node" Files [🔴 CRITICAL]

**Symptom**: `Only actions can be defined in Node.js` deployment error  
**Root Cause**: Files with `"use node"` can only contain actions, not mutations/queries  
**Fix**:

```typescript
// ❌ WRONG: "use node" with mutations
"use node";
import { mutation, action } from './_generated/server';
const crypto = require('crypto');

export const create = mutation({ ... }); // ❌ Not allowed
export const encrypt = action({ ... });   // ✅ Allowed

// ✅ CORRECT: Separate files (Context7 validated)

// convex/flashcards.ts (NO "use node")
import { mutation, action } from './_generated/server';
import { internal } from './_generated/api';

export const create = mutation({ ... }); // ✅ Works
export const generate = action({
  handler: async (ctx, args) => {
    // Call Node.js action from separate file
    const key = await ctx.runAction(internal.crypto.decrypt, { ... });
    // ... rest of logic
  }
});

// convex/crypto.ts (WITH "use node" - actions only)
"use node";
import { internalAction } from './_generated/server';
const crypto = require('crypto');

export const decrypt = internalAction({ ... }); // ✅ Only actions here
export const encrypt = internalAction({ ... });
```

**Why**: Convex Node.js runtime restriction - `"use node"` files can only contain actions.  
**Apply when**: Need Node.js APIs (crypto, fs, etc.)  
**Related**: #L140 (File system access), #L390 (Config pattern)

---

## #L100: Persistent Session Configuration [🟡 IMPORTANT]

**Symptom**: Users logged out when closing browser  
**Root Cause**: Default session cookies expire on browser close  
**Fix**:

```typescript
// ❌ WRONG: Default session cookies
const { handleAuth } = createConvexAuthHooks();

// ✅ CORRECT: Configure maxAge (Context7 validated)
import { config } from '$lib/config';

const { handleAuth } = createConvexAuthHooks({
	cookieConfig: {
		maxAge: config.auth.sessionMaxAgeSeconds // 30 days in seconds
	}
});
```

**Why**: `maxAge` sets persistent cookie duration.  
**Apply when**: Implementing authentication  
**Related**: #L390 (Centralized config)

---

## #L140: Use TypeScript Imports Not File System [🟡 IMPORTANT]

**Symptom**: `readFileSync` fails in Convex, or `InvalidConfig: hyphens in filename`  
**Root Cause**: Convex serverless doesn't support file system reads, and requires camelCase names  
**Fix**:

```typescript
// ❌ WRONG: File system access
'use node';
import { readFileSync } from 'fs';

export function loadPrompt(name: string) {
	return readFileSync(`./prompts/${name}.xml`, 'utf-8'); // ❌ Fails in serverless
}

// ❌ WRONG: Hyphen in filename
// convex/prompt-utils.ts  // ❌ InvalidConfig error

// ✅ CORRECT: TypeScript imports (Context7 validated)
// convex/prompts/flashcardGeneration.ts
export const flashcardTemplate = `<prompt>...</prompt>`; // ✅ String export

// convex/promptUtils.ts (camelCase, no hyphens)
import { flashcardTemplate } from './prompts/flashcardGeneration';

const templates: Record<string, string> = {
	'flashcard-generation': flashcardTemplate
};

export function loadPrompt(name: string): string {
	const template = templates[name];
	if (!template) throw new Error(`Prompt "${name}" not found`);
	return template;
}
```

**Why**: TypeScript imports bundled reliably by Convex, no file system needed.  
**File Naming Rules**: Only alphanumeric, underscores, periods. Use camelCase: `promptUtils.ts` ✅, `prompt-utils.ts` ❌  
**Apply when**: Loading templates, prompts, or static content in Convex  
**Related**: #L50 ("use node" restrictions)

---

## #L190: File=Noun, Function=Verb Naming [🟡 IMPORTANT]

**Symptom**: Redundant API paths like `api.generateFlashcard.generateFlashcard`  
**Root Cause**: File name matches function name  
**Fix**:

```typescript
// ❌ WRONG: File name matches function name
// convex/generateFlashcard.ts
export const generateFlashcard = action({ ... });
// Result: api.generateFlashcard.generateFlashcard ❌ Redundant

// ✅ CORRECT: File = domain (noun), Function = action (verb)
// convex/flashcards.ts
export const generate = action({ ... });
// Result: api.flashcards.generate ✅ Clean

// Or if single-purpose:
// convex/flashcardGeneration.ts (module name)
export const generateFlashcard = action({ ... });
// Result: api.flashcardGeneration.generateFlashcard ✅ Clear
```

**Naming Rules**:

- **Files**: Domain/module names (nouns) - `flashcards.ts`, `inbox.ts`, `flashcardGeneration.ts`
- **Functions**: Actions/verbs - `create`, `list`, `generate`, `sync`
- **Result**: Clean paths - `api.flashcards.create`, `api.inbox.list`

**Apply when**: Creating new Convex functions  
**Related**: #L140 (File naming), #L240 (Type definitions)

---

## #L240: Shared Type Definitions [🟢 REFERENCE]

**Symptom**: Using `any` everywhere, losing type safety  
**Root Cause**: No shared types for Convex client and API functions  
**Fix**:

```typescript
// ❌ WRONG: any everywhere
export function useInboxSync(
	convexClient: any, // ❌ No type safety
	inboxApi: any // ❌ No IntelliSense
) {}

// ✅ CORRECT: Shared types (Context7 validated)
// src/lib/types/convex.ts
import type { FunctionReference } from 'convex/server';

export interface ConvexClient {
	query<Q extends FunctionReference<'query'>>(query: Q, args?: unknown): Promise<unknown>;
	action<A extends FunctionReference<'action'>>(action: A, args?: unknown): Promise<unknown>;
	mutation<M extends FunctionReference<'mutation'>>(mutation: M, args?: unknown): Promise<unknown>;
}

export interface InboxApi {
	listInboxItems: FunctionReference<'query', 'public', { processed?: boolean }>;
	syncReadwiseHighlights: FunctionReference<'action', 'public', { dateRange?: string }>;
}

// Usage
export function useInboxSync(
	convexClient: ConvexClient | null, // ✅ Type safe
	inboxApi: InboxApi | null // ✅ IntelliSense works
) {
	const items = (await convexClient.query(inboxApi.listInboxItems, {})) as InboxItem[];
}
```

**Why**: Shared types provide IntelliSense, compile-time checks, and documentation.  
**Apply when**: Creating composables or utilities using Convex  
**Related**: #L290 (Discriminated unions)

---

## #L290: Discriminated Union Types [🟢 REFERENCE]

**Symptom**: Can't narrow types on polymorphic data (inbox items with different types)  
**Root Cause**: Using `any` or union without discriminator field  
**Fix**:

```typescript
// ❌ WRONG: No discriminator
type InboxItem = {
	_id: string;
	highlightId?: string; // ❌ Optional, hard to narrow
	text?: string; // ❌ Optional, hard to narrow
};

// ✅ CORRECT: Discriminated union (Context7 validated)
type BaseInboxItem = {
	_id: string;
	type: 'readwise_highlight' | 'photo_note' | 'manual_text'; // Discriminator
	userId: string;
	processed: boolean;
};

type ReadwiseHighlight = BaseInboxItem & {
	type: 'readwise_highlight'; // ✅ Literal type
	highlightId: string;
	highlight: { text: string } | null;
};

type PhotoNote = BaseInboxItem & {
	type: 'photo_note';
	imageFileId?: string;
};

type ManualText = BaseInboxItem & {
	type: 'manual_text';
	text?: string;
};

type InboxItemWithDetails = ReadwiseHighlight | PhotoNote | ManualText;

// Usage with type narrowing
function process(item: InboxItemWithDetails) {
	if (item.type === 'readwise_highlight') {
		console.log(item.highlight?.text); // ✅ TypeScript knows highlight exists
	} else if (item.type === 'photo_note') {
		console.log(item.imageFileId); // ✅ TypeScript knows imageFileId exists
	}
}
```

**Why**: Discriminator field enables TypeScript type narrowing with if/switch.  
**Apply when**: Working with polymorphic data structures  
**Related**: #L240 (Shared types), #L340 (Enum conversion)

---

## #L340: Enum to Database String Conversion [🟢 REFERENCE]

**Symptom**: TypeScript error casting enum to string literal  
**Root Cause**: External library uses enums, database uses strings  
**Fix**:

```typescript
// ❌ WRONG: Direct casting fails
import { State } from 'ts-fsrs';
fsrsState: newCard.state as 'new' | 'learning'; // ❌ TypeScript error

// ✅ CORRECT: Explicit conversion functions
function stateToString(state: State): 'new' | 'learning' | 'review' | 'relearning' {
	switch (state) {
		case State.New:
			return 'new';
		case State.Learning:
			return 'learning';
		case State.Review:
			return 'review';
		case State.Relearning:
			return 'relearning';
		default:
			return 'new';
	}
}

function stringToState(state: string): State {
	switch (state) {
		case 'new':
			return State.New;
		case 'learning':
			return State.Learning;
		case 'review':
			return State.Review;
		case 'relearning':
			return State.Relearning;
		default:
			return State.New;
	}
}

// Usage
await ctx.db.insert('flashcards', {
	fsrsState: stateToString(card.state) // ✅ Convert enum to string
});

const card: Card = {
	state: stringToState(flashcard.fsrsState) // ✅ Convert string to enum
};
```

**Why**: Explicit conversion ensures type safety and handles all enum cases.  
**Apply when**: Integrating external libraries with enums  
**Related**: #L290 (Discriminated unions)

---

## #L390: Centralized Configuration [🟢 REFERENCE]

**Symptom**: Settings scattered across codebase, magic numbers  
**Root Cause**: No single source of truth for app-wide settings  
**Fix**:

```typescript
// ❌ WRONG: Hardcoded values
const { handleAuth } = createConvexAuthHooks({
	cookieConfig: { maxAge: 2592000 } // ❌ What is this number?
});

// ✅ CORRECT: Centralized config
// src/lib/config.ts
const SESSION_DURATION_DAYS = 30;

export const config = {
	auth: {
		sessionDurationDays: SESSION_DURATION_DAYS,
		sessionMaxAgeSeconds: SESSION_DURATION_DAYS * 24 * 60 * 60
	}
} as const;

// hooks.server.ts
import { config } from '$lib/config';

const { handleAuth } = createConvexAuthHooks({
	cookieConfig: { maxAge: config.auth.sessionMaxAgeSeconds } // ✅ Clear
});
```

**Why**: Single config file makes settings discoverable and maintainable.  
**Apply when**: Adding app-wide settings (timeouts, durations, feature flags)  
**Related**: #L100 (Session config), #L50 (Runtime patterns)

---

## #L440: Reusable Entity Tagging Pattern [🟢 REFERENCE]

**Symptom**: Duplicating tag assignment logic for each entity type (highlights, flashcards, notes)  
**Root Cause**: No shared helper function for common tag operations  
**Fix**:

```typescript
// ❌ WRONG: Duplicate mutations for each entity
export const assignTagsToHighlight = mutation({
	handler: async (ctx, args) => {
		// ... 50 lines of validation and assignment logic
	}
});

export const assignTagsToFlashcard = mutation({
	handler: async (ctx, args) => {
		// ... SAME 50 lines of validation and assignment logic
	}
});

// ✅ CORRECT: Shared helper with type-safe wrappers (Context7 validated)

// Helper function (private, reduces duplication)
async function assignTagsToEntity(
	ctx: MutationCtx,
	userId: Id<'users'>,
	entityType: 'highlights' | 'flashcards',
	entityId: Id<any>,
	tagIds: Id<'tags'>[]
) {
	// 1. Validate entity ownership
	// 2. Validate tag access
	// 3. Clear old assignments from junction table
	// 4. Create new assignments
}

// Type-safe public mutations (one per entity)
export const assignTagsToHighlight = mutation({
	args: {
		highlightId: v.id('highlights'),
		tagIds: v.array(v.id('tags'))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		return await assignTagsToEntity(ctx, userId, 'highlights', args.highlightId, args.tagIds);
	}
});

export const assignTagsToFlashcard = mutation({
	args: {
		flashcardId: v.id('flashcards'),
		tagIds: v.array(v.id('tags'))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		return await assignTagsToEntity(ctx, userId, 'flashcards', args.flashcardId, args.tagIds);
	}
});
```

**Frontend Composable** (Svelte 5 pattern):

```typescript
// src/lib/composables/useTagging.svelte.ts
export function useTagging(entityType: 'highlight' | 'flashcard') {
	const state = $state({ isAssigning: false, error: null });
	const convexClient = browser ? useConvexClient() : null;

	// Dynamic mutation reference: 'tags:assignTagsToHighlight', 'tags:assignTagsToFlashcard'
	const mutation = browser
		? makeFunctionReference(`tags:assignTagsTo${capitalize(entityType)}`)
		: null;

	async function assignTags(entityId: Id<any>, tagIds: Id<'tags'>[]) {
		await convexClient.mutation(mutation, {
			[`${entityType}Id`]: entityId,
			tagIds
		});
	}

	return {
		get isAssigning() {
			return state.isAssigning;
		},
		assignTags
	};
}

// Usage in any component
const tagging = useTagging('flashcard');
await tagging.assignTags(flashcardId, [tag1, tag2]);
```

**Benefits**:

- ✅ Type-safe mutations (Convex validators per entity)
- ✅ ~70% code reduction (shared helper)
- ✅ Easy to extend (~30 min per new entity)
- ✅ Reusable UI component (TagSelector)
- ✅ No breaking changes (existing code works)

**Schema Requirements**:

- Junction table per entity: `highlightTags`, `flashcardTags`
- Index: `by_highlight`, `by_flashcard`, `by_tag`
- Same structure: `{ entityId, tagId }`

**Why**: Shared helper reduces duplication while maintaining type safety at mutation boundaries.  
**Apply when**: Implementing tagging for new entity types  
**Related**: #L240 (Type safety), #L190 (Naming conventions)  
**See**: `4-archive/TAGGING_SYSTEM_ANALYSIS.md` for full architecture

---

## #L490: Convex Timestamps Are Numbers Not Dates [🟡 IMPORTANT]

**Symptom**: `TypeError: item.createdAt.toLocaleDateString is not a function`  
**Root Cause**: Convex returns timestamps as numbers (milliseconds since epoch), not JavaScript `Date` objects  
**Fix**:

```typescript
// ❌ WRONG: Calling date methods directly on Convex timestamp
<span>Added {item.createdAt.toLocaleDateString()}</span>
// TypeError: item.createdAt.toLocaleDateString is not a function

// ✅ CORRECT: Wrap in new Date() first
<span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
```

**Why**: Convex stores dates as numbers for efficient serialization/comparison. JavaScript Date methods must be called on Date objects.  
**Apply when**: Displaying any Convex timestamp field (createdAt, updatedAt, etc.)  
**Related**: #L10 (Serializable values), #L240 (Type definitions)

**Common Fields**:

- `createdAt` - When the record was created
- `updatedAt` - When the record was last modified
- Any custom timestamp field

---

## #L540: Separate Convex & Vercel Deployments [🔴 CRITICAL]

**Symptom**: Vercel build fails with `Could not resolve "./_generated/dataModel"` - circular dependency during `convex deploy`  
**Root Cause**: Trying to run `convex deploy` in Vercel creates chicken-and-egg: convex bundles functions that import `_generated` types, but `_generated` doesn't exist yet!  
**Fix**:

**1. Commit `_generated` to Git** (Context7 validated - official Convex best practice)

```bash
# Remove from .gitignore
- convex/_generated

# Add to git
git add convex/_generated/
git commit -m "fix: commit convex/_generated per Convex docs"
```

**2. Vercel: Frontend Build Only**

```json
// vercel.json
{
	"buildCommand": "npm run build" // ✅ JUST frontend - no convex deploy
}
```

**3. Convex: Deploy Separately via GitHub Integration**

In [Convex Dashboard](https://dashboard.convex.dev):

- Settings → GitHub Integration
- Connect repo: `synergyai-os/Synergy-Open-Source`
- Branch: `main`
- Path: `convex/` (default)

**Why This Works**:

1. `_generated` files exist in git → Vite can import them → build succeeds ✅
2. Convex deploys independently on push → no circular dependency ✅
3. Separation of concerns → frontend build fast (~30s) ✅

**Environment Variables** (Vercel Project Settings - Frontend Only):

```bash
PUBLIC_CONVEX_URL=https://prestigious-whale-251.convex.cloud  # Production URL
CONVEX_SITE_URL=https://www.synergyos.ai  # Your domain for auth redirects
PUBLIC_POSTHOG_KEY=phc_xxx  # Analytics
PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

**Note**: `CONVEX_DEPLOY_KEY` **NOT** needed in Vercel (GitHub Integration handles deployment)

**svelte.config.js**:

```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter(),
		alias: {
			$convex: './convex' // ✅ Required for $convex/_generated imports
		}
	}
};
```

**Why Old Approach Failed**:

- ❌ `npx convex codegen` → tries to bundle functions → imports `_generated` → doesn't exist → fail
- ❌ `npx convex deploy` → same bundling issue → circular dependency
- ❌ Adding `_generated` THEN deploying → timing issues, cache problems

**Why New Approach Works**:

- ✅ `_generated` in git → always present → no bundling chicken-and-egg
- ✅ Convex deploys separately → dedicated environment → reliable
- ✅ Vercel fast → no Convex CLI overhead → 30s builds

**Migration Steps**:

1. Locally: `npx convex codegen` to generate types
2. Remove `convex/_generated` from `.gitignore`
3. Commit `_generated` files to git
4. Update `vercel.json` to just `npm run build`
5. Set up Convex GitHub Integration
6. Push to GitHub → watch both deploy independently!

**Common Mistakes**:

- ❌ Forgetting to commit `_generated` to git (build will fail)
- ❌ Missing `$convex` alias in svelte.config.js (Rollup can't resolve)
- ❌ Wrong `PUBLIC_CONVEX_URL` (using .site instead of .cloud)
- ❌ Trailing slash in `PUBLIC_CONVEX_URL` (causes double slash in WebSocket)

**Apply when**: Deploying SvelteKit + Convex to Vercel  
**Related**: #L50 (Runtime restrictions), #L140 (File system)
**Source**: [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/other-recommendations)

## #L590: Type-Only Imports for \_generated Files [🔴 CRITICAL]

**Symptom**: Deployment fails with `Could not resolve "./_generated/dataModel"` during bundling  
**Root Cause**: esbuild tries to resolve runtime imports during bundling, but `dataModel.js` doesn't exist (only `.d.ts` type definitions)  
**Fix**:

```typescript
// ❌ WRONG - Runtime import (esbuild tries to bundle)
import { Doc, Id } from './_generated/dataModel';

// ✅ CORRECT - Type-only import (stripped during bundling)
import type { Doc, Id } from './_generated/dataModel';
import type { DataModel } from './_generated/dataModel';
```

**Why This Works**:

- Type-only imports are erased during transpilation
- esbuild doesn't try to resolve them as runtime dependencies
- No circular dependency during `npx convex deploy`

**Common Files to Fix**:

- `convex/auth.ts` - DataModel imports
- `convex/featureFlags.ts` - Doc, Id imports
- `convex/teams.ts` - Doc, Id imports
- `convex/tags.ts` - Doc, Id imports
- `convex/organizations.ts` - Doc, Id imports
- `convex/permissions.ts` - Id imports
- `convex/flashcards.ts` - Id imports

**Apply when**: Any import from `_generated/dataModel` in Convex function files  
**Related**: #L540 (Separate deployments), #L50 (Runtime restrictions)

---

## #L640: Silent Deployment Failures from Git Conflicts [🔴 CRITICAL]

**Symptom**: Query returns empty results even with correct args, Convex dashboard shows `ArgumentValidationError: Object contains extra field [fieldName]` for valid fields  
**Root Cause**: Git merge conflicts block Convex deployment silently, backend runs stale code without parameter changes  
**Fix**:

```bash
# 1. Check for conflict markers in Convex files
grep -r "<<<<<<< HEAD\|=======\|>>>>>>>" convex/

# 2. Resolve conflicts (take appropriate version or merge manually)
git show HEAD:convex/problematic-file.ts > convex/problematic-file.ts

# 3. OR delete non-critical files (e.g., seed data, tests)
rm convex/seed/conflicted-file.ts

# 4. Force clean deployment
npx convex deploy --yes

# 5. Verify in Convex dashboard logs (not just terminal)
# Look for deployment success + query execution logs
```

**Debugging Steps**:

1. Check `npx convex dev` terminal for compilation errors (not just warnings)
2. Open Convex dashboard → Logs tab
3. Click on failing query to see actual error (not summary)
4. Look for `ArgumentValidationError` indicating schema mismatch
5. Compare deployed schema vs local code

**Why**: Convex can't parse conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), silently skips deployment, continues serving old functions. Frontend sends new params, backend rejects them.

**Common Scenarios**:

- Cherry-picking commits between branches
- Merging branches with schema changes
- Stashing/unstashing with conflicts
- Multiple AI agents working in different branches

**Prevention**:

- Always check `npx convex dev` output after git operations
- Use `git diff --check` before committing
- Verify deployment success in Convex dashboard, not just terminal
- Delete test/seed files if they conflict (non-critical)

**Apply when**: Query fails with schema validation errors despite correct code  
**Related**: #L590 (Type imports), #L540 (Deployment issues)

---

## #L680: Convex Requires OIDC, Not Raw JWT [🟡 IMPORTANT]

**Symptom**: Custom JWT auth fails with cyclic import or "not configured"  
**Root Cause**: Convex doesn't support raw JWT authentication - requires OpenID Connect (OIDC) provider with discovery endpoint

**What We Tried** (Didn't Work):

```typescript
// ❌ This approach doesn't work with Convex
import { defineAuth } from 'convex/server'; // defineAuth doesn't exist
export default {
	providers: [
		{
			domain: 'https://www.synergyos.ai',
			applicationID: 'convex'
		}
	]
};
```

**Why It Failed**:

- Convex expects OIDC providers (Google, Auth0, WorkOS as OIDC)
- Needs discovery endpoint: `https://domain/.well-known/openid-configuration`
- Requires proper key rotation, token validation, etc.
- Raw JWT signing isn't enough

**Working Temporary Solution**:

```typescript
// Backend: Accept userId as optional parameter
export const myMutation = mutation({
	args: {
		// ... other args
		userId: v.optional(v.id('users')) // TODO: Remove once OIDC set up
	},
	handler: async (ctx, args) => {
		// Fallback pattern
		const userId = args.userId ?? (await getAuthUserId(ctx));
		if (!userId) throw new Error('Not authenticated');
		// ... rest of logic
	}
});

// Frontend: Pass userId from HTTP-only cookie
const userId = $page.data.user?.userId;
await convexClient.mutation(api.myModule.myMutation, {
	userId: userId as any
	// ... other args
});
```

**Why This Is Secure**:

- ✅ WorkOS handles authentication (OAuth)
- ✅ UserId stored in HTTP-only cookie (can't be tampered by JS)
- ✅ RBAC permission checks happen server-side
- ✅ Only routing/context info, not authentication proof

**Future: Full OIDC Setup**:

- Configure WorkOS as OIDC provider
- Set up discovery endpoint
- Use Convex's built-in OIDC validation
- Remove `userId` parameters (automatic from JWT)
- See SYOS-27 for implementation plan

**Apply when**: Implementing auth with Convex before OIDC is configured  
**Related**: SYOS-25 (canceled), SYOS-27 (future work), #L550 (Auth patterns)

---

## #L690: Git Stash Can Revert to Incomplete State [🟡 CAUTION]

**Symptom**: After `git stash`, code compiles but fails at runtime with "Not authenticated" or validation errors  
**Root Cause**: Stash reverted to a state where backend/frontend were out of sync

**What Happened**:

1. Working code: Frontend passes `userId`, backend accepts it ✅
2. Attempted JWT auth implementation (failed - needs OIDC)
3. Used `git stash` to revert changes
4. Reverted to state where:
   - Backend mutations DON'T accept `userId` parameter
   - Frontend still tries to pass `userId`
   - `getAuthUserId(ctx)` returns `null` (expected - see auth.ts comments)
   - Result: "Not authenticated" errors everywhere

**Fix Pattern**:

```typescript
// 1. Add userId parameter to backend mutations
export const myMutation = mutation({
	args: {
		// ... existing args
		userId: v.optional(v.id('users')) // Re-add this
	},
	handler: async (ctx, args) => {
		// 2. Use fallback pattern
		const userId = args.userId ?? (await getAuthUserId(ctx));
		if (!userId) throw new Error('Not authenticated');
		// ... rest
	}
});

// 3. Ensure frontend passes userId
await convexClient.mutation(api.myModule.myMutation, {
	userId: userId as any
	// ... other args
});
```

**Prevention**:

- Before `git stash`, note exactly what working state you want to return to
- After revert, check both backend args AND frontend calls are aligned
- Test a mutation immediately after revert to verify auth works
- Consider `git stash show -p` to preview what will be reverted

**Why It's Subtle**:

- Code compiles ✅ (TypeScript happy)
- No linter errors ✅
- Only fails at runtime when user triggers mutation
- Error message says "Not authenticated" (misleading - it's about parameter passing)

**Debugging Checklist**:

1. Check backend mutation args: `userId: v.optional(v.id("users"))` present?
2. Check handler: Uses `args.userId ?? await getAuthUserId(ctx)` pattern?
3. Check frontend: Passes `userId` parameter?
4. Check `convex/auth.ts`: Comments explain auth context not yet set up?

**Apply when**: After git revert operations, especially git stash  
**Related**: #L680 (JWT/OIDC), #L640 (Silent failures)

---

## #L700: Bugbot Finds Critical Logic Bugs [🔴 CRITICAL]

**Symptom**: Code compiles, tests pass, but automated code review (Bugbot) finds logic bugs that would break production  
**Root Cause**: AI code review tools catch architectural mismatches and logic errors that static analysis misses

**What Happened** (RBAC Implementation):

1. ✅ Code compiled successfully
2. ✅ Manual testing worked
3. ✅ CI passed (type errors temporarily disabled)
4. 🤖 **Bugbot found 3 critical bugs**:
   - **Role Conflation**: Using legacy `teamMembers.role` instead of RBAC `userRoles` table
   - **Team-Scoped Permissions Broken**: "own" scope checked `resourceOwnerId` but Team Leads identified by `teamId` in RBAC
   - **Silent Permission Failures**: Missing `resourceOwnerId` for "own" scope silently failed instead of denying

**Why Static Analysis Missed It**:

- TypeScript only checks types, not business logic
- Tests didn't cover edge cases (Team Lead scenarios)
- Manual testing used Admin role (always works)

**Bugbot Value**:

- ✅ Found architectural mismatches (old vs new role system)
- ✅ Caught undefined behavior paths (silent failures)
- ✅ Identified logic errors before production

**Fix Pattern**:

```typescript
// ❌ WRONG: Using legacy role field
resourceOwnerId: membership?.role === 'admin' ? userId : undefined;

// ✅ CORRECT: RBAC handles scoping via teamId in userRoles table
// Don't pass resourceOwnerId - RBAC checks teamId scope automatically
await requirePermission(ctx, userId, 'teams.update', {
	organizationId: team.organizationId,
	teamId: args.teamId,
	resourceType: 'team',
	resourceId: args.teamId
	// Note: resourceOwnerId not used - RBAC handles scoping via teamId
});

// ✅ CORRECT: Handle "own" scope with team-scoped roles
if (perm.scope === 'own') {
	// CASE 1: Team-scoped permission (Team Lead managing their team)
	if (context?.teamId && !context.resourceOwnerId) {
		// getUserPermissions already filtered to roles with matching teamId
		return true; // User has team-scoped role for this team
	}
	// CASE 2: Resource ownership check
	if (context?.resourceOwnerId) {
		return context.resourceOwnerId === userId;
	}
	// CASE 3: No ownership info - deny explicitly
	return false;
}
```

**Prevention**:

- ✅ Enable automated code review (Bugbot, CodeQL, etc.)
- ✅ Review Bugbot findings before merging
- ✅ Test with different roles (not just Admin)
- ✅ Document architectural decisions (old vs new systems)

**Apply when**: Using automated code review tools or implementing new systems alongside legacy code  
**Related**: #L640 (Silent failures), #L680 (Auth patterns)

---

## #L750: Convex Production vs Dev Deployment [🟡 IMPORTANT]

**Symptom**: Code works locally but production database is empty, or deploying to wrong environment  
**Root Cause**: Convex has separate dev and production deployments, need explicit deploy key

**What Happened**:

1. ✅ Merged RBAC to `main` (production)
2. ✅ Deployed with `npx convex deploy` → deployed to **dev** (`blissful-lynx-970`)
3. ❌ Production (`prestigious-whale-251`) still empty
4. ❌ User looking at production dashboard sees empty database

**Why It Happened**:

- `npx convex deploy` defaults to dev deployment
- Production requires `CONVEX_DEPLOY_KEY_PROD` environment variable
- No visual indication which deployment you're targeting

**Fix Pattern**:

```bash
# ❌ WRONG: Deploys to dev by default
npx convex deploy

# ✅ CORRECT: Deploy to production using deploy key
CONVEX_DEPLOY_KEY="prod:prestigious-whale-251|eyJ2MiI6..." npx convex deploy --yes

# Or use env file
echo "CONVEX_DEPLOYMENT=prestigious-whale-251" > .env.production
npx convex deploy --env-file .env.production --yes
```

**Deployment Workflow**:

```bash
# 1. Deploy functions to production
CONVEX_DEPLOY_KEY="prod:prestigious-whale-251|..." npx convex deploy --yes

# 2. Seed data in production
CONVEX_DEPLOY_KEY="prod:prestigious-whale-251|..." npx convex run rbac/seedRBAC:seedRBAC '{}'

# 3. Assign roles in production
CONVEX_DEPLOY_KEY="prod:prestigious-whale-251|..." npx convex run rbac/setupAdmin:setupAdmin '{"userId":"..."}'
```

**Verification**:

- Check Convex dashboard URL: `prestigious-whale-251` = production
- Verify deployment in dashboard → Logs tab
- Check data exists in production tables

**Prevention**:

- Always check which deployment you're targeting
- Use `CONVEX_DEPLOY_KEY_PROD` from `.env.local`
- Verify in Convex dashboard after deployment
- Document production deployment steps

**Apply when**: Deploying to production or working with multiple Convex environments  
**Related**: #L640 (Deployment issues), #L510 (Auth deployment)

---

## #L800: Branch Cleanup Before Deletion [🟡 IMPORTANT]

**Symptom**: After merging feature branch to main, other branches become outdated and will cause conflicts later  
**Root Cause**: Feature branches don't automatically update when main changes

**What Happened**:

1. ✅ Merged `feature/team-access-permissions` → `main`
2. ✅ Deleted feature branch
3. ⚠️ Other branches (`feature/ai-docs-system`, `feature/multi-workspace-auth`) still behind main
4. ⚠️ Future merges will have conflicts

**Why It Matters**:

- Other branches missing RBAC foundation
- Will cause merge conflicts when they're merged
- Risk of losing work or breaking code

**Fix Pattern**:

```bash
# ✅ CORRECT: Update all feature branches before deleting merged branch

# 1. Switch to feature branch
git checkout feature/ai-docs-system

# 2. Merge main into feature branch (brings it up to date)
git merge main --no-edit -X theirs
# -X theirs: Prefer main's version for conflicts (production code)

# 3. Push updated branch
git push origin feature/ai-docs-system

# 4. Repeat for all active branches
git checkout feature/multi-workspace-auth
git merge main --no-edit -X theirs
git push origin feature/multi-workspace-auth

# 5. Now safe to delete merged branch
git checkout main
git branch -d feature/team-access-permissions
git push origin --delete feature/team-access-permissions
```

**Merge Strategy**:

- `-X theirs`: Prefer main's version for conflicts (production code is source of truth)
- `--no-edit`: Use default merge message
- Verify branch's unique commits are preserved: `git log feature/branch ^main`

**When to Update Branches**:

- ✅ After merging major feature to main
- ✅ Before deleting merged branch
- ✅ Before starting new work on feature branch
- ❌ Don't update if branch is abandoned/archived

**Prevention**:

- Update branches immediately after merge
- Document branch cleanup in PR template
- Use branch protection rules (require up-to-date)
- Regular branch audits (delete stale branches)

**Apply when**: Cleaning up branches after merge or maintaining multiple feature branches  
**Related**: #L640 (Git conflicts), #L690 (Git stash issues)

---

## #L850: Missing Destructuring from validateSessionAndGetUserId [🔴 CRITICAL]

**Symptom**: Database queries fail with type errors, userId is an object instead of string  
**Root Cause**: `validateSessionAndGetUserId()` returns `{ userId, session }` but code assigns directly  
**Fix**:

```typescript
// ❌ WRONG: Missing destructuring (userId becomes an object)
const userId = await validateSessionAndGetUserId(ctx, args.sessionId);
// userId is now { userId: "...", session: {...} } not a string!

const tags = await ctx.db
	.query('tags')
	.withIndex('by_user', (q) => q.eq('userId', userId)) // ❌ Fails - expects string, got object
	.collect();

// ✅ CORRECT: Destructure to extract userId
const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
// userId is now the string ID

const tags = await ctx.db
	.query('tags')
	.withIndex('by_user', (q) => q.eq('userId', userId)) // ✅ Works
	.collect();
```

**Why**: Function returns object with two properties, must destructure to get the ID string.  
**Apply when**: Any Convex function using `validateSessionAndGetUserId()`  
**Related**: #L240 (Type definitions), #L900 (Integration testing catches this)

**Prevention**:

- Static analysis: `scripts/check-sessionid-usage.sh` catches missing destructuring
- Integration tests: Would fail immediately with type error
- ESLint rule: Can detect missing destructuring from known functions

---

## #L900: Integration Testing with convex-test [🟡 IMPORTANT]

**Symptom**: Unit tests pass but bugs slip through to production  
**Root Cause**: Unit tests mock dependencies, don't catch integration issues  
**Fix**:

```typescript
// Unit tests (isolated) - don't catch destructuring bugs
describe('validateSessionAndGetUserId', () => {
	it('returns userId', async () => {
		const result = await validateSessionAndGetUserId(ctx, sessionId);
		expect(result.userId).toBe(validUserId); // ✅ Test uses correct pattern
	});
});

// But real code has bug:
const userId = await validateSessionAndGetUserId(ctx, args.sessionId); // ❌ Bug not caught!

// ✅ CORRECT: Integration tests run actual functions
import { convexTest } from 'convex-test';
import { api } from '../../../convex/_generated/api';
import { createTestSession } from './setup';

describe('Tags Integration', () => {
	it('should list tags', async () => {
		const t = convexTest();
		const { sessionId, userId } = await createTestSession(t);

		// Runs actual Convex function - would fail if destructuring missing
		const tags = await t.query(api.tags.listTags, { sessionId });

		expect(tags).toBeDefined();
		expect(Array.isArray(tags)).toBe(true);
	});
});
```

**Test Structure**:

```
tests/convex/integration/
├── README.md           - Documentation
├── setup.ts            - Test helpers (createTestSession, cleanup)
├── tags.integration.test.ts
├── flashcards.integration.test.ts
└── [module].integration.test.ts
```

**Test Helpers**:

```typescript
// setup.ts
export async function createTestSession(t: ConvexTestingHelper) {
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert('users', {
			email: `test-${Date.now()}@example.com`,
			name: 'Test User'
		});
	});

	const sessionId = `test_session_${Date.now()}`;
	await t.run(async (ctx) => {
		await ctx.db.insert('authSessions', {
			sessionId,
			convexUserId: userId,
			isValid: true,
			expiresAt: Date.now() + 3600000
		});
	});

	return { sessionId, userId };
}
```

**What Integration Tests Catch**:

- ✅ Missing destructuring (type errors)
- ✅ Database query errors (indexes, field names)
- ✅ Auth flow bugs (session validation)
- ✅ Return value contracts (shape mismatches)
- ✅ User isolation (data leaks)

**Performance**: < 30 seconds for full suite (vs minutes for E2E)

**CI Integration**:

```json
// package.json
{
	"scripts": {
		"test:integration": "vitest --run tests/convex/integration",
		"precommit": "npm run test:sessionid && npm run test:integration"
	}
}
```

**Why**: Integration tests bridge the gap between unit tests and E2E tests.  
**Apply when**: Testing Convex functions end-to-end without full UI  
**Related**: #L850 (Would catch destructuring bugs), #L240 (Type safety)

---

---

## #L950: convex-test Requires Modules Map [🔴 CRITICAL]

**Symptom**: `TypeError: (intermediate value).glob is not a function` from convex-test  
**Root Cause**: convex-test needs `import.meta.glob()` map of Convex functions to mock the backend  
**Fix**:

```typescript
// ❌ WRONG: Missing modules parameter
const t = convexTest(schema); // ❌ Fails with .glob error

// ✅ CORRECT: Create test.setup.ts with modules map
// tests/convex/integration/test.setup.ts
export const modules = import.meta.glob("../../../convex/**/!(*.*.*)*.*s");
// Pattern: Match all .ts/.js files in convex/, exclude files with multiple dots (*.test.ts, *.config.ts)

// Pass both schema AND modules to convexTest
import { convexTest } from 'convex-test';
import schema from '../../../convex/schema';
import { modules } from './test.setup';

const t = convexTest(schema, modules); // ✅ Works
```

**Why**: convex-test uses `import.meta.glob()` to discover and bundle Convex function files for the mock backend.  
**Apply when**: Setting up convex-test for integration testing  
**Related**: #L900 (Integration testing pattern)

---

## #L1000: Schema Validation Errors in Tests [🔴 CRITICAL]

**Symptom**: `Validator error: Missing required field X in object` during test data insertion  
**Root Cause**: Test helpers don't match actual schema requirements  
**Fix**:

```typescript
// ❌ WRONG: Missing required fields
await ctx.db.insert('users', {
	workosId: `test_${now}`,
	email: `test@example.com`,
	// ❌ Missing: firstName, lastName, emailVerified, updatedAt, lastLoginAt
});

// ✅ CORRECT: Include ALL schema-required fields
await ctx.db.insert('users', {
	workosId: `test_workos_${now}`,
	email: `test-${now}@example.com`,
	name: 'Test User',
	firstName: 'Test',       // ✅ Required
	lastName: 'User',        // ✅ Required
	emailVerified: true,     // ✅ Required
	createdAt: now,
	updatedAt: now,          // ✅ Required
	lastLoginAt: now         // ✅ Required
});

// Common missing fields by table:
// - users: firstName, lastName, emailVerified, updatedAt, lastLoginAt
// - authSessions: workosSessionId, accessTokenCiphertext, refreshTokenCiphertext, csrfTokenHash, userSnapshot
// - roles: updatedAt
// - permissions: requiresResource, isSystem, updatedAt
// - tags: displayName, createdAt
// - userRoles: assignedBy, assignedAt
```

**Debugging Pattern**:
1. Run integration tests
2. Note `Validator error: Missing required field X`
3. Check `convex/schema.ts` for table definition
4. Update test helper in `tests/convex/integration/setup.ts`
5. Re-run tests to verify

**Why**: Integration tests validate against actual schema, not mocked types.  
**Apply when**: Creating test data helpers for convex-test  
**Related**: #L950 (convex-test setup), #L900 (Integration testing)

---

## #L1050: Cleanup Must Check Document Existence [🟡 IMPORTANT]

**Symptom**: `Error: Delete on non-existent doc` during test cleanup  
**Root Cause**: Document may have been deleted by test or cascade deleted  
**Fix**:

```typescript
// ❌ WRONG: Assumes document exists
await ctx.db.delete(userId); // ❌ Fails if user already deleted

// ✅ CORRECT: Check existence first
const user = await ctx.db.get(userId);
if (user) {
	await ctx.db.delete(userId); // ✅ Safe
}

// ✅ CORRECT: Cleanup pattern for test helpers
export async function cleanupTestData(t: TestConvex<any>, userId: Id<'users'>) {
	await t.run(async (ctx) => {
		// 1. Clean up child documents first (sessions, roles, etc.)
		const sessions = await ctx.db
			.query('authSessions')
			.withIndex('by_convex_user', (q) => q.eq('convexUserId', userId))
			.collect();
		for (const session of sessions) {
			await ctx.db.delete(session._id);
		}

		// 2. Check parent exists before deleting
		const user = await ctx.db.get(userId);
		if (user) {
			await ctx.db.delete(userId); // ✅ Only delete if exists
		}
	});
}
```

**Common Cleanup Order** (child first, parent last):
1. authSessions (child of user)
2. userRoles (child of user)  
3. organizationMembers (child of user)
4. flashcards (child of user)
5. tags (child of user)
6. user (parent) - check exists

**Why**: Tests may delete documents explicitly, or cascade deletes may remove them.  
**Apply when**: Writing test cleanup functions  
**Related**: #L1000 (Schema validation), #L900 (Integration testing)

---

## #L1100: User Isolation Requires Unique Sessions [🟡 IMPORTANT]

**Symptom**: `expected 1 to be +0` - User 2 sees User 1's data in isolation tests  
**Root Cause**: Sessions created in same millisecond have identical timestamps, causing collisions  
**Fix**:

```typescript
// ❌ WRONG: Timestamp alone not unique enough
const sessionId = `test_session_${Date.now()}`;
// Multiple calls in same millisecond → same ID → collision

// ✅ CORRECT: Counter + timestamp for uniqueness
let sessionCounter = 0; // Module-level counter

export async function createTestSession(t: TestConvex<any>) {
	const now = Date.now();
	const uniqueId = `${now}_${sessionCounter++}`; // ✅ Always unique

	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert('users', {
			workosId: `test_workos_${uniqueId}`,    // ✅ Unique
			email: `test-${uniqueId}@example.com`,  // ✅ Unique
			// ... other fields
		});
	});

	const sessionId = `test_session_${uniqueId}`; // ✅ Unique
	await t.run(async (ctx) => {
		await ctx.db.insert('authSessions', {
			sessionId,
			convexUserId: userId,
			// ... other fields
		});
	});

	return { sessionId, userId };
}
```

**Why This Matters**: User isolation tests create multiple users rapidly. Without counter, sessions can collide.

**Test Pattern**:
```typescript
// User isolation test (now works correctly)
it('should enforce user isolation', async () => {
	const t = convexTest(schema, modules);

	const { sessionId: session1, userId: user1 } = await createTestSession(t);
	const { sessionId: session2, userId: user2 } = await createTestSession(t);
	// ✅ Counter ensures session1 !== session2

	await createTestTag(t, user1, 'User 1 Tag');

	const user2Tags = await t.query(api.tags.listUserTags, { sessionId: session2 });
	expect(user2Tags.length).toBe(0); // ✅ Now passes
});
```

**Why**: Counter ensures uniqueness even when tests run in same millisecond.  
**Apply when**: Creating test data helpers that need unique identifiers  
**Related**: #L950 (convex-test setup), #L900 (Integration testing)

---

## #L1150: convex-test Limitations with Context-Based Auth [🟡 CAUTION]

**Symptom**: `Session not found or expired` when testing functions using `getAuthUserId(ctx)`  
**Root Cause**: convex-test doesn't populate auth context automatically, only supports sessionId parameter pattern  
**Fix**:

```typescript
// ❌ WON'T WORK in convex-test: Context-based auth
export const removeOrganizationMember = mutation({
	args: {
		organizationId: v.id('organizations'),
		targetUserId: v.id('users')
		// ❌ No sessionId parameter
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx); // ❌ Returns null in convex-test
		if (!userId) throw new Error('Not authenticated'); // Always fails in tests
		// ...
	}
});

// ✅ WORKS in convex-test: sessionId parameter pattern
export const createOrganization = mutation({
	args: {
		name: v.string(),
		sessionId: v.string() // ✅ Explicit parameter
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId); // ✅ Works
		// ...
	}
});

// ✅ WORKAROUND: Skip tests for context-based auth functions
it.skip('should remove organization member', async () => {
	// TODO: This test requires context-based auth which isn't supported by convex-test yet
	// Will work once migrated to sessionId parameter pattern
});
```

**Migration Path**:
1. Identify functions using `getAuthUserId(ctx)` without sessionId parameter
2. Either: Add `sessionId` parameter (preferred) OR skip integration tests
3. Document with TODO comment explaining the limitation

**Why**: convex-test is a mock backend that doesn't populate auth context from Convex Auth library.  
**Apply when**: Migrating codebase to sessionId pattern or writing integration tests  
**Related**: #L850 (validateSessionAndGetUserId pattern), #L900 (Integration testing)

---

**Pattern Count**: 26  
**Last Validated**: 2025-11-12  
**Context7 Source**: `/get-convex/convex-backend`, `convex-test` NPM docs
