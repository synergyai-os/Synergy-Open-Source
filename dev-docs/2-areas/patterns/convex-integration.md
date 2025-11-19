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

## #L370: Distinguish API-Synced vs Manual Data [🟡 IMPORTANT]

**Symptom**: UI feature shows for manual entries when it should only show for API-synced items  
**Root Cause**: Both manual and API-synced data use same discriminated union type, need secondary check  
**Fix**:

```typescript
// Schema: Both use same type but different metadata
// convex/schema.ts
highlights: defineTable({
  externalId: v.string(), // Both have this (manual uses "manual_timestamp")
  lastSyncedAt: v.optional(v.number()), // ✅ Only API-synced highlights have this
  // ...
})

// Manual creation (no lastSyncedAt)
// convex/inbox.ts
const highlightId = await ctx.db.insert('highlights', {
  externalId: `manual_${Date.now()}`, // Has externalId
  // lastSyncedAt: undefined ❌ Not set for manual entries
});

// API sync (has lastSyncedAt)
// convex/syncReadwise.ts
const highlightId = await ctx.db.insert('highlights', {
  externalId: readwiseHighlight.id, // From API
  lastSyncedAt: Date.now() // ✅ Only synced items have this
});

// ❌ WRONG: Check type only
{#if item?.type === 'readwise_highlight'}
  <GenerateFlashcardButton /> <!-- Shows for manual entries too -->
{/if}

// ❌ WRONG: Check externalId (both have it)
{#if item?.type === 'readwise_highlight' && item?.highlight?.externalId}
  <GenerateFlashcardButton /> <!-- Still shows for manual entries -->
{/if}

// ✅ CORRECT: Check sync metadata field
{#if item?.type === 'readwise_highlight' && item?.highlight?.lastSyncedAt}
  <GenerateFlashcardButton /> <!-- Only shows for synced items -->
{/if}
```

**Why**: API-synced data has metadata fields (lastSyncedAt, externalUrl) that manual entries don't have.  
**Apply when**: Rendering features that should only apply to API-synced data (not manual entries)  
**Related**: #L290 (Discriminated unions), #L240 (Shared types)

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

## #L1200: SessionId Migration Pattern [🔴 CRITICAL]

**Symptom**: TypeScript errors "Expected 2 arguments, but got 1" or "Property 'sessionId' is missing"  
**Root Cause**: Migrating from userId parameter to sessionId-based authentication requires destructuring pattern  
**Fix**:

```typescript
// ❌ WRONG: Old userId parameter pattern
export const listTags = query({
	args: {
		userId: v.id('users') // ❌ Client can fake userId
	},
	handler: async (ctx, args) => {
		await validateSession(ctx, args.userId);
		const userId = args.userId;
		// ... query logic
	}
});

// ✅ CORRECT: SessionId with destructuring (Context7 validated)
import { validateSessionAndGetUserId } from './sessionValidation';

export const listTags = query({
	args: {
		sessionId: v.string() // ✅ Server validates session
	},
	handler: async (ctx, args) => {
		// CRITICAL: Must destructure to get userId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		// ... query logic with userId
	}
});

// Frontend usage with conditional hook creation
const tagsQuery =
	browser && getSessionId()
		? useQuery(api.tags.listAllTags, () => {
				const sessionId = getSessionId();
				if (!sessionId) throw new Error('sessionId required'); // ✅ Throw if missing (outer check ensures it exists)
				return { sessionId };
			})
		: null;
```

**Migration Checklist**:

1. **Backend (Convex)**:
   - Change `userId: v.id('users')` → `sessionId: v.string()`
   - Import `validateSessionAndGetUserId`
   - Destructure: `const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId)`
2. **Frontend (Svelte)**:
   - Change `const getUserId = () => $page.data.user?.userId` → `const getSessionId = () => $page.data.sessionId`
   - Use conditional hook creation: `browser && getSessionId() ? useQuery(...) : null`
   - Throw in args function if sessionId missing: `if (!sessionId) throw new Error('sessionId required');`
   - Type cast Ids: `organizationId as Id<'organizations'>`

3. **Tests**:
   - Update test helpers to return `{ sessionId, userId }`
   - Pass `sessionId` to query/mutation calls
   - Fix cleanup queue types

**Common Gotchas**:

```typescript
// ❌ WRONG: Missing destructuring
const userId = await validateSessionAndGetUserId(ctx, args.sessionId);
// userId is now { userId: "...", ... } object, not string!

// ✅ CORRECT: Destructure to extract userId
const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

// ❌ WRONG: Returns null when sessionId missing
const tagsQuery = useQuery(api.tags.listAllTags, () => {
	if (!sessionId) return null; // ❌ null not valid - breaks type contract
	return { sessionId };
});

// ✅ CORRECT: Use conditional hook creation with throw pattern
const tagsQuery =
	browser && getSessionId()
		? useQuery(api.tags.listAllTags, () => {
				const sessionId = getSessionId();
				if (!sessionId) throw new Error('sessionId required'); // ✅ Throw if missing (outer check ensures it exists)
				return { sessionId };
			})
		: null;
```

**Why**: SessionId pattern prevents impersonation attacks - server validates session instead of trusting client-provided userId.  
**Apply when**: Migrating from userId to sessionId authentication, or creating new authenticated queries/mutations  
**Related**: #L850 (Destructuring pattern), #L680 (Auth without JWT), #L760 (Session validation)

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
export const modules = import.meta.glob('../../../convex/**/!(*.*.*)*.*s');
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
	email: `test@example.com`
	// ❌ Missing: firstName, lastName, emailVerified, updatedAt, lastLoginAt
});

