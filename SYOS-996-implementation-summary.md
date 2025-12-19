# SYOS-996 Implementation Summary

**Title**: Phase-aware GOV-02/GOV-03 validation in custom field creation

**Status**: ✅ Completed

**Date**: 2025-12-18

---

## Problem

When manually creating roles via `AddRoleDialog`, the mutation calls `createCustomFieldValuesFromTemplate` which unconditionally validates GOV-02 (purpose required) and GOV-03 (decision_right required). This fails because the UI only collects purpose, not decision rights.

Per `governance-design.md`, design phase should allow incomplete roles:

> "Design Phase: Invariants not enforced (except schema-level)"

---

## Solution Implemented

Added phase-aware validation to `createCustomFieldValuesFromTemplate` (Option F from ticket):

1. ✅ Added optional `workspacePhase` parameter to function signature
2. ✅ Skip GOV-02/GOV-03 validation when `workspacePhase === 'design'`
3. ✅ Updated all 4 callers to pass workspace phase
4. ⏸️ Activation validation (checking all roles have required fields) - separate ticket

---

## Files Modified

### 1. `convex/infrastructure/customFields/helpers.ts`

**Changes:**

- Added `workspacePhase?: 'design' | 'active'` parameter to `createCustomFieldValuesFromTemplate`
- Updated JSDoc to document phase-aware behavior
- Modified validation logic: `if (args.entityType === 'role' && args.workspacePhase !== 'design')`
- Added comment: "Only enforce during active phase - design phase allows incomplete roles (SYOS-996)"

**Key Logic:**

```typescript
// Validate required fields for roles (GOV-02, GOV-03)
// Only enforce during active phase - design phase allows incomplete roles (SYOS-996)
if (args.entityType === 'role' && args.workspacePhase !== 'design') {
	if (!hasRequiredFields.purpose) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'GOV-02: Role purpose is required');
	}
	if (!hasRequiredFields.decision_right) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'GOV-03: Role must have at least one decision right'
		);
	}
}
```

### 2. `convex/core/roles/mutations.ts`

**Changes:**

- Fetch workspace to get phase: `const workspace = await ctx.db.get(workspaceId);`
- Pass `workspacePhase: workspace?.phase` to `createCustomFieldValuesFromTemplate`
- Updated comment to reference SYOS-996

**Location**: Line ~586 in `create` mutation handler

### 3. `convex/core/circles/autoCreateRoles.ts` (3 calls)

#### Call 1: `createCoreRolesForCircle` (line ~189)

- Added workspace fetch at function start
- Pass `workspacePhase: workspace?.phase` to helper

#### Call 2: `transformLeadRoleOnCircleTypeChange` (line ~320)

- Added workspace fetch after circle fetch
- Pass `workspacePhase: workspace?.phase` to helper

#### Call 3: `handleStructuralRoleChange` (line ~408)

- Added workspace fetch after circle fetch
- Pass `workspacePhase: workspace?.phase` to helper

---

## Investigation Results

### Callers Found

```bash
grep -r "createCustomFieldValuesFromTemplate" convex/
```

**Result**: 4 callers identified

1. `convex/core/roles/mutations.ts` (line 586)
2. `convex/core/circles/autoCreateRoles.ts` (line 189)
3. `convex/core/circles/autoCreateRoles.ts` (line 316)
4. `convex/core/circles/autoCreateRoles.ts` (line 400)

### Workspace Phase Field

**Location**: `convex/core/workspaces/tables.ts`

```typescript
phase: v.optional(v.union(v.literal('design'), v.literal('active')));
```

**Type Definition**: `convex/core/workspaces/queries.ts`

```typescript
phase?: 'design' | 'active'; // Optional: undefined treated as 'active' for backwards compat
```

---

## Testing

### Type Check

```bash
npm run check
```

**Result**: ✅ Pass (0 errors, 0 warnings)

### Linting

```bash
npm run lint
```

**Result**: ✅ Pass (ESLint clean on all modified files)

**Prettier**: All modified files already properly formatted

---

## Acceptance Criteria

- ✅ `createCustomFieldValuesFromTemplate` accepts optional `workspacePhase` parameter
- ✅ When `workspacePhase === 'design'`, GOV-02/GOV-03 validation is skipped
- ✅ When `workspacePhase === 'active'` or undefined, validation is enforced
- ✅ All callers updated to pass workspace phase
- ✅ Manual role creation works in design phase without decision_right
- ✅ `npm run check` passes
- ✅ `npm run lint` passes (on modified files)

---

## Out of Scope (As Expected)

- Activation validation (checking all roles have required fields) - separate ticket
- Renaming function to `createCustomFieldValuesWithValidation` - tech debt, defer
- UI warnings for incomplete roles during design - future enhancement

---

## Design Decisions

### Why Optional Parameter?

Made `workspacePhase` optional to maintain backwards compatibility:

- If undefined, defaults to strict validation (safe default)
- Callers explicitly opt into design-phase leniency

### Why Fetch Workspace at Call Site?

Could have fetched workspace inside `createCustomFieldValuesFromTemplate`, but chose to fetch at call sites because:

1. **Single Responsibility**: Helper focuses on field value creation
2. **Performance**: Some callers might batch multiple calls and reuse workspace
3. **Clarity**: Explicit at call sites makes phase-aware behavior visible

### Validation Logic

```typescript
args.workspacePhase !== 'design';
```

This means validation runs when:

- `workspacePhase === 'active'` (explicit active phase)
- `workspacePhase === undefined` (backwards compat - safe default)

Validation **skips** only when:

- `workspacePhase === 'design'` (explicit design phase)

---

## Architecture Compliance

### Principle #5: `infrastructure/ ← core/ ← features/`

✅ **Compliant**: Infrastructure helper called by core (correct direction)

### Principle #9: Mutations validate authorization BEFORE writing

✅ **Compliant**: Phase check happens during validation, before writes

### Function Naming Convention

✅ **Compliant**: `create___` pattern followed

### Domain Cohesion

✅ **Compliant**:

- Custom fields logic in `infrastructure/customFields/`
- Role creation logic in `core/roles/` and `core/circles/`

---

## References

- **Ticket**: [SYOS-996](https://linear.app/younghumanclub/issue/SYOS-996)
- **Governance Design**: `dev-docs/master-docs/architecture/governance-design.md`
- **Invariants**: `convex/admin/invariants/INVARIANTS.md` (GOV-02, GOV-03)
- **Architecture**: `dev-docs/master-docs/architecture.md` (Workspace Lifecycle)

---

## Next Steps

1. **Workspace Activation**: Create separate ticket for activation validation (verify all roles have required fields before allowing phase transition)
2. **UI Enhancement**: Consider adding visual indicators for incomplete roles during design phase
3. **Testing**: Add integration tests for phase-aware validation (manual testing confirmed working)

---

**Implementation Time**: ~1 hour
**Model**: Claude Sonnet 4.5
**Validation**: Human spot-check ✅ + `npm run check` ✅ + `npm run lint` ✅
