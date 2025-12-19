# SYOS-998: Activation Validation Alignment Proposal

## Problem Statement

The activation validation in `convex/core/workspaces/queries.ts` has three critical issues:

### 1. **Silent Validation Failure (Bug)**

Lines 324-357 and 360-393 check for `purposeDef` and `decisionRightDef`:

```typescript
if (purposeDef) {
	// Only checks values IF definition exists!
}
```

**Bug**: If custom field definitions don't exist, validation is silently skipped.  
**Result**: Workspace appears "ready to activate" when it's actually missing critical infrastructure.

### 2. **Architecture Violations**

- **210-line handler** (lines 190-399) — violates Principle #26 "Query handlers ≤20 lines"
- **No extraction to `rules.ts`** — violates Principle #27 "Validation logic extracted to rules.ts"
- **Complex business logic in query** — violates Principle #10 "All business logic lives in Convex"

### 3. **Code Duplication**

The invariants system (`convex/admin/invariants/`) **already implements** GOV-02, GOV-03, ORG-01, ORG-10:

- `governance.ts`: checkGOV02 (lines 24-106), checkGOV03 (lines 118-201)
- `organization.ts`: checkORG01 (lines 13-52)

**Critical difference**: Invariants correctly fail when definitions are missing (line 57-59 in governance.ts).

---

## Proposed Solution

### Architecture: Three-Layer Validation

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Core Validation Rules (rules.ts)                   │
│ Pure validation functions - single source of truth           │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
┌───────────────┐     ┌──────────────────────┐
│ Layer 2a:     │     │ Layer 2b:            │
│ Invariants    │     │ Activation Query     │
│ (admin check) │     │ (UI feedback)        │
└───────────────┘     └──────────────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ Layer 3:        │
                      │ Activation      │
                      │ Mutation        │
                      │ (final gate)    │
                      └─────────────────┘
```

### File Structure

```
convex/core/workspaces/
├── tables.ts                     # Existing
├── schema.ts                     # Existing
├── rules.ts                      # NEW - Validation rules
├── queries.ts                    # REFACTOR - Thin handlers
├── mutations.ts                  # REFACTOR - Use rules.ts
├── lifecycle.ts                  # Existing
└── index.ts                      # UPDATE - Export rules
```

---

## Implementation Plan

### Step 1: Create `convex/core/workspaces/rules.ts`

Extract pure validation functions that can be shared:

```typescript
import type { QueryCtx, MutationCtx } from '../../_generated/server';
import type { Id, Doc } from '../../_generated/dataModel';
import { CIRCLE_TYPES } from '../circles';

/**
 * Activation validation issue structure
 * Matches the UI requirements from SYOS-998
 */
export type ActivationIssue = {
	id: string;
	code: string;
	severity: 'error';
	entityType: 'circle' | 'role' | 'workspace';
	entityId: string;
	entityName: string;
	message: string;
	actionType: 'edit_role' | 'edit_circle' | 'assign_lead' | 'create_root';
	actionUrl: string;
};

/**
 * Validation context - everything needed to build actionUrl
 */
type ValidationContext = {
	workspaceSlug: string;
};

/**
 * ORG-01: Validate workspace has exactly one root circle
 *
 * @returns Issues (empty array if valid)
 */
export async function validateRootCircle(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	workspace: Doc<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const issues: ActivationIssue[] = [];

	const rootCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.filter((q) => q.eq(q.field('parentCircleId'), undefined))
		.collect();

	if (rootCircles.length === 0) {
		issues.push({
			id: 'ORG-01-MISSING',
			code: 'ORG-01',
			severity: 'error',
			entityType: 'workspace',
			entityId: workspaceId,
			entityName: workspace.name,
			message: 'Workspace must have a root circle',
			actionType: 'create_root',
			actionUrl: `/w/${context.workspaceSlug}/settings/activation`
		});
	} else if (rootCircles.length > 1) {
		issues.push({
			id: 'ORG-01-MULTIPLE',
			code: 'ORG-01',
			severity: 'error',
			entityType: 'workspace',
			entityId: workspaceId,
			entityName: workspace.name,
			message: `Workspace has ${rootCircles.length} root circles, must have exactly one`,
			actionType: 'create_root',
			actionUrl: `/w/${context.workspaceSlug}/settings/activation`
		});
	}

	return issues;
}