// ✅ CORRECT: Include ALL schema-required fields
await ctx.db.insert('users', {
	workosId: `test_workos_${now}`,
	email: `test-${now}@example.com`,
	name: 'Test User',
	firstName: 'Test', // ✅ Required
	lastName: 'User', // ✅ Required
	emailVerified: true, // ✅ Required
	createdAt: now,
	updatedAt: now, // ✅ Required
	lastLoginAt: now // ✅ Required
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

## #L1420: Lazy Module Loading in Layout Server [🟡 IMPORTANT]

**Symptom**: Layout server loads data for all modules upfront, even when modules are disabled via feature flags. This wastes resources and prevents true independent enablement.  
**Root Cause**: Feature flags checked but module-specific data still loaded unconditionally  
**Fix**:

```typescript
// ❌ WRONG: Loads data for all modules regardless of flags
let meetingsData = await client.query(api.meetings.listUpcoming, { sessionId });
let circlesData = await client.query(api.circles.list, { sessionId });
// Data loaded even if meetings-module or circles_ui_beta flags disabled

// ✅ CORRECT: Three-step lazy loading pattern
// STEP 1: Check feature flags FIRST (before any module-specific data loading)
let circlesEnabled = false;
let meetingsEnabled = false;
try {
	[circlesEnabled, meetingsEnabled] = await Promise.all([
		client.query(api.featureFlags.checkFlag, {
			flag: 'circles_ui_beta',
			sessionId
		}),
		client.query(api.featureFlags.checkFlag, {
			flag: 'meetings-module',
			sessionId
		})
	]);
} catch (error) {
	console.warn('Failed to load feature flags server-side:', error);
}

// STEP 2: Load CORE data (always needed, regardless of module flags)
// Organizations, teams, permissions, tags - required for all routes
const organizations = await client.query(api.organizations.listOrganizations, { sessionId });
const teams = await client.query(api.teams.listTeams, { sessionId, organizationId: activeOrgId });
// ... core data always loaded

// STEP 3: Conditionally load MODULE-SPECIFIC data (only if flags enabled)
const meetingsData: unknown =
	meetingsEnabled && activeOrgId
		? (() => {
				try {
					// Only load if module enabled
					return await client.query(api.meetings.listUpcoming, {
						sessionId,
						organizationId: activeOrgId as Id<'organizations'>
					});
				} catch (error) {
					console.warn('Failed to load meetings data server-side:', error);
					return null; // Don't block page load if optional module data fails
				}
			})()
		: null;

const circlesData: unknown =
	circlesEnabled && activeOrgId
		? (() => {
				try {
					return await client.query(api.circles.list, {
						sessionId,
						organizationId: activeOrgId as Id<'organizations'>
					});
				} catch (error) {
					console.warn('Failed to load circles data server-side:', error);
					return null;
				}
			})()
		: null;
```

**Pattern Structure**:

1. **STEP 1**: Check feature flags FIRST (before any module-specific data loading)
2. **STEP 2**: Load core data always (organizations, teams, permissions, tags)
3. **STEP 3**: Conditionally load module-specific data only if flags enabled

**Key Principles**:

- Feature flags checked BEFORE data loading (enables independent enablement)
- Core data always loaded (required for all authenticated routes)
- Module-specific data conditionally loaded (only when flags enabled)
- Graceful error handling (don't block page load if optional module data fails)

**Why**: Enables true independent module enablement - disabled modules skip unnecessary database queries, improving page load performance. Foundation for independent module deployment.  
**Apply when**: Refactoring layout server to support modular architecture, adding new module-specific data loading  
**Related**: #L1390 (Server-side preload), [feature-flags.md](../patterns/feature-flags.md), [modularity-refactoring-analysis.md](../architecture/modularity-refactoring-analysis.md)  
**See**: `src/routes/(authenticated)/+layout.server.ts` for complete implementation

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
			workosId: `test_workos_${uniqueId}`, // ✅ Unique
			email: `test-${uniqueId}@example.com` // ✅ Unique
			// ... other fields
		});
	});

	const sessionId = `test_session_${uniqueId}`; // ✅ Unique
	await t.run(async (ctx) => {
		await ctx.db.insert('authSessions', {
			sessionId,
			convexUserId: userId
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

## #L1175: Reuse Test Session for RBAC Permission Tests [🔴 CRITICAL]

**Symptom**: RBAC permission test fails with `Permission denied: users.invite` even though permissions are correctly assigned  
**Root Cause**: Test creates two separate sessions - one for RBAC setup, another for mutation - creating different users  
**Fix**:

```typescript
// ❌ WRONG: Creates two different users
it('should create organization invite with RBAC permission check', async () => {
	const t = convexTest(schema, modules);
	const { userId: adminUserId } = await createTestSession(t); // Creates user A
	const orgId = await createTestOrganization(t, 'Test Org');
	await createTestOrganizationMember(t, orgId, adminUserId, 'admin');

	// Set up RBAC permissions for adminUserId (user A)
	const adminRole = await createTestRole(t, 'admin', 'Admin');
	const invitePermission = await createTestPermission(t, 'users.invite', 'Invite Users');
	await assignPermissionToRole(t, adminRole, invitePermission, 'all');
	await assignRoleToUser(t, adminUserId, adminRole, { organizationId: orgId });

	// ❌ Creates user B (different from user A!)
	const { sessionId: adminSessionId } = await createTestSession(t);
	const result = await t.mutation(api.organizations.createOrganizationInvite, {
		sessionId: adminSessionId, // ❌ Uses user B, but RBAC is on user A
		organizationId: orgId,
		email: 'newuser@example.com',
		role: 'member'
	});
	// ❌ Fails: Permission denied: users.invite
});

// ✅ CORRECT: Use same session for RBAC setup and mutation
it('should create organization invite with RBAC permission check', async () => {
	const t = convexTest(schema, modules);
	const { userId: adminUserId, sessionId: adminSessionId } = await createTestSession(t); // ✅ Get both
	const orgId = await createTestOrganization(t, 'Test Org');
	await createTestOrganizationMember(t, orgId, adminUserId, 'admin');

	// Set up RBAC permissions for adminUserId
	const adminRole = await createTestRole(t, 'admin', 'Admin');
	const invitePermission = await createTestPermission(t, 'users.invite', 'Invite Users');
	await assignPermissionToRole(t, adminRole, invitePermission, 'all');
	await assignRoleToUser(t, adminUserId, adminRole, { organizationId: orgId });

	// ✅ Uses same sessionId (same user)
	const result = await t.mutation(api.organizations.createOrganizationInvite, {
		sessionId: adminSessionId, // ✅ Uses same user with RBAC
		organizationId: orgId,
		email: 'newuser@example.com',
		role: 'member'
	});
	// ✅ Passes: User has RBAC permissions
});
```

**Why**: Each `createTestSession()` call creates a new user. RBAC permissions are assigned to a specific `userId`. If the mutation uses a different user's `sessionId`, the permission check fails because that user doesn't have the permissions.

**Pattern**: Always destructure both `userId` and `sessionId` from a single `createTestSession()` call when you need both for RBAC setup and mutation execution.

**Apply when**: Writing integration tests that test RBAC permissions or any test where you set up permissions and then execute mutations  
**Related**: #L900 (Integration testing), #L1100 (User isolation), #L1150 (convex-test limitations)

---

## #L1700: Polymorphic Convex Schema with Union Types [🟡 IMPORTANT]

**Symptom**: Need to support multiple types of related entities (e.g., attendees can be users, circles, or teams)  
**Root Cause**: Using separate tables or optional fields without discriminator  
**Fix**:

```typescript
// ✅ CORRECT: Polymorphic schema with union type discriminator
meetingAttendees: defineTable({
	meetingId: v.id('meetings'),

	// Discriminator field (exactly one type)
	attendeeType: v.union(
		v.literal('user'),
		v.literal('role'),
		v.literal('circle'),
		v.literal('team')
	),

	// Optional fields (exactly one must be set based on attendeeType)
	userId: v.optional(v.id('users')),
	circleRoleId: v.optional(v.id('circleRoles')),
	circleId: v.optional(v.id('circles')),
	teamId: v.optional(v.id('teams')),

	addedAt: v.number()
})
	.index('by_meeting', ['meetingId'])
	.index('by_user', ['userId']),

// ✅ CORRECT: Mutation validates exactly one ID is provided
export const addAttendee = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		attendeeType: v.union(
			v.literal('user'),
			v.literal('role'),
			v.literal('circle'),
			v.literal('team')
		),
		userId: v.optional(v.id('users')),
		circleRoleId: v.optional(v.id('circleRoles')),
		circleId: v.optional(v.id('circles')),
		teamId: v.optional(v.id('teams'))
	},
	handler: async (ctx, args) => {
		// Validate exactly one attendee ID is provided
		const providedIds = [
			args.userId,
			args.circleRoleId,
			args.circleId,
			args.teamId
		].filter((id) => id !== undefined);

		if (providedIds.length !== 1) {
			throw new Error(
				'Exactly one of userId, circleRoleId, circleId, or teamId must be provided'
			);
		}

		// Check for existing attendee
		const existingAttendee = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.filter((q) => {
				if (args.attendeeType === 'user') {
					return q.and(
						q.eq(q.field('attendeeType'), 'user'),
						q.eq(q.field('userId'), args.userId)
					);
				} else if (args.attendeeType === 'circle') {
					return q.and(
						q.eq(q.field('attendeeType'), 'circle'),
						q.eq(q.field('circleId'), args.circleId)
					);
				} else if (args.attendeeType === 'team') {
					return q.and(
						q.eq(q.field('attendeeType'), 'team'),
						q.eq(q.field('teamId'), args.teamId)
					);
				}
				// ... other types
			})
			.first();

		if (existingAttendee) {
			throw new Error('Attendee already exists');
		}

		// Insert with all optional fields (only one will be set)
		await ctx.db.insert('meetingAttendees', {
			meetingId: args.meetingId,
			attendeeType: args.attendeeType,
			userId: args.userId,
			circleRoleId: args.circleRoleId,
			circleId: args.circleId,
			teamId: args.teamId,
			addedAt: Date.now()
		});
	}
});
```

**Key Points**:

1. **Discriminator field** - `attendeeType` union with literal types
2. **Optional ID fields** - One per type (userId, circleId, teamId, etc.)
3. **Validation** - Ensure exactly one ID is provided
4. **Query filtering** - Use discriminator + specific ID field for uniqueness checks
5. **Insert all fields** - Include all optional fields (only one will have value)

**Why**: Supports multiple entity types in single table while maintaining type safety and validation.  
**Apply when**: Building relationships that can reference different entity types (attendees, assignees, owners)  
**Related**: #L290 (Discriminated union types), #L1250 (Id<> type assertions)

---

---

## #L1250: Avoid `any` Type - Use Proper `Id<>` Assertions [🔴 CRITICAL]

**Symptom**: TypeScript errors "Type 'string' is not assignable to type 'Id<\"tableName\">'" or using `as any` to bypass type errors  
**Root Cause**: Convex `Id<>` types are branded strings - need explicit type assertion, not `any`  
**Fix**:

```typescript
// ❌ WRONG: Using `any` bypasses type safety
await convexClient.mutation(api.notes.updateNote, {
	sessionId,
	noteId: state.noteId as any, // ❌ Loses type safety
	title: state.title
});

// ✅ CORRECT: Use proper `Id<>` type assertion
import type { Id } from '$lib/convex';

await convexClient.mutation(api.notes.updateNote, {
	sessionId,
	noteId: state.noteId as Id<'inboxItems'>, // ✅ Type-safe assertion
	title: state.title
});

// ✅ CORRECT: For backend queries (string → Id conversion)
const settings = await ctx.db
	.query('userSettings')
	.withIndex('by_user', (q) => q.eq('userId', args.userId as Id<'users'>)) // ✅ Safe: userId is Id<"users"> at runtime
	.first();
```

**When to Use**:

- **Frontend**: When `state` has `string | null` but Convex expects `Id<"tableName">`
- **Backend**: When `sessionId` → `userId` conversion returns `string` but queries need `Id<"users">`
- **Always**: Import `Id` type from `$lib/convex` or `convex/_generated/dataModel`

**Why**: `any` disables type checking - bugs slip through. `Id<>` assertions preserve type safety while allowing necessary conversions.  
**Apply when**: Converting between `string` and `Id<>` types, or when state types don't match Convex function signatures  
**Related**: #L1200 (SessionId migration), #L850 (Type safety)

---

## #L1600: Use Top-Level Imports for Convex Doc Types [🟡 IMPORTANT]

**Symptom**: Type annotations extremely long and hard to read with inline `import()` syntax for Convex `Doc` types  
**Root Cause**: Inline `import()` syntax makes type annotations verbose and violates coding standards for readability  
**Fix**:

```typescript
// ❌ WRONG: Inline import() syntax is hard to read
let modalFlashcards = $state<Array<import('../../../../convex/_generated/dataModel').Doc<'flashcards'>>>([]);
let flashcards: Array<import('../../../../convex/_generated/dataModel').Doc<'flashcards'>> = [];

// ✅ CORRECT: Use top-level imports for consistency and readability
import type { Doc, Id } from '../../../../convex/_generated/dataModel';

let modalFlashcards = $state<Array<Doc<'flashcards'>>>([]);
let flashcards: Array<Doc<'flashcards'>> = [];
```

**When to Use**:

- **Always**: When using Convex `Doc` types in type annotations
- **Consistency**: Matches existing pattern for `Id` type imports (top-level)
- **Readability**: Makes types easier to scan and understand

**Why**: Top-level imports improve code readability and maintain consistency with how `Id` types are imported. Inline `import()` syntax makes type annotations extremely long and harder to scan.  
**Apply when**: Using Convex `Doc` types in any type annotations (variables, function parameters, return types)  
**Related**: #L1250 (Id type assertions), #L590 (import type for _generated files)

---

## #L1300: Circular API References - Use FunctionReference Type Assertions [🟡 IMPORTANT]

**Symptom**: TypeScript errors "Type of property 'X' circularly references itself" or "Property 'Y' does not exist on type '{}'"  
**Root Cause**: Convex API type generation creates circular references when module A calls `api.B.function` and module B calls `api.A.function`  
**Fix**:

```typescript
// ❌ WRONG: Direct API call causes circular reference
import { api, internal } from './_generated/api';

export const listBlogPosts = action({
	handler: async (ctx, args) => {
		const notes = await ctx.runQuery(api.notes.listNotes, {
			// ❌ Circular: blogExport → api.notes → api (includes blogExport)
			sessionId: args.sessionId,
			blogOnly: true
		});
	}
});

// ✅ CORRECT: Use FunctionReference type assertion to break circular reference
import { api, internal } from './_generated/api';
import type { FunctionReference } from 'convex/server';

export const listBlogPosts = action({
	handler: async (ctx, args) => {
		// Type assertion breaks circular reference while preserving type safety
		const listNotesQuery = api.notes.listNotes as FunctionReference<
			'query',
			'public',
			{ sessionId: string; blogOnly?: boolean },
			InboxItem[] // ✅ Explicit return type
		>;
		const notes = await ctx.runQuery(listNotesQuery, {
			sessionId: args.sessionId,
			blogOnly: true
		});
	}
});

// ✅ CORRECT: For internal API calls
const getUserIdQuery = internal.settings.getUserIdFromSessionId as FunctionReference<
	'query',
	'internal',
	{ sessionId: string },
	string | null
>;
const userId = await ctx.runQuery(getUserIdQuery, { sessionId: args.sessionId });
```

**Common Patterns**:

```typescript
// For queries
const queryRef = api.module.function as FunctionReference<'query', 'public', Args, ReturnType>;

// For mutations
const mutationRef = internal.module.function as FunctionReference<
	'mutation',
	'internal',
	Args,
	ReturnType
>;

// For actions
const actionRef = internal.module.function as FunctionReference<
	'action',
	'internal',
	Args,
	ReturnType
>;
```

**Frontend Pattern** (using `makeFunctionReference`):

```typescript
// ❌ WRONG: Using `as any` bypasses type safety
import { makeFunctionReference } from 'convex/server';

const getUserSettings = makeFunctionReference('settings:getUserSettings') as any; // ❌ No type safety
const data = await convexClient.query(getUserSettings, {});

// ✅ CORRECT: Use FunctionReference type assertion for type safety
import { makeFunctionReference } from 'convex/server';
import type { FunctionReference } from 'convex/server';
import { page } from '$app/stores';

const sessionId = $page.data.sessionId;
if (!sessionId) {
	// Handle missing sessionId
	return;
}

const getUserSettings = makeFunctionReference('settings:getUserSettings') as FunctionReference<
	'query',
	'public',
	{ sessionId: string },
	{ hasClaudeKey?: boolean; hasReadwiseKey?: boolean } | null
>;
const data = await convexClient.query(getUserSettings, { sessionId });

// ✅ CORRECT: For actions
const generateFlashcardAction = makeFunctionReference(
	'generateFlashcard:generateFlashcard'
) as FunctionReference<
	'action',
	'public',
	{ sessionId: string; text: string; sourceTitle?: string; sourceAuthor?: string },
	{ success: boolean; flashcard?: { question: string; answer: string } }
>;
const result = await convexClient.action(generateFlashcardAction, {
	sessionId,
	text: inputText.trim()
});
```

**When to Use**:

- Module A calls `api.B.function` AND module B calls `api.A.function` (circular)
- TypeScript shows "circularly references itself" error
- `internal` API shows as `{}` type (circular reference)
- **Frontend**: Using `makeFunctionReference()` - always use `FunctionReference` type assertion instead of `as any`

**Why**: Type assertions break circular references while preserving type safety. Better than `any` - still validates args/return types.  
**Apply when**: Encountering circular API reference errors in Convex backend OR using `makeFunctionReference()` in frontend code  
**Related**: #L1250 (Avoid `any`), #L1200 (SessionId migration)

---

## #L1550: Systematic `any` Type Elimination Strategy [🟢 REFERENCE]

**Symptom**: Hundreds of `any` types across codebase violating coding standards ("NEVER use `any`")  
**Root Cause**: Gradual codebase growth without consistent type definitions, external API types missing, union types not narrowed  
**Fix**:

**Strategy: Phased Approach**

1. **Create Shared Type Definitions** (Phase 1):
```typescript
// ✅ Create dedicated type files for external APIs
// src/lib/types/readwise.ts
export type ReadwiseHighlight = {
	id: number;
	book_id: number;
	text: string;
	location?: number;
	highlighted_at?: string;
	// ... complete type definition
};

export type ReadwisePaginatedResponse<T> = {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
};

// src/lib/types/prosemirror.ts
import type { Command, EditorState, Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export type ProseMirrorDoc = {
	type: string;
	content: ProseMirrorContent;
};

export type ProseMirrorCommand = (
	state: EditorState,
	dispatch?: (tr: Transaction) => void
) => boolean;

// Re-export EditorState and Transaction for convenience
export type { EditorState };
export type { Transaction };

// src/lib/types/sonner.ts
export type ToastOptions = {
	id?: string | number;
	duration?: number;
	description?: string;
	// ... complete type definition
};
```

2. **Fix Convex Backend Files** (Phase 2):
```typescript
// ❌ WRONG: any types everywhere
export const syncReadwise = action({
	handler: async (ctx, args) => {
		const highlights: any[] = [];
		const books: any[] = [];
		// ...
	}
});

// ✅ CORRECT: Import and use proper types
import type { ReadwiseHighlight, ReadwiseSource, ReadwisePaginatedResponse } from '../src/lib/types/readwise';
import type { ActionCtx } from './_generated/server';

export const syncReadwise = action({
	handler: async (ctx: ActionCtx, args) => {
		const highlights: ReadwiseHighlight[] = [];
		const books: ReadwiseSource[] = [];
		const response: ReadwisePaginatedResponse<ReadwiseHighlight> = await ctx.runAction(...);
		// ...
	}
});
```

3. **Fix Components with Type Narrowing** (Phase 3):
```typescript
// ❌ WRONG: Union type without narrowing
type Props = {
	item: InboxItemWithDetails; // Union type
};

// Accessing properties that don't exist on all union members
item.tags // ❌ Error: Property 'tags' doesn't exist on PhotoNoteWithDetails

// ✅ CORRECT: Narrow union type in component props
import type { ReadwiseHighlightWithDetails } from '$lib/types/convex';

type Props = {
	item: ReadwiseHighlightWithDetails; // Narrowed to specific type
};

// Now TypeScript knows item has tags, highlight, source, etc.
item.tags // ✅ Type-safe
```

4. **Fix Utils with Library Types** (Phase 4):
```typescript
// ❌ WRONG: any for library types
import type { ToastOptions } from '$lib/types/sonner';

function success(message: string, options?: any) { // ❌
	// ...
}

// ✅ CORRECT: Use proper types
import type { ToastOptions } from '$lib/types/sonner';

function success(message: string, options?: ToastOptions) { // ✅
	// ...
}
```

5. **Fix Routes with FunctionReference** (Phase 5):
```typescript
// ❌ WRONG: as any for function references
const inboxApi = {
	getInboxItemWithDetails: makeFunctionReference('inbox:getInboxItemWithDetails') as any,
};

// ✅ CORRECT: Use FunctionReference type assertion
import type { FunctionReference } from 'convex/server';
import type { Id } from '$lib/convex';
import type { InboxItemWithDetails } from '$lib/types/convex';

const inboxApi = {
	getInboxItemWithDetails: makeFunctionReference('inbox:getInboxItemWithDetails') as FunctionReference<
		'query',
		'public',
		{ sessionId: string; inboxItemId: Id<'inboxItems'> },
		InboxItemWithDetails | null
	>,
};
```

**Common Patterns**:

```typescript
// Pattern 1: External API types → Create dedicated type file
// Pattern 2: Convex ctx types → Use ActionCtx, QueryCtx, MutationCtx from _generated/server
// Pattern 3: Union types → Narrow in component props (ReadwiseHighlightWithDetails vs InboxItemWithDetails)
// Pattern 4: Library types → Create wrapper types (ToastOptions, ProseMirrorCommand)
// Pattern 5: Function references → Use FunctionReference type assertion, never `as any`
// Pattern 6: Error handling → Use `unknown` + type guards instead of `any`
```

**Migration Checklist**:

1. ✅ Create type definition files for external APIs (Readwise, ProseMirror, Sonner)
2. ✅ Replace `any` in Convex files with proper types (`Doc<>`, `Id<>`, `ActionCtx`, etc.)
3. ✅ Narrow union types in component props (use specific types like `ReadwiseHighlightWithDetails`)
4. ✅ Replace `any` in utils with library-specific types (`ToastOptions`, `ProseMirrorCommand`)
5. ✅ Replace `as any` in routes with `FunctionReference` type assertions
6. ✅ Use `unknown` + type guards for error handling instead of `any`
7. ✅ Verify completion: Run ESLint, TypeScript check, and tests

**Verification Phase** (Phase 4):

```bash
# Verify zero violations
npx eslint src --format=json | grep "@typescript-eslint/no-explicit-any"
# Expected: 0 violations

# Verify TypeScript check passes
npm run check
# Expected: 0 errors

# Verify tests pass
npm run test:unit:server && npm run test:integration
# Expected: All type-related tests pass
```

**ProseMirror Type Enhancement**:

When using ProseMirror types (`EditorState`, `Transaction`), ensure they're exported from type definition file:

```typescript
// ✅ CORRECT: Export EditorState and Transaction from prosemirror.ts
// src/lib/types/prosemirror.ts
import type { Command, EditorState, Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

// Re-export for convenience
export type { EditorState };
export type { Transaction };
```

**Success Metrics**:

- ✅ Zero `@typescript-eslint/no-explicit-any` violations
- ✅ Zero TypeScript errors
- ✅ All tests pass (type-related)
- ✅ All `makeFunctionReference()` calls use `FunctionReference` assertions
- ✅ All external API types properly imported
- ✅ All error handling uses `unknown` + type guards

**Why**: Systematic elimination of `any` types improves type safety, catches bugs at compile time, enables better IDE support, and prevents runtime errors.  
**Apply when**: Large-scale type safety improvements, fixing ESLint `no-explicit-any` violations, improving developer experience  
**Related**: #L1250 (Avoid `any`), #L1300 (FunctionReference), #L240 (Shared types), #L290 (Discriminated unions)

---

## #L1350: useQuery Argument Functions Must Return Valid Object or Throw [🟡 IMPORTANT]

**Symptom**: TypeScript errors "Argument of type '() => { sessionId: string; } | null' is not assignable" or "Property 'sessionId' is missing"  
**Root Cause**: `useQuery` argument function returns `null` when `sessionId` is missing, but Convex expects valid object. Hooks cannot be conditionally created reactively - must use conditional hook creation pattern.  
**Fix**:

```typescript
// ❌ WRONG: Returns null when sessionId missing
const organizationsQuery = useQuery(api.organizations.listOrganizations, () => {
	const sessionId = getSessionId();
	if (!sessionId) return null; // ❌ null not valid - breaks type contract
	return { sessionId };
});

// ✅ CORRECT: Conditional hook creation with throw pattern (outer check ensures sessionId exists)
const organizationsQuery =
	browser && getSessionId()
		? useQuery(api.organizations.listOrganizations, () => {
				const sessionId = getSessionId();
				if (!sessionId) throw new Error('sessionId required'); // ✅ Ensures valid object returned
				return { sessionId };
			})
		: null;
```

**Pattern**:

```typescript
// Pattern: Conditional hook creation (required sessionId)
// Hooks cannot be conditionally created reactively - condition must be evaluated at hook creation time
const query =
	browser && getSessionId()
		? useQuery(api.module.function, () => {
				const sessionId = getSessionId();
				if (!sessionId) throw new Error('sessionId required'); // ✅ Outer check ensures it exists
				return { sessionId, ...otherArgs };
			})
		: null;
```

**Why**: 
- Convex `useQuery` expects argument function to return valid query args object, never `null`
- Hooks must be created unconditionally at the top level - conditional creation based on reactive values doesn't work
- When `sessionId` changes from `null` to a value, the hook was already evaluated as `null` at initialization
- Use conditional hook creation (`browser && getSessionId() ? useQuery(...) : null`) - condition evaluated once at initialization
- Throw in args function if sessionId missing (defensive check, outer condition ensures it exists)

**Note**: The `'skip'` pattern is NOT supported by convex-svelte. Context7 docs show no support for `'skip'` return value. Always use conditional hook creation pattern.  
**Apply when**: Writing `useQuery` calls with conditional `sessionId` or when ID might be `null` initially  
**Related**: #L1200 (SessionId migration), #L220 (useQuery pattern)

---

## #L1355: $effect Pattern for Queries When ID Starts as Null [🔴 CRITICAL]

**Symptom**: Query stuck in loading state, hook never created when ID changes from `null` to a value, hydration errors  
**Root Cause**: Hooks cannot be conditionally created reactively. When `selectedId` changes from `null` → `'id'`, the hook was already evaluated as `null` at initialization. Conditional hook creation (`browser && getSessionId() && selectedId ? useQuery(...) : null`) doesn't work because the condition is evaluated once at initialization, not reactively.  
**Fix**: Use `$effect` pattern with manual `convexClient.query()` calls (proven pattern from `useSelectedItem`)

```typescript
// ❌ WRONG: Conditional hook creation doesn't work reactively
const selectedRoleQuery =
	browser && getSessionId() && state.selectedRoleId
		? useQuery(api.circleRoles.get, () => {
				const sessionId = getSessionId();
				const roleId = state.selectedRoleId;
				if (!sessionId || !roleId) throw new Error('sessionId and roleId required');
				return { sessionId, roleId };
			})
		: null;
// Problem: When selectedRoleId changes from null → 'id', hook was already null at initialization

// ✅ CORRECT: $effect pattern with manual query (proven pattern from useSelectedItem)
import { useConvexClient } from 'convex-svelte';

const convexClient = browser ? useConvexClient() : null;

// Query tracking for race condition prevention
let currentRoleQueryId: Id<'circleRoles'> | null = null;

// Load selected role details with $effect pattern
$effect(() => {
	if (!browser || !convexClient || !state.selectedRoleId) {
		state.selectedRole = null;
		state.selectedRoleIsLoading = false;
		state.selectedRoleError = null;
		currentRoleQueryId = null;
		return;
	}

	const sessionId = getSessionId();
	if (!sessionId) {
		state.selectedRole = null;
		state.selectedRoleIsLoading = false;
		state.selectedRoleError = null;
		currentRoleQueryId = null;
		return;
	}

	// Generate unique ID for this query
	const queryId = state.selectedRoleId;
	currentRoleQueryId = queryId;
	state.selectedRoleIsLoading = true;
	state.selectedRoleError = null;

	// Load role details
	convexClient
		.query(api.circleRoles.get, {
			sessionId,
			roleId: state.selectedRoleId
		})
		.then((result) => {
			// Only update if this is still the current query (prevent race conditions)
			if (currentRoleQueryId === queryId) {
				state.selectedRole = result;
				state.selectedRoleIsLoading = false;
				state.selectedRoleError = null;
			}
		})
		.catch((error) => {
			// Only handle error if this is still the current query
			if (currentRoleQueryId === queryId) {
				console.error('[useOrgChart] Failed to load role:', error);
				state.selectedRole = null;
				state.selectedRoleIsLoading = false;
				state.selectedRoleError = error;
			}
		});

	// Cleanup function: mark query as stale when effect re-runs or component unmounts
	return () => {
		if (currentRoleQueryId === queryId) {
			currentRoleQueryId = null;
		}
	};
});
```

**Complete Pattern**:

```typescript
// State includes query results, loading, and error
const state = $state({
	selectedRoleId: null as Id<'circleRoles'> | null,
	selectedRole: null as Role | null,
	selectedRoleIsLoading: false,
	selectedRoleError: null as unknown | null
});

const convexClient = browser ? useConvexClient() : null;
let currentRoleQueryId: Id<'circleRoles'> | null = null;

// $effect reacts to selectedRoleId changes
$effect(() => {
	// Early return if ID is null or prerequisites missing
	if (!browser || !convexClient || !state.selectedRoleId) {
		state.selectedRole = null;
		state.selectedRoleIsLoading = false;
		state.selectedRoleError = null;
		currentRoleQueryId = null;
		return;
	}

	const sessionId = getSessionId();
	if (!sessionId) {
		state.selectedRole = null;
		state.selectedRoleIsLoading = false;
		state.selectedRoleError = null;
		currentRoleQueryId = null;
		return;
	}

	// Track query ID for race condition prevention
	const queryId = state.selectedRoleId;
	currentRoleQueryId = queryId;
	state.selectedRoleIsLoading = true;
	state.selectedRoleError = null;

	// Manual query call
	convexClient
		.query(api.circleRoles.get, {
			sessionId,
			roleId: state.selectedRoleId
		})
		.then((result) => {
			// Only update if still current query
			if (currentRoleQueryId === queryId) {
				state.selectedRole = result;
				state.selectedRoleIsLoading = false;
				state.selectedRoleError = null;
			}
		})
		.catch((error) => {
			if (currentRoleQueryId === queryId) {
				state.selectedRole = null;
				state.selectedRoleIsLoading = false;
				state.selectedRoleError = error;
			}
		});

	// Cleanup on re-run or unmount
	return () => {
		if (currentRoleQueryId === queryId) {
			currentRoleQueryId = null;
		}
	};
});
```

**Why**: 
- `$effect` re-runs when `selectedRoleId` changes from `null` → `'id'`
- Early return clears state when ID is `null`
- Manual `convexClient.query()` executes when ID becomes non-null
- Query tracking prevents race conditions (stale results ignored)
- No hydration errors (hooks not conditionally created)

**Trade-offs**:
- ✅ Works reactively when ID changes from null to value
- ✅ No hydration errors
- ✅ Race condition prevention built-in
- ❌ One-time fetch (not real-time subscription like `useQuery`)
- ❌ More code than `useQuery` pattern

**When to Use**:
- ID starts as `null` and becomes non-null later (user selection, conditional loading)
- Need reactive loading when ID changes
- Can accept one-time fetch instead of real-time subscription

**When NOT to Use**:
- Need real-time subscriptions (use `useQuery` with always-available IDs)
- ID is always available at initialization (use conditional hook creation pattern)

**Proven Examples**:
- `useSelectedItem.svelte.ts` - Selected inbox item details
- `useOrgChart.svelte.ts` - Selected circle/role details

**Related**: #L1350 (Conditional hook creation), #L220 (useQuery pattern), `useSelectedItem.svelte.ts` (reference implementation)

---

## #L1360: Batch Queries for Performance [🟡 IMPORTANT]

**Symptom**: Multiple related queries take 3-5 seconds, slow page load  
**Root Cause**: Each query makes separate network round trip + session validation overhead  
**Fix**: Create batch query that checks multiple items at once

```typescript
// ❌ WRONG: Multiple separate queries (slow)
const flag1Query = useQuery(api.featureFlags.checkFlag, () => ({ flag: 'flag1', sessionId }));
const flag2Query = useQuery(api.featureFlags.checkFlag, () => ({ flag: 'flag2', sessionId }));
const flag3Query = useQuery(api.featureFlags.checkFlag, () => ({ flag: 'flag3', sessionId }));
// Result: 3 network calls, 3x session validation, 3-5 seconds

// ✅ CORRECT: Batch query (fast)
const flagsQuery = useQuery(api.featureFlags.checkFlags, () => ({
	sessionId,
	flags: ['flag1', 'flag2', 'flag3']
}));
const flag1 = $derived(flagsQuery?.data?.['flag1'] ?? false);
const flag2 = $derived(flagsQuery?.data?.['flag2'] ?? false);
const flag3 = $derived(flagsQuery?.data?.['flag3'] ?? false);
// Result: 1 network call, 1x session validation, < 1 second
```

**Backend Implementation**:

```typescript
// convex/featureFlags.ts
export const checkFlags = query({
	args: {
		flags: v.array(v.string()),
		sessionId: v.optional(v.string())
	},
	handler: async (ctx, { flags, sessionId }) => {
		// Validate session once for all flags
		let userId: Id<'users'> | undefined;
		if (sessionId) {
			const { userId: id } = await validateSessionAndGetUserId(ctx, sessionId);
			userId = id;
		}

		// Fetch all configs in parallel
		const configs = await Promise.all(
			flags.map(flag =>
				ctx.db.query('featureFlags')
					.withIndex('by_flag', (q) => q.eq('flag', flag))
					.first()
			)
		);

		// Evaluate all flags
		const results: Record<string, boolean> = {};
		for (let i = 0; i < flags.length; i++) {
			results[flags[i]] = evaluateFlag(configs[i], userId);
		}
		return results;
	}
});
```

**Performance**: Reduces 3-5 seconds → < 1 second (3-5x faster)  
**When to Use**: Checking multiple related items (feature flags, settings, permissions)  
**Trade-off**: Slightly more complex backend, but significant performance gain  
**Related**: #L1200 (SessionId pattern), #L220 (useQuery pattern), #L1390 (Server-side preload)

---

## #L1390: Server-Side Preload for Instant UI Rendering [🔴 CRITICAL]

**Symptom**: UI elements appear 3-5 seconds after page load, missing data until hard refresh, inconsistent behavior after login  
**Root Cause**: Client-side Convex queries (`useQuery`) only execute after component mount, causing network latency delays  
**Fix**: Load critical data server-side in `+layout.server.ts` using `ConvexHttpClient`, pass as initial data

```typescript
// ❌ WRONG: Client-side query (slow, inconsistent)
// src/lib/components/Sidebar.svelte
const circlesEnabledQuery = browser && sessionId
	? useQuery(api.featureFlags.checkFlag, () => {
			if (!sessionId) throw new Error('sessionId required');
			return { flag: 'circles_ui_beta', sessionId };
		})
	: null;
const circlesEnabled = $derived(circlesEnabledQuery?.data ?? false);
// Result: Menu item appears 3-5 seconds after sidebar renders

// ✅ CORRECT: Server-side preload (instant)
// src/routes/(authenticated)/+layout.server.ts
export const load: LayoutServerLoad = async ({ locals, url }) => {
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;
	
	let circlesEnabled = false;
	try {
		circlesEnabled = await client.query(api.featureFlags.checkFlag, {
			flag: 'circles_ui_beta',
			sessionId
		});
	} catch (error) {
		console.warn('Failed to load feature flag server-side:', error);
	}
	
	return {
		sessionId,
		circlesEnabled // ✅ Included in initial HTML payload
	};
};

// src/routes/(authenticated)/+layout.svelte
const circlesEnabled = $derived(data.circlesEnabled ?? false);

// src/lib/components/Sidebar.svelte
// Receive as prop - no client-side query needed
let { circlesEnabled = false }: Props = $props();
// Result: Menu item appears instantly with page load
```

**Hybrid Pattern** (Server-side initial + Client-side reactive):

```typescript
// Server-side preload for instant rendering
// src/routes/(authenticated)/+layout.server.ts
const [organizations, invites] = await Promise.all([
	client.query(api.organizations.listOrganizations, { sessionId }),
	client.query(api.organizations.listOrganizationInvites, { sessionId })
]);

// Pass as initial data
return { organizations, invites };

// Client-side composable uses initial data immediately, updates when queries complete
// src/lib/composables/useOrganizations.svelte.ts
export function useOrganizations(options?: {
	initialOrganizations?: OrganizationSummary[]; // Server-side preloaded
	// ...
}) {
	const organizationsQuery = browser && getSessionId()
		? useQuery(api.organizations.listOrganizations, () => {
				const sessionId = getSessionId();
				if (!sessionId) throw new Error('sessionId required');
				return { sessionId };
			})
		: null;
	
	// Use server-side data immediately, then use query data when available
	const organizationsData = $derived((): OrganizationSummary[] => {
		if (organizationsQuery?.data !== undefined) {
			return organizationsQuery.data as OrganizationSummary[];
		}
		return options?.initialOrganizations ?? []; // ✅ Instant rendering
	});
}
```

**Why**: Server-side data is included in initial HTML payload, eliminating network latency for critical UI elements  
**Apply when**: Data is needed for initial render (feature flags, user data, organizations, etc.)  
**Related**: #L1360 (Batch queries), #L850 (sessionId pattern), #L10 (Undefined in Convex)

---

---

## #L1400: Null Checks for Optional Chaining with Nested Properties [🟡 IMPORTANT]

**Symptom**: TypeScript errors "'X' is possibly 'null'" when accessing nested properties after optional chaining  
**Root Cause**: Optional chaining (`?.`) only guards the immediate property access, not subsequent property accesses  
**Fix**:

```typescript
// ❌ WRONG: Optional chaining doesn't guard nested property access
export function isEditorEmpty(state: EditorState): boolean {
	const doc = state.doc;
	const firstChild = doc.firstChild;
	return (
		doc.childCount === 1 && (firstChild?.isTextblock ?? false) && firstChild.content.size === 0
	);
	// ❌ firstChild.content.size - firstChild could be null
}

// ✅ CORRECT: Use optional chaining for nested property access
export function isEditorEmpty(state: EditorState): boolean {
	const doc = state.doc;
	const firstChild = doc.firstChild;
	return (
		doc.childCount === 1 &&
		(firstChild?.isTextblock ?? false) &&
		(firstChild?.content.size ?? 0) === 0
	);
	// ✅ firstChild?.content.size - guards nested access
}

// ✅ CORRECT: Alternative - Extract to variable with null check
export function isEditorEmpty(state: EditorState): boolean {
	const doc = state.doc;
	const firstChild = doc.firstChild;
	if (!firstChild) return false;
	return doc.childCount === 1 && firstChild.isTextblock && firstChild.content.size === 0;
	// ✅ Early return ensures firstChild is not null
}
```

**When to Use**:

- Accessing nested properties after optional chaining (`obj?.prop.nested`)
- TypeScript shows "'X' is possibly 'null'" for nested property access
- Working with union types that include `null`

**Why**: Optional chaining only guards the immediate property, not subsequent property accesses. Need explicit null checks or additional optional chaining.  
**Apply when**: Accessing nested properties on potentially null values  
**Related**: #L1250 (Avoid `any`), #L290 (Discriminated unions)

---

## #L1450: Type Narrowing for Union Types with Type Assertions [🟡 IMPORTANT]

**Symptom**: TypeScript errors "Property 'X' does not exist on type 'Y | Z'" when accessing properties on union types  
**Root Cause**: TypeScript can't narrow union types without type guards or explicit assertions  
**Fix**:

```typescript
// ❌ WRONG: TypeScript can't narrow union type automatically
let { data }: { data: PageData } = $props();
let title = $derived(data.note?.title || 'Untitled Note');
// ❌ Property 'title' does not exist on type 'InboxItemWithDetails | null'
// InboxItemWithDetails is union of ReadwiseHighlight | PhotoNote | ManualText | NoteWithDetails

// ✅ CORRECT: Use type assertion to narrow to specific union member
import type { NoteWithDetails } from '$lib/types/convex';

let { data }: { data: PageData } = $props();
const note = data.note as NoteWithDetails | null; // ✅ Narrow to NoteWithDetails
let title = $derived(note?.title || 'Untitled Note');
let markdown = $derived(note?.contentMarkdown || '');
let createdAt = $derived(note?.createdAt ? new Date(note.createdAt).toLocaleDateString() : '');

// ✅ CORRECT: Use type guard for runtime safety
function isNoteWithDetails(item: InboxItemWithDetails | null): item is NoteWithDetails {
	return item !== null && item.type === 'note';
}

if (isNoteWithDetails(data.note)) {
	// ✅ TypeScript knows data.note is NoteWithDetails here
	const title = data.note.title;
}
```

**When to Use**:

- Accessing properties that only exist on specific union members
- TypeScript shows "Property does not exist" errors on union types
- Working with discriminated unions where you know the specific type

**Why**: Type assertions provide type narrowing when you know the runtime type, but type guards are safer for runtime validation.  
**Apply when**: Accessing properties specific to one union member, or when TypeScript can't infer the correct type  
**Related**: #L290 (Discriminated unions), #L1250 (Avoid `any`)

---

---

## #L1500: RequestHandler Syntax - Function Not Object Literal [🟡 IMPORTANT]

**Symptom**: TypeScript error "',' expected" when exporting `RequestHandler` in SvelteKit server routes  
**Root Cause**: Using object literal syntax `});` instead of function syntax `};`  
**Fix**:

```typescript
// ❌ WRONG: Object literal syntax (closing with });
export const GET: RequestHandler = async ({ url, getClientAddress }) => {
  // ... handler code
}); // ❌ TypeScript expects comma (object literal syntax)

// ✅ CORRECT: Function syntax (closing with };
export const GET: RequestHandler = async ({ url, getClientAddress }) => {
  // ... handler code
}; // ✅ Function syntax - no comma needed

// ✅ CORRECT: With wrapper function (still function syntax)
export const POST: RequestHandler = withRateLimit(RATE_LIMITS.register, async ({ event }) => {
  // ... handler code
}); // ✅ This is correct - closing the wrapper function call
```

**When to Use**:

- Exporting `RequestHandler` in SvelteKit `+server.ts` files
- TypeScript shows "',' expected" error at end of handler function
- Using direct function assignment vs wrapper functions

**Why**: `RequestHandler` is a function type, not an object type. Direct assignment uses `};`, wrapper functions use `});` to close the wrapper call.  
**Apply when**: Creating SvelteKit API route handlers  
**Related**: #L1250 (Avoid `any`), #L10 (Convex payloads)

---

## #L1530: Feature Flag Secure Defaults [🔴 CRITICAL]

**Symptom**: Feature flags visible to all users when no targeting rules configured, security risk  
**Root Cause**: Flags default to `flagConfig.enabled` (often `true`) when no targeting rules exist, granting access to everyone  
**Fix**: Default to `false` when no targeting rules configured, require explicit configuration

```typescript
// ❌ WRONG: Insecure default (everyone gets access)
const hasTargetingRules =
	flagConfig.allowedUserIds !== undefined ||
	flagConfig.allowedDomains !== undefined ||
	flagConfig.rolloutPercentage !== undefined;

if (flagConfig.allowedUserIds?.includes(userId)) {
	result = true;
}
// ... domain and rollout checks ...
else if (!hasTargetingRules) {
	result = flagConfig.enabled; // ❌ Defaults to true for everyone
}

// ✅ CORRECT: Secure default (require explicit configuration)
const hasTargetingRules =
	flagConfig.allowedUserIds !== undefined ||
	flagConfig.allowedDomains !== undefined ||
	flagConfig.rolloutPercentage !== undefined;

if (flagConfig.allowedUserIds?.includes(userId)) {
	result = true;
}
// ... domain and rollout checks ...
else if (!hasTargetingRules) {
	result = false; // ✅ Secure default - require explicit targeting configuration
}
```

**Why**: Security by default - flags should be opt-in, not opt-out. If no targeting rules are configured, assume the flag is not ready for production.  
**Apply when**: Implementing feature flag evaluation logic  
**Related**: #L1390 (Server-side preload), #L1360 (Batch queries), feature-flags.md (Feature flag patterns)

**Configuration Required**:

After fix, flags must be explicitly configured:

```typescript
// Option 1: User-based targeting
await upsertFlag({
	flag: 'circles_ui_beta',
	enabled: true,
	allowedUserIds: ['user-id-1', 'user-id-2']
});

// Option 2: Domain-based targeting
await upsertFlag({
	flag: 'circles_ui_beta',
	enabled: true,
	allowedDomains: ['@synergyai.nl']
});

// Option 3: Percentage rollout
await upsertFlag({
	flag: 'circles_ui_beta',
	enabled: true,
	rolloutPercentage: 10 // 10% of users
});
```

**Debugging**: Use `debugFlagEvaluation` query to inspect flag evaluation:

```typescript
// In Convex dashboard function runner
await debugFlagEvaluation({
	flag: 'circles_ui_beta',
	sessionId: 'your-session-id'
});
// Returns: { result, reason, flagConfig, hasTargetingRules, ... }
```

---

## #L1650: useConvexClient for Mutations (No useMutation) [🟡 IMPORTANT]

**Symptom**: `Module "convex-svelte" has no exported member 'useMutation'` error  
**Root Cause**: convex-svelte doesn't export `useMutation` - use `useConvexClient()` instead  
**Fix**:

```typescript
// ❌ WRONG: useMutation doesn't exist
import { useQuery, useMutation } from 'convex-svelte';
const createItem = useMutation(api.items.create);
await createItem({ title: 'New Item' });

// ✅ CORRECT: Use useConvexClient + client.mutation()
import { useQuery, useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';

const convexClient = browser ? useConvexClient() : null;

async function handleCreate() {
	if (!convexClient) return;
	
	await convexClient.mutation(api.items.create, {
		sessionId: getSessionId(),
		title: 'New Item'
	});
}
```

**Pattern for Components**:

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	
	// Get client once
	const convexClient = browser ? useConvexClient() : null;
	
	// Reactive queries
	const items = useQuery(api.items.list, () => ({ sessionId }));
	
	// Mutations in async functions
	async function handleCreate(title: string) {
		if (!convexClient || !sessionId) return;
		
		try {
			await convexClient.mutation(api.items.create, {
				sessionId,
				title
			});
		} catch (err) {
			console.error('Failed to create:', err);
		}
	}
	
	async function handleUpdate(itemId: Id<'items'>, updates: { title?: string }) {
		if (!convexClient || !sessionId) return;
		
		await convexClient.mutation(api.items.update, {
			sessionId,
			itemId,
			...updates
		});
	}
	
	async function handleDelete(itemId: Id<'items'>) {
		if (!convexClient || !sessionId) return;
		
		await convexClient.mutation(api.items.remove, {
			sessionId,
			itemId
		});
	}
</script>

<button onclick={() => handleCreate('New Item')}>Create</button>
```

**Why**: convex-svelte provides `useQuery()` for reactive subscriptions and `useConvexClient()` for imperative operations (mutations, actions). This is the documented API pattern.

**Apply when**: Calling Convex mutations from Svelte components  
**Related**: #L10 (Avoid undefined payloads), #L1350 (useQuery argument functions), ui-patterns.md#L2800 (Inline CRUD forms)

---

## #L1700: Auto-Add Creator as Attendee [🟡 IMPORTANT]

**Symptom**: Entity creator not visible in member/attendee lists, dropdowns show empty, "I don't see myself" bug  
**Root Cause**: Entity creation mutation doesn't automatically add creator to associated members/attendees table  
**Fix**:

```typescript
// ❌ WRONG: Only create entity, forget to add creator
export const create = mutation({
	args: { sessionId: v.string(), title: v.string() },
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		const meetingId = await ctx.db.insert('meetings', {
			organizationId: args.organizationId,
			title: args.title,
			createdBy: userId,
			createdAt: Date.now()
		});
		
		return { meetingId }; // ❌ Creator not added to attendees
	}
});

// ✅ CORRECT: Auto-add creator to associated table
export const create = mutation({
	args: { sessionId: v.string(), title: v.string() },
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		// Create entity
		const meetingId = await ctx.db.insert('meetings', {
			organizationId: args.organizationId,
			title: args.title,
			createdBy: userId,
			createdAt: Date.now()
		});
		
		// ✅ Auto-add creator as attendee
		await ctx.db.insert('meetingAttendees', {
			meetingId,
			attendeeType: 'user',
			userId,
			addedAt: Date.now()
		});
		
		return { meetingId };
	}
});
```

**Common Entity Patterns**:

```typescript
// Meetings → meetingAttendees
await ctx.db.insert('meetingAttendees', {
	meetingId,
	attendeeType: 'user',
	userId,
	addedAt: Date.now()
});

// Teams → teamMembers
await ctx.db.insert('teamMembers', {
	teamId,
	userId,
	role: 'admin', // Creator gets admin role
	joinedAt: Date.now()
});

// Projects → projectMembers
await ctx.db.insert('projectMembers', {
	projectId,
	userId,
	role: 'owner', // Creator gets owner role
	joinedAt: Date.now()
});

// Organizations → organizationMembers
await ctx.db.insert('organizationMembers', {
	organizationId,
	userId,
	role: 'owner',
	joinedAt: Date.now()
});
```

**Why**: Entity-relationship tables need explicit entries. `createdBy` field tracks metadata, but membership/attendance requires separate records for queries/permissions.

**When to Apply**:
- Creating entities with members/attendees/participants
- "I don't see myself" bugs in member lists
- Empty dropdowns after entity creation
- Permission checks fail for creator

**Related**: #L850 (Destructure validateSessionAndGetUserId), #L1175 (RBAC test patterns), #L240 (Shared types)

---

## #L1750: Real-Time Confirmation Workflow with Request Table [🟢 REFERENCE]

**Symptom**: Need approval workflow for state changes (role assignment, permissions, resource access)  
**Root Cause**: Direct updates don't allow for approval/rejection flow with real-time notifications  
**Fix**: Create request table + pending status + real-time query for current approver

**Pattern**: Secretary Change Workflow (SYOS-222)

**1. Schema - Request Table**:

```typescript
// schema.ts
secretaryChangeRequests: defineTable({
	meetingId: v.id('meetings'),
	requestedBy: v.id('users'),      // Who made the request
	requestedFor: v.id('users'),     // Who they want to assign
	status: v.union(
		v.literal('pending'),
		v.literal('approved'),
		v.literal('denied')
	),
	createdAt: v.number(),
	resolvedAt: v.optional(v.number()),
	resolvedBy: v.optional(v.id('users'))
})
	.index('by_meeting_status', ['meetingId', 'status'])
	.index('by_meeting', ['meetingId']),
```

**2. Backend - Request + Approve/Deny Mutations**:

```typescript
// Request secretary change
export const requestSecretaryChange = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		requestedForId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		// Validate requested user is an attendee
		const attendees = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();
			
		const isAttendee = attendees.some(
			(a) => a.attendeeType === 'user' && a.userId === args.requestedForId
		);
		if (!isAttendee) {
			throw new Error('Requested secretary must be a meeting attendee');
		}
		
		// Check for existing pending request
		const existingRequest = await ctx.db
			.query('secretaryChangeRequests')
			.withIndex('by_meeting_status', (q) =>
				q.eq('meetingId', args.meetingId).eq('status', 'pending')
			)
			.first();
			
		if (existingRequest) {
			throw new Error('There is already a pending secretary change request');
		}
		
		// Create request
		const requestId = await ctx.db.insert('secretaryChangeRequests', {
			meetingId: args.meetingId,
			requestedBy: userId,
			requestedFor: args.requestedForId,
			status: 'pending',
			createdAt: Date.now()
		});
		
		return { requestId };
	}
});

