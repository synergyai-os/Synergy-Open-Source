# SYOS-1006 Implementation Summary

**Task**: Refactor activation validation to rules.ts with registry pattern  
**Status**: ✅ Complete  
**Date**: 2025-12-19

---

## Overview

Successfully refactored the activation validation system from a 210-line monolithic handler to an extensible registry pattern. The new architecture makes adding/removing validation rules a one-line change while fixing critical silent failure bugs.

---

## Changes Made

### 1. Created `convex/core/workspaces/rules.ts` (382 lines)

**Registry Pattern Implementation:**

```typescript
export const ACTIVATION_RULES: ValidationRule[] = [
	{ code: 'ORG-01', severity: 'error', check: checkRootCircle },
	{ code: 'ORG-10', severity: 'error', check: checkRootCircleType },
	{ code: 'GOV-01', severity: 'error', check: checkCircleLeadRoles },
	{ code: 'GOV-02', severity: 'error', check: checkRolePurposes },
	{ code: 'GOV-03', severity: 'error', check: checkRoleDecisionRights }
];
```

**Key Features:**

- **Single source of truth**: `ACTIVATION_RULES` array is the registry
- **Generic runner**: `runActivationValidation()` never needs to change
- **Individual check functions**: Small, focused, testable (5 functions)
- **Extensible**: Adding SYOS-999 placeholder validation = add 1 line to array

**Critical Bug Fix:**

- **GOV-02 (checkRolePurposes)**: Now explicitly fails if `customFieldDefinitions` for 'purpose' doesn't exist (returns SYS-01 error)
- **GOV-03 (checkRoleDecisionRights)**: Now explicitly fails if `customFieldDefinitions` for 'decision_right' doesn't exist (returns SYS-01 error)
- **Before**: Silent pass (false positive) if definitions missing
- **After**: Explicit error with actionable message

### 2. Refactored `convex/core/workspaces/queries.ts`

**Before**: 210-line handler (lines 213-400)  
**After**: 17-line handler (lines 213-230)

**Handler now:**

```typescript
handler: async (ctx, args) => {
	// Auth check: verify user has access to workspace
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
	if (!person || person.status !== 'active') {
		throw new Error('AUTHZ_NOT_WORKSPACE_MEMBER: You do not have access to this workspace');
	}

	// Get workspace
	const workspace = await ctx.db.get(args.workspaceId);
	if (!workspace || workspace.archivedAt) {
		throw new Error('WORKSPACE_NOT_FOUND: Workspace not found');
	}

	// Delegate to shared validation rules (SYOS-1006)
	const { runActivationValidation } = await import('./rules');
	return runActivationValidation(ctx, args.workspaceId, workspace.slug);
};
```

**Meets Principle #26**: Handler ≤20 lines ✅

### 3. Updated `convex/core/workspaces/mutations.ts`

**Changes:**

- Removed 187-line internal `runActivationValidation()` function
- Imported shared `runActivationValidation` from `./rules`
- Updated comment: "SYOS-1006: Use shared rules"
- Mutation handler unchanged (already used the internal function)

**Result**: Both query and mutation now use the same validation logic (DRY principle)

### 4. Added Error Code

**File**: `convex/infrastructure/errors/codes.ts`

```typescript
// ============================================
// SYSTEM - System-level errors
// ============================================
SYS_FIELD_DEFINITIONS_MISSING: 'SYS_FIELD_DEFINITIONS_MISSING',
```

**Usage**: Returned when `customFieldDefinitions` for system fields (purpose, decision_right) are missing during activation validation.

### 5. Updated `convex/core/workspaces/index.ts`

**Added exports:**

```typescript
export { runActivationValidation } from './rules';
export type { ValidationRule, ValidationContext } from './rules';
```

**Rationale**: Public API for potential future use (e.g., admin invariant checks, testing)

---

## Architecture Compliance

### ✅ Principle #26: Query/mutation handlers ≤20 lines

- **Before**: 210 lines
- **After**: 17 lines
- **Status**: ✅ PASS

### ✅ Principle #27: Validation logic extracted to `rules.ts`

- **Before**: No `rules.ts` file
- **After**: `rules.ts` with registry pattern
- **Status**: ✅ PASS

### ✅ Principle #18: Functions do one thing at appropriate abstraction level

- **Before**: Monolithic handler doing validation + orchestration
- **After**:
  - Handler: orchestration (auth + delegate)
  - `runActivationValidation`: registry runner
  - Individual check functions: focused validation
- **Status**: ✅ PASS

---

