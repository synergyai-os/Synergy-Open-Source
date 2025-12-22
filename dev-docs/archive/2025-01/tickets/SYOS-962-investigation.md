# SYOS-962 Investigation: Update GOV-02, GOV-03 Invariants

**Date**: 2025-12-17  
**Task**: [SYOS-962](https://linear.app/younghumanclub/issue/SYOS-962)  
**Status**: Investigation Complete ✅

---

## Task Summary

Update GOV-02 and GOV-03 governance invariants to check `customFieldValues` instead of schema fields, following the migration of role metadata to the custom fields system (SYOS-957, SYOS-960).

---

## Key Findings

### 1. Current Invariants Documentation

**Location**: `convex/admin/invariants/INVARIANTS.md`

**GOV-02** (Line 178):

```markdown
| GOV-02 | Every role has a `purpose` (non-empty string) | No role clarity | All `circleRoles.purpose` is non-empty string | critical |
```

**GOV-03** (Line 179):

```markdown
| GOV-03 | Every role has at least one `decisionRight` | No explicit authority | All `circleRoles.decisionRights.length >= 1` and no empty strings | critical |
```

**Current Enforcement** (Line 188):

```markdown
> **GOV-02 & GOV-03 Validation**: Enforced in mutations via `convex/core/roles/rules.ts` validators.
```

### 2. **Critical Discovery: No Runtime Checks Implemented**

**Finding**: GOV-02 and GOV-03 are **documented** but **NOT implemented** as runtime invariant checks.

**Evidence**:

- Searched `convex/admin/invariants/` for `checkGOV*` functions → **0 results**
- Checked `convex/admin/invariants/index.ts` → No GOV-\* checks registered
- The invariants are only enforced at **mutation time** via `convex/core/roles/rules.ts`
- No data-level validation exists to check existing roles in the database

**Implication**: This task is NOT just updating existing checks — we're **creating new runtime invariant checks** from scratch.

### 3. Custom Fields System Architecture

**System Fields for Roles**:

- `purpose` (systemKey: `'purpose'`, required: true)
- `decision_right` (systemKey: `'decision_right'`, required: true)

**Data Structure** (`convex/features/customFields/tables.ts`):

```typescript
customFieldDefinitions: {
  workspaceId: Id<'workspaces'>,
  entityType: 'role' | 'circle' | ...,
  systemKey?: string,  // e.g., 'purpose', 'decision_right'
  isSystemField: boolean,
  isRequired: boolean,
  // ...
}

customFieldValues: {
  workspaceId: Id<'workspaces'>,
  definitionId: Id<'customFieldDefinitions'>,
  entityType: 'role' | 'circle' | ...,
  entityId: string,  // Role ID as string
  value: string,     // JSON-encoded value
  searchText?: string,
  // ...
}
```

**Indexes Available**:

- `by_entity`: `['entityType', 'entityId']` — Get all values for a specific entity
- `by_workspace_entity`: `['workspaceId', 'entityType']` — Get all values for entity type in workspace

### 4. Query Pattern for Invariant Checks

**Option A: Query all roles, then check customFieldValues** (RECOMMENDED)

```typescript
// 1. Get all roles
const roles = await ctx.db.query('circleRoles').collect();

// 2. Get all customFieldValues for roles in workspace
const allRoleValues = await ctx.db
	.query('customFieldValues')
	.withIndex('by_workspace_entity', (q) =>
		q.eq('workspaceId', workspaceId).eq('entityType', 'role')
	)
	.collect();

// 3. Get definitions for purpose and decision_right
const purposeDef = await ctx.db
	.query('customFieldDefinitions')
	.withIndex('by_workspace_system_key', (q) =>
		q.eq('workspaceId', workspaceId).eq('systemKey', 'purpose')
	)
	.first();

// 4. Group values by entityId and check
```

**Rationale**: Minimize database queries by batching, similar to existing invariant patterns.

### 5. Existing Invariant Patterns

**Reference**: `convex/admin/invariants/roles.ts`

**Pattern**:

```typescript
export const checkROLE01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// 1. Collect all relevant data
		const roles = await ctx.db.query('circleRoles').collect();
		const circles = await ctx.db.query('circles').collect();

		// 2. Build lookup maps
		const circleIds = new Set(circles.map((circle) => circle._id.toString()));

		// 3. Find violations
		const violations = roles
			.filter((role) => !role.circleId || !circleIds.has(role.circleId.toString()))
			.map((role) => role._id.toString());

		// 4. Return result
		return makeResult({
			id: 'ROLE-01',
			name: 'Every circleRoles.circleId points to existing circle',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All roles reference existing circles'
					: `${violations.length} roles reference missing circles`
		});
	}
});
```

### 6. Helper Functions

**Mutation-time validation** (`convex/infrastructure/customFields/helpers.ts:94-105`):

```typescript
// Validate required fields for roles (GOV-02, GOV-03)
if (args.entityType === 'role') {
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

This validates **during role creation**. Our invariant checks validate **existing data**.

---

## Implementation Plan

### Files to Create/Update

#### 1. Create `convex/admin/invariants/governance.ts`

New file with GOV-01 through GOV-08 checks (per INVARIANTS.md lines 171-185).

**Initial Implementation**: GOV-02 and GOV-03 (this task).

**Structure**:

```typescript
export const checkGOV02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// Check: Every role has customFieldValue with systemKey='purpose'
		// Implementation details below
	}
});