// Approve request
export const approveSecretaryChange = mutation({
	args: {
		sessionId: v.string(),
		requestId: v.id('secretaryChangeRequests')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		const request = await ctx.db.get(args.requestId);
		if (!request || request.status !== 'pending') {
			throw new Error('Request not found or already resolved');
		}
		
		const meeting = await ctx.db.get(request.meetingId);
		const currentSecretaryId = meeting.secretaryId ?? meeting.createdBy;
		
		// Only current secretary can approve
		if (userId !== currentSecretaryId) {
			throw new Error('Only the current secretary can approve this request');
		}
		
		// Update request status
		await ctx.db.patch(args.requestId, {
			status: 'approved',
			resolvedAt: Date.now(),
			resolvedBy: userId
		});
		
		// Apply the change
		await ctx.db.patch(request.meetingId, {
			secretaryId: request.requestedFor,
			updatedAt: Date.now()
		});
		
		return { success: true };
	}
});

// Deny request
export const denySecretaryChange = mutation({
	args: {
		sessionId: v.string(),
		requestId: v.id('secretaryChangeRequests')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		const request = await ctx.db.get(args.requestId);
		if (!request || request.status !== 'pending') {
			throw new Error('Request not found or already resolved');
		}
		
		const meeting = await ctx.db.get(request.meetingId);
		const currentSecretaryId = meeting.secretaryId ?? meeting.createdBy;
		
		if (userId !== currentSecretaryId) {
			throw new Error('Only the current secretary can deny this request');
		}
		
		await ctx.db.patch(args.requestId, {
			status: 'denied',
			resolvedAt: Date.now(),
			resolvedBy: userId
		});
		
		return { success: true };
	}
});