/**
 * ORG-10: Validate root circle type ≠ guild
 *
 * @returns Issues (empty array if valid)
 */
export async function validateRootCircleType(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const issues: ActivationIssue[] = [];

	const rootCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.filter((q) => q.eq(q.field('parentCircleId'), undefined))
		.collect();

	// Only check if we have exactly one root (ORG-01 must pass first)
	if (rootCircles.length === 1) {
		const rootCircle = rootCircles[0];
		if (rootCircle.circleType === CIRCLE_TYPES.GUILD) {
			issues.push({
				id: `ORG-10-${rootCircle._id}`,
				code: 'ORG-10',
				severity: 'error',
				entityType: 'circle',
				entityId: rootCircle._id,
				entityName: rootCircle.name,
				message: `Root circle "${rootCircle.name}" cannot be type 'guild'`,
				actionType: 'edit_circle',
				actionUrl: `/w/${context.workspaceSlug}/circles/${rootCircle._id}`
			});
		}
	}

	return issues;
}

/**
 * GOV-01: Validate every circle has a circle_lead role
 *
 * @returns Issues (empty array if valid)
 */
export async function validateCircleLeadRoles(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const issues: ActivationIssue[] = [];

	const circles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.collect();

	for (const circle of circles) {
		const leadRole = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle_roleType', (q) =>
				q.eq('circleId', circle._id).eq('roleType', 'circle_lead')
			)
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.first();

		if (!leadRole) {
			issues.push({
				id: `GOV-01-${circle._id}`,
				code: 'GOV-01',
				severity: 'error',
				entityType: 'circle',
				entityId: circle._id,
				entityName: circle.name,
				message: `Circle "${circle.name}" is missing a Circle Lead role`,
				actionType: 'edit_circle',
				actionUrl: `/w/${context.workspaceSlug}/circles/${circle._id}`
			});
		}
	}

	return issues;
}

/**
 * GOV-02: Validate every role has a purpose
 *
 * **CRITICAL**: Fails if customFieldDefinition for 'purpose' doesn't exist
 * (definition must be seeded during onboarding)
 *
 * @returns Issues (empty array if valid)
 */
export async function validateRolePurposes(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const issues: ActivationIssue[] = [];

	// Get purpose field definition
	const purposeDef = await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace_system_key', (q) =>
			q.eq('workspaceId', workspaceId).eq('systemKey', 'purpose')
		)
		.filter((q) => q.eq(q.field('entityType'), 'role'))
		.first();

	if (!purposeDef) {
		// ❌ FAIL: Required infrastructure missing
		const workspace = await ctx.db.get(workspaceId);
		issues.push({
			id: 'SYS-01-PURPOSE-DEF',
			code: 'SYS-01',
			severity: 'error',
			entityType: 'workspace',
			entityId: workspaceId,
			entityName: workspace?.name ?? 'Unknown',
			message:
				'System field definitions not initialized. Please complete onboarding step 3 (set circle type).',
			actionType: 'create_root',
			actionUrl: `/w/${context.workspaceSlug}/settings/activation`
		});
		return issues;
	}

	// Get all circles to build role URLs
	const circles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.collect();
	const circleMap = new Map(circles.map((c) => [c._id.toString(), c]));

	// Get all roles
	const roles = await ctx.db
		.query('circleRoles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.collect();

	// Get all purpose values
	const purposeValues = await ctx.db
		.query('customFieldValues')
		.withIndex('by_definition', (q) => q.eq('definitionId', purposeDef._id))
		.collect();

	// Build lookup: roleId → purpose values
	const purposeByRole = new Map<string, string[]>();
	for (const value of purposeValues) {
		const roleId = value.entityId;
		if (!purposeByRole.has(roleId)) {
			purposeByRole.set(roleId, []);
		}
		if (value.value && value.value.trim().length > 0) {
			purposeByRole.get(roleId)!.push(value.value);
		}
	}

	// Check each role
	for (const role of roles) {
		const purposes = purposeByRole.get(role._id.toString()) || [];
		if (purposes.length === 0) {
			const circle = circleMap.get(role.circleId.toString());
			if (!circle) continue; // Skip if circle not found (ORG-02 will catch this)

			issues.push({
				id: `GOV-02-${role._id}`,
				code: 'GOV-02',
				severity: 'error',
				entityType: 'role',
				entityId: role._id,
				entityName: role.name,
				message: `Role "${role.name}" in circle "${circle.name}" is missing a purpose`,
				actionType: 'edit_role',
				actionUrl: `/w/${context.workspaceSlug}/circles/${circle._id}`
			});
		}
	}

	return issues;
}

