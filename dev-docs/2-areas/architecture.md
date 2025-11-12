# SynergyOS Architecture & Tech Stack

**OS = Open Source**

## Overview

SynergyOS is a full-stack open source application built with modern web technologies, designed for both web and mobile platforms. The architecture follows a hybrid authentication model with server-side validation and client-side state management.

## Tech Stack

### Frontend

- **Framework**: SvelteKit 5 (with TypeScript)
- **UI Components**: Bits UI (headless components) + Tailwind CSS 4
- **Mobile**: Capacitor 7 (iOS support configured)
- **State Management**: Convex Svelte (reactive queries/mutations)
- **Build Tool**: Vite 7

### Backend

- **Database & Backend**: Convex (serverless, real-time database)
- **Authentication**: WorkOS AuthKit (enterprise-grade, OAuth 2.0)
- **Email Service**: Resend

### Development Tools

- **Testing**: Vitest (unit tests) + Playwright (E2E tests)
- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript

## Why These Technologies?

### SvelteKit 5 + Svelte 5 Runes

**Why We Chose It:**

- **Server-Side Rendering (SSR)**: Built-in SSR and static site generation for better performance and SEO
- **File-Based Routing**: Intuitive `+page.svelte`, `+layout.svelte`, `+page.server.ts` structure
- **First-Class TypeScript**: End-to-end type safety from frontend to backend
- **Svelte 5 Runes**: Modern reactivity system (`$state`, `$derived`, `$effect`) with better composability
- **Zero-Config**: Works out of the box with Vite, TypeScript, and modern tooling

**Quick Start:**

**File Structure:**

```
src/routes/
  +page.svelte              # Homepage (client component)
  +layout.svelte            # Root layout (wraps all pages)
  +layout.server.ts         # Server-side data loading
  +page.server.ts           # Page-specific server data
  dashboard/
    +page.svelte            # /dashboard route
```

**Reactive State:**

```typescript
<script lang="ts">
  // Reactive state
  let count = $state(0);

  // Derived values (computed)
  const doubled = $derived(count * 2);

  // Side effects
  $effect(() => {
    console.log(`Count changed to ${count}`);
  });
</script>

<button onclick={() => count++}>
  Count: {count} (Doubled: {doubled})
</button>
```

**Server-Side Data Loading:**

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		user: { name: 'Randy' }
	};
};
```

**See Also:**

- [Svelte 5 Reactivity Patterns](patterns/svelte-reactivity.md) - Complete guide to `$state`, `$derived`, composables
- [Composables Analysis](composables-analysis.md) - Reusable logic patterns
- Official Docs: Use Context7 for latest SvelteKit and Svelte 5 documentation

---

### Convex

**Why We Chose It:**

- **Real-Time Subscriptions**: Live queries update UI automatically when data changes
- **Serverless Functions**: No infrastructure management, auto-scaling, zero DevOps
- **TypeScript End-to-End**: Type-safe queries/mutations with auto-generated client types
- **Developer Experience**: Fast local development, instant deploys, time-travel debugging

**Quick Start:**

**Schema Definition:**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	notes: defineTable({
		title: v.string(),
		content: v.string(),
		userId: v.id('users'),
		createdAt: v.number()
	}).index('by_user', ['userId'])
});
```

**Queries (Read Data):**

```typescript
// convex/notes.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query('notes')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
	}
});
```

**Mutations (Write Data):**

```typescript
// convex/notes.ts
import { mutation } from './_generated/server';

export const create = mutation({
	args: { title: v.string(), content: v.string() },
	handler: async (ctx, { title, content }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Not authenticated');

		return await ctx.db.insert('notes', {
			title,
			content,
			userId,
			createdAt: Date.now()
		});
	}
});
```

**Using in Components:**

```typescript
<script lang="ts">
  import { useQuery, useMutation } from 'convex-svelte';
  import { api } from '$convex/_generated/api';

  // Reactive query (auto-updates)
  const notesQuery = useQuery(api.notes.list, () => ({ userId }));
  const notes = $derived(notesQuery?.data ?? []);

  // Mutation
  const createNote = useMutation(api.notes.create);

  async function handleCreate() {
    await createNote({ title: 'New Note', content: '' });
  }
</script>
```