// Real-time query for current approver
export const watchSecretaryRequests = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		const meeting = await ctx.db.get(args.meetingId);
		const currentSecretaryId = meeting.secretaryId ?? meeting.createdBy;
		
		// Only return requests if user is current secretary
		if (userId !== currentSecretaryId) {
			return [];
		}
		
		// Get pending requests
		const requests = await ctx.db
			.query('secretaryChangeRequests')
			.withIndex('by_meeting_status', (q) =>
				q.eq('meetingId', args.meetingId).eq('status', 'pending')
			)
			.collect();
			
		// Resolve user names
		const requestsWithNames = await Promise.all(
			requests.map(async (request) => {
				const requestedBy = await ctx.db.get(request.requestedBy);
				const requestedFor = await ctx.db.get(request.requestedFor);
				
				return {
					...request,
					requestedByName: requestedBy?.name ?? 'Unknown',
					requestedForName: requestedFor?.name ?? 'Unknown'
				};
			})
		);
		
		return requestsWithNames;
	}
});
```

**3. Frontend - Real-Time Dialog**:

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	
	const convexClient = browser ? useConvexClient() : null;
	
	// Real-time subscription (only for current secretary)
	const requestsQuery = browser ? useQuery(
		api.meetings.watchSecretaryRequests,
		() => ({ sessionId: getSessionId(), meetingId: getMeetingId() })
	) : null;
	
	const pendingRequest = $derived(requestsQuery?.data?.[0] ?? null);
	
	async function handleApprove(requestId) {
		if (!convexClient) return;
		await convexClient.mutation(api.meetings.approveSecretaryChange, {
			sessionId: getSessionId(),
			requestId
		});
	}
	
	async function handleDeny(requestId) {
		if (!convexClient) return;
		await convexClient.mutation(api.meetings.denySecretaryChange, {
			sessionId: getSessionId(),
			requestId
		});
	}
</script>

<!-- Real-time confirmation dialog -->
{#if pendingRequest}
	<dialog open>
		<h2>Secretary Change Request</h2>
		<p>
			{pendingRequest.requestedByName} requests to change the secretary to
			{pendingRequest.requestedForName}.
		</p>
		<button onclick={() => handleDeny(pendingRequest._id)}>Deny</button>
		<button onclick={() => handleApprove(pendingRequest._id)}>Approve</button>
	</dialog>
{/if}
```

