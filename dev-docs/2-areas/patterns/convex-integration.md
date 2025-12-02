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

**Last Updated**: 2025-01-27

