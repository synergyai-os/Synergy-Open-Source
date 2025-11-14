# Coding Standards for AI Agents

> **Purpose**: Clear, enforceable rules for AI agents/LLMs when writing code for SynergyOS. These standards prevent the 483 linting errors that blocked PRs.

---

## 🚨 **CRITICAL: Never Use These**

### ❌ **NEVER use `any` type**

**Why**: Eliminates type safety, causes ~250 linting errors.

```typescript
// ❌ WRONG
function process(data: any) {
	return data.value;
}

// ✅ CORRECT: Use proper types
function process<T extends { value: unknown }>(data: T) {
	return data.value;
}

// ✅ CORRECT: Use unknown + type guards
function process(data: unknown) {
	if (typeof data === 'object' && data !== null && 'value' in data) {
		return (data as { value: unknown }).value;
	}
	throw new Error('Invalid data');
}

// ✅ CORRECT: Use Convex types
import type { Doc, Id } from '../convex/_generated/dataModel';
function processTag(tag: Doc<'tags'>) {
	return tag.name;
}
```

**Exception**: Test files (`.test.ts`, `.spec.ts`) - see ESLint config line 54.

---

### ❌ **NEVER use `{#each}` without keys**

**Why**: Causes ~50 linting errors, breaks reactivity.

```svelte
<!-- ❌ WRONG -->
{#each items as item}
	<div>{item.name}</div>
{/each}

<!-- ✅ CORRECT: Always provide key -->
{#each items as item (item._id)}
	<div>{item.name}</div>
{/each}

<!-- ✅ CORRECT: Use unique identifier -->
{#each tags as tag (tag._id)}
	<TagBadge {tag} />
{/each}

<!-- ✅ CORRECT: Use index if no unique ID (rare) -->
{#each items as item, index (index)}
	<div>{item.name}</div>
{/each}
```

**Rule**: Every `{#each}` block MUST have a key expression `(key)`.

---

### ❌ **NEVER use navigation without `resolve()`**

**Why**: Causes ~100 linting errors, breaks SvelteKit prefetching.

```typescript
// ❌ WRONG: Direct path string
import { goto } from '$app/navigation';
goto('/settings');

// ✅ CORRECT: Use resolveRoute() for type-safe navigation
import { goto } from '$app/navigation';
import { resolveRoute } from '$app/paths';

goto(resolveRoute('/settings'));

// ✅ CORRECT: For dynamic routes with params
goto(resolveRoute('/tags/[id]', { id: tagId }));

// ✅ CORRECT: For query params (append after resolveRoute)
const url = resolveRoute('/settings') + '?tab=permissions';
goto(url);

// ✅ CORRECT: Using URL object
goto(resolveRoute('/settings'), {
	searchParams: { tab: 'permissions' },
	invalidateAll: true
});
```

**Rule**: Every `goto()` call MUST use `resolveRoute()` from `$app/paths`.

**Note**: This ensures type-safe route resolution and enables SvelteKit's prefetching.

---

### ❌ **NEVER use `Map`/`Set` instead of `SvelteMap`/`SvelteSet`**

**Why**: Causes ~10 linting errors, breaks Svelte reactivity.

```typescript
// ❌ WRONG: Regular Map/Set
const items = $state(new Map<string, string>());
items.set('key', 'value'); // ❌ Not reactive

// ✅ CORRECT: Use SvelteMap/SvelteSet
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
const items = $state(new SvelteMap<string, string>());
items.set('key', 'value'); // ✅ Reactive

// ✅ CORRECT: Use arrays/objects for simple cases
const items = $state<Record<string, string>>({});
items['key'] = 'value'; // ✅ Reactive
```

**Rule**: Use `SvelteMap`/`SvelteSet` for reactive collections, or plain objects/arrays.

---

### ❌ **NEVER leave unused imports/variables**

**Why**: Causes ~50 linting errors, clutters codebase.

```typescript
// ❌ WRONG: Unused imports
import { useState, useEffect } from 'react'; // ❌ Not using React
import { goto } from '$app/navigation'; // ❌ Not using goto

// ✅ CORRECT: Remove unused imports
// (no imports if not needed)

// ❌ WRONG: Unused variables
const unused = computeValue();
const result = processData();

// ✅ CORRECT: Remove or use
const result = processData();
// Or prefix with underscore if intentionally unused
const _unused = computeValue(); // ESLint ignores _prefixed vars
```

**Rule**: Remove unused imports/variables, or prefix with `_` if intentionally unused.

---

## ✅ **ALWAYS Follow These Patterns**

### ✅ **ALWAYS use TypeScript types**

```typescript
// ✅ CORRECT: Explicit types
interface User {
	id: string;
	name: string;
	email: string;
}

function getUser(id: string): Promise<User> {
	// ...
}

// ✅ CORRECT: Use Convex generated types
import type { Doc, Id } from '../convex/_generated/dataModel';
type Tag = Doc<'tags'>;
type TagId = Id<'tags'>;
```

