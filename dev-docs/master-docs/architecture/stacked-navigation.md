# Stacked Navigation Pattern

**Version**: 1.1  
**Last Updated**: 2025-12-19  
**Status**: Production Ready

---

## Overview

Stacked navigation provides hierarchical panel navigation that:

- **Works across modules**: Navigate from org-chart → role → linked document seamlessly
- **Syncs to URL**: Creates shareable deep links (`?nav=c:abc123.r:def456`)
- **Derives selection state**: Stack is single source of truth (no sync bugs)
- **Supports edit protection**: Blocks navigation when unsaved changes exist
- **Validates permissions**: Eager permission check, lazy content loading
- **Manages z-index**: Automatic layering for stacked panels

**Key insight**: Selection is derived from the navigation stack, never separately managed. This eliminates an entire class of bugs where navigation and selection get out of sync.

---

## Architecture

### Three-Layer Model

The stacked navigation system is architected in three distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Module Composables                                 │
│ (useOrgChart.svelte.ts, useMeetings.svelte.ts, etc.)       │
│                                                             │
│ • Derive selection from stack                              │
│ • Module-specific navigation helpers                       │
│ • Integration with module business logic                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────────────┐
│ Layer 2: useStackedNavigation (contract)                    │
│ (src/lib/composables/useStackedNavigation.svelte.ts)       │
│                                                             │
│ • Global singleton via Svelte context                      │
│ • URL synchronization (bidirectional)                      │
│ • Edit protection registry                                 │
│ • Permission validation on URL load                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────────────┐
│ Layer 1: useNavigationStack (primitive)                     │
│ (src/lib/composables/useNavigationStack.svelte.ts)         │
│                                                             │
│ • Pure stack operations (push, pop, jump, clear)           │
│ • Z-index management                                        │
│ • No URL sync, no permissions, no business logic           │
└─────────────────────────────────────────────────────────────┘
```

**Why three layers?**

- **Layer 1 (Primitive)**: Reusable stack implementation, no coupling to URL or permissions
- **Layer 2 (Contract)**: Shared navigation infrastructure, URL sync, permission gates
- **Layer 3 (Module)**: Business logic integration, module-specific helpers

---

## Key Files

| File | Layer | Purpose |
|------|-------|---------|
| `src/lib/composables/useNavigationStack.svelte.ts` | 1 | Stack primitive (push/pop/jump) |
| `src/lib/composables/useStackedNavigation.svelte.ts` | 2 | Navigation contract (URL sync, permissions) |
| `src/lib/infrastructure/navigation/constants.ts` | — | Layer type mappings (circle, role, etc.) |
| `src/lib/infrastructure/navigation/accessChecks.ts` | — | Permission validation helpers |
| `src/lib/components/organisms/PermissionGate.svelte` | — | Access denied UI component |
| `src/lib/components/organisms/StackedPanel.svelte` | — | Panel UI with breadcrumbs |
| `src/lib/modules/org-chart/composables/useOrgChart.svelte.ts` | 3 | Example: Org chart integration |

---

## Usage Patterns

### Pattern 1: Setting Up Navigation in a Layout

Initialize navigation in a parent layout (e.g., workspace layout):

```typescript
// src/routes/(authenticated)/w/[slug]/+layout.svelte
<script lang="ts">
  import { useStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
  import { setContext } from 'svelte';
  import { useConvexClient } from 'convex-svelte';

  const convexClient = useConvexClient();

  // Initialize navigation with URL sync and permissions
  const navigation = useStackedNavigation({
    onNavigate: (target, context) => {
      // Sync module selection state to match stack
      // This is where you notify your module composables
      console.log('Navigated to:', target);
    },
    enableUrlSync: true,
    enablePermissionChecks: true,
    convex: convexClient,
    sessionId: data.sessionId
  });

  // Provide to child components via context
  setContext('stacked-navigation', navigation);
</script>

<slot />
```

### Pattern 2: Consuming Navigation in a Module

Derive selection from the stack (never manage separately):

```typescript
// src/lib/modules/org-chart/composables/useOrgChart.svelte.ts
import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
import type { Id } from '$lib/convex';

export function useOrgChart(options: { sessionId: () => string }) {
  // Get shared navigation from context
  const navigation = getStackedNavigation();

  // ✅ CORRECT: Derive selection from stack (single source of truth)
  const selectedCircleId = $derived(
    navigation.getTopmostLayer('circle')?.id as Id<'circles'> | null
  );
  const selectedRoleId = $derived(
    navigation.getTopmostLayer('role')?.id as Id<'circleRoles'> | null
  );

  // ❌ WRONG: Separate selection state (can get out of sync!)
  // let selectedCircleId = $state<Id<'circles'> | null>(null);

  // Navigation methods
  function openCircle(circleId: string, circleName: string) {
    navigation.push({ type: 'circle', id: circleId, name: circleName });
  }

  function openRole(roleId: string, roleName: string) {
    navigation.push({ type: 'role', id: roleId, name: roleName });
  }

  return {
    get selectedCircleId() { return selectedCircleId; },
    get selectedRoleId() { return selectedRoleId; },
    get navigationStack() { return navigation; },
    openCircle,
    openRole
  };
}
```

### Pattern 3: Checking Visibility in Panels

Panels should derive their visibility from the navigation stack:

```svelte
<!-- src/lib/modules/org-chart/components/CircleDetailPanel.svelte -->
<script lang="ts">
  import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
  import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';

  const navigation = getStackedNavigation();

  let { circleId, circleName } = $props();

  // Derive visibility from stack
  const isOpen = $derived(navigation.isInStack('circle', circleId));
  const isTopmost = $derived(navigation.isTopmost('circle', circleId));
</script>

{#if isOpen}
  <StackedPanel
    {isOpen}
    navigationStack={navigation.stack}
    onClose={navigation.handleClose}
    onBreadcrumbClick={navigation.handleBreadcrumbClick}
  >
    <!-- Panel content -->
  </StackedPanel>
{/if}
```

### Pattern 4: Edit Protection

Register edit protection when a panel enters edit mode:

```typescript
// In a component with edit mode
import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';

const navigation = getStackedNavigation();

let isEditMode = $state(false);
let isDirty = $state(false);
let showDiscardDialog = $state(false);

// Register edit protection when entering edit mode
const editProtection = {
  isActive: () => isEditMode,
  isDirty: () => isDirty,
  onBlock: () => {
    // Navigation was blocked due to unsaved changes
    showDiscardDialog = true;
  },
  onReset: () => {
    // Navigation succeeded, reset edit mode
    isEditMode = false;
    isDirty = false;
  }
};

// Pass edit protection when initializing navigation
const navigation = useStackedNavigation({
  onNavigate: (target) => { /* ... */ },
  editProtection
});
```

---

## Adding a New Layer Type

To add a new layer type (e.g., `document`, `meeting`, `task`):

### Step 1: Add to Constants

Update `src/lib/infrastructure/navigation/constants.ts`:

```typescript
export const LAYER_TYPE_TO_PREFIX = {
  circle: 'c',
  role: 'r',
  document: 'd',  // ✅ Add new type
  // ... existing types
} as const;

export const PREFIX_TO_LAYER_TYPE = {
  c: 'circle',
  r: 'role',
  d: 'document',  // ✅ Add reverse mapping
  // ... existing types
} as const;
```

### Step 2: Add Permission Check (Backend)

Create a `canAccess` query in your backend feature:

```typescript
// convex/features/documents/queries.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const canAccess = query({
  args: {
    sessionId: v.string(),
    documentId: v.id('documents')
  },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    // Your permission logic here
    return true; // or false
  }
});
```

### Step 3: Add Access Check Case

Update `src/lib/infrastructure/navigation/accessChecks.ts`:

```typescript
export async function checkLayerAccess(
  convex: ConvexClient,
  layerType: LayerType,
  resourceId: string,
  sessionId: string
): Promise<boolean> {
  try {
    switch (layerType) {
      // ... existing cases
      case 'document':  // ✅ Add new case
        return await convex.query(api.features.documents.queries.canAccess, {
          sessionId,
          documentId: resourceId as Id<'documents'>
        });
      // ... rest of cases
    }
  } catch (error) {
    console.error(`[AccessCheck] Error checking ${layerType}:${resourceId}`, error);
    return false;
  }
}
```

### Step 4: Create Panel Component

Create a panel component that uses the pattern:

```svelte
<!-- src/lib/modules/documents/components/DocumentDetailPanel.svelte -->
<script lang="ts">
  import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
  import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
  import PermissionGate from '$lib/components/organisms/PermissionGate.svelte';

  const navigation = getStackedNavigation();

  let { documentId } = $props();

  const isOpen = $derived(navigation.isInStack('document', documentId));
  const blocked = $derived(
    navigation.blockedLayer?.type === 'document' &&
    navigation.blockedLayer?.id === documentId
  );
