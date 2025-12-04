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

**Last Updated**: 2025-12-04