---

### ✅ **ALWAYS use design tokens (never hardcode)**

```svelte
<!-- ❌ WRONG: Hardcoded values -->
<div class="px-2 py-1.5 bg-gray-900 text-white">

<!-- ✅ CORRECT: Design tokens -->
<div class="px-nav-item py-nav-item bg-sidebar text-sidebar-primary">
```

**Reference**: `dev-docs/2-areas/design/design-tokens.md`

---

### ✅ **ALWAYS use `.svelte.ts` extension for composables**

```typescript
// ❌ WRONG: Regular .ts file
// src/lib/composables/useData.ts

// ✅ CORRECT: .svelte.ts extension
// src/lib/composables/useData.svelte.ts
```

**Why**: Required for Svelte 5 runes (`$state`, `$derived`, `$effect`).

---

### ✅ **ALWAYS use single `$state` object with getters**

```typescript
// ❌ WRONG: Multiple $state variables
let isOpen = $state(false);
let data = $state(null);

// ✅ CORRECT: Single $state object + getters
const state = $state({ isOpen: false, data: null });
return {
	get isOpen() {
		return state.isOpen;
	},
	get data() {
		return state.data;
	}
};
```

**Reference**: `dev-docs/2-areas/patterns/svelte-reactivity.md#L10`

---

### ✅ **ALWAYS use `useQuery()` for Convex data**

```typescript
// ❌ WRONG: Manual one-time query
const items = await convexClient.query(api.items.list, {});

// ✅ CORRECT: Reactive subscription
import { useQuery } from 'convex-svelte';
const query = useQuery(api.items.list, () => ({ filter: false }));
const items = $derived(query?.data ?? []);
```

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md#L220`

---

### ✅ **ALWAYS destructure `validateSessionAndGetUserId()`**

```typescript
// ❌ WRONG: Missing destructuring
const userId = await validateSessionAndGetUserId(ctx, args.sessionId);
// userId is now { userId: "...", session: {...} } not a string!

// ✅ CORRECT: Destructure to extract userId
const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
```

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md#L850`

---

### ✅ **ALWAYS use `import type` for `_generated` files**

```typescript
// ❌ WRONG: Runtime import
import { Doc, Id } from './_generated/dataModel';

// ✅ CORRECT: Type-only import
import type { Doc, Id } from './_generated/dataModel';
```

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md#L590`

---

### ✅ **ALWAYS guard browser-only code**

```typescript
// ❌ WRONG: Module-level browser check
if (browser) {
	$effect(() => {
		document.addEventListener('keydown', handler);
	});
}

// ✅ CORRECT: Browser check inside $effect
import { browser } from '$app/environment';

$effect(() => {
	if (!browser) return;
	document.addEventListener('keydown', handler);
	return () => document.removeEventListener('keydown', handler);
});
```

**Reference**: `dev-docs/2-areas/patterns/svelte-reactivity.md#L500`

---

## 📋 **TypeScript Best Practices**

### Use Discriminated Unions for Polymorphic Data

```typescript
// ✅ CORRECT: Discriminated union
type BaseItem = {
	_id: string;
	type: 'highlight' | 'note' | 'flashcard';
};

type Highlight = BaseItem & {
	type: 'highlight';
	highlightId: string;
};

type Note = BaseItem & {
	type: 'note';
	text: string;
};

type InboxItem = Highlight | Note;

function process(item: InboxItem) {
	if (item.type === 'highlight') {
		console.log(item.highlightId); // ✅ TypeScript knows highlightId exists
	}
}
```

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md#L290`

---

### Use Type Guards for Unknown Data

```typescript
// ✅ CORRECT: Type guard pattern
function isUser(data: unknown): data is User {
	return (
		typeof data === 'object' && data !== null && 'id' in data && 'name' in data && 'email' in data
	);
}

function process(data: unknown) {
	if (isUser(data)) {
		console.log(data.email); // ✅ TypeScript knows it's a User
	}
}
```

---

### Avoid `@ts-ignore` and `@ts-expect-error`

```typescript
// ❌ WRONG: Suppressing errors
// @ts-ignore
const result = process(data);

// ✅ CORRECT: Fix the type error
const result = process(data as ProcessedData);
// Or better: Fix the function signature
function process(data: ProcessedData): Result {
	// ...
}
```

**Exception**: Only use `@ts-expect-error` with a comment explaining why it's safe.

---

## 🎨 **Svelte Best Practices**

### Use `$derived` for Computed Values

```svelte
<script lang="ts">
	let count = $state(0);

	// ✅ CORRECT: Use $derived for computed values
	let doubled = $derived(count * 2);

	// ❌ WRONG: Don't use $effect for computed values
	// $effect(() => { doubled = count * 2; });
</script>
```

