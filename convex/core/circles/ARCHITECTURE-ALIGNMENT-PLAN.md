# Circles Domain Architecture Alignment Plan

**Status**: Ready for Implementation  
**Priority**: High  
**Estimated Effort**: 4-6 hours

## Overview

This plan aligns `convex/core/circles` with the architecture specification in `dev-docs/master-docs/architecture.md`.

## Phase 1: Critical Fixes (MUST DO)

### Task 1.1: Extract Mutations from queries.ts

**Current State**: `queries.ts` contains 7 mutations (create, update, updateInline, archive, restore, addMember, removeMember)

**Target State**: `mutations.ts` contains all mutation implementations

**Steps**:
1. Read `queries.ts` to identify all mutations
2. Create new `mutations.ts` with proper mutation implementations:
   ```typescript
   // mutations.ts
   import { mutation } from '../../_generated/server';
   import { v } from 'convex/values';
   import { createCircleInternal } from './circleLifecycle';
   import { updateCircleInternal, updateInlineCircle } from './circleLifecycle';
   import { archiveCircle, restoreCircle } from './circleArchival';
   import { addCircleMember, removeCircleMember } from './circleMembers';
   // ... etc
   
   export const create = mutation({ ... });
   export const update = mutation({ ... });
   // ... etc
   ```
3. Remove mutations from `queries.ts`
4. Update `mutations.ts` to remove re-export pattern
5. Update `index.ts` to export from `mutations.ts` instead of `queries.ts`

**Files to Modify**:
- `queries.ts` - Remove mutations
- `mutations.ts` - Add actual implementations
- `index.ts` - Update exports

**Validation**:
- `queries.ts` only contains `query()` handlers
- `mutations.ts` only contains `mutation()` handlers
- All exports work correctly
- Tests still pass

### Task 1.2: Move listCircles Helper into queries.ts

**Current State**: `circleList.ts` contains `listCircles` function

**Target State**: `listCircles` function is in `queries.ts` (it's query logic)

**Steps**:
1. Read `circleList.ts` to understand `listCircles` implementation
2. Move function into `queries.ts` (or inline if simple)
3. Update `queries.ts` imports
4. Delete `circleList.ts` if no longer needed
5. Update any imports of `circleList.ts`

**Files to Modify**:
- `queries.ts` - Add listCircles function
- `circleList.ts` - Delete or mark as deprecated

**Validation**:
- `list` query still works
- No broken imports

## Phase 2: Test Consolidation (SHOULD DO)

### Task 2.1: Consolidate Test Files

**Current State**: 6 separate test files

**Target State**: Single `circles.test.ts` file

**Steps**:
1. Read all test files:
   - `queries.test.ts`
   - `circleLifecycle.test.ts`
   - `circleArchival.test.ts`
   - `circleMembers.test.ts`
   - `validation.test.ts`
   - `slug.test.ts`
2. Create `circles.test.ts` with organized describe blocks:
   ```typescript
   // circles.test.ts
   describe('circles domain', () => {
     describe('queries', () => { ... });
     describe('mutations', () => { ... });
     describe('lifecycle', () => { ... });
     describe('archival', () => { ... });
     describe('members', () => { ... });
     describe('validation', () => { ... });
     describe('slug', () => { ... });
   });
   ```
3. Merge all tests into organized structure
4. Delete old test files
5. Run tests to ensure nothing broke

**Files to Modify**:
- Create `circles.test.ts`
- Delete 6 old test files

**Validation**:
- All tests pass
- Test organization is clear
- No duplicate tests

## Phase 3: Documentation Cleanup (DEFERRED)

### Task 3.1: Move Documentation Files

**Status**: DEFERRED - Leave documentation files in place for now

**Current State**: 3 markdown files in domain folder

**Future Target State**: Historical docs in `dev-docs/`, obsolete files removed

**Note**: Documentation files (`CONSTANTS-ANALYSIS.md`, `CONSTANTS-MIGRATION.md`, `ESLINT-VIOLATIONS-REPORT.md`) will remain in domain folder for now.

### Task 3.2: Update README.md

**Current State**: README.md documents files but doesn't explain helper file pattern

**Target State**: README.md explains internal helper files and references architecture trade-offs

**Steps**:
1. Add section to README.md:
   ```markdown
   ## Internal Implementation Files
   
   This domain uses helper files for readability and cohesion:
   - `circleLifecycle.ts` - Create/update logic
   - `circleCoreRoles.ts` - Role auto-creation
   - `circleArchival.ts` - Archive/restore logic
   - `circleMembers.ts` - Member management
   - `circleAccess.ts` - Access control helpers
   - `validation.ts` - Validation helpers
   - `slug.ts` - Slug generation
   
   These are internal implementation details (not exported via index.ts).
   They're kept separate for readability (see architecture.md trade-off guidance).
   ```
2. Update Files section to mark helpers as "internal"

**Files to Modify**:
- `README.md`

## Phase 4: Verification (MUST DO)

### Task 4.1: Run All Checks

**Steps**:
1. Run `npm run check` - Should pass
2. Run `npm run lint` - Should pass
3. Run `npm run test:unit:server` - All tests should pass
4. Check imports - No broken imports
5. Verify exports - `index.ts` exports work correctly

### Task 4.2: Architecture Compliance Check

**Steps**:
1. Verify `queries.ts` only has queries
2. Verify `mutations.ts` only has mutations
3. Verify `rules.ts` has business rules
4. Verify `index.ts` only exports public API
5. Verify test file is `circles.test.ts`
6. Verify no doc files in domain folder (except README.md)

## Implementation Order

1. **Phase 1** (Critical) - Must be done first
2. **Phase 2** (Important) - Should be done for consistency
3. **Phase 3** (Cleanup) - DEFERRED - Leave doc files in place
4. **Phase 4** (Verification) - After each phase

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-------------|
| Breaking imports | High | Search codebase for all imports before changing |
| Test failures | Medium | Run tests after each change |
| Missing exports | Medium | Verify index.ts exports all public API |
| Helper file confusion | Low | Document in README.md |

## Success Criteria

✅ `queries.ts` contains only query handlers  
✅ `mutations.ts` contains only mutation handlers  
✅ All tests consolidated in `circles.test.ts`  
✅ All checks pass (`npm run check`, `npm run lint`, tests)  
✅ README.md documents helper file pattern  

**Note**: Documentation files remain in domain folder (deferred cleanup)  

## Notes

- Helper files (`circleLifecycle.ts`, etc.) are kept separate for readability (1,176 lines total would be too large for single file)
- This aligns with architecture trade-off guidance: "Domain cohesion over technical purity"
- Helper files are internal (not exported via `index.ts`), so they're implementation details