**Why**: Request table + real-time query pattern enables instant notifications to the approver without polling. The approver's browser automatically shows the dialog when a request is created.

**Workflow**:
1. **User A** clicks to request change → `requestSecretaryChange` mutation
2. **Request created** → `status: 'pending'` in database
3. **Current approver's browser** → `watchSecretaryRequests` query triggers (Convex real-time)
4. **Dialog appears** → Approver clicks Approve/Deny
5. **Request resolved** → `approveSecretaryChange` or `denySecretaryChange` mutation
6. **All browsers update** → State changes (Convex real-time subscriptions)

**Performance**:
- Latency: <100ms (Convex real-time subscriptions)
- Cost: 1 mutation (request) + 1 read per active approver + 1 mutation (approve/deny)

**Apply when**:
- Building approval workflows (role changes, permissions, resource access)
- Need real-time notifications to approver
- Want atomic state changes with audit trail
- Avoiding race conditions in concurrent updates

**Related**: #L220 in svelte-reactivity.md (useQuery real-time), #L1350 (useQuery throw pattern), #L1650 (useConvexClient for mutations), #L1200 in svelte-reactivity.md (Role-based rendering)

---

## #L1800: Convex Presence Tracking with Heartbeat Pattern [🟢 REFERENCE]

**Symptom**: Need to track who's actively present in a resource (meeting, document, chat) in real-time  
**Root Cause**: Static attendee/member lists don't reflect who's actually active. Need live presence tracking with automatic cleanup.  
**Fix**:

**Pattern**: Heartbeat mutation + lastSeenAt threshold + real-time query

### Schema Design (convex/schema.ts)

```typescript
meetingPresence: defineTable({
  meetingId: v.id('meetings'),
  userId: v.id('users'),
  joinedAt: v.number(),      // First join timestamp (ms)
  lastSeenAt: v.number()     // Heartbeat timestamp (ms) - updated every 30s
})
  .index('by_meeting', ['meetingId'])
  .index('by_meeting_lastSeen', ['meetingId', 'lastSeenAt']) // For active queries
  .index('by_meeting_user', ['meetingId', 'userId'])        // For upserts
```

### Backend Implementation (convex/meetingPresence.ts)

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';

const ACTIVE_THRESHOLD_MS = 60_000; // 60 seconds

// Upsert presence record (called every 30s from client)
export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    meetingId: v.id('meetings')
  },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    const now = Date.now();

    // Try to find existing presence record
    const existing = await ctx.db
      .query('meetingPresence')
      .withIndex('by_meeting_user', (q) =>
        q.eq('meetingId', args.meetingId).eq('userId', userId)
      )
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        lastSeenAt: now
      });
    } else {
      // Create new record
      await ctx.db.insert('meetingPresence', {
        meetingId: args.meetingId,
        userId,
        joinedAt: now,
        lastSeenAt: now
      });
    }
  }
});

// Get currently active users (real-time subscription)
export const getActivePresence = query({
  args: {
    sessionId: v.string(),
    meetingId: v.id('meetings')
  },
  handler: async (ctx, args) => {
    const { userId: _userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    const now = Date.now();
    const threshold = now - ACTIVE_THRESHOLD_MS;

    // Get all presence records updated within threshold
    const presenceRecords = await ctx.db
      .query('meetingPresence')
      .withIndex('by_meeting_lastSeen', (q) =>
        q.eq('meetingId', args.meetingId).gt('lastSeenAt', threshold)
      )
      .collect();

    // Resolve user details
    return await Promise.all(
      presenceRecords.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        return {
          userId: record.userId,
          name: user?.name ?? 'Unknown',
          joinedAt: record.joinedAt
        };
      })
    );
  }
});
```

### Frontend Composable (src/lib/composables/useMeetingPresence.svelte.ts)

```typescript
import { useQuery, useConvexClient } from 'convex-svelte';
import { browser } from '$app/environment';
import { api, type Id } from '$lib/convex';

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

export function useMeetingPresence(
  meetingId: () => Id<'meetings'> | undefined,
  sessionId: () => string | undefined
) {
  const convexClient = useConvexClient();
  const state = $state({
    heartbeatInterval: null as NodeJS.Timeout | null
  });

  // Real-time active users query (browser + defensive checks)
  const activePresenceQuery =
    browser && meetingId() && sessionId()
      ? useQuery(api.meetingPresence.getActivePresence, () => {
          const mid = meetingId();
          const sid = sessionId();
          if (!mid || !sid) {
            throw new Error('meetingId and sessionId required');
          }
          return { meetingId: mid, sessionId: sid };
        })
      : null;

  const activeUsers = $derived(activePresenceQuery?.data ?? []);
  const activeCount = $derived(activeUsers.length);

  async function sendHeartbeat() {
    const mid = meetingId();
    const sid = sessionId();
    if (!browser || !mid || !sid) return;

    try {
      await convexClient.mutation(api.meetingPresence.heartbeat, {
        meetingId: mid,
        sessionId: sid
      });
    } catch (error) {
      console.error('[Presence] Heartbeat failed:', error);
    }
  }

  function startHeartbeat() {
    if (state.heartbeatInterval) return; // Already running

    // Send initial heartbeat immediately
    sendHeartbeat();

    // Start interval for subsequent heartbeats
    state.heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  }

  function stopHeartbeat() {
    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval);
      state.heartbeatInterval = null;
    }
  }

  return {
    get activeUsers() {
      return activeUsers;
    },
    get activeCount() {
      return activeCount;
    },
    startHeartbeat,
    stopHeartbeat
  };
}
```

### Frontend Integration (src/routes/(authenticated)/meetings/[id]/+page.svelte)

```typescript
import { untrack } from 'svelte';
import { browser } from '$app/environment';
import { useMeetingPresence } from '$lib/composables/useMeetingPresence.svelte';

const presence = useMeetingPresence(
  () => meeting._id,
  () => data.sessionId
);

// Start/stop heartbeat on mount/unmount (use untrack() - see #L700 in svelte-reactivity.md)
$effect(() => {
  if (!browser) return;

  untrack(() => {
    presence.startHeartbeat();
  });

  return () => {
    untrack(() => {
      presence.stopHeartbeat();
    });
  };
});
```

**Why This Works**:

- **Heartbeat pattern**: Client sends "I'm alive" signal every 30s
- **lastSeenAt threshold**: Server filters records updated within 60s (active users)
- **Automatic cleanup**: Stale presence records (>60s) excluded from queries (no manual deletion needed)
- **Real-time**: `useQuery` subscription updates UI instantly when users join/leave
- **Upsert pattern**: Same mutation handles first join + subsequent heartbeats

**Performance**:

- **Heartbeat cost**: 2 requests/min/user (negligible)
- **Active threshold**: 60s (2x heartbeat interval for reliability)
- **Real-time subscriptions**: Built-in Convex (no polling, no extra cost)
- **Auto-cleanup**: Presence records expire naturally (no scheduled jobs)

**Apply when**:

- Tracking active users in meetings, documents, chat rooms
- Showing "who's online" indicators
- Need real-time presence without manual cleanup
- Want automatic stale record filtering

**Example Use Cases**:

- Meeting attendance tracking (SYOS-227)
- Document collaboration (who's editing)
- Chat room presence
- Live dashboard viewers

**Related**: #L220 in svelte-reactivity.md (useQuery real-time), #L1350 (useQuery throw pattern), #L1650 (useConvexClient), #L700 in svelte-reactivity.md (untrack for lifecycle methods)

**Source**: SYOS-227 (Meeting Presence Tracking), Convex Presence Component pattern

---

## #L3300: Owner Bypass Pattern for RBAC Permissions [🟡 IMPORTANT]

**Symptom**: Organization owners can't perform actions even though they should have full access  
**Root Cause**: RBAC permission checks don't account for implicit owner privileges  
**Fix**:

```typescript
// convex/organizations.ts
export const createOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
		email: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Check if user is an organization owner (owners can always invite members)
		const userMembership = await ctx.db
			.query('organizationMembers')
			.withIndex('by_organization_user', (q) =>
				q.eq('organizationId', args.organizationId).eq('userId', userId)
			)
			.first();

		const isOwner = userMembership?.role === 'owner';

		// RBAC Permission Check: Only owners or users with "users.invite" permission can invite
		if (!isOwner) {
			await requirePermission(ctx, userId, 'users.invite', {
				organizationId: args.organizationId
			});
		}

		// ... rest of mutation logic
	}
});
```

**Frontend Pattern** (complementary):

```svelte
<script lang="ts">
	const canInviteMembers = $derived(() => {
		// Owners can always invite members
		if (organizations && organizations.activeOrganization?.role === 'owner') {
			return true;
		}
		// Non-owners need users.invite permission
		return permissions.can('users.invite');
	});
</script>

{#if canInviteMembers()}
	<button onclick={() => (showInviteModal = true)}>Invite Member</button>
{/if}
```

**Why**: Owners should have implicit full access without needing explicit RBAC roles.  
**Apply when**: Organization/team management actions (invite, remove, modify)  
**Related**: #L3200 in ui-patterns.md (Permission-based UI visibility)

**Source**: SYOS-211 (Member Invite Modal)

---

## #L3400: RBAC vs Organization Membership Checks [🟡 IMPORTANT]

**Symptom**: Permission denied errors for basic operations like creating teams/circles  
**Root Cause**: Using RBAC `requirePermission()` when simple organization membership check is sufficient  
**Fix**:

```typescript
// ❌ WRONG: RBAC check for basic org member operations
export const createTeam = mutation({
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		// ❌ Too restrictive - only Admin/Manager roles have teams.create permission
		await requirePermission(ctx, userId, 'teams.create', {
			organizationId: args.organizationId
		});
		// ... create team
	}
});

