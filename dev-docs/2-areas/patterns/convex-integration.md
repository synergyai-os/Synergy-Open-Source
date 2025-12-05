# Convex Integration Patterns

Patterns for Convex queries, mutations, real-time updates, and performance optimization.

---

## #L10: Preload Related Data to Avoid N+1 Queries [🟡 IMPORTANT]

**Keywords**: preload, batch query, N+1 queries, performance, instant display, listByWorkspace, roles preloading

**Symptom**: 
- Data loads with delay after user interaction (e.g., roles appear after circle selection)
- Multiple sequential queries causing poor UX
- N+1 query problem (1 query + N queries for related data)

**Root Cause**: Loading related data on-demand causes delay. When user selects an item, related data must be fetched, creating a visible delay.

**Example of broken code**:
```typescript
// ❌ BROKEN: Loads roles when circle is selected (causes delay)
const rolesQuery = $derived.by(() => {
  if (!selectedCircleId) return null;
  return useQuery(api.circleRoles.listByCircle, () => ({
    sessionId: getSessionId(),
    circleId: selectedCircleId
  }));
});
```

**Fix**: Preload related data when parent data loads, store in composable state:

```typescript
// ✅ CORRECT: Preload all roles when workspace loads
// Backend: Create listByWorkspace query
export const listByWorkspace = query({
  args: { sessionId: v.string(), workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    // Get all circles
    const circles = await ctx.db
      .query('circles')
      .withIndex('by_workspace_archived', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('archivedAt', undefined)
      )
      .collect();

    // Fetch roles for all circles in parallel (Promise.all executes concurrently)
    const rolesByCirclePromises = circleIds.map(async (circleId) => {
      const roles = await ctx.db
        .query('circleRoles')
        .withIndex('by_circle_archived', (q) =>
          q.eq('circleId', circleId).eq('archivedAt', undefined)
        )
        .collect();
      return { circleId, roles };
    });
    const rolesByCircleData = await Promise.all(rolesByCirclePromises);

    // Fetch assignments in parallel
    const assignmentPromises = allRoleIds.map(async (roleId) => {
      const assignments = await ctx.db
        .query('userCircleRoles')
        .withIndex('by_role_archived', (q) =>
          q.eq('circleRoleId', roleId).eq('archivedAt', undefined)
        )
        .collect();
      return { roleId, assignments };
    });
    const assignmentsByRoleData = await Promise.all(assignmentPromises);

    // Group and return
    return Array.from(rolesByCircle.entries()).map(([circleId, roles]) => ({
      circleId,
      roles
    }));
  }
});

// Frontend: Preload in composable
const rolesByWorkspaceQuery =
  browser && getSessionId() && getWorkspaceId()
    ? useQuery(api.circleRoles.listByWorkspace, () => ({
        sessionId: getSessionId(),
        workspaceId: getWorkspaceId()
      }))
    : null;

// Store in Map for O(1) lookup
const rolesByCircle = $derived.by(() => {
  const data = rolesByWorkspaceQuery?.data ?? [];
  const map = new Map<Id<'circles'>, Role[]>();
  for (const { circleId, roles } of data) {
    map.set(circleId, roles);
  }
  return map;
});

// Expose getter
getRolesForCircle: (circleId: Id<'circles'>) => {
  return rolesByCircle.get(circleId) ?? null;
}

// Component: Use preloaded data (instant display)
const roles = $derived(
  orgChart?.selectedCircleId
    ? orgChart.getRolesForCircle(orgChart.selectedCircleId) ?? []
    : []
);
```