**See Also:**

- [Convex Integration Patterns](patterns/convex-integration.md) - Avoid undefined, runtime restrictions, auth
- [Authentication Architecture](#authentication-architecture) - How Convex Auth works
- Official Docs: Use Context7 for latest Convex documentation

---

### Tailwind CSS 4

**Why We Chose It:**

- **Utility-First CSS**: Rapid UI development with composable utility classes
- **Design Tokens via CSS Variables**: Semantic tokens that adapt to light/dark mode automatically
- **No Build Step**: Tailwind CSS 4 uses native CSS features (no PostCSS required)
- **Fast Iteration**: Change design system once, updates everywhere
- **Type Safety**: IntelliSense autocomplete for all utility classes

**Quick Start:**

**Design Token System:**

```css
/* src/app.css */
@theme {
	/* Semantic color tokens */
	--color-surface: light-dark(white, #1a1a1a);
	--color-primary: light-dark(#1a1a1a, #f5f5f5);

	/* Spacing tokens */
	--spacing-nav-item: 0.5rem;
	--spacing-inbox-container: 1.5rem;
}
```

**Using Semantic Tokens:**

```svelte
<!-- ❌ WRONG: Hardcoded values -->
<div class="px-2 py-1.5 bg-gray-900 text-white">

<!-- ✅ CORRECT: Semantic tokens -->
<div class="px-nav-item py-nav-item bg-surface text-primary">
```

**Why Tokens Matter:**

```svelte
<!-- These automatically adapt to light/dark mode -->
<div class="border-accent-primary bg-surface text-primary">
	<!-- No manual dark: variants needed! -->
</div>
```

**See Also:**

- [Design Tokens](design-tokens.md) - Complete token reference ⭐ **MANDATORY**
- [Design Principles](design-principles.md) - Visual philosophy, accessibility, UX
- [Component Architecture](component-architecture.md) - Tokens → Utilities → Patterns → Components
- [UI Patterns](patterns/ui-patterns.md) - Solved design problems
- Official Docs: Use Context7 for latest Tailwind CSS 4 documentation

---

### PostHog

**Why We Chose It:**

- **Open Source**: Self-hostable, transparent, privacy-friendly alternative to Google Analytics
- **Product Analytics**: Event tracking, funnels, retention, user paths, cohorts
- **Feature Flags**: Toggle features without deploys, A/B testing, gradual rollouts
- **Session Replay**: Watch user sessions to debug issues and improve UX
- **No Data Silos**: All product data in one place

**Quick Start:**

**Server-Side Tracking (Recommended):**

```typescript
// src/lib/server/posthog.ts
import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

export function getPostHogClient() {
	if (!client) {
		client = new PostHog(PUBLIC_POSTHOG_KEY, {
			host: PUBLIC_POSTHOG_HOST
		});
	}
	return client;
}

// Track critical events server-side (bypasses browser blockers)
export async function trackEvent(
	event: string,
	distinctId: string,
	properties: Record<string, any>
) {
	await getPostHogClient().capture({
		event,
		distinctId,
		properties
	});
}
```

**Event Naming Conventions:**

```typescript
// Use object_action format
await trackEvent('user_signed_in', email, { method: 'password' });
await trackEvent('note_created', userId, { hasTitle: true });
await trackEvent('inbox_synced', userId, { itemCount: 42 });
```

**Why Server-Side:**

- Browser privacy tools block `*.posthog.com` requests
- Server-to-server requests guarantee event delivery
- Critical for tracking sign-ups, conversions, payments

**See Also:**

- [Analytics Patterns](patterns/analytics.md) - Server-side tracking, event naming, AARRR funnel
- [PostHog Setup](posthog.md) - Configuration and usage guide
- Official Docs: Use Context7 for latest PostHog documentation

---

### ProseMirror

**Why We Chose It:**

- **Collaborative Editing Foundation**: Built for real-time collaboration (CRDT-ready)
- **Schema-Based**: Precise document model prevents invalid content states
- **Extensible Plugins**: Modular architecture for mentions, emoji, code blocks, etc.
- **Framework Agnostic**: Works with any UI framework (Svelte, React, Vue)
- **Battle-Tested**: Powers Notion, Atlassian, GitLab, and other major editors

**Quick Start:**

**Basic Editor Setup:**

```typescript
// See: src/lib/components/notes/NoteEditor.svelte
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { createEditorState } from '$lib/utils/prosemirror-setup';

let editorElement: HTMLDivElement;
let editorView: EditorView | null = null;

onMount(() => {
	const state = createEditorState(content);
	editorView = new EditorView(editorElement, {
		state,
		dispatchTransaction(transaction) {
			const newState = editorView!.state.apply(transaction);
			editorView!.updateState(newState);

			// Export to markdown
			const markdown = exportMarkdown(newState);
			onContentChange?.(markdown);
		}
	});
});
```

**Plugin System:**

```typescript
// Mentions plugin
import { createMentionPlugin } from '$lib/utils/prosemirror-mentions';
const mentionPlugin = createMentionPlugin([
	{ id: 'randy', label: 'Randy', icon: '👤' },
	{ id: 'project', label: 'project', icon: '📁' }
]);

// Emoji plugin
import { createEmojiPlugin } from './prosemirror/emoji-plugin';
const emojiPlugin = createEmojiPlugin();

// Syntax highlighting for code blocks
import { createSyntaxHighlightPlugin } from '$lib/utils/prosemirror-codeblock';
const syntaxPlugin = createSyntaxHighlightPlugin();

// Add to editor state
const state = EditorState.create({
	schema,
	plugins: [mentionPlugin, emojiPlugin, syntaxPlugin]
});
```

**Document Model:**

```typescript
// ProseMirror uses a precise schema
const schema = new Schema({
	nodes: {
		doc: { content: 'block+' },
		paragraph: { content: 'inline*', group: 'block' },
		heading: { content: 'inline*', group: 'block', attrs: { level: {} } },
		codeBlock: { content: 'text*', group: 'block', attrs: { language: {} } },
		text: { inline: true }
	},
	marks: {
		strong: {},
		em: {},
		code: {}
	}
});
```

**Export to Markdown:**

```typescript
import { exportMarkdown } from '$lib/utils/prosemirror-setup';

const markdown = exportMarkdown(editorView.state);
// "# Title\n\nParagraph with **bold** and *italic*"
```

**Key Files:**

- `src/lib/components/notes/NoteEditor.svelte` - Main editor component
- `src/lib/utils/prosemirror-setup.ts` - Editor state creation and export
- `src/lib/utils/prosemirror-mentions.ts` - Mention plugin
- `src/lib/components/notes/prosemirror/emoji-plugin.ts` - Emoji plugin
- `src/lib/utils/prosemirror-codeblock.ts` - Code block syntax highlighting

**See Also:**

- Pattern documentation coming when we next refactor editor code
- Official Docs: Use Context7 for latest ProseMirror documentation

---

## Other Technologies (Document as We Use)

The following tools are part of our stack and will be documented with rationale + quick start guides when we next work with them:

**UI & Components:**

- **Bits UI** - Headless component library (accessible, unstyled primitives)
- **Layerchart** - Charts and data visualization

**Mobile:**

- **Capacitor 7** - Cross-platform mobile (iOS support configured)

**Testing:**

- **Vitest** - Unit tests (fast, Vite-native)
- **Playwright** - E2E tests (browser automation)

**Integrations:**

- **Readwise API** - Import highlights from reading apps
- **Resend** - Transactional email service
- **Claude API** - AI-powered flashcard generation

**Documentation:**

- **MDsveX** - Markdown in Svelte components
- **Shiki** - Syntax highlighting for code blocks
- **Rehype** - Markdown processing (auto-linking headings, slugs)

**Utilities:**

- **ts-fsrs** - Spaced repetition algorithm (flashcards)
- **marked** - Markdown parser and renderer
- **highlight.js** / **lowlight** - Code syntax highlighting

**Follow the pattern:** When you touch any of these tools, add a section above with:

1. **Why** we chose it (rationale)
2. **Quick Start** (setup + basic usage)
3. **Links** to Context7 docs and any pattern files

## Authentication Architecture

> ✅ **CURRENT**: We now use **WorkOS AuthKit** for authentication (migrated Nov 2025).
>
> **📖 Complete Architecture**: [WorkOS + Convex Auth Architecture](workos-convex-auth-architecture.md) ⭐ **READ THIS FIRST**
>
> **🔧 Deployment Patterns**: [patterns/auth-deployment.md](patterns/auth-deployment.md)
>
> The information below is **ARCHIVED** from the old Convex Auth implementation and kept for reference.

---

### 🔐 OLD: Authentication Model (ARCHIVED)

**Note**: This was the old `@mmailaender/convex-auth-svelte` approach (no longer used).

SynergyOS now uses WorkOS AuthKit. See [patterns/auth-deployment.md](patterns/auth-deployment.md) for current implementation.

<details>
<summary>Click to expand archived Convex Auth documentation</summary>

SynergyOS used a **hybrid authentication approach** that combined:

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
import { convexAuth } from '@convex-dev/auth/server';
import { Password } from '@convex-dev/auth/providers/Password';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Password] // Email/password auth
});
```

**`convex/http.ts`** - HTTP routes for authentication

```typescript
import { httpRouter } from 'convex/server';
import { auth } from './auth';

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
	'/about'
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
	return {
		user: {
			/* user data */
		}
	};
};
```

### Convex Functions: Validate Authentication

Always validate authentication in Convex queries and mutations:

```typescript
// convex/users.ts
import { query, mutation } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