// ✅ CORRECT: Organization membership check (same pattern as circles.create)
async function ensureOrganizationMembership(
	ctx: MutationCtx,
	organizationId: Id<'organizations'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('organizationMembers')
		.withIndex('by_organization_user', (q) =>
			q.eq('organizationId', organizationId).eq('userId', userId)
		)
		.first();

	if (!membership) {
		throw new Error('You do not have access to this organization');
	}
}

export const createTeam = mutation({
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		// ✅ Any org member can create teams (matches circles pattern)
		await ensureOrganizationMembership(ctx, args.organizationId, userId);
		// ... create team
	}
});
```

**When to Use Each**:

- **Organization Membership** (`ensureOrganizationMembership`):
  - ✅ Basic CRUD operations (create team, create circle)
  - ✅ Viewing organization data
  - ✅ Any operation where "member of org" = sufficient permission

- **RBAC** (`requirePermission`):
  - ✅ Administrative actions (delete team, remove members)
  - ✅ Sensitive operations (manage billing, change roles)
  - ✅ Operations requiring specific roles (Team Lead, Manager, Admin)

**Pattern**: Match existing patterns in codebase. If `circles.create` uses org membership, `teams.create` should too.  
**Why**: Consistency prevents permission errors and matches user expectations (org members can create teams).  
**Apply when**: Creating new mutations - check similar operations first  
**Related**: #L3300 (Owner bypass), #L1175 (RBAC test patterns), `convex/circles.ts` (create pattern), `convex/teams.ts` (create pattern)

**Source**: SYOS-216 (Team Management - Create team modal)

---

## #L3365: Schedule Non-Blocking Emails After Mutations [🟢 REFERENCE]

**Symptom**: Email sending blocks mutation response, slow user experience  
**Root Cause**: Synchronous email sending delays mutation completion  
**Fix**:

```typescript
// convex/organizations.ts
export const createOrganizationInvite = mutation({
	handler: async (ctx, args) => {
		// ... validation and invite creation ...
		
		const inviteId = await ctx.db.insert('organizationInvites', {
			organizationId: args.organizationId,
			email: normalizedEmail,
			code,
			// ... other fields
		});

		// Schedule email sending (non-blocking)
		if (normalizedEmail) {
			const organization = await ctx.db.get(args.organizationId);
			const inviter = await ctx.db.get(userId);
			const inviteLink = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/invite?code=${code}`;

			// Schedule email sending (non-blocking via scheduler)
			await ctx.scheduler.runAfter(0, internal.email.sendOrganizationInviteEmail, {
				email: normalizedEmail,
				inviteLink,
				organizationName: organization.name,
				inviterName: inviter.name || inviter.email,
				role: args.role ?? 'member'
			});
		}

		return { inviteId, code };
	}
});
```

**Email Action Pattern**:

```typescript
// convex/email.ts
export const sendOrganizationInviteEmail = internalAction({
	args: {
		email: v.string(),
		inviteLink: v.string(),
		organizationName: v.string(),
		inviterName: v.string(),
		role: v.string()
	},
	handler: async (ctx, args) => {
		// E2E test mode - skip actual email sending
		if (process.env.E2E_TEST_MODE === 'true') {
			console.log('📧 [E2E Mock] Organization invite email suppressed:', args.email);
			return { success: true, emailId: `mock-invite-${Date.now()}` };
		}

		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) throw new Error('RESEND_API_KEY not set');

		const resend = new Resend(apiKey);
		const result = await resend.emails.send({
			from: 'SynergyOS <noreply@mail.synergyos.ai>',
			to: args.email,
			subject: `You've been invited to join ${args.organizationName}`,
			html: `<!-- Email template -->`,
			text: `You've been invited... ${args.inviteLink}`
		});

		return { success: true, emailId: result.data?.id };
	}
});
```

**Why**: 
- Non-blocking: Mutation returns immediately, email sent asynchronously
- Error isolation: Email failures don't break mutation
- Better UX: User sees success immediately

**Apply when**: 
- Sending emails after mutations (invites, notifications, confirmations)
- External API calls that shouldn't block user actions

**Related**: #L1320 in ci-cd.md (E2E test mode for emails)

**Source**: SYOS-232 (Send Email When Invite Created)

---

## #L3500: Server-Side Invite Acceptance After Registration [🟡 IMPORTANT]

**Symptom**: User registers via invite link, verifies email, but gets redirected to `/invite` page showing unauthenticated UI instead of organization  
**Root Cause**: Client-side redirect after email verification causes cookie timing race condition - session cookie not yet available to server-side layout on subsequent request  
**Fix**:

```typescript
// ❌ WRONG: Client-side invite acceptance after redirect
// src/routes/auth/verify-email/+server.ts
return json({ success: true, redirectTo: '/invite?code=...' });
// Client redirects to /invite, then tries to accept invite
// Cookie timing issue: session not yet available to server-side layout

// ✅ CORRECT: Server-side invite acceptance before redirect
// src/routes/auth/verify-email/+server.ts
const sessionId = await establishSession({ event, ... });
let redirectTo = registrationData.redirect ?? '/inbox';
const inviteMatch = redirectTo.match(/^\/invite\?code=([^&]+)/);

if (inviteMatch) {
	const inviteCode = inviteMatch[1];
	const acceptResult = await convex.mutation(api.organizations.acceptOrganizationInvite, {
		sessionId, // ✅ Use newly established session
		code: inviteCode
	});
	redirectTo = `/org/circles?org=${acceptResult.organizationId}`; // ✅ Direct redirect
}

return json({ success: true, redirectTo });
```

**Why**: Server-side mutations execute immediately after session establishment, avoiding cookie propagation delays. Direct redirect to organization eliminates client-side race conditions.  
**Apply when**: Accepting invites, joining teams, or performing organization actions immediately after account creation/authentication  
**Related**: #L850 (Session validation), #L1200 (SessionId pattern)

**Source**: SYOS-233 (Invite Acceptance Page)

---

## #L3600: Server-Side Invite Acceptance After Login [🟡 IMPORTANT]

**Symptom**: User logs in from invite link, gets redirected back to `/invite` page showing "Sign in or create an account" screen instead of being accepted into organization/team  
**Root Cause**: Login handler redirects to `/invite?code=...` without accepting invite server-side, causing client-side race condition where session cookie may not be immediately available  
**Fix**:

```typescript
// ❌ WRONG: Redirect to invite page after login
// src/routes/auth/login/+server.ts
return json({ success: true, redirectTo: redirect ?? '/inbox' });
// If redirect contains /invite?code=..., client tries to accept invite
// Race condition: session cookie not yet available, auto-accept fails

// ✅ CORRECT: Accept invite server-side before redirect
// src/routes/auth/login/+server.ts
await establishSession({ event, ... });
let redirectTo = redirect ?? '/inbox';
const inviteMatch = redirectTo.match(/^\/invite\?code=([^&]+)/);

if (inviteMatch) {
	const inviteCode = inviteMatch[1];
	const inviteDetails = await convex.query(api.organizations.getInviteByCode, {
		code: inviteCode
	});
	
	if (inviteDetails?.type === 'organization') {
		const result = await convex.mutation(api.organizations.acceptOrganizationInvite, {
			sessionId: event.locals.auth.sessionId!,
			code: inviteCode
		});
		redirectTo = `/org/circles?org=${result.organizationId}`;
	} else if (inviteDetails?.type === 'team') {
		const result = await convex.mutation(api.teams.acceptTeamInvite, {
			sessionId: event.locals.auth.sessionId!,
			code: inviteCode
		});
		redirectTo = `/org/teams/${result.teamId}?org=${result.organizationId}`;
	}
}

return json({ success: true, redirectTo });
```

**Why**: Server-side mutations execute immediately after session establishment, avoiding cookie propagation delays. Direct redirect to organization/team eliminates client-side race conditions.  
**Apply when**: Accepting invites immediately after login (same pattern as registration)  
**Related**: #L3500 (Server-Side Invite Acceptance After Registration), #L1200 (SessionId pattern)

**Source**: SYOS-235 (URL Patterns - Login Redirect Fix)

---

## #L3650: Migrate from Internal Types to Public API Interfaces [🟡 IMPORTANT]

**Symptom**: Components depend on internal composable return types (`UseOrganizations`, `UseCircles`), making refactoring risky and breaking changes when internal implementation changes  
**Root Cause**: Direct dependency on `ReturnType<typeof useComposable>` couples components to internal implementation details instead of stable public API contract  
**Fix**:

```typescript
// ❌ WRONG: Direct dependency on internal type
import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
const organizations = getContext<UseOrganizations | undefined>('organizations');

// ✅ CORRECT: Depend on public API interface (enables loose coupling)
import type { OrganizationsModuleAPI } from '$lib/composables/useOrganizations.svelte';
// OR: import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/api';
const organizations = getContext<OrganizationsModuleAPI | undefined>('organizations');
```

**Migration Pattern**:

1. **Create API Contract** (if not exists):
   ```typescript
   // src/lib/modules/core/organizations/api.ts
   export interface OrganizationsModuleAPI {
     get organizations(): OrganizationSummary[];
     get activeOrganizationId(): string | null;
     setActiveOrganization(organizationId: string | null): void;
     // ... all public properties and methods
   }
   ```

2. **Wrap Implementation**:
   ```typescript
   // src/lib/composables/useOrganizations.svelte.ts
   export function useOrganizations(...) {
     // ... internal implementation ...
     
     // Return value implements API contract
     const api: OrganizationsModuleAPI = {
       get organizations() { return queries.organizations; },
       // ... implement all interface members ...
     };
     
     return api; // Backward compatible
   }
   
   // Re-export interface for convenience
   export type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/api';
   ```

3. **Migrate Components**:
   ```typescript
   // Find all files using internal type
   // grep -r "UseOrganizations" src/
   
   // Replace in each file:
   // - import type { UseOrganizations } → import type { OrganizationsModuleAPI }
   // - getContext<UseOrganizations | undefined> → getContext<OrganizationsModuleAPI | undefined>
   ```

**Why**: Public API contracts enable loose coupling - components depend on stable interface, not internal implementation. Internal refactoring becomes safe without breaking dependent modules.  
**Apply when**: Migrating composables to module architecture, enabling safe refactoring, or preparing for dependency injection  
**Related**: #L240 (Shared Type Definitions), #L1300 (Circular API References)

**Source**: SYOS-296, SYOS-299 (Organizations Module API Migration)

---

## #L3900: Create Module API Contract for New Modules [🟡 IMPORTANT]

**Symptom**: New module needs public API contract to enable loose coupling, but no pattern exists for creating one from scratch  
**Root Cause**: Module API contracts enable loose coupling between modules, but the pattern for creating them isn't documented  
**Fix**:

```typescript
// 1. Create API contract file (src/lib/modules/[module]/api.ts)
/**
 * [Module] Module API Contract
 *
 * Public interface for the [Module] module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { Id } from '$lib/convex';

// Export public types used by the API
export interface [Module]Data {
	_id: Id<'[table]'>;
	// ... public fields only
}

// Export composable options and return types
export interface Use[Module]Options {
	organizationId: () => string | undefined;
	sessionId: () => string | undefined;
	// ... other options
}

export interface Use[Module]Return {
	get items(): [Module]Data[];
	get isLoading(): boolean;
	get error(): unknown;
	// ... public methods
}

/**
 * Public API contract for the [Module] module
 *
 * **Usage Pattern:**
 * ```typescript
 * import type { [Module]ModuleAPI } from '$lib/modules/[module]/api';
 *
 * // In component:
 * const [module] = getContext<[Module]ModuleAPI>('[module]');
 * const items = [module].use[Module]({ ... });
 * ```
 */
export interface [Module]ModuleAPI {
	// Expose public composables
	use[Module](options: Use[Module]Options): Use[Module]Return;
	// ... other public methods
}

// 2. Update manifest (src/lib/modules/[module]/manifest.ts)
import type { ModuleManifest } from '../registry';
import { FeatureFlags } from '$lib/featureFlags';
import type { [Module]ModuleAPI } from './api';