**Reference**: `dev-docs/2-areas/patterns/svelte-reactivity.md#L440`

---

### Use `$effect` Only for Side Effects

```svelte
<script lang="ts">
	let count = $state(0);

	// ✅ CORRECT: $effect for side effects (logging, API calls)
	$effect(() => {
		console.log('Count changed:', count);
		// API call, DOM manipulation, etc.
	});
</script>
```

---

### Pass Reactive Values as Functions

```typescript
// ❌ WRONG: Direct value capture
export function useKeyboard(items: InboxItem[]) {
	const current = items[0]; // Always stale
}

// ✅ CORRECT: Function parameters
export function useKeyboard(items: () => InboxItem[]) {
	const currentItems = items(); // Always fresh
	const current = currentItems[0];
}

// Usage
const keyboard = useKeyboard(() => filteredItems);
```

**Reference**: `dev-docs/2-areas/patterns/svelte-reactivity.md#L80`

---

## 🔌 **Convex Best Practices**

### Never Pass `undefined` to Convex

```typescript
// ❌ WRONG: undefined in payload
useQuery(api.teams.list, () => (activeOrgId ? { organizationId: activeOrgId } : undefined));

// ✅ CORRECT: Always send serializable value
const SENTINEL_ORG_ID = '00000000000000000000000000000000';
useQuery(api.teams.list, () => ({
	organizationId: activeOrgId ?? SENTINEL_ORG_ID
}));
```

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md#L10`

---

### Separate "use node" Files

```typescript
// ❌ WRONG: "use node" with mutations
"use node";
export const create = mutation({ ... }); // ❌ Not allowed

// ✅ CORRECT: Separate files
// convex/flashcards.ts (NO "use node")
export const create = mutation({ ... });

// convex/crypto.ts (WITH "use node" - actions only)
"use node";
export const encrypt = internalAction({ ... });
```

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md#L50`

---

### Use File=Noun, Function=Verb Naming

```typescript
// ❌ WRONG: File name matches function name
// convex/generateFlashcard.ts
export const generateFlashcard = action({ ... });
// Result: api.generateFlashcard.generateFlashcard ❌

// ✅ CORRECT: File = domain (noun), Function = action (verb)
// convex/flashcards.ts
export const generate = action({ ... });
// Result: api.flashcards.generate ✅
```

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md#L190`

---

## 🧪 **Testing Best Practices**

### Use `.svelte.test.ts` for Browser Tests

```typescript
// ❌ WRONG: .test.ts runs in Node (no Web Crypto API)
// src/lib/client/crypto.test.ts

// ✅ CORRECT: .svelte.test.ts runs in browser
// src/lib/client/crypto.svelte.test.ts
```

**Reference**: `dev-docs/2-areas/patterns/svelte-reactivity.md#L800`

---

### Use Integration Tests for Convex Functions

```typescript
// ✅ CORRECT: Integration test with convex-test
import { convexTest } from 'convex-test';
import { api } from '../../../convex/_generated/api';

describe('Tags Integration', () => {
	it('should list tags', async () => {
		const t = convexTest(schema, modules);
		const { sessionId } = await createTestSession(t);
		const tags = await t.query(api.tags.listTags, { sessionId });
		expect(tags).toBeDefined();
	});
});
```

**Reference**: `dev-docs/2-areas/patterns/convex-integration.md#L900`

---

## 📝 **Code Review Checklist**

Before submitting code, verify:

- [ ] No `any` types (except test files)
- [ ] All `{#each}` blocks have keys
- [ ] All `goto()` calls use `resolveRoute()`
- [ ] No unused imports/variables
- [ ] Using `SvelteMap`/`SvelteSet` if needed (not `Map`/`Set`)
- [ ] Composables use `.svelte.ts` extension
- [ ] Single `$state` object with getters
- [ ] Using `useQuery()` for Convex data
- [ ] Destructuring `validateSessionAndGetUserId()`
- [ ] Using `import type` for `_generated` files
- [ ] Browser checks inside `$effect` (not module-level)
- [ ] Using design tokens (no hardcoded values)
- [ ] No `@ts-ignore` without explanation

---

## 🔗 **Related Documentation**

- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Fast pattern lookup
- **Svelte 5**: `dev-docs/2-areas/patterns/svelte-reactivity.md` - Reactivity patterns
- **Convex**: `dev-docs/2-areas/patterns/convex-integration.md` - Convex patterns
- **Design**: `dev-docs/2-areas/design/design-tokens.md` - Design token reference
- **Architecture**: `dev-docs/2-areas/architecture/architecture.md` - Tech stack

---

**Last Updated**: 2025-01-XX  
**Purpose**: Prevent linting errors that block PRs  
**Target**: AI agents/LLMs writing code for SynergyOS
