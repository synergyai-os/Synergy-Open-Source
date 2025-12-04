# SYOS-645: Quick Edit Mode - useQuery Reactivity Issue

**Status**: ✅ Fixed  
**Related**: SYOS-643 (Edit Circle Feature), SYOS-645 Phase 2 (Quick Edit Mode)  
**Created**: 2025-01-27  
**Last Updated**: 2025-01-27  
**Current State**: Fixed - Query creation now reactive with `$derived`

---

## 📋 Summary

Quick Edit Mode for circles was implemented and initially worked, but then stopped working due to a reactivity issue with `useQuery` in `CircleDetailPanel.svelte`.

**Current State**:

- ✅ Reactivity issue fixed - query creation now wrapped in `$derived` for reactive evaluation
- ✅ Naming conflict bug fixed - getters now correctly reference `$derived` values
- ✅ `canEdit` now correctly reflects permission state when query resolves
- ✅ `InlineEditText` components render when `canEdit` is `true`

**Final Fix**: Wrapped query creation in `$derived()` to make it reactive (see Fix 3 below).

---

## 🚀 Quick Start for Next Agent

**Files to Check**:

1. `src/lib/modules/org-chart/composables/useQuickEditPermission.svelte.ts` - Composable implementation
2. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` - Component usage (lines 37-46)
3. `convex/orgChartPermissions.ts` - Backend query (lines 54-157)

**Key Question**: Why does `canEditValue` remain `false` when `canEditQuery?.data?.allowed` is `true`?

**Hypothesis**: The `$derived` value might not be updating reactively, or there's an error state overriding the data, or the getter isn't being called reactively in the component.

**First Step**: Add debug logging (see "Debugging Checklist" section below) to trace the reactivity chain.

---

## 🎯 What We Want to Do

**Goal**: Enable inline editing of circle name and purpose for users with Org Designer role when `allowQuickChanges` workspace setting is enabled.

**Implementation Status**:

- ✅ Backend mutations (`circles.quickUpdate`, `circleItems.quickUpdate`, `circleRoles.quickUpdate`)
- ✅ Permission checking (`canQuickEditQuery`, `requireQuickEditPermission`)
- ✅ Frontend components (`InlineEditText`, `EditPermissionTooltip`, `QuickEditIndicator`)
- ✅ Integration into `CircleDetailPanel` and `RoleCard`
- ✅ Workspace settings UI (`/w/[slug]/settings/org-chart/`)
- ✅ **Reactivity issue**: Fixed - Query now created reactively via composable
- ✅ **Naming conflict bug**: Fixed - Getters now reference `$derived` values correctly
- ❌ **Permission state bug**: `canEdit` remains `false` despite correct permissions

---

## 🐛 The Problem

### Symptom

- Initially worked on Root Circle and other circles
- Then stopped working entirely
- `canEditQuery` is `null` or not being created when `circle` and `sessionId` become available
- `InlineEditText` components don't render because `canEdit` is always `false`

### Root Cause Hypothesis

The `useQuery` hook is not being created reactively when dependencies (`circle`, `sessionId`) change from `null` to actual values. The conditional check `browser && circle && sessionId` uses `$derived` values, which may not trigger `useQuery` re-creation.

---

## 🔍 What We Tried

### Attempt 1: Direct `$derived` Values in Condition

```typescript
const circle = $derived(orgChart?.selectedCircle ?? null);
const sessionId = $derived($page.data.sessionId);

const canEditQuery =
	browser && circle && sessionId
		? useQuery(api.orgChartPermissions.canQuickEditQuery, () => {
				const currentCircle = orgChart?.selectedCircle;
				const currentSessionId = $page.data.sessionId;
				if (!currentCircle || !currentSessionId) {
					throw new Error('Circle and sessionId required');
				}
				return {
					sessionId: currentSessionId,
					circleId: currentCircle.circleId
				};
			})
		: null;
```

**Result**: ❌ Didn't work. Query not created reactively.

**Why**: `$derived` values in the condition don't trigger `useQuery` re-creation. The condition is evaluated once, and if `circle` or `sessionId` is initially `null`, the query never gets created.

---

### Attempt 2: Getter Functions in Condition (Current)

```typescript
const getCircle = () => orgChart?.selectedCircle ?? null;
const getSessionId = () => $page.data.sessionId;