/**
 * GOV-03: Validate every role has ≥1 decision_right
 *
 * **CRITICAL**: Fails if customFieldDefinition for 'decision_right' doesn't exist
 * (definition must be seeded during onboarding)
 *
 * @returns Issues (empty array if valid)
 */
export async function validateRoleDecisionRights(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const issues: ActivationIssue[] = [];

	// Get decision_right field definition
	const decisionRightDef = await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace_system_key', (q) =>
			q.eq('workspaceId', workspaceId).eq('systemKey', 'decision_right')
		)
		.filter((q) => q.eq(q.field('entityType'), 'role'))
		.first();

	if (!decisionRightDef) {
		// ❌ FAIL: Required infrastructure missing
		const workspace = await ctx.db.get(workspaceId);
		issues.push({
			id: 'SYS-01-DECISION-RIGHT-DEF',
			code: 'SYS-01',
			severity: 'error',
			entityType: 'workspace',
			entityId: workspaceId,
			entityName: workspace?.name ?? 'Unknown',
			message:
				'System field definitions not initialized. Please complete onboarding step 3 (set circle type).',
			actionType: 'create_root',
			actionUrl: `/w/${context.workspaceSlug}/settings/activation`
		});
		return issues;
	}

	// Get all circles to build role URLs
	const circles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.collect();
	const circleMap = new Map(circles.map((c) => [c._id.toString(), c]));

	// Get all roles
	const roles = await ctx.db
		.query('circleRoles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.collect();

	// Get all decision right values
	const decisionRightValues = await ctx.db
		.query('customFieldValues')
		.withIndex('by_definition', (q) => q.eq('definitionId', decisionRightDef._id))
		.collect();

	// Build lookup: roleId → decision right values
	const decisionRightsByRole = new Map<string, string[]>();
	for (const value of decisionRightValues) {
		const roleId = value.entityId;
		if (!decisionRightsByRole.has(roleId)) {
			decisionRightsByRole.set(roleId, []);
		}
		if (value.value && value.value.trim().length > 0) {
			decisionRightsByRole.get(roleId)!.push(value.value);
		}
	}

	// Check each role
	for (const role of roles) {
		const decisionRights = decisionRightsByRole.get(role._id.toString()) || [];
		if (decisionRights.length === 0) {
			const circle = circleMap.get(role.circleId.toString());
			if (!circle) continue; // Skip if circle not found (ORG-02 will catch this)

			issues.push({
				id: `GOV-03-${role._id}`,
				code: 'GOV-03',
				severity: 'error',
				entityType: 'role',
				entityId: role._id,
				entityName: role.name,
				message: `Role "${role.name}" in circle "${circle.name}" is missing decision rights`,
				actionType: 'edit_role',
				actionUrl: `/w/${context.workspaceSlug}/circles/${circle._id}`
			});
		}
	}

	return issues;
}

/**
 * Run all activation validation checks
 *
 * This is the orchestrator function that runs all validation rules
 * and aggregates the results.
 *
 * @returns All validation issues (empty array if workspace ready to activate)
 */
export async function runActivationValidation(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	workspaceSlug: string
): Promise<ActivationIssue[]> {
	const workspace = await ctx.db.get(workspaceId);
	if (!workspace) {
		throw new Error('WORKSPACE_NOT_FOUND: Workspace not found');
	}

	const context: ValidationContext = { workspaceSlug };

	const [
		rootCircleIssues,
		rootCircleTypeIssues,
		circleLeadIssues,
		purposeIssues,
		decisionRightIssues
	] = await Promise.all([
		validateRootCircle(ctx, workspaceId, workspace, context),
		validateRootCircleType(ctx, workspaceId, context),
		validateCircleLeadRoles(ctx, workspaceId, context),
		validateRolePurposes(ctx, workspaceId, context),
		validateRoleDecisionRights(ctx, workspaceId, context)
	]);

	return [
		...rootCircleIssues,
		...rootCircleTypeIssues,
		...circleLeadIssues,
		...purposeIssues,
		...decisionRightIssues
	];
}
```

### Step 2: Refactor `queries.ts` (Make Handler Thin)

```typescript
/**
 * Get activation issues for a workspace
 *
 * Returns a list of validation issues that block activation (design → active phase).
 * Empty array means workspace is ready to activate.
 *
 * @see SYOS-997: Activation validation query and mutation
 * @see rules.ts: runActivationValidation for validation logic
 */