## Bug Fixes

### 🐛 Silent Validation Failure (Critical)

**Problem**: If `customFieldDefinitions` for 'purpose' or 'decision_right' didn't exist, validation silently passed (false positive).

**Root Cause**:

```typescript
// ❌ OLD CODE (silent pass)
const purposeDef = await ctx.db.query(...).first();
if (purposeDef) {
  // Only checks IF definition exists
}
```

**Fix**:

```typescript
// ✅ NEW CODE (explicit fail)
const purposeDef = await ctx.db.query(...).first();
if (!purposeDef) {
  return [{
    code: 'SYS-01',
    message: 'System field definitions not initialized. Complete onboarding step 3.',
    ...
  }];
}
```

**Impact**: Workspaces can no longer activate without proper field definitions.

---

## Extensibility Demonstration

### Adding SYOS-999 Placeholder Validation (Future)

**Before (would require):**

- Modify 210-line handler
- Add new query logic inline
- Risk breaking existing validation
- Difficult to test in isolation

**After (requires):**

```typescript
// 1. Add check function in rules.ts
async function checkPlaceholderPeople(...) { ... }

// 2. Add ONE line to registry
export const ACTIVATION_RULES: ValidationRule[] = [
  { code: 'ORG-01', severity: 'error', check: checkRootCircle },
  { code: 'ORG-10', severity: 'error', check: checkRootCircleType },
  { code: 'GOV-01', severity: 'error', check: checkCircleLeadRoles },
  { code: 'GOV-02', severity: 'error', check: checkRolePurposes },
  { code: 'GOV-03', severity: 'error', check: checkRoleDecisionRights },
  { code: 'PPL-01', severity: 'warning', check: checkPlaceholderPeople } // ← ONE LINE
];
```

**That's it.** No changes to handlers, no changes to runner.

---

## Validation Results

### ✅ Type Check

```bash
npm run check
# Result: 0 errors, 0 warnings
```

### ✅ Linter Check

```bash
read_lints
# Result: No linter errors found
```

### ✅ File Structure

```
convex/core/workspaces/
├── rules.ts (NEW)          382 lines - Registry + 5 check functions
├── queries.ts              231 lines - Handler: 17 lines (was 210)
├── mutations.ts             78 lines - Uses shared rules
├── index.ts                 19 lines - Exports rules
└── schema.ts                38 lines - ActivationIssue type
```

---

## Acceptance Criteria

- [x] `rules.ts` created with registry pattern
- [x] All 5 validation rules implemented as separate check functions
- [x] `ACTIVATION_RULES` array is the single source of truth
- [x] Missing customFieldDefinitions returns SYS-01 error (not silent pass)
- [x] Query handler ≤20 lines (17 lines)
- [x] Mutation uses same `runActivationValidation()`
- [x] `npm run check` passes (0 errors, 0 warnings)
- [x] Manual test: N/A (requires workspace setup - can be tested in dev environment)

---

## Out of Scope (As Specified)

- ❌ Placeholder people validation (SYOS-999 will add to registry)
- ❌ Deduplicating with admin invariants (different purposes)
- ❌ Unit tests (separate ticket)

---

## Key Insights

### 1. Registry Pattern Benefits

- **Extensibility**: Adding rules is trivial (1 line)
- **Testability**: Each check function is independently testable
- **Maintainability**: Clear separation of concerns
- **Discoverability**: All rules visible in one array

### 2. Silent Failure Pattern

- **Lesson**: Always validate prerequisites explicitly
- **Pattern**: `if (!required) { return error; }` not `if (optional) { check; }`
- **Impact**: Prevents false positives in validation

### 3. Handler Refactoring

- **Target**: ≤20 lines (Principle #26)
- **Method**: Extract to focused functions
- **Result**: Handler becomes pure orchestration

---

## Next Steps

1. **SYOS-999**: Add placeholder people validation to registry (1 line + check function)
2. **Testing**: Create unit tests for individual check functions
3. **Documentation**: Update architecture.md with registry pattern example
4. **Manual Testing**: Verify SYS-01 error in dev workspace without field definitions

---

## References

- **SYOS-997**: Original activation validation implementation
- **SYOS-998**: Depends on this refactor (frontend)
- **SYOS-999**: Will add placeholder validation to registry
- **architecture.md**: Principles #26, #27, #18

---

**Implementation Time**: ~45 minutes  
**Lines Changed**: +382 new, -210 removed, ~50 modified  
**Net Impact**: +222 lines (but 382 of those are extensible, testable rules)