const canEditQuery =
	browser && getCircle() && getSessionId()
		? useQuery(api.orgChartPermissions.canQuickEditQuery, () => {
				const currentCircle = getCircle();
				const currentSessionId = getSessionId();
				if (!currentCircle || !currentSessionId) {
					throw new Error('Circle and sessionId required');
				}
				return {
					sessionId: currentSessionId,
					circleId: currentCircle.circleId
				};
			})
		: null;
```

**Result**: ❌ Still doesn't work.

**Why**: Even with getter functions, the condition is still evaluated once. When `getCircle()` or `getSessionId()` returns `null` initially, the query never gets created. When they later return values, the condition doesn't re-evaluate because it's not reactive.

---

### Attempt 3: Debug Logging

Added extensive debug logging to track:

- `canEditQuery` state (isLoading, error, data)
- `canEdit` and `editReason` values
- DOM presence of `InlineEditText` components

**Findings**:

- `canEditQuery` eventually resolves to `{ allowed: true }` ✅
- But `canEdit` remains `false` ❌
- `InlineEditText` components not found in DOM ❌

**Conclusion**: The query works, but the reactivity chain is broken somewhere.

---

## 📚 Patterns We Studied

### Pattern 1: `usePermissions` (Working Example)

```typescript
// From: src/lib/infrastructure/rbac/composables/usePermissions.svelte.ts
const permissionsQuery =
	browser && params.sessionId()
		? useQuery(api.rbac.permissions.getUserPermissionsQuery, () => {
				const sessionId = params.sessionId();
				if (!sessionId) throw new Error('sessionId required');
				return { sessionId };
			})
		: null;
```

**Key Difference**: `params.sessionId()` is a **function parameter**, not a `$derived` value. The function is called in the condition, making it reactive.

---

### Pattern 2: `useInboxItems` (Working Example)

```typescript
// From: src/lib/modules/inbox/composables/useInboxItems.svelte.ts
const inboxQuery =
	browser && params?.sessionId
		? useQuery(api.inbox.listInboxItems, () => {
				const sessionId = params.sessionId(); // Function call
				if (!sessionId) throw new Error('sessionId required');
				return { sessionId };
			})
		: null;
```

**Key Difference**: `params.sessionId()` is a **function passed as parameter**, ensuring reactivity.

---

### Pattern 3: `useMeetingPresence` (Working Example)

```typescript
// From: src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts
const activePresenceQuery =
	browser && meetingId() && sessionId()
		? useQuery(api.meetingPresence.getActivePresence, () => {
				const mid = meetingId();
				const sid = sessionId();
				if (!mid || !sid) {
					throw new Error('meetingId and sessionId required');
				}
				return {
					meetingId: mid,
					sessionId: sid
				};
			})
		: null;
```

**Key Difference**: `meetingId()` and `sessionId()` are **function parameters** passed to the composable.

---

## 💡 What We Learned

### Key Insight: Function Parameters vs `$derived` Values

**The Problem**:

- `$derived` values are reactive **within** the component
- But when used in a **conditional** for `useQuery`, the condition is evaluated **once**
- If the condition is `false` initially (because `circle` or `sessionId` is `null`), `useQuery` is never called
- When the values later become available, the condition doesn't re-evaluate because it's not reactive

**The Solution** (from working patterns):

- Use **function parameters** (`() => value`) instead of `$derived` values
- Pass functions to composables, or create getter functions that are called in the condition
- The function calls in the condition make the condition reactive

---

### Svelte 5 Reactivity Rules

1. **`$derived`**: Reactive computed values, but condition evaluation is not reactive
2. **Function calls**: Reactive when called in conditions (Svelte tracks function calls)
3. **`useQuery`**: Must be called unconditionally OR with reactive conditions

---

### The Correct Pattern

Based on working examples, we should:

**Option A**: Always call `useQuery`, handle nulls inside:

```typescript
const canEditQuery = browser
	? useQuery(api.orgChartPermissions.canQuickEditQuery, () => {
			const currentCircle = orgChart?.selectedCircle;
			const currentSessionId = $page.data.sessionId;
			if (!currentCircle || !currentSessionId) {
				throw new Error('Circle and sessionId required');
			}
			return {
				sessionId: currentSessionId,
				circleId: currentCircle.circleId
			};
		})
	: null;