export const getActivationIssues = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	returns: v.array(
		v.object({
			id: v.string(),
			code: v.string(),
			severity: v.literal('error'),
			entityType: v.union(v.literal('circle'), v.literal('role'), v.literal('workspace')),
			entityId: v.string(),
			entityName: v.string(),
			message: v.string(),
			actionType: v.union(
				v.literal('edit_role'),
				v.literal('edit_circle'),
				v.literal('assign_lead'),
				v.literal('create_root')
			),
			actionUrl: v.string()
		})
	),
	handler: async (ctx, args) => {
		// Auth check
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

		// Run validation (business logic extracted to rules.ts)
		return runActivationValidation(ctx, args.workspaceId, workspace.slug);
	}
});
```

**Result**: Handler is now 18 lines ✅ (down from 210 lines)

### Step 3: Update `mutations.ts` (Use Shared Rules)

The `activate` mutation should use the same validation:

```typescript
import { runActivationValidation } from './rules';

export const activate = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		// Auth check
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

		// Already active?
		if (workspace.phase === 'active') {
			throw new Error('WORKSPACE_ALREADY_ACTIVE: Workspace is already active');
		}

		// Re-run validation (double-check before irreversible action)
		const issues = await runActivationValidation(ctx, args.workspaceId, workspace.slug);
		if (issues.length > 0) {
			const issueList = issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
			throw new Error(
				`WORKSPACE_ACTIVATION_FAILED: Workspace has ${issues.length} blocking issue(s): ${issueList}`
			);
		}

		// Activate workspace (one-way transition)
		await ctx.db.patch(args.workspaceId, {
			phase: 'active',
			updatedAt: Date.now()
		});

		return { success: true };
	}
});
```

### Step 4: Update Invariants to Use Shared Rules (Future Enhancement)

**Option A**: Keep invariants separate (current state is acceptable)

- Invariants check ALL workspaces across the platform
- Activation validation checks ONE workspace
- Different performance characteristics
- Current duplication is minimal

**Option B**: Extract shared helpers (if duplication becomes problematic)

```typescript
// convex/core/workspaces/helpers/fieldValidation.ts
export async function getRolePurposeMap(
	ctx: QueryCtx,
	workspaceId: Id<'workspaces'>
): Promise<Map<string, string[]>> {
	// Shared logic for getting purpose values
}
```

**Recommendation**: Keep invariants separate for now (Option A). They serve different purposes:

- Invariants = platform-wide data integrity checks (all workspaces)
- Activation = single workspace pre-flight check (UI feedback)

---

## Benefits

### 1. **Bug Fixed** ✅

Missing `purposeDef`/`decisionRightDef` now **fails validation** (SYS-01 error code).

### 2. **Architecture Aligned** ✅

- Query handler: 18 lines (was 210)
- Validation logic: Extracted to `rules.ts`
- Business rules: Pure functions, testable
- Follows Principles #26, #27, #18

### 3. **Code Quality** ✅

- Single source of truth for validation logic
- Mutations and queries use same rules
- No drift between UI validation and final activation check
- Clear separation of concerns

### 4. **Testability** ✅

```typescript
// Unit test for validateRolePurposes
describe('validateRolePurposes', () => {
	it('should fail if purposeDef missing', async () => {
		// Mock: no purpose definition
		const issues = await validateRolePurposes(ctx, workspaceId, context);
		expect(issues).toHaveLength(1);
		expect(issues[0].code).toBe('SYS-01');
	});

	it('should fail if role has no purpose value', async () => {
		// Mock: definition exists, role has no value
		const issues = await validateRolePurposes(ctx, workspaceId, context);
		expect(issues[0].code).toBe('GOV-02');
	});
});
```

### 5. **Maintainability** ✅

- Add new validation rule? → Add function to `rules.ts`, call in `runActivationValidation`
- Change validation logic? → Update once in `rules.ts`, affects both query and mutation
- Debug validation? → Pure functions, easy to test in isolation

---

## Migration Path

1. **Create `rules.ts`** (new file, no breaking changes)
2. **Update `queries.ts`** (refactor handler to call rules.ts)
3. **Update `mutations.ts`** (use shared validation from rules.ts)
4. **Add unit tests** for validation rules
5. **Manual testing** with workspace that has no custom field definitions
6. **Update `index.ts`** to export validation types (if needed by frontend)

## Risks

### Low Risk

- No breaking changes to public API
- Query signature unchanged
- Mutation signature unchanged
- Only internal refactoring

### Mitigation

- Keep both old and new code temporarily
- Test with multiple workspace states:
  - No custom field definitions (should fail with SYS-01)
  - Has definitions, but roles missing values (should fail with GOV-02/GOV-03)
  - All valid (should pass with empty array)

---

## Decision

**Recommendation**: Implement this refactoring as part of SYOS-998.

**Why now?**

1. Activation UI depends on accurate validation
2. Bug is critical (false positive = bad UX)
3. Architecture violations will accumulate technical debt
4. Refactoring is low-risk (internal only)

**Time estimate**: 2-3 hours

- rules.ts creation: 1 hour
- queries.ts refactor: 30 min
- mutations.ts update: 30 min
- Testing: 1 hour

---

## Appendix: Comparison Table

| Aspect                          | Before (Current)                | After (Proposed)               |
| ------------------------------- | ------------------------------- | ------------------------------ |
| **Query handler lines**         | 210                             | 18                             |
| **Validation logic**            | Inline in query                 | Extracted to rules.ts          |
| **Missing definition behavior** | ❌ Silent pass (bug)            | ✅ Fails with SYS-01           |
| **Code duplication**            | ⚠️ Duplicates invariants        | ✅ Shared with mutation        |
| **Testability**                 | ❌ Hard (requires full context) | ✅ Easy (pure functions)       |
| **Principle #26 (≤20 lines)**   | ❌ Violated (210 lines)         | ✅ Compliant (18 lines)        |
| **Principle #27 (rules.ts)**    | ❌ Violated (no extraction)     | ✅ Compliant (rules.ts exists) |
| **Single source of truth**      | ❌ Query vs Mutation drift      | ✅ Both use rules.ts           |

---

## Open Questions & Clarifications

### Q1: SYS-01 Error Code

**Status**: ❌ **NOT DEFINED** (needs to be created)

The proposal introduces a new error code `SYS-01` for "system field definitions not initialized."

**Required action**:

```typescript
// Add to convex/infrastructure/errors/codes.ts
export const ErrorCodes = {
	// ... existing codes ...

	// ============================================
	// SYSTEM - System infrastructure errors
	// ============================================
	SYS_FIELD_DEFINITIONS_MISSING: 'SYS_FIELD_DEFINITIONS_MISSING'

	// ... rest
};
```

**Usage in rules.ts**:

```typescript
message: 'System field definitions not initialized. Please complete onboarding step 3 (set circle type).',
```

This error indicates the workspace hasn't completed onboarding (step 3: set circle type triggers custom field definition seeding).

---

### Q2: Invariants Deduplication Strategy

**Decision**: ✅ **Keep invariants separate (Option A)**

| Aspect          | Invariants                     | Activation Validation          |
| --------------- | ------------------------------ | ------------------------------ |
| **Scope**       | ALL workspaces (platform-wide) | ONE workspace (user-facing)    |
| **Purpose**     | Data integrity checks (admin)  | Pre-flight check (UI feedback) |
| **Performance** | Batch processing matters       | Single query acceptable        |
| **Context**     | No UI URLs needed              | Requires actionUrl for fixes   |
| **Frequency**   | Periodic admin runs            | Every activation attempt       |

**Rationale**:

- Different contexts require different output formats
- Invariants return `violations: string[]` (entity IDs only)
- Activation returns `ActivationIssue[]` (rich objects with URLs)
- Premature optimization to extract shared helpers (Option B)
- Minimal duplication (~50 lines) is acceptable trade-off

**Future**: If we add 10+ more validation checks, consider extracting shared query helpers at that point.

---

### Q3: actionUrl Route Pattern

**Status**: ⚠️ **PARTIALLY INCORRECT** (needs adjustment)

The proposed URLs assume specific route structure:

```typescript
actionUrl: `/org/${context.workspaceSlug}/circles/${circle.slug}/roles/${role._id}`;
```

**Actual route structure**:

- ✅ `/w/[slug]/circles/[id]` exists (circle detail page)
- ❌ `/w/[slug]/circles/[slug]/roles/[roleId]` does NOT exist
- Roles are edited **inline** on the circle page (via `CircleRolesPanel` component)
- No dedicated role editing route

**Corrected actionUrl patterns**:

```typescript
// For role issues (GOV-02, GOV-03)
actionUrl: `/w/${context.workspaceSlug}/circles/${circle._id}`;
// Opens circle page where roles are visible in the panel
// Note: Uses circle._id, not circle.slug (actual route parameter)