// Example: Get current user
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error('Client is not authenticated');
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
			throw new Error('Client is not authenticated');
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

</details>

---

### Current Implementation: WorkOS AuthKit

For the current authentication implementation, see:

- **[patterns/auth-deployment.md](patterns/auth-deployment.md)** - Complete patterns and examples
- **Migration**: Completed Nov 2025 from `@mmailaender/convex-auth-svelte` to WorkOS AuthKit
- **Features**: OAuth 2.0, hosted UI, enterprise-grade security, free tier up to 1M MAUs

---

## Role-Based Access Control (RBAC)

> 🚧 **Status**: Design Phase - Implementation Pending (Nov 2025)

SynergyOS implements a **Permission-Based Access Control** system where:

- Users are assigned **roles** (Admin, Manager, Team Lead, Billing Admin, Member, Guest)
- Roles have **permissions** (e.g., `teams.create`, `org.billing.view`)
- Features check **permissions**, not roles directly (scalable approach)

### Key Features

- ✅ **Multiple Roles Per User** - Users can have multiple roles simultaneously
- ✅ **Resource-Scoped Permissions** - Team Leads only manage their own teams
- ✅ **Guest Access** - Resource-specific sharing (like Notion/Google Docs)
- ✅ **Audit Trail** - All permission checks and role changes are logged

