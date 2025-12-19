# Root Cause Analysis: RoleDetailPanel Design Phase Editing

## Problem Statement

`RoleDetailPanel.svelte` does not allow editing in design phase like `CircleDetailPanel.svelte` does, even though both should allow any workspace member to edit during design phase.

## Root Cause

**Primary Issue: `workspaceId` Source Dependency**

`RoleDetailPanel.svelte` gets `workspaceId` from the role object (`role?.workspaceId`), while `CircleDetailPanel.svelte` gets it from context. This creates a timing dependency issue:

1. **RoleDetailPanel** (line 53):

   ```typescript
   const workspaceId = $derived(role?.workspaceId ?? null);
   ```

2. **CircleDetailPanel** (lines 46-50):
   ```typescript
   const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
   const workspaceId = $derived(() => {
   	if (!workspaces) return undefined;
   	return workspaces.activeWorkspaceId ?? undefined;
   });
   ```

**Impact Chain:**

1. If `role` is null or hasn't loaded yet → `workspaceId` is null
2. `useCanEdit` receives null `workspaceId` → workspaceQuery doesn't run (line 14: `params.workspaceId() && params.sessionId()`)
3. `workspaceQuery` is null → `canEdit` returns false (line 38: `if (!workspace) return false;`)
4. `workspaceQuery` is null → `isDesignPhase` returns false (line 49: `workspaceQuery?.data?.phase === 'design'`)
5. Footer button logic (line 946) checks `(!isDesignPhase && !canEdit)` → button disabled

**Secondary Issue: Footer Button Logic Pattern Mismatch**

Even when `workspaceId` is available, the footer button logic differs:

- **CircleDetailPanel** (lines 1167-1175): Explicit `{#if isDesignPhase}` block that shows "Save" button unconditionally in design phase
- **RoleDetailPanel** (lines 943-949): Single button with conditional disable logic `(!isDesignPhase && !canEdit)`

The CircleDetailPanel pattern is clearer and more explicit about design phase behavior.

## Evidence

### useCanEdit Logic (lines 36-49)

```typescript
const canEdit = $derived.by(() => {
	const workspace = workspaceQuery?.data;
	if (!workspace) return false; // ← Returns false if workspaceQuery never ran

	// Design phase: any workspace member can edit
	if (workspace.phase === 'design') {
		return true;
	}
	// ...
});

const isDesignPhase = $derived(workspaceQuery?.data?.phase === 'design'); // ← false if workspaceQuery is null
```

### RoleDetailPanel Footer (lines 943-949)

```svelte
<Button
	variant="primary"
	onclick={handleSaveDirectly}
	disabled={editRole.isSaving || !editRole.isDirty || (!isDesignPhase && !canEdit)}
>
	{editRole.isSaving ? 'Saving...' : 'Save'}
</Button>
```

### CircleDetailPanel Footer (lines 1167-1175)

```svelte
{#if isDesignPhase}
	<!-- Design phase: Direct save for all members -->
	<Button
		variant="primary"
		onclick={handleSaveDirectly}
		disabled={editCircle.isSaving || !editCircle.isDirty}
	>
		{editCircle.isSaving ? 'Saving...' : 'Save'}
	</Button>
{/if}
```

## Architecture Alignment

Per `dev-docs/master-docs/architecture.md`:

- **Workspace Lifecycle** (lines 715-737): Design phase allows free create/modify/delete for all workspace members
- **Frontend Patterns** (lines 1056-1317): Components should use context for workspace state, not derived from entity objects

## Fix Confidence: 98%

**High confidence** because:

1. Root cause is clear: `workspaceId` source dependency
2. Solution pattern exists: Use context like CircleDetailPanel
3. Footer button pattern can be aligned with CircleDetailPanel's explicit design phase check
4. Context verification: `WorkspacesModuleAPI` is provided in `src/routes/(authenticated)/+layout.svelte` (line 59), making it available to all authenticated routes including org chart pages

**2% uncertainty** due to:

- May need to handle edge case if context is not available (fallback to role.workspaceId), though this is unlikely given the layout structure

## Recommended Fix

1. **Change `workspaceId` source** (line 53): Use context pattern from CircleDetailPanel instead of `role?.workspaceId`
2. **Align footer button logic** (lines 923-951): Use explicit `{#if isDesignPhase}` pattern like CircleDetailPanel for clarity

## Files to Modify

- `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`
  - Line 45-53: Change workspaceId source to use context
  - Lines 923-951: Align footer button logic with CircleDetailPanel pattern
