# Inbox Refactoring: Microstep-by-Microstep Plan

**Date**: 2025-01-02  
**Approach**: Small, independently testable microsteps  
**Status**: Planning Phase

---

## Philosophy

**We only do small microsteps** - Each step:
- ✅ Takes 5-15 minutes to complete
- ✅ Can be independently tested/verified
- ✅ Is low risk (doesn't break existing functionality)
- ✅ Can be confirmed by user before proceeding
- ✅ Follows Svelte 5 best practices

---

## Current State Summary

- **Main page**: 760 lines (target: ~200 lines)
- **Mixed concerns**: Data fetching, state, sync, keyboard nav, layout, UI
- **No composables yet**: Starting from scratch
- **Existing stores**: `activityTracker.svelte.ts`, `theme.ts` (reference patterns)

---

## Microstep Plan Overview

### Phase 1: Extract Sync Logic (Lowest Risk, Highest Value)
### Phase 2: Extract Data Fetching Logic
### Phase 3: Extract Keyboard Navigation
### Phase 4: Extract State Management
### Phase 5: Split Large Components (Future)

---

## Phase 1: Extract Sync Logic (Microsteps 1-12)

### Microstep 1.1: Create composables directory structure
**Goal**: Set up folder structure for composables  
**Time**: 2 minutes  
**Risk**: None (just creates empty directory)  
**Action**: Create `src/lib/composables/` directory  
**Verification**: Directory exists

---

### Microstep 1.2: Create skeleton `useInboxSync.ts` file
**Goal**: Create empty composable file with TypeScript types  
**Time**: 5 minutes  
**Risk**: None (empty file)  
**Action**: 
- Create `src/lib/composables/useInboxSync.ts`
- Add basic function signature with return type
- Export empty function that returns mock state
**Verification**: File exists, TypeScript compiles

---

### Microstep 1.3: Extract sync state variables (isSyncing, syncError, syncSuccess)
**Goal**: Move sync state variables to composable  
**Time**: 10 minutes  
**Risk**: Low (just moving state)  
**Action**:
- Copy `isSyncing`, `syncError`, `syncSuccess` state to composable
- Return them from `useInboxSync()`
- Keep them in page component for now (parallel implementation)
**Verification**: Both old and new state exist (no breaking changes)

---

### Microstep 1.4: Extract syncProgress state
**Goal**: Move syncProgress to composable  
**Time**: 5 minutes  
**Risk**: Low  
**Action**:
- Move `syncProgress` state to composable
- Return from composable
- Keep in page for now
**Verification**: Both implementations work

---

### Microstep 1.5: Extract showSyncConfig state
**Goal**: Move showSyncConfig to composable  
**Time**: 5 minutes  
**Risk**: Low  
**Action**:
- Move `showSyncConfig` to composable
- Return from composable
- Keep in page for now
**Verification**: Config panel still shows/hides correctly

---

### Microstep 1.6: Extract handleSyncClick function
**Goal**: Move sync click handler to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**:
- Move `handleSyncClick` function to composable
- Return from composable
- Keep in page for now
**Verification**: Sync button still works

---

### Microstep 1.7: Extract pollSyncProgress function (without logic)
**Goal**: Move function signature to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**:
- Copy `pollSyncProgress` function to composable
- Add necessary parameters (convexClient, inboxApi, etc.)
- Return from composable
- Keep original in page for now
**Verification**: Function exists in both places

---

### Microstep 1.8: Extract pollSyncProgress logic (part 1: progress query)
**Goal**: Move progress query logic to composable  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Move query logic from `pollSyncProgress` to composable
- Handle progress state updates
- Return progress from composable
**Verification**: Progress polling still works

---

### Microstep 1.9: Extract pollSyncProgress logic (part 2: activity tracker integration)
**Goal**: Move activity tracker calls to composable  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Move `updateActivity`, `removeActivity` calls to composable
- Handle `syncActivityId` in composable
- Pass activity tracker functions as parameters or import
**Verification**: Activity tracker still updates correctly

---

### Microstep 1.10: Extract pollSyncProgress logic (part 3: completion handling)
**Goal**: Move sync completion logic to composable  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Move sync success/timeout logic to composable
- Handle interval cleanup
- Return success state
**Verification**: Sync completion still works correctly

---

### Microstep 1.11: Extract handleImport function (part 1: function signature)
**Goal**: Move handleImport signature to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**:
- Copy `handleImport` function signature to composable
- Add all parameters
- Return from composable
- Keep original in page
**Verification**: Function exists in both places

---

### Microstep 1.12: Extract handleImport function (part 2: implementation)
**Goal**: Move handleImport logic to composable  
**Time**: 20 minutes  
**Risk**: Medium  
**Action**:
- Move all sync initiation logic
- Move progress polling setup
- Move activity tracker setup
- Handle all error cases
- Return from composable
**Verification**: Full sync flow works end-to-end

---

### Microstep 1.13: Wire up composable in page component (part 1: state)
**Goal**: Replace page state with composable state  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Import `useInboxSync` in page
- Call composable and get state
- Replace page state variables with composable state
- Remove old state declarations
**Verification**: All sync state still works

---

### Microstep 1.14: Wire up composable in page component (part 2: functions)
**Goal**: Replace page functions with composable functions  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Replace `handleSyncClick` with composable version
- Replace `handleImport` with composable version
- Replace `pollSyncProgress` with composable version
- Remove old function definitions
**Verification**: All sync functionality works

---

### Microstep 1.15: Clean up: Remove duplicate code
**Goal**: Remove all old sync code from page  
**Time**: 10 minutes  
**Risk**: Low (already replaced)  
**Action**:
- Remove all sync-related state
- Remove all sync-related functions
- Verify no unused imports
**Verification**: Page compiles, sync works, no unused code

---

### Microstep 1.16: Test and verify sync functionality
**Goal**: Ensure all sync features work  
**Time**: 10 minutes  
**Risk**: None (testing)  
**Action**:
- Test sync button click
- Test sync with different options
- Test progress tracking
- Test activity tracker updates
- Test error handling
- Test success states
**Verification**: Everything works as before

---

## Phase 2: Extract Data Fetching Logic (Microsteps 2.1-2.10)

### Microstep 2.1: Create `useInboxItems.ts` skeleton
**Goal**: Create empty composable for inbox items  
**Time**: 5 minutes  
**Risk**: None  
**Action**: Create file with basic function signature  
**Verification**: File exists, TypeScript compiles

---

### Microstep 2.2: Extract filterType state
**Goal**: Move filterType to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**:
- Move `filterType` state to composable
- Return from composable
- Keep in page for now
**Verification**: Filter still works

---

### Microstep 2.3: Extract inboxItems state and isLoading
**Goal**: Move items state to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**:
- Move `inboxItems` and `isLoading` to composable
- Return from composable
- Keep in page for now
**Verification**: Items still load

---

### Microstep 2.4: Extract loadItems function
**Goal**: Move loadItems to composable  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Move `loadItems` function to composable
- Pass convexClient and inboxApi as parameters
- Handle filterType reactivity
- Return from composable
- Keep in page for now
**Verification**: Items still load correctly

---

### Microstep 2.5: Extract filteredItems derived state
**Goal**: Move filteredItems to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**:
- Move `filteredItems` $derived to composable
- Return from composable
- Keep in page for now
**Verification**: Filtering still works

---

### Microstep 2.6: Extract setFilter function
**Goal**: Move setFilter to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**:
- Move `setFilter` function to composable
- Return from composable
- Keep in page for now
**Verification**: Filter changes still work

---

### Microstep 2.7: Wire up composable in page (state)
**Goal**: Replace page state with composable state  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Import `useInboxItems` in page
- Call composable and get state
- Replace page state with composable state
- Remove old state declarations
**Verification**: Items still load and filter

---

### Microstep 2.8: Wire up composable in page (functions)
**Goal**: Replace page functions with composable functions  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Replace `loadItems` with composable version
- Replace `setFilter` with composable version
- Remove old function definitions
**Verification**: All data fetching works

---

### Microstep 2.9: Clean up duplicate code
**Goal**: Remove old data fetching code  
**Time**: 10 minutes  
**Risk**: Low  
**Action**: Remove all old state and functions  
**Verification**: Page compiles, data fetching works

---

### Microstep 2.10: Test data fetching functionality
**Goal**: Verify all data features work  
**Time**: 10 minutes  
**Risk**: None  
**Action**: Test loading, filtering, error states  
**Verification**: Everything works

---

## Phase 3: Extract Selected Item Logic (Microsteps 3.1-3.8)

### Microstep 3.1: Create `useSelectedItem.ts` skeleton
**Goal**: Create empty composable for selected item  
**Time**: 5 minutes  
**Risk**: None  
**Action**: Create file with basic function signature  
**Verification**: File exists

---

### Microstep 3.2: Extract selectedItemId state
**Goal**: Move selectedItemId to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**: Move state, return from composable, keep in page  
**Verification**: Selection still works

---

### Microstep 3.3: Extract selectedItem state
**Goal**: Move selectedItem to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**: Move state, return from composable  
**Verification**: Selected item displays

---

### Microstep 3.4: Extract query tracking logic (currentQueryId)
**Goal**: Move race condition prevention to composable  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Move `currentQueryId` logic to composable
- Move query tracking to composable
- Handle cleanup in composable
**Verification**: Race conditions still prevented

---

### Microstep 3.5: Extract selectedItem $effect logic
**Goal**: Move item loading effect to composable  
**Time**: 20 minutes  
**Risk**: Medium  
**Action**:
- Move entire $effect for loading item details
- Pass convexClient and inboxApi as parameters
- Handle all error cases
- Return selectedItem from composable
**Verification**: Item details still load correctly

---

### Microstep 3.6: Extract selectItem function
**Goal**: Move selectItem to composable  
**Time**: 10 minutes  
**Risk**: Low  
**Action**: Move function, return from composable  
**Verification**: Item selection still works

---

### Microstep 3.7: Wire up composable in page
**Goal**: Replace page logic with composable  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**: Import, use composable, remove old code  
**Verification**: Selection works, details load

---

### Microstep 3.8: Test selected item functionality
**Goal**: Verify selection and details work  
**Time**: 10 minutes  
**Risk**: None  
**Action**: Test selection, detail loading, race conditions  
**Verification**: Everything works

---

## Phase 4: Extract Keyboard Navigation (Microsteps 4.1-4.6)

### Microstep 4.1: Create `useKeyboardNavigation.ts` skeleton
**Goal**: Create empty composable for keyboard nav  
**Time**: 5 minutes  
**Risk**: None  
**Action**: Create file with basic function signature  
**Verification**: File exists

---

### Microstep 4.2: Extract navigateItems function
**Goal**: Move navigation logic to composable  
**Time**: 15 minutes  
**Risk**: Low  
**Action**:
- Move `navigateItems` function to composable
- Pass items and onSelect as parameters
- Return from composable
- Keep in page for now
**Verification**: J/K navigation still works

---

### Microstep 4.3: Extract keyboard event handler
**Goal**: Move keydown handler to composable  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**:
- Move keyboard event handler logic to composable
- Handle input focus detection
- Return cleanup function
- Keep in page for now
**Verification**: Keyboard shortcuts still work

---

### Microstep 4.4: Extract navigation helper functions
**Goal**: Move getCurrentItemIndex, handleNextItem, handlePreviousItem  
**Time**: 10 minutes  
**Risk**: Low  
**Action**: Move all helper functions to composable  
**Verification**: Navigation helpers still work

---

### Microstep 4.5: Wire up composable in page
**Goal**: Replace page logic with composable  
**Time**: 15 minutes  
**Risk**: Medium  
**Action**: Import, use composable, remove old code  
**Verification**: All keyboard navigation works

---

### Microstep 4.6: Test keyboard navigation
**Goal**: Verify all keyboard features work  
**Time**: 10 minutes  
**Risk**: None  
**Action**: Test J/K, scroll, selection  
**Verification**: Everything works

---

## Phase 5: Extract Layout State (Microsteps 5.1-5.4)

### Microstep 5.1: Extract inboxWidth state
**Goal**: Move inboxWidth to composable or utility  
**Time**: 10 minutes  
**Risk**: Low  
**Action**: Move state and localStorage logic  
**Verification**: Width persistence works

---

### Microstep 5.2: Extract handleInboxWidthChange
**Goal**: Move width change handler  
**Time**: 10 minutes  
**Risk**: Low  
**Action**: Move function to composable  
**Verification**: Width changes work

---

### Microstep 5.3: Wire up in page
**Goal**: Use composable version  
**Time**: 10 minutes  
**Risk**: Low  
**Action**: Replace with composable  
**Verification**: Layout works

---

### Microstep 5.4: Test layout functionality
**Goal**: Verify layout features work  
**Time**: 5 minutes  
**Risk**: None  
**Action**: Test resizing, persistence  
**Verification**: Everything works

---

## Verification Checklist (After Each Phase)

After completing each phase, verify:

- [ ] Page compiles without errors
- [ ] All functionality works as before
- [ ] No console errors
- [ ] TypeScript types are correct
- [ ] No unused imports
- [ ] Code is cleaner than before
- [ ] Line count reduced
- [ ] User confirms it works

---

## Success Metrics

**Target State**:
- `+page.svelte`: ~200 lines (down from 760)
- 4 composables created and working
- All functionality preserved
- Code is more maintainable and testable

**Progress Tracking**:
- Phase 1: 0/16 steps
- Phase 2: 0/10 steps
- Phase 3: 0/8 steps
- Phase 4: 0/6 steps
- Phase 5: 0/4 steps
- **Total**: 0/44 microsteps

---

## Notes

- Each microstep should be completed and verified before moving to the next
- User confirmation required before proceeding between phases
- If any step fails, we can revert that specific step
- Future phases (component splitting) can be planned after core refactoring is complete

---

## Next Steps

1. Review this plan
2. Confirm approach (microsteps)
3. Start with Microstep 1.1 when ready
4. Get user confirmation after each phase