export const checkGOV03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// Check: Every role has at least one customFieldValue with systemKey='decision_right'
		// Implementation details below
	}
});
```

#### 2. Update `convex/admin/invariants/index.ts`

Add to `checkRefs` array:

```typescript
// Governance (8) - Starting with GOV-02, GOV-03 (SYOS-962)
internal.admin.invariants.governance.checkGOV02,
internal.admin.invariants.governance.checkGOV03,
```

#### 3. Update `convex/admin/invariants/INVARIANTS.md`

**Line 178** (GOV-02):

```markdown
| GOV-02 | Every role has a `purpose` (non-empty string) | No role clarity | All roles have customFieldValue with systemKey='purpose' | critical |
```

**Line 179** (GOV-03):

```markdown
| GOV-03 | Every role has at least one `decisionRight` | No explicit authority | All roles have at least one customFieldValue with systemKey='decision_right' | critical |
```

**Line 188** (Update note):

```markdown
> **GOV-02 & GOV-03 Validation**:
>
> - Enforced at mutation time via `convex/infrastructure/customFields/helpers.ts`
> - Enforced at data level via `convex/admin/invariants/governance.ts` (SYOS-962)
```

---

## Implementation Details

### GOV-02: Every role has a purpose

**Check Logic**:

1. Get all roles (non-archived)
2. Get all customFieldDefinitions with `systemKey='purpose'` per workspace
3. Get all customFieldValues for `entityType='role'`
4. For each role, verify:
   - At least one customFieldValue exists with matching definitionId (purpose)
   - Value is non-empty (after JSON.parse if needed)

**Edge Cases**:

- Archived roles: **Exclude** from check (follow pattern from other invariants)
- Draft vs active: **Check both** (status doesn't exempt from governance requirements)
- Multiple workspaces: **Check per workspace** (definitions are workspace-scoped)

### GOV-03: Every role has at least one decision right

**Check Logic**:

1. Get all roles (non-archived)
2. Get all customFieldDefinitions with `systemKey='decision_right'` per workspace
3. Get all customFieldValues for `entityType='role'` with decision_right definitionId
4. For each role, verify:
   - At least one customFieldValue exists with matching definitionId (decision_right)
   - Value is non-empty

**Note**: Decision rights are stored as **multiple customFieldValues** per SYOS-960.

- One customFieldValues record per decision right
- GOV-03 passes if role has >= 1 decision_right customFieldValue

---

## Query Performance Considerations

**Approach**: Batch queries by workspace to minimize database round trips.

**Pattern**:

```typescript
// 1. Get all roles
const roles = await ctx.db
	.query('circleRoles')
	.filter((q) => q.eq(q.field('archivedAt'), undefined))
	.collect();

// 2. Group roles by workspace
const rolesByWorkspace = new Map<string, typeof roles>();
for (const role of roles) {
	const wsKey = role.workspaceId.toString();
	if (!rolesByWorkspace.has(wsKey)) rolesByWorkspace.set(wsKey, []);
	rolesByWorkspace.get(wsKey)!.push(role);
}

// 3. For each workspace, batch query customFieldValues
for (const [workspaceId, wsRoles] of rolesByWorkspace) {
	// Query all role values for this workspace at once
	const values = await ctx.db
		.query('customFieldValues')
		.withIndex('by_workspace_entity', (q) =>
			q.eq('workspaceId', workspaceId as Id<'workspaces'>).eq('entityType', 'role')
		)
		.collect();

	// Build lookup map: roleId → values[]
	// Check each role
}
```

**Estimated Complexity**:

- O(R) for roles query (R = total roles)
- O(W) for workspace iterations (W = workspaces)
- O(V) for values query per workspace (V = avg values per workspace)
- Total: O(R + W\*V) — acceptable for invariant checks

---

## Testing Strategy

### 1. Unit Tests (Not in Scope)

Custom fields domain is tested via integration tests. Invariant checks are verified by:

- Running against seeded data
- Verifying violation detection

### 2. Manual Testing

**Setup**:

```bash
# Run invariants against dev data
npx convex run admin/invariants:runAll --severity critical
```

**Test Cases**:

1. **Valid role** (has purpose + decision rights) → No violations
2. **Missing purpose** → GOV-02 violation
3. **Missing decision rights** → GOV-03 violation
4. **Archived role** → Excluded from checks

### 3. CI Integration

Invariant checks run in CI via `npm run invariants:critical` (already configured).

---

## Dependencies & Blockers

**Dependencies** (from Linear issue):

- ✅ SYOS-957: circleRoles schema (completed)
- ✅ SYOS-960: role creation mutation (completed)

**Blockers**: None identified.

---

## Acceptance Criteria

- [x] GOV-02 checks customFieldValues for purpose, not schema field
- [x] GOV-03 checks customFieldValues for decision_right, not schema field
- [ ] `convex/admin/invariants/governance.ts` created with checkGOV02, checkGOV03
- [ ] `convex/admin/invariants/index.ts` updated to register checks
- [ ] `INVARIANTS.md` documentation updated
- [ ] `npm run check` passes
- [ ] `npm run invariants:critical` passes with valid data

---

## Next Steps

1. Create `convex/admin/invariants/governance.ts` with checkGOV02, checkGOV03
2. Update `convex/admin/invariants/index.ts` to register checks
3. Update `INVARIANTS.md` documentation
4. Test manually with `npx convex run admin/invariants:runAll`
5. Verify CI passes

---

## References

- **Architecture**: `dev-docs/master-docs/architecture.md`
- **Custom Fields**: `convex/features/customFields/README.md`
- **Invariants Doc**: `convex/admin/invariants/INVARIANTS.md`
- **Existing Checks**: `convex/admin/invariants/roles.ts` (pattern reference)
- **Helper Functions**: `convex/infrastructure/customFields/helpers.ts`
- **Constants**: `convex/features/customFields/constants.ts`

---

**Investigation Complete**: Ready to implement.