</script>

{#if blocked}
  <PermissionGate
    layerType="document"
    resourceId={documentId}
    onGoBack={navigation.clearBlockedLayer}
  />
{:else if isOpen}
  <StackedPanel
    {isOpen}
    navigationStack={navigation.stack}
    onClose={navigation.handleClose}
    onBreadcrumbClick={navigation.handleBreadcrumbClick}
  >
    <!-- Document content -->
  </StackedPanel>
{/if}
```

### Step 5: Integrate with Module Composable

Add navigation methods to your module composable:

```typescript
// src/lib/modules/documents/composables/useDocuments.svelte.ts
import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';

export function useDocuments() {
  const navigation = getStackedNavigation();

  // Derive selection from stack
  const selectedDocumentId = $derived(
    navigation.getTopmostLayer('document')?.id as Id<'documents'> | null
  );

  // Navigation methods
  function openDocument(documentId: string, documentName: string) {
    navigation.push({ type: 'document', id: documentId, name: documentName });
  }

  return {
    get selectedDocumentId() { return selectedDocumentId; },
    openDocument
  };
}
```

---

## Cross-Module Panel Reuse

When building new features (e.g., activation flow, reporting, admin panels), you may need to display entities from existing modules (circles, roles, documents). This section covers when to reuse existing panels vs create new ones.

### Decision Framework

| Question | Reuse Existing | Create New |
|----------|----------------|------------|
| Same data/interactions needed? | ✅ Yes | ❌ No |
| Okay with module composable dependency? | ✅ Yes | ❌ No |
| Need all panel features? | ✅ Yes | ❌ No |
| Want consistent UX with main app? | ✅ Yes | ⚠️ Maybe |
| Performance-sensitive context? | ⚠️ Maybe | ✅ Yes |

### Pattern A: Reuse with Module Composable

**When to use**: Standard case - you want the same behavior as the main app.

```typescript
// In your new feature (e.g., activation page)
import { useOrgChart } from '$lib/modules/org-chart/composables/useOrgChart.svelte';
import RoleDetailPanel from '$lib/modules/org-chart/components/RoleDetailPanel.svelte';

// Initialize the module's composable
const orgChart = useOrgChart({
  sessionId: () => data.sessionId,
  workspaceId: () => data.workspaceId
});

// Use existing panel - it works with stacked navigation automatically
<RoleDetailPanel {orgChart} roleId={issue.entityId} />
```

**Trade-offs:**
- ✅ **Consistent UI/UX** - Same look and feel as main app
- ✅ **Less code duplication** - Reuse existing components
- ✅ **Automatic updates** - Bug fixes and features propagate
- ❌ **Heavier dependency** - Loads full module composable
- ❌ **All features included** - May have actions you don't need
- ❌ **Module coupling** - Changes to module affect your feature

**Good for**: Admin panels, reports, dashboards where consistency matters

### Pattern B: Lightweight Standalone Panel

**When to use**: Simplified view, performance-critical, or avoiding tight coupling.

```svelte
<!-- SetupRolePanel.svelte - Lightweight alternative -->
<script lang="ts">
  import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
  import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
  import { useQuery } from 'convex-svelte';
  import { api } from '$lib/convex';

  const navigation = getStackedNavigation();

  let { roleId, roleName } = $props();

  // Minimal query - only what you need
  const roleQuery = browser && roleId
    ? useQuery(api.core.roles.index.get, () => ({
        sessionId: getSessionId(),
        roleId
      }))
    : null;

  const isOpen = $derived(navigation.isInStack('role', roleId));
  const isTopmost = $derived(navigation.isTopmost('role', roleId));
</script>

{#if isOpen}
  <StackedPanel
    {isOpen}
    navigationStack={navigation}
    onClose={navigation.handleClose}
    onBreadcrumbClick={navigation.handleBreadcrumbClick}
    isTopmost={() => isTopmost}
  >
    <!-- Simplified view - only what setup needs -->
    <div class="p-content-section">
      <h2 class="text-heading-2">{roleName}</h2>
      {#if roleQuery?.data}
        <p class="text-body">{roleQuery.data.purpose}</p>
      {/if}
    </div>
  </StackedPanel>
{/if}
```

**Trade-offs:**
- ✅ **Simpler, focused** - Only what you need
- ✅ **No unnecessary dependencies** - Minimal imports
- ✅ **Independent evolution** - Changes don't affect main app
- ❌ **Code duplication** - Panel logic repeated
- ❌ **Different UX** - May diverge from main app
- ❌ **Manual updates** - Bug fixes need to be applied twice

**Good for**: Onboarding flows, wizards, simplified views where full features aren't needed

### Pattern C: Shared Base Component

**When to use**: Multiple lightweight panels with shared behavior.

```typescript
// SharedRolePanel.svelte - Reusable base
<script lang="ts">
  import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    roleId: string;
    roleName: string;
    children: Snippet; // Customizable content
  }

  const navigation = getStackedNavigation();
  const isOpen = $derived(navigation.isInStack('role', roleId));
</script>

{#if isOpen}
  <StackedPanel ...>
    {@render children()}
  </StackedPanel>
{/if}
```

**Trade-offs:**
- ✅ **Reusable infrastructure** - Panel mechanics shared
- ✅ **Flexible content** - Each use case customizes
- ✅ **Moderate coupling** - Shared base, custom logic
- ⚠️ **Medium complexity** - More abstraction than A or B

**Good for**: Multiple simplified views that share panel behavior but differ in content

### Recommendation: Start Simple, Extract When Needed

**The pragmatic approach:**

1. **Start with Pattern A** (reuse existing panels)
   - Fastest to implement
   - Proven to work
   - Consistent UX

2. **Extract to Pattern B** if you hit these issues:
   - Performance problems (too many queries)
   - Feature bloat (unwanted actions/complexity)
   - Maintenance burden (module changes break your feature)

3. **Consider Pattern C** if you have:
   - 3+ simplified panels with similar structure
   - Need for shared infrastructure but custom content

**Example timeline:**
- **Week 1**: Use `RoleDetailPanel` directly (Pattern A)
- **Week 4**: Performance slow in activation flow → Create `SetupRolePanel` (Pattern B)
- **Week 8**: Need 3 more setup panels → Extract `SharedRolePanel` (Pattern C)

### Cross-Module Navigation Example

Roles can be pushed to the stack independently or as children:

```typescript
// Independent role (e.g., from governance issues list)
navigation.push({ type: 'role', id: roleId, name: roleName });
// Stack: [role]

// Role from circle context (e.g., from org chart)
navigation.push({ type: 'circle', id: circleId, name: circleName });
navigation.push({ type: 'role', id: roleId, name: roleName });
// Stack: [circle, role]
```

**Both are valid!** The navigation system doesn't enforce parent-child relationships - that's a business logic concern. Your backend may need `circleId` on issues for data modeling reasons, but navigation works either way.

### Testing Cross-Module Usage

When reusing panels from other modules:

```typescript
// Test that navigation context works
test('activation page can use org-chart panels', async () => {
  const orgChart = useOrgChart({ sessionId: () => 'test', workspaceId: () => 'test' });
  const navigation = getStackedNavigation();
  
  // Push role to stack
  navigation.push({ type: 'role', id: 'role123', name: 'Dev Lead' });
  
  // Panel should be open
  expect(navigation.isInStack('role', 'role123')).toBe(true);
});
```

---

## URL Format

Navigation state is encoded in the URL query parameter:

```
?nav=c:abc123.r:def456.d:ghi789
```

**Format rules:**

- **Query param**: `nav`
- **Layer separator**: `.` (dot)
- **Type/ID separator**: `:` (colon)
- **Type prefixes**: Defined in `constants.ts` (e.g., `c` = circle, `r` = role)

**Examples:**

| Stack State | URL Encoding |
|-------------|--------------|
| Circle "abc123" | `?nav=c:abc123` |
| Circle → Role | `?nav=c:abc123.r:def456` |
| Circle → Role → Document | `?nav=c:abc123.r:def456.d:ghi789` |

**Invalid segments** (missing colon, unknown prefix, empty ID) are skipped with console warnings.

---

## Permission Checking

The navigation system validates user access before loading content:

### Eager Permission Check, Lazy Content Load

When a URL is loaded:

1. **Parse stack from URL**: `?nav=c:abc123.r:def456`
2. **Check permissions in order**: Validate access to each layer
3. **Build accessible stack**: Include layers user can access
4. **Set blocked layer**: First layer user cannot access (if any)
5. **Load content for topmost**: Only load content for the visible panel

**Why eager permission check?**

- User sees "Access Required" gate immediately (no loading spinner)
- URL is preserved (shareable link works, just shows permission gate)
- Prevents accidental exposure of unauthorized content

**Why lazy content load?**

- Performance: Don't load data for panels underneath
- Security: Don't fetch data user shouldn't see

### Example Flow

User loads URL: `?nav=c:abc123.r:def456.d:ghi789`

**Scenario 1: Full access**
- Check `circle:abc123` → ✅ Accessible
- Check `role:def456` → ✅ Accessible
- Check `document:ghi789` → ✅ Accessible
- Result: All three panels in stack, load document content

**Scenario 2: Blocked at document**
- Check `circle:abc123` → ✅ Accessible
- Check `role:def456` → ✅ Accessible
- Check `document:ghi789` → ❌ Blocked
- Result: Stack = `[circle, role]`, `blockedLayer = document:ghi789`
- UI: Show PermissionGate for document

---

## Edit Protection

Panels with edit mode can block navigation when there are unsaved changes:

### Registration Pattern

```typescript
const navigation = useStackedNavigation({
  onNavigate: (target) => { /* ... */ },
  editProtection: {
    isActive: () => isEditMode,
    isDirty: () => isDirty,
    onBlock: () => {
      // Navigation blocked, show discard dialog
      showDiscardDialog = true;
    },
    onReset: () => {
      // Navigation succeeded, reset edit mode
      isEditMode = false;
      isDirty = false;
    }
  }
});
```

### Flow

1. User tries to navigate (close, breadcrumb click)
2. Navigation checks `editProtection.isActive() && editProtection.isDirty()`
3. If true: Call `editProtection.onBlock()`, abort navigation
4. If false: Proceed with navigation, call `editProtection.onReset()`

**Key insight**: Edit protection is optional. Only panels with edit mode need to register it.

---

## Invariants

The stacked navigation system maintains these invariants:

### INV-1: Stack is Source of Truth
**Rule**: Selection state is derived from stack, never separately managed.

```typescript
// ✅ CORRECT
const selectedCircleId = $derived(navigation.getTopmostLayer('circle')?.id);

// ❌ WRONG
let selectedCircleId = $state(null); // Can get out of sync!
```

### INV-2: Selection Derived, Not Set
**Rule**: Never call `setSelectedCircleId(id)`. Always push/pop stack.

```typescript
// ✅ CORRECT
navigation.push({ type: 'circle', id: circleId, name: circleName });

// ❌ WRONG
setSelectedCircleId(circleId); // Separate selection state!
```

### INV-3: URL Reflects Stack State
**Rule**: When `enableUrlSync` is true, URL always matches stack.

- `navigation.push()` → URL updates
- Browser back/forward → Stack syncs to URL
- Direct URL load → Stack initialized from URL

### INV-4: Permission Checked Before Content
**Rule**: When `enablePermissionChecks` is true, access validation runs before content loads.

- URL load → Permission check → Build accessible stack
- Blocked layer → Show PermissionGate
- Accessible → Load content

### INV-5: Z-Index Increments
**Rule**: Each layer gets `baseZIndex + (depth * 10)`.

- Base: 60 (matches `--z-index-panel-base` token)
- Increment: 10 (matches `--z-index-panel-increment` token)
- Example: Circle (60), Role (70), Document (80)

---

## API Reference

### useStackedNavigation

**Parameters:**

```typescript
interface UseStackedNavigationParams {
  onNavigate: (target: NavigationLayer | null, context: NavigationContext) => void;
  editProtection?: EditProtection;
  enableUrlSync?: boolean;
  convex?: ConvexClient;
  sessionId?: string;
  enablePermissionChecks?: boolean;
}
```

**Returns:**

```typescript
interface UseStackedNavigationReturn {
  // Stack access (reactive)
  stack: NavigationLayer[];
  currentLayer: NavigationLayer | null;
  previousLayer: NavigationLayer | null;
  depth: number;
  blockedLayer: NavigationLayer | null;

  // Navigation actions
  push: (layer: Omit<NavigationLayer, 'zIndex'>) => boolean;
  pushAndReplace: (layer: Omit<NavigationLayer, 'zIndex'>) => boolean;

  // Navigation handlers (for StackedPanel)
  handleClose: () => void;
  handleBreadcrumbClick: (index: number) => void;
  clearBlockedLayer: () => void;

  // Helpers
  isTopmost: (layerType: string, entityId: string | null) => boolean;
  isInStack: (layerType: string, entityId?: string) => boolean;
  getTopmostLayer: (layerType: string) => NavigationLayer | null;
  getLayer: (index: number) => NavigationLayer | null;
}
```

### useNavigationStack (Primitive)

**Returns:**

```typescript
interface UseNavigationStack {
  // Stack access (reactive)
  stack: NavigationLayer[];
  currentLayer: NavigationLayer | null;
  previousLayer: NavigationLayer | null;
  depth: number;

  // Actions
  push: (layer: Omit<NavigationLayer, 'zIndex'>) => void;
  pop: () => void;
  jumpTo: (index: number) => void;
  clear: () => void;
  getLayer: (index: number) => NavigationLayer | null;
}
```

---

## Testing Guidance

### Unit Tests

Test navigation logic in isolation:

```typescript
// useNavigationStack.test.ts
test('push adds layer to stack', () => {
  const stack = useNavigationStack();
  stack.push({ type: 'circle', id: 'abc123', name: 'Engineering' });
  expect(stack.depth).toBe(1);
  expect(stack.currentLayer?.type).toBe('circle');
});

test('pop removes current layer', () => {
  const stack = useNavigationStack();
  stack.push({ type: 'circle', id: 'abc123', name: 'Engineering' });
  stack.push({ type: 'role', id: 'def456', name: 'Dev Lead' });
  stack.pop();
  expect(stack.depth).toBe(1);
  expect(stack.currentLayer?.type).toBe('circle');
});
```

### Integration Tests

Test URL sync and permission checks:

```typescript
// stacked-navigation.integration.test.ts
test('URL sync: push updates URL', async () => {
  const navigation = useStackedNavigation({
    onNavigate: () => {},
    enableUrlSync: true
  });
  
  navigation.push({ type: 'circle', id: 'abc123', name: 'Engineering' });
  
  expect(window.location.search).toContain('nav=c:abc123');
});

test('Permission check: blocked layer shows gate', async () => {
  const navigation = useStackedNavigation({
    onNavigate: () => {},
    enablePermissionChecks: true,
    convex: mockConvex,
    sessionId: 'session123'
  });
  
  // Mock permission check to fail
  mockConvex.query.mockResolvedValueOnce(false);
  
  await navigation.push({ type: 'document', id: 'ghi789', name: 'Secret Doc' });
  
  expect(navigation.blockedLayer).toEqual({
    type: 'document',
    id: 'ghi789',
    name: 'Secret Doc'
  });
});
```

### E2E Tests

Test full user workflows:

```typescript
// org-chart-navigation.e2e.ts
test('Navigate from circle to role to document', async ({ page }) => {
  await page.goto('/w/my-workspace/chart');
  
  // Click circle
  await page.click('[data-circle-id="abc123"]');
  expect(page.url()).toContain('nav=c:abc123');
  
  // Click role
  await page.click('[data-role-id="def456"]');
  expect(page.url()).toContain('nav=c:abc123.r:def456');
  
  // Click breadcrumb to jump back
  await page.click('[data-breadcrumb-index="0"]');
  expect(page.url()).toContain('nav=c:abc123');
});
```

---

## Common Mistakes

| Mistake | Why It Happens | Correct Approach |
|---------|----------------|------------------|
| Managing selection separately | "I need a place to store selected ID" | Derive from `navigation.getTopmostLayer()` |
| Not using `getStackedNavigation()` | "I'll create my own navigation" | Use shared context |
| Hardcoding z-index | "I need this panel on top" | Let stack manage z-index |
| Not checking `isTopmost` | "All panels should handle ESC" | Only topmost panel handles ESC |
| Forgetting permission checks | "Users are trusted" | Always validate access |
| Using `$state` for navigation | "I need reactivity" | Stack is already reactive |

---

## Performance Considerations

### Lazy Content Loading

Only load content for the topmost panel:

```typescript
// ✅ CORRECT: Load only when topmost
const isTopmost = $derived(navigation.isTopmost('circle', circleId));

$effect(() => {
  if (!isTopmost) return; // Don't load if not visible
  
  loadCircleData(circleId);
});
```

### Efficient Permission Checks

Permission checks are cached per layer:

- First access: Query backend
- Subsequent access: Use cached result
- Cache invalidates: When layer is removed from stack

---

## Migration Guide

### From Separate Selection State

If your module manages selection separately, here's how to migrate:

**Before:**

```typescript
let selectedCircleId = $state<Id<'circles'> | null>(null);

function selectCircle(id: Id<'circles'>) {
  selectedCircleId = id;
}
```

**After:**

```typescript
const navigation = getStackedNavigation();

// Derive selection from stack
const selectedCircleId = $derived(
  navigation.getTopmostLayer('circle')?.id as Id<'circles'> | null
);

function selectCircle(id: Id<'circles'>, name: string) {
  navigation.push({ type: 'circle', id, name });
}
```

**Benefits:**

- No sync bugs between navigation and selection
- URL deep linking works automatically
- Browser back/forward navigation works
- Edit protection works across modules

---

## Related Documentation

- **StackedPanel Component**: `src/lib/components/organisms/StackedPanel.svelte`
- **PermissionGate Component**: `src/lib/components/organisms/PermissionGate.svelte`
- **Design Tokens**: `dev-docs/master-docs/design-system.md` (z-index tokens)
- **Architecture**: `dev-docs/master-docs/architecture.md` (Frontend Patterns section)
- **Org Chart Example**: `src/lib/modules/org-chart/composables/useOrgChart.svelte.ts`

---

## Change History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-19 | Added "Cross-Module Panel Reuse" section with decision framework, 3 patterns (reuse/standalone/shared), recommendations, and testing guidance. Addresses when to reuse existing module panels vs create new ones. |
| 1.0 | 2025-12-19 | Initial documentation from SYOS-1027 |