export const [module]Module: ModuleManifest = {
	name: '[module]',
	version: '1.0.0',
	dependencies: ['core'], // List module dependencies
	featureFlag: FeatureFlags.[MODULE]_MODULE, // Feature flag key
	api: undefined as [Module]ModuleAPI | undefined // Type reference for API contract
};
```

**Key Principles**:

1. **Expose Only Public Surface**: Only expose composables/types used by other modules, hide internal implementation
2. **Use Interface Types**: Define return types as interfaces (not `ReturnType<typeof composable>`)
3. **Document Usage Pattern**: Include JSDoc with usage examples and migration path
4. **Update Manifest**: Reference API type in manifest for type safety
5. **Follow Existing Pattern**: Use OrganizationsModuleAPI (SYOS-295) or MeetingsModuleAPI (SYOS-305) as template

**Checklist**:

- [ ] API contract file created (`src/lib/modules/[module]/api.ts`)
- [ ] Public composables exposed via API interface
- [ ] Public types exported (options, return types, data structures)
- [ ] Manifest updated with API reference
- [ ] TypeScript compilation succeeds
- [ ] Pattern documented with JSDoc comments
- [ ] No runtime errors

**Why**: Module API contracts enable loose coupling - other modules depend on stable interface, not internal implementation. Internal refactoring becomes safe without breaking dependent modules.  
**Apply when**: Creating new module API contract (e.g., InboxModuleAPI, CirclesModuleAPI) or adding API to existing module  
**Related**: #L3650 (Migrate to Public API Interfaces), #L4000 (Module Registry System)

**Source**: SYOS-305 (MeetingsModuleAPI Contract)

---

## #L4100: Move Shared Components to Core Module [🟡 IMPORTANT]

**Symptom**: Component used by multiple modules creates cross-module dependencies (e.g., Flashcards → Inbox, Meetings → Inbox), violating modularity principles  
**Root Cause**: Shared UI components placed in feature modules instead of core module, creating unwanted coupling between modules  
**Fix**:

```typescript
// ❌ WRONG: TagSelector in inbox module, used by flashcards
// Creates dependency: Flashcards → Inbox
import type { InboxModuleAPI } from '$lib/modules/inbox/api';
const inboxAPI = getContext<InboxModuleAPI | undefined>('inbox-api');
const TagSelector = inboxAPI?.TagSelector;

// ✅ CORRECT: TagSelector in core module, used via CoreModuleAPI
// No cross-module dependencies
import type { CoreModuleAPI } from '$lib/modules/core/api';
const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
const TagSelector = coreAPI?.TagSelector;
```

**Migration Steps**:

1. **Move Component to Core Module**:
   ```bash
   # Move component file
   mv src/lib/components/[feature]/Component.svelte \
      src/lib/modules/core/components/Component.svelte
   ```

2. **Create/Update CoreModuleAPI**:
   ```typescript
   // src/lib/modules/core/api.ts
   import Component from '$lib/modules/core/components/Component.svelte';
   
   export interface CoreModuleAPI {
     Component: typeof Component;
   }
   
   export function createCoreModuleAPI(): CoreModuleAPI {
     return {
       Component: Component
     };
   }
   ```

3. **Remove from Feature Module API**:
   ```typescript
   // src/lib/modules/[feature]/api.ts
   // Remove Component from interface and factory
   export interface [Feature]ModuleAPI {
     // Component removed - now in CoreModuleAPI
   }
   ```

4. **Update All Consumers**:
   ```typescript
   // Update imports and context keys
   // FROM: 'feature-api' → TO: 'core-api'
   const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
   const Component = coreAPI?.Component;
   ```

5. **Update Layout Context Provider**:
   ```typescript
   // src/routes/(authenticated)/+layout.svelte
   import { createCoreModuleAPI } from '$lib/modules/core/api';
   const coreAPI = createCoreModuleAPI();
   setContext('core-api', coreAPI);
   ```

6. **Update Core Manifest**:
   ```typescript
   // src/lib/modules/core/manifest.ts
   import type { CoreModuleAPI } from './api';
   export const coreModule: ModuleManifest = {
     api: undefined as CoreModuleAPI | undefined
   };
   ```

**Key Principles**:

1. **Core Module = Shared Components**: Components used by 2+ modules belong in core
2. **Feature Modules = Domain-Specific**: Components used only by one module stay in that module
3. **API Contracts**: Always expose via module API, never direct imports
4. **Update All Consumers**: Don't leave any consumers using old API
5. **Update Documentation**: Update manifest comments and API docs

**Checklist**:

- [ ] Component moved to `src/lib/modules/core/components/`
- [ ] CoreModuleAPI created/updated with component exposed
- [ ] Feature module API updated (component removed)
- [ ] All consumers updated to use `core-api` context
- [ ] Layout provides CoreModuleAPI via context
- [ ] Core manifest updated with API reference
- [ ] TypeScript compilation succeeds
- [ ] No cross-module dependencies remain

**Why**: Shared components in core module eliminate cross-module dependencies and enable proper module boundaries. Feature modules can use shared components without coupling to other feature modules.  
**Apply when**: Component used by multiple modules, creating unwanted dependencies (e.g., Flashcards → Inbox, Meetings → Inbox)  
**Related**: #L3900 (Create Module API Contract), #L3650 (Migrate to Public API Interfaces)

**Source**: SYOS-308 (Move TagSelector to Core Module)

---

## #L3800: Type Interface Migration - Match Return Types Exactly [🔴 CRITICAL]

**Symptom**: TypeScript error "Type 'string | null' is not assignable to type 'string | undefined'" when migrating to interface  
**Root Cause**: Interface contracts specify exact return types. Composables expecting `undefined` fail with `null`.  
**Fix**:

```typescript
// ❌ WRONG: Returns null but interface expects undefined
const organizationId = $derived(() => {
	const org = activeOrganization();
	return org?.organizationId ?? null; // ❌ null not assignable to string | undefined
});

useMeetings({
	organizationId: () => organizationId(), // ❌ Type error
	sessionId: getSessionId
});

// ✅ CORRECT: Match interface contract exactly
const organizationId = $derived(() => {
	const org = activeOrganization();
	return org?.organizationId ?? undefined; // ✅ undefined matches interface
});

useMeetings({
	organizationId: () => organizationId(), // ✅ Type matches
	sessionId: getSessionId
});
```

**Why**: When migrating from concrete types to interfaces, the interface contract must be honored exactly. `null` and `undefined` are different types in TypeScript.  
**Apply when**: Migrating code to use interface contracts (e.g., OrganizationsModuleAPI), ensuring return types match interface definitions  
**Related**: #L1200 (sessionId migration), #L1250 (Id type assertions), #L3650 (Interface migration pattern)

---

## #L4000: Module Registry & Discovery System [🟡 IMPORTANT]

**Symptom**: Modules loaded statically, no way to discover enabled modules, hardcoded feature flag checks scattered across codebase  
**Root Cause**: No centralized module registry system for discovery, dependency management, and feature flag integration  
**Fix**:

```typescript
// ❌ WRONG: Hardcoded feature flag checks, no module discovery
let meetingsEnabled = false;
let circlesEnabled = false;
try {
	[meetingsEnabled, circlesEnabled] = await Promise.all([
		client.query(api.featureFlags.checkFlag, { flag: 'meetings-module', sessionId }),
		client.query(api.featureFlags.checkFlag, { flag: 'circles_ui_beta', sessionId })
	]);
} catch (error) {
	console.warn('Failed to load feature flags:', error);
}

// ✅ CORRECT: Module registry with discovery and dependency management

// 1. Create module registry (src/lib/modules/registry.ts)
export interface ModuleManifest {
	name: string;
	version: string;
	dependencies: string[];
	featureFlag: FeatureFlagKey | null;
	api?: unknown;
}

const moduleRegistry = new Map<string, ModuleManifest>();

export function registerModule(manifest: ModuleManifest): void {
	if (moduleRegistry.has(manifest.name)) {
		throw new Error(`Module "${manifest.name}" is already registered`);
	}
	moduleRegistry.set(manifest.name, manifest);
}

export async function getEnabledModules(
	sessionId: string,
	client: { query: (query: unknown, args: unknown) => Promise<unknown> }
): Promise<string[]> {
	const allModules = getAllModules();
	const enabledModules: string[] = [];

	for (const module of allModules) {
		// Check feature flag
		const flagEnabled = await checkFeatureFlag(module.featureFlag, sessionId, client);
		if (!flagEnabled) continue;

		// Check dependencies
		const allDependenciesEnabled = module.dependencies.every((depName) =>
			enabledModules.includes(depName)
		);

		if (allDependenciesEnabled) {
			enabledModules.push(module.name);
		}
	}

	return enabledModules;
}

export async function checkFeatureFlag(
	flag: FeatureFlagKey | null,
	sessionId: string,
	client: { query: (query: unknown, args: unknown) => Promise<unknown> }
): Promise<boolean> {
	if (flag === null) return true; // Always enabled
	
	try {
		const result = await client.query(api.featureFlags.checkFlag, { flag, sessionId });
		return (result as boolean) ?? false;
	} catch (error) {
		console.warn(`Failed to check feature flag "${flag}":`, error);
		return false; // Secure by default
	}
}

// 2. Create module manifests (src/lib/modules/core/manifest.ts)
export const coreModule: ModuleManifest = {
	name: 'core',
	version: '1.0.0',
	dependencies: [],
	featureFlag: null, // Always enabled
	api: undefined as OrganizationsModuleAPI | undefined
};

// src/lib/modules/meetings/manifest.ts
export const meetingsModule: ModuleManifest = {
	name: 'meetings',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: FeatureFlags.MEETINGS_MODULE, // 'meetings-module'
	api: undefined
};

// 3. Initialize registry (src/lib/modules/index.ts)
import { registerModule } from './registry';
import { coreModule } from './core/manifest';
import { meetingsModule } from './meetings/manifest';

registerModule(coreModule);
registerModule(meetingsModule);

// 4. Use registry in layout server (src/routes/(authenticated)/+layout.server.ts)
import '$lib/modules'; // Initialize registry
import { getEnabledModules, isModuleEnabled } from '$lib/modules/registry';

// Use registry instead of hardcoded checks
let meetingsEnabled = false;
try {
	const enabledModules = await getEnabledModules(sessionId, client);
	meetingsEnabled = await isModuleEnabled('meetings', sessionId, client);
} catch (error) {
	console.warn('Failed to load feature flags server-side:', error);
	meetingsEnabled = false;
}
```

**Key Components**:

1. **Module Registry** (`src/lib/modules/registry.ts`):
   - `registerModule()` - Register modules
   - `getEnabledModules()` - Discover enabled modules (checks flags + dependencies)
   - `isModuleEnabled()` - Check if specific module enabled
   - `resolveDependencies()` - Resolve dependency order

2. **Module Manifests** (`src/lib/modules/[module]/manifest.ts`):
   - Declare module metadata (name, version, dependencies, feature flag)
   - Define module API contract (optional)

3. **Registry Initialization** (`src/lib/modules/index.ts`):
   - Import all manifests
   - Register all modules on import

4. **Layout Server Integration**:
   - Import registry initialization
   - Use `getEnabledModules()` or `isModuleEnabled()` instead of hardcoded checks

**Benefits**:

- ✅ Centralized module discovery
- ✅ Automatic dependency resolution
- ✅ Single source of truth for module enablement
- ✅ Foundation for independent module deployment
- ✅ Easier to add new modules (just create manifest + register)

**Why**: Enables true modularity - modules can be discovered, enabled/disabled dynamically, and managed independently. Foundation for independent module deployment and versioning.  
**Apply when**: Building modular architecture, refactoring layout server, adding new modules, or preparing for independent deployment  
**Related**: #L1420 (Lazy Module Loading), [feature-flags.md](feature-flags.md), [modularity-refactoring-analysis.md](../architecture/modularity-refactoring-analysis.md)  
**See**: `src/lib/modules/registry.ts`, `src/lib/modules/index.ts`, `src/routes/(authenticated)/+layout.server.ts` for complete implementation

**Source**: SYOS-301, SYOS-302, SYOS-303 (Module Registry & Discovery System)

---

**Pattern Count**: 47  
**Last Validated**: 2025-11-19  
**Context7 Source**: `/get-convex/convex-backend`, `convex-test` NPM docs, TypeScript type system, SvelteKit docs