**Performance**:
- **Before**: N+1 queries (1 for circles + N for each circle's roles)
- **After**: 1 client query (internal parallel queries executed concurrently)
- **Result**: Instant display, no delay

**Key Principles**:
1. **Create batch query** that loads all related data in one call
2. **Use Promise.all** for parallel internal queries (Convex executes efficiently)
3. **Store in Map** for O(1) lookup by ID
4. **Preload when parent data loads** (not on-demand)
5. **Expose getter method** for easy access

**When to Use**:
- Related data needed for multiple items (e.g., roles for all circles)
- User interaction triggers data display (e.g., selecting circle shows roles)
- Data is small enough to preload (memory overhead acceptable)
- UX requires instant display (no loading delay acceptable)

**Real Example**: `circleRoles.listByWorkspace` + `useOrgChart.getRolesForCircle`

**Related**: 
- Convex batch query best practices
- Promise.all parallel execution
- Map-based O(1) lookup patterns

---

## #L140: useQuery Hydration Errors in Components vs Composables [🔴 CRITICAL]

**Keywords**: useQuery, hydration error, SSR, white screen, browser check, composable, component, $derived, conditional query, reactive query

**Symptom**: 
- White screen on hard refresh with `Failed to hydrate: Error: sessionId and workspaceId required`
- Query works initially but breaks on page refresh
- Error at component line where `useQuery` is conditionally created
- Component script runs during SSR even when wrapped in `{#if browser}`

**Root Cause**: 
1. `{#if browser}` in template only controls **rendering**, not **script execution**
2. Component scripts run during SSR/hydration regardless of template conditionals
3. `useQuery` conditionally created based on `$derived` values evaluates **once at initialization**
4. If `$derived` value is `undefined` initially, query is `null` forever (not reactive)
5. If query throws during hydration, it breaks the page

**Example of broken code**:
```svelte
<!-- Parent: +page.svelte -->
{#if browser && orgChart}
  <CircleDetailPanel {orgChart} />  <!-- ❌ Component script STILL runs during SSR -->
{/if}

<!-- CircleDetailPanel.svelte -->
<script lang="ts">
  // ❌ BROKEN: workspaceId is $derived and undefined during hydration
  const workspaceId = $derived.by(() => circle?.workspaceId);
  
  // ❌ BROKEN: Condition evaluates ONCE at initialization
  // When workspaceId becomes available later, query is still null
  const templatesQuery =
    browser && $page.data.sessionId && workspaceId
      ? useQuery(api.roleTemplates.list, () => {
          if (!workspaceId) throw new Error('workspaceId required');  // ❌ Throws during hydration
          return { workspaceId };
        })
      : null;
</script>
```

**Fix**: Move query to composable where SSR behavior is different:

```typescript
// ✅ CORRECT: Query in composable (useOrgChart.svelte.ts)
// Composable is only created when browser && sessionId is true (in +page.svelte)
// The "throw when params not ready" pattern works - Convex retries reactively

const roleTemplatesQuery = browser
  ? useQuery(api.roleTemplates.list, () => {
      const sessionId = getSessionId();
      const workspaceId = getWorkspaceId();
      // Throw when params not ready - Convex handles gracefully and retries
      if (!sessionId || !workspaceId) throw new Error('sessionId and workspaceId required');
      return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
    })
  : null;

// Store in Map for O(1) lookup
const templatesMap = $derived.by(() => {
  const data = roleTemplatesQuery?.data;
  if (!data) return new SvelteMap();
  // ... populate map
});

// Expose helper methods
return {
  getCoreRolesForCircle: (circleId) => { /* use templatesMap */ },
  getRegularRolesForCircle: (circleId) => { /* use templatesMap */ },
};

// Component: Use composable's preloaded data (no query creation)
const coreRoles = $derived(
  orgChart?.selectedCircleId
    ? orgChart.getCoreRolesForCircle(orgChart.selectedCircleId)
    : []
);
```

**Why Composables Work**:
1. Composable is only instantiated when `browser && sessionId` is true
2. The "throw error when params not ready" pattern works in composables
3. Convex handles the error gracefully and retries when params become available
4. Components use reactive getters - no query creation needed

**Key Principles**:
1. **Never conditionally create useQuery based on $derived values in components**
2. **Move queries to composables** where SSR behavior is predictable
3. **Use "throw when params not ready" pattern** inside query function
4. **Expose helper methods** from composable for filtered/derived data
5. **Components use reactive getters** - no query logic in components

**Detection**:
- Check for `useQuery` in component with condition checking `$derived` values
- Check for hydration errors mentioning "required" or query params
- Check if query works initially but breaks on hard refresh

**Real Example**: 
- Before: `CircleDetailPanel.svelte` had `templatesQuery` with workspaceId condition
- After: `useOrgChart.svelte.ts` has `roleTemplatesQuery` + helper methods
- Component uses `orgChart.getCoreRolesForCircle()` / `orgChart.getRegularRolesForCircle()`

**Related**: 
- Composable Reactivity Break (svelte-reactivity.md#L10)
- Preload Related Data (convex-integration.md#L10)
- SvelteKit SSR/Hydration lifecycle

---

## #L250: Conditional Query Creation Must Be Wrapped in $derived [🔴 CRITICAL]

**Keywords**: useQuery, $derived, conditional query, reactive query creation, null forever, circle selection, dependency changes, ternary evaluation

**Symptom**: 
- Query works when dependencies are available at component init
- Query never fires when dependencies become available later (e.g., after user selection)
- `queryResult` is permanently `null` even after selecting an item
- UI doesn't update despite backend data being available

**Root Cause**: When you write a ternary for conditional query creation **outside of a reactive context**, it's evaluated **once** at initialization. If the condition is `false` initially (e.g., no circle selected), the query is `null` and stays `null` forever - even when a circle is later selected.

**Example of broken code**:
```typescript
// ❌ BROKEN: Ternary evaluated ONCE at init
// If circle() returns null initially, canEditQuery stays null forever
const canEditQuery =
    browser && params.circle() && params.sessionId()
        ? useQuery(api.permissions.check, () => ({
              circleId: params.circle()!.circleId,
              sessionId: params.sessionId()!
          }))
        : null;

// When user selects circle, circle() now returns a value
// BUT the ternary doesn't re-evaluate - canEditQuery is still null!
```

**Fix**: Wrap conditional query creation in `$derived()`:

```typescript
// ✅ CORRECT: $derived makes the ternary reactive
const canEditQuery = $derived(
    browser && params.circle() && params.sessionId()
        ? useQuery(api.permissions.check, () => ({
              circleId: params.circle()!.circleId,
              sessionId: params.sessionId()!
          }))
        : null
);

// Now when circle changes from null → value, $derived re-evaluates
// and creates the query subscription!
```

**Why This Works**:
1. `$derived` tracks dependencies read inside it synchronously
2. When `params.circle()` changes, `$derived` detects the change
3. The entire expression (including ternary) re-evaluates
4. `useQuery` is now called and the subscription is created

**When to Use `$derived` Wrapper**:
- Query depends on state that might be `null`/`undefined` initially
- State comes from user interaction (selecting item, opening panel)
- Condition uses function calls like `params.circle()`

**When NOT Needed**:
- Dependencies are always available at init (e.g., `sessionId` from page data)
- Query is always created (no conditional)

**Common Scenarios**:
- Permission check after selecting item in list
- Loading detail data after opening panel
- Any query that depends on user-selected context

**Anti-Patterns**:
- ❌ Bare ternary for query creation: `const q = condition ? useQuery(...) : null`
- ❌ Using `$effect` to create queries (creates subscription leaks)
- ✅ `$derived` wrapper: `const q = $derived(condition ? useQuery(...) : null)`

**Performance Optimization**: If you have a fast pre-check that can determine "no access" immediately, check it before the query:

```typescript
// Fast path: If workspace setting disables feature, skip backend call
const isDisabledAtWorkspaceLevel = $derived(!allowFeature);

const permissionQuery = $derived(
    browser && !isDisabledAtWorkspaceLevel && params.item()
        ? useQuery(api.permissions.check, () => ({ ... }))
        : null
);

// Result: If feature disabled, no network call needed
```

**Real Example**: `useQuickEditPermission.svelte.ts` - fixed by wrapping query creation in `$derived`

**Related**: 
- #L140: useQuery Hydration Errors (composable vs component)
- Composable Reactivity Break (svelte-reactivity.md#L10)
- Svelte 5 `$derived` documentation

---

---

## #L340: Use Reactive useQuery Instead of Manual Queries for Auto-Refetch [🟡 IMPORTANT]

**Keywords**: useQuery, manual query, convexClient.query, $effect, auto-refetch, reactivity, mutation updates, hard reload, refetch

**Symptom**: 
- After mutations, UI doesn't update until page refresh
- Need to manually call refetch functions after mutations
- "Hard reload" feeling when data updates
- Different behavior between similar entities (e.g., circles update smoothly but roles don't)

**Root Cause**: Manual `convexClient.query()` calls in `$effect` don't automatically refetch after mutations. Convex pushes updates via WebSocket, but manual queries aren't subscribed to those updates. Only reactive `useQuery` automatically refetches when data changes.

**Example of broken code**:
```typescript
// ❌ BROKEN: Manual query doesn't auto-refetch after mutations
$effect(() => {
  if (!browser || !convexClient || !state.selectedRoleId) return;
  
  convexClient
    .query(api.circleRoles.get, {
      sessionId: getSessionId(),
      roleId: state.selectedRoleId
    })
    .then((result) => {
      state.selectedRole = result;
    });
});

// After mutation, need manual refetch:
async function handleQuickUpdateRole(updates) {
  await convexClient.mutation(api.circleRoles.quickUpdate, { ... });
  await refetchSelectedRole(); // ❌ Manual refetch needed - causes "hard reload"
}
```

**Fix**: Use reactive `useQuery` wrapped in `$derived`:

```typescript
// ✅ CORRECT: Reactive query auto-refetches after mutations
const selectedRoleQuery = $derived(
  browser && state.selectedRoleId
    ? useQuery(api.circleRoles.get, () => {
        const sessionId = getSessionId();
        if (!sessionId || !state.selectedRoleId) {
          throw new Error('sessionId and selectedRoleId required');
        }
        return { sessionId, roleId: state.selectedRoleId };
      })
    : null
);

// Sync query state to internal state
$effect(() => {
  if (selectedRoleQuery) {
    state.selectedRole = selectedRoleQuery.data ?? null;
    state.selectedRoleIsLoading = selectedRoleQuery.isLoading ?? false;
    state.selectedRoleError = selectedRoleQuery.error ?? null;
  } else {
    state.selectedRole = null;
    state.selectedRoleIsLoading = false;
    state.selectedRoleError = null;
  }
});

// After mutation, no manual refetch needed:
async function handleQuickUpdateRole(updates) {
  await convexClient.mutation(api.circleRoles.quickUpdate, { ... });
  // ✅ No refetch needed - useQuery automatically refetches via WebSocket
}
```

**Why This Works**:
1. `useQuery` creates a reactive subscription to Convex data
2. When mutations update the database, Convex pushes changes via WebSocket
3. `useQuery` automatically receives updates and refetches
4. UI updates smoothly without manual intervention

**Key Principles**:
1. **Always use `useQuery` for data displayed in UI** (not manual queries)
2. **Wrap conditional queries in `$derived`** to make them reactive
3. **No manual refetch needed** - Convex handles it automatically
4. **Consistent pattern - use same pattern** (e.g., circles and roles should both use `useQuery`)

**When to Use Manual Queries**:
- One-time data fetch (no real-time needed)
- Background data loading
- Conditional queries that shouldn't subscribe (rare)

**When to Use Reactive useQuery**:
- Data displayed in UI
- Data that changes via mutations
- Related entities that should update together
- Any query where you want automatic updates

**Detection**:
- Check if mutations require manual refetch calls
- Check if similar entities behave differently (one smooth, one hard reload)
- Check for `refetch*` methods being called after mutations
- Check for manual `convexClient.query()` in `$effect`

**Real Example**: 
- Before: `useOrgChart` used manual `convexClient.query()` for `$effect
- After: Converted to reactive `useQuery` wrapped in `$derived`
- Result: Roles now update smoothly like circles do

**Related**: 
- #L250: Conditional Query Creation Must Be Wrapped in $derived
- #L140: useQuery Hydration Errors
- Convex real-time subscriptions

---

**Last Updated**: 2025-01-27