```

**Option B**: Use `$derived` for the query itself:

```typescript
const canEditQuery = $derived(
	browser && circle && sessionId
		? useQuery(api.orgChartPermissions.canQuickEditQuery, () => {
				// ...
			})
		: null
);
```

**Option C**: Move to a composable (like `usePermissions`):

```typescript
// Create: useQuickEditPermission.svelte.ts
export function useQuickEditPermission(
	getCircle: () => CircleSummary | null,
	getSessionId: () => string | undefined
) {
	const canEditQuery =
		browser && getCircle() && getSessionId()
			? useQuery(api.orgChartPermissions.canQuickEditQuery, () => {
					const circle = getCircle();
					const sessionId = getSessionId();
					if (!circle || !sessionId) {
						throw new Error('Circle and sessionId required');
					}
					return {
						sessionId,
						circleId: circle.circleId
					};
				})
			: null;

	return {
		canEdit: $derived(canEditQuery?.data?.allowed ?? false),
		editReason: $derived(canEditQuery?.data?.reason)
	};
}
```

---

## ✅ Solutions Implemented

### Fix 1: Moved Query to Composable (Option C)

**Root Cause**: The conditional check `browser && circle && sessionId` was evaluated once at initialization. When `circle` or `sessionId` was initially `null`, `useQuery` was never called. When values later became available, the condition didn't re-evaluate because it wasn't reactive.

**Solution**: Created `useQuickEditPermission.svelte.ts` composable following the `usePermissions` pattern. The composable uses function parameters which makes the condition reactive.

**Code Change**:

```typescript
// ✅ Created: src/lib/modules/org-chart/composables/useQuickEditPermission.svelte.ts
export function useQuickEditPermission(
	params: UseQuickEditPermissionParams
): UseQuickEditPermissionReturn {
	const canEditQuery =
		browser && params.circle() && params.sessionId()
			? useQuery(api.orgChartPermissions.canQuickEditQuery, () => {
					const circle = params.circle();
					const sessionId = params.sessionId();
					if (!circle || !sessionId) {
						throw new Error('Circle and sessionId required');
					}
					return {
						sessionId,
						circleId: circle.circleId
					};
				})
			: null;
	// ...
}

// ✅ Updated: CircleDetailPanel.svelte
const quickEditPermission = useQuickEditPermission({
	circle: () => orgChart?.selectedCircle ?? null,
	sessionId: () => $page.data.sessionId
});
const canEdit = $derived(quickEditPermission.canEdit);
```

**Why This Works**:

- Function parameters (`params.circle()`, `params.sessionId()`) are called in the condition, making it reactive
- When dependencies change from `null` to values, the condition re-evaluates and creates the query
- Matches the proven pattern from `usePermissions.svelte.ts`

---

### Fix 2: Fixed Naming Conflict Bug

**Root Cause**: Getters were referencing themselves instead of the `$derived` values, causing incorrect reactivity.

**Broken Code**:

```typescript
const canEdit = $derived(...);
return {
    get canEdit() {
        return canEdit;  // ❌ References itself, not the $derived value!
    }
}
```

**Fixed Code**:

```typescript
const canEditValue = $derived(...);  // Renamed to avoid conflict
return {
    get canEdit() {
        return canEditValue;  // ✅ References the $derived value
    }
}
```

**Why This Was Needed**:

- JavaScript getter names shadow variables with the same name
- The getter was creating a circular reference instead of reading the `$derived` value
- Renaming the `$derived` variables allows getters to correctly reference them

---

## ✅ Fix 3: Made Query Creation Reactive with `$derived`

**Root Cause**: The ternary condition for query creation was evaluated **once** when `useQuickEditPermission()` was called. If `params.circle()` returned `null` at that moment (no circle selected), `canEditQuery` was permanently set to `null` and never re-evaluated.

**Why Previous Fixes Didn't Work**:

- Fix 1 (composable pattern) moved the query to a composable but didn't make the creation reactive
- Fix 2 (naming conflict) fixed getter references but the query still wasn't being created

**Solution**: Wrap the query creation in `$derived()`:

```typescript
// Before (NOT reactive - evaluated once at init)
const canEditQuery =
    browser && params.circle() && params.sessionId()
        ? useQuery(...) : null;