### Documentation

- **[📖 RBAC Architecture](rbac/rbac-architecture.md)** - Complete system design with database schema, diagrams, and implementation guide
- **[⚡ Quick Reference](rbac/rbac-quick-reference.md)** - Fast lookup for common patterns and permissions

### Example Usage

```typescript
// In Convex functions - Check permission
await requirePermission(ctx, userId, "teams.create", undefined, orgId);

// In Svelte components - Permission gate
const permissions = usePermissions(() => userId, () => orgId);

{#if permissions.can("teams.create")}
  <button>Create Team</button>
{/if}
```

**See full documentation for**:

- Complete role and permission definitions
- Database schema and migration plan
- Code examples and patterns
- Testing strategy

---

## Frontend Architecture: Composables Pattern

### Composables Overview

Axon uses **Svelte 5 composables** to extract reusable logic from components. All composables follow established patterns documented in [`dev-docs/2-areas/patterns/`](patterns/) (see [INDEX.md](patterns/INDEX.md) for fast lookup).

### Composable Structure

All composables:

- Use `.svelte.ts` extension (required for Svelte 5 runes)
- Located in `src/lib/composables/`
- Use single `$state` object pattern for reactivity
- Return getters for reactive state properties
- Have explicit TypeScript return types

### Available Composables

