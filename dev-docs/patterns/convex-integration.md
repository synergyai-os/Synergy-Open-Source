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
  () => activeOrgId ? { organizationId: activeOrgId } : undefined  // ❌ undefined
);

// ✅ CORRECT: Always send serializable value (Context7 validated)
const SENTINEL_ORG_ID = "00000000000000000000000000000000";
useQuery(
  api.teams.list,
  () => ({ organizationId: activeOrgId ?? SENTINEL_ORG_ID })  // ✅ Always valid
);

// For mutations: Strip undefined fields
const args: any = { toOrgId, count };
if (fromOrgId) args.fromOrgId = fromOrgId;  // ✅ Only add if defined
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
"use node";
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
  'flashcard-generation': flashcardTemplate,
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
  convexClient: any,  // ❌ No type safety
  inboxApi: any       // ❌ No IntelliSense
) { }

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
  convexClient: ConvexClient | null,  // ✅ Type safe
  inboxApi: InboxApi | null           // ✅ IntelliSense works
) {
  const items = await convexClient.query(inboxApi.listInboxItems, {}) as InboxItem[];
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
  highlightId?: string;  // ❌ Optional, hard to narrow
  text?: string;         // ❌ Optional, hard to narrow
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
    console.log(item.imageFileId);     // ✅ TypeScript knows imageFileId exists
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
    case State.New: return 'new';
    case State.Learning: return 'learning';
    case State.Review: return 'review';
    case State.Relearning: return 'relearning';
    default: return 'new';
  }
}

function stringToState(state: string): State {
  switch (state) {
    case 'new': return State.New;
    case 'learning': return State.Learning;
    case 'review': return State.Review;
    case 'relearning': return State.Relearning;
    default: return State.New;
  }
}

// Usage
await ctx.db.insert('flashcards', {
  fsrsState: stateToString(card.state), // ✅ Convert enum to string
});

const card: Card = {
  state: stringToState(flashcard.fsrsState), // ✅ Convert string to enum
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
  userId: Id<"users">,
  entityType: "highlights" | "flashcards",
  entityId: Id<any>,
  tagIds: Id<"tags">[]
) {
  // 1. Validate entity ownership
  // 2. Validate tag access
  // 3. Clear old assignments from junction table
  // 4. Create new assignments
}

// Type-safe public mutations (one per entity)
export const assignTagsToHighlight = mutation({
  args: {
    highlightId: v.id("highlights"),
    tagIds: v.array(v.id("tags")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await assignTagsToEntity(ctx, userId, "highlights", args.highlightId, args.tagIds);
  },
});

export const assignTagsToFlashcard = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    tagIds: v.array(v.id("tags")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await assignTagsToEntity(ctx, userId, "flashcards", args.flashcardId, args.tagIds);
  },
});
```

**Frontend Composable** (Svelte 5 pattern):

```typescript
// src/lib/composables/useTagging.svelte.ts
export function useTagging(entityType: 'highlight' | 'flashcard') {
  const state = $state({ isAssigning: false, error: null });
  const convexClient = browser ? useConvexClient() : null;
  
  // Dynamic mutation reference: 'tags:assignTagsToHighlight', 'tags:assignTagsToFlashcard'
  const mutation = browser ? 
    makeFunctionReference(`tags:assignTagsTo${capitalize(entityType)}`) : null;
  
  async function assignTags(entityId: Id<any>, tagIds: Id<'tags'>[]) {
    await convexClient.mutation(mutation, {
      [`${entityType}Id`]: entityId,
      tagIds,
    });
  }
  
  return {
    get isAssigning() { return state.isAssigning; },
    assignTags,
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
**See**: `TAGGING_SYSTEM_ANALYSIS.md` for full architecture

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

**Pattern Count**: 11  
**Last Validated**: 2025-11-08  
**Context7 Source**: `/get-convex/convex-backend`