// For circle issues (GOV-01, ORG-10)
actionUrl: `/w/${context.workspaceSlug}/circles/${circle._id}`;
// Same destination - circle detail page

// For workspace issues (ORG-01, SYS-01)
actionUrl: `/w/${context.workspaceSlug}/settings/activation`;
// Settings page for workspace-level fixes
```

**Important notes**:

1. Route uses `[id]` parameter (Convex ID), not `[slug]`
2. All role issues point to the circle page (roles edited inline)
3. No fragment/hash navigation to specific role (future enhancement)
4. Route prefix is `/w/` not `/org/` (workspace routes)

**Future enhancement (SYOS-XXX)**:
Add hash navigation to scroll to specific role:

```typescript
actionUrl: `/w/${context.workspaceSlug}/circles/${circle._id}#role-${role._id}`;
```

---

### Q4: GOV-04 Missing from Validation?

**Status**: ✅ **CORRECT** (intentionally excluded)

**GOV-04 Definition**: "Circle lead role cannot be deleted while circle exists"

**Why it's NOT in activation validation**:

| Aspect          | GOV-04 (Invariant)                  | GOV-01 (Activation)  |
| --------------- | ----------------------------------- | -------------------- |
| **Check**       | Lead role exists AND not archived   | Lead role exists     |
| **Scope**       | Runtime protection (mutation guard) | Pre-activation check |
| **When**        | Every role delete attempt           | Activation only      |
| **Enforcement** | Code-level (cannot delete)          | Data validation      |

**Relationship**:

- **GOV-01** (activation): "Every circle has a circle_lead role"
  - Checks role exists at activation time
  - Blocks activation if missing
- **GOV-04** (invariant): "Circle lead role cannot be deleted"
  - Enforced in `archiveRole` mutation
  - Prevents deletion at runtime
  - Runtime protection, not activation check

**Conclusion**: GOV-04 is correctly excluded from activation validation. It's a runtime constraint enforced by mutation logic, not a pre-flight check.

---

### Q5: Error Code Consistency

**Question**: Should we use existing `WORKSPACE_*` codes or new `SYS_*` codes?

**Recommendation**: Use new `SYS_*` category for infrastructure issues.

**Rationale**:

- `WORKSPACE_*` codes = workspace entity issues (not found, access denied, etc.)
- `SYS_*` codes = system infrastructure issues (definitions missing, seeding incomplete)
- Clear distinction between user errors vs system setup issues

**Alternative**: Could use `WORKSPACE_SETUP_INCOMPLETE` but loses granularity (what's incomplete?).

---

## References

- **SYOS-997**: Activation validation query and mutation (backend)
- **SYOS-998**: Activation page UI (frontend + this refactoring)
- **Principle #26**: Query/mutation handlers ≤ 20 lines
- **Principle #27**: Validation logic extracted to `rules.ts`
- **Principle #18**: Functions do one thing at appropriate abstraction level
- **architecture.md**: Core Domains, File Structure Patterns, Code Standards

---

## Implementation Checklist

Before starting implementation, confirm:

- [ ] **Q1 resolved**: Add `SYS_FIELD_DEFINITIONS_MISSING` to error codes
- [ ] **Q3 resolved**: Update actionUrl patterns to use `/w/` prefix and `circle._id`
- [ ] **Routing verified**: Test that `/w/[slug]/circles/[id]` accepts Convex IDs
- [ ] **UI verified**: Confirm CircleRolesPanel shows all roles on circle page
- [ ] **Approval**: Get sign-off from user before starting refactor

---

**Status**: Proposal (awaiting clarification resolution)  
**Author**: AI Assistant  
**Date**: 2025-12-19  
**Updated**: 2025-12-19 (added clarifications)