1. **`useInboxItems`** - Manages inbox item queries and filtering
   - Uses `useQuery()` from `convex-svelte` for reactive subscriptions
   - Handles filtering by type and processed status
   - Returns reactive `filteredItems` and loading states

2. **`useSelectedItem`** - Manages selected inbox item state
   - Handles async item detail loading
   - Prevents race conditions with query tracking
   - Uses `$effect` for reactive data fetching

3. **`useInboxSync`** - Handles Readwise sync operations
   - Manages sync state (progress, errors, success)
   - Handles polling for sync progress
   - Integrates with activity tracker

4. **`useKeyboardNavigation`** - Keyboard navigation (J/K keys)
   - Uses function parameters for reactive values
   - Sets up keyboard event listeners with `$effect`
   - Handles navigation and scrolling

5. **`useInboxLayout`** - Manages inbox layout state
   - Persists layout preferences to localStorage
   - Handles responsive layout changes

### Composable Patterns

**Pattern 1: Single `$state` Object with Getters**

```typescript
const state = $state({
	isSyncing: false,
	syncError: null as string | null
});

return {
	get isSyncing() {
		return state.isSyncing;
	},
	get syncError() {
		return state.syncError;
	}
};
```

**Pattern 2: Function Parameters for Reactive Values**

```typescript
export function useKeyboardNavigation(
	filteredItems: () => InboxItem[],
	selectedItemId: () => string | null,
	onSelectItem: (itemId: string) => void
) {
	// Call functions to get current reactive values
	const items = filteredItems();
	const currentId = selectedItemId();
}
```

**Pattern 3: Reactive Queries with `useQuery()`**

```typescript
import { useQuery } from 'convex-svelte';

const inboxQuery = useQuery(api.inbox.listInboxItems, () => ({ processed: false }));

const inboxItems = $derived(inboxQuery?.data ?? []);
```

See `dev-docs/2-areas/patterns/` for complete pattern documentation.

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
│   └── lib/
│       ├── composables/          # Reusable logic (Svelte 5 composables)
│       │   ├── useInboxItems.svelte.ts
│       │   ├── useSelectedItem.svelte.ts
│       │   ├── useInboxSync.svelte.ts
│       │   ├── useKeyboardNavigation.svelte.ts
│       │   └── useInboxLayout.svelte.ts
│       ├── types/                # Shared TypeScript types
│       │   └── convex.ts         # Convex client and API types
│       └── components/           # Reusable UI components
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
# Convex deployment URL (set automatically)
CONVEX_URL=https://your-deployment.convex.cloud
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

- [ ] Configure WorkOS Production environment with production redirect URIs
- [ ] Set WorkOS production credentials in deployment platform (Vercel)
- [ ] Validate auth in all Convex queries/mutations using `getAuthUserId()`
- [ ] Ensure HTTPS is enabled (required for secure cookies)
- [ ] Test complete auth flow: login → protected route → logout
- [ ] Configure CORS if needed
- [ ] Add rate limiting for auth endpoints
- [ ] Test authentication flow end-to-end
- [ ] Verify mobile app authentication works

## Additional Resources

- **[Authentication Patterns](patterns/auth-deployment.md)** - WorkOS AuthKit implementation
- **[Convex Documentation](https://docs.convex.dev)** - Use Context7 for latest docs
- **[WorkOS Documentation](https://workos.com/docs)** - AuthKit guides
- **[SvelteKit Documentation](https://kit.svelte.dev/docs)** - Framework docs
- **[Capacitor Documentation](https://capacitorjs.com/docs)** - Mobile integration
