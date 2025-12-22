# SYOS-1016: Replace ConfirmDiscardDialog with StandardDialog

**Status**: ✅ Complete  
**Date**: 2025-12-19  
**Linear Issue**: [SYOS-1016](https://linear.app/younghumanclub/issue/SYOS-1016)

## Summary

Successfully replaced the single-use `ConfirmDiscardDialog` component with the more flexible `StandardDialog` component. This eliminates code duplication, improves design system consistency, and makes the `children` prop optional in `StandardDialog` for simple confirmation dialogs.

## Changes Made

### 1. Made `children` prop optional in StandardDialog ✅

**File**: `src/lib/components/organisms/StandardDialog.svelte`

- Changed `children: Snippet` to `children?: Snippet` in the type definition (line 44)
- Added conditional rendering around the body section (lines 125-129):
  ```svelte
  {#if children}
  	<div class={bodyClasses}>
  		{@render children()}
  	</div>
  {/if}
  ```

This allows `StandardDialog` to be used for simple confirmations where only the `description` prop is needed, without requiring a `children` snippet.

### 2. Updated CircleDetailPanel to use StandardDialog ✅

**File**: `src/lib/modules/org-chart/components/CircleDetailPanel.svelte`

- Replaced `ConfirmDiscardDialog` import with `StandardDialog` (line 21)
- Replaced dialog usage (lines 940-946):
  ```svelte
  <StandardDialog
  	bind:open={showDiscardDialog}
  	title="Discard unsaved changes?"
  	description="You have unsaved changes. Are you sure you want to discard them?"
  	submitLabel="Discard"
  	cancelLabel="Keep Editing"
  	variant="danger"
  	onsubmit={handleConfirmDiscard}
  />
  ```

### 3. Updated RoleDetailPanel to use StandardDialog ✅

**File**: `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`

- Replaced `ConfirmDiscardDialog` import with `StandardDialog` (line 22)
- Replaced dialog usage (lines 718-724) with same pattern as CircleDetailPanel

### 4. Deleted ConfirmDiscardDialog ✅

**File**: `src/lib/modules/org-chart/components/ConfirmDiscardDialog.svelte`

- Deleted the entire file as it's no longer needed
- Verified no remaining references in the codebase

## Verification

### Type Checking ✅

```bash
npm run check
# Result: svelte-check found 0 errors and 0 warnings
```

### Code Search ✅

```bash
grep -r "ConfirmDiscardDialog" src/
# Result: No matches found
```

## Benefits

1. **Eliminated duplication**: Removed 50 lines of redundant dialog code
2. **Design system alignment**: All dialogs now use the same component with design system recipes
3. **Improved flexibility**: `StandardDialog` can now handle both simple confirmations (description-only) and complex forms (with children)
4. **Fixed bug**: The old component used `variant="destructive"` on Button, which doesn't exist in our Button recipe. Now uses `variant="danger"` with proper styling
5. **Better API**: Uses `bind:open` instead of `open` + `onOpenChange` for cleaner syntax

## Testing Checklist

- [x] TypeScript check passes (`npm run check`)
- [x] No remaining references to `ConfirmDiscardDialog`
- [x] StandardDialog accepts optional `children` prop
- [x] StandardDialog renders correctly without children (body section hidden)
- [ ] Manual verification: Trigger discard dialog in org-chart (CircleDetailPanel)
- [ ] Manual verification: Trigger discard dialog in org-chart (RoleDetailPanel)
- [ ] Manual verification: Verify danger variant styling (red submit button)
- [ ] Manual verification: Test button interactions (Discard, Keep Editing, X button, ESC key)

## Manual Testing Instructions

To manually test the changes:

1. **Start the dev server**: `npm run dev`
2. **Navigate to org chart**: Go to any workspace org chart
3. **Test CircleDetailPanel discard dialog**:
   - Click on a circle to open the detail panel
   - Start editing (e.g., change the purpose)
   - Try to navigate away (click another circle or close panel)
   - Verify the "Discard unsaved changes?" dialog appears
   - Verify styling: Red "Discard" button, "Keep Editing" button
   - Test "Discard" button → should discard changes
   - Test "Keep Editing" button → should close dialog and keep editing
   - Test X button → should close dialog and keep editing
   - Test ESC key → should close dialog and keep editing
4. **Test RoleDetailPanel discard dialog**:
   - Click on a role to open the detail panel
   - Start editing (e.g., change the purpose)
   - Try to navigate away
   - Verify same dialog behavior as above

## Notes

- The `variant="danger"` prop on `StandardDialog` applies inline classes to the submit button: `bg-error text-inverse hover:bg-error` (line 142 in StandardDialog.svelte)
- This is a temporary solution until we add a proper `destructive` variant to the Button recipe (out of scope for this issue)
- The dialog uses design system recipes for all styling, ensuring consistency with the rest of the application

## Out of Scope (As Specified in Issue)

- Migrating `OrgStructureImporter.svelte` (uses AlertDialog directly, different pattern)
- Deprecating `AlertDialog.svelte` wrapper (still has usage)
- Adding `destructive` variant to Button recipe (separate concern)
- Migrating native `confirm()` calls elsewhere in codebase

## Related Files

- `src/lib/components/organisms/StandardDialog.svelte` - Updated to make children optional
- `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` - Updated to use StandardDialog
- `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` - Updated to use StandardDialog
- `src/lib/modules/org-chart/components/ConfirmDiscardDialog.svelte` - Deleted

## References

- Architecture: `dev-docs/master-docs/architecture.md` (component patterns)
- Design system: `dev-docs/master-docs/design-system.md` (recipes, dialog patterns)
- StandardDialog implementation: `SYOS-990-IMPLEMENTATION-SUMMARY.md`