// After (REACTIVE - re-evaluated when dependencies change)
const canEditQuery = $derived(
    browser && params.circle() && params.sessionId()
        ? useQuery(...) : null
);
```

**Why This Works**:

- `$derived` tracks dependencies synchronously read inside it
- When `params.circle()` changes from `null` to a value, `$derived` detects the change
- The expression re-evaluates, creating the `useQuery` subscription
- `canEditValue` then properly derives from the query result

**Key Insight**: In Svelte 5, a ternary condition outside of a reactive context (`$derived`, `$effect`, template) is evaluated **once**. The `$derived` wrapper makes it reactive

---

## 📝 Code References

### Current Implementation

- **Composable**: `src/lib/modules/org-chart/composables/useQuickEditPermission.svelte.ts`
  - **Lines**: 46-88
  - **Pattern**: Function parameters for reactive condition (matches `usePermissions.svelte.ts`)
  - **Query**: `canQuickEditQuery` from `api.orgChartPermissions.canQuickEditQuery`
- **Component**: `src/lib/modules/org-chart/components/CircleDetailPanel.svelte`
  - **Lines**: 37-46
  - **Usage**: Calls composable and derives `canEdit` and `editReason` from it

### Backend Query

- **File**: `convex/orgChartPermissions.ts`
- **Lines**: 54-69
- **Function**: `canQuickEditQuery`

### Working Examples

- `src/lib/infrastructure/rbac/composables/usePermissions.svelte.ts`
- `src/lib/modules/inbox/composables/useInboxItems.svelte.ts`
- `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts`

### Patterns Documentation

- `.cursor/rules/svelte-typescript-patterns.mdc` (lines 67-95)
- `dev-docs/2-areas/patterns/convex-integration.md`
- `dev-docs/2-areas/patterns/svelte-reactivity.md`

---

## 🎯 Success Criteria

- [x] `canEditQuery` is created reactively when `circle` and `sessionId` become available
- [x] Naming conflict bug fixed - getters reference `$derived` values correctly
- [x] `canEdit` correctly reflects permission state (query creation now reactive)
- [x] `InlineEditText` components render when `canEdit` is `true`
- [x] Inline editing works for circle name and purpose
- [x] Solution follows established patterns in codebase (with `$derived` enhancement)

---

## 📌 Related Issues

- **SYOS-643**: Edit Circle Feature (parent ticket)
- **SYOS-645**: Quick Edit Mode Phase 2 (current phase)
- **SYOS-645 Phase 3**: Operating Modes (future, requires `hasCircleRole()`)

---

## 🔗 References

- [Convex-Svelte Documentation](https://docs.convex.dev/client/svelte)
- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/runes)
- [Svelte Reactivity Patterns](./svelte-reactivity.md)
- [Convex Integration Patterns](./convex-integration.md)

---

---

## 📝 Key Learning: Svelte 5 Reactivity with Conditional Query Creation

**The Pattern That Doesn't Work**:

```typescript
// Ternary OUTSIDE reactive context - evaluated ONCE
const query = condition ? useQuery(...) : null;
```

**The Pattern That Works**:

```typescript
// Ternary INSIDE $derived - reactive
const query = $derived(condition ? useQuery(...) : null);
```

**When to Use This**:

- Use `$derived` wrapper when the condition depends on state that might be `null`/`undefined` initially
- Especially important when state comes from user interaction (e.g., selecting an item)
- Not needed when state is always available at init (e.g., `sessionId` from page data)

---

**Keywords**: `useQuery`, `reactivity`, `Svelte 5`, `$derived`, `convex-svelte`, `conditional queries`, `quick edit`, `permissions`, `composable`
