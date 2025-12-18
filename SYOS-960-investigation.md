# SYOS-960 Investigation: Update Role Creation Mutation (Create customFieldValues from Template)

**Date**: 2025-12-17  
**Status**: Investigation Complete  
**Agent**: Claude Sonnet 4.5

---

## Summary

Investigation of role creation mutations to update them to create `customFieldValues` from template `defaultFieldValues` instead of storing purpose, decisionRights, etc. directly on the `circleRoles` schema.

---

## 1. Dependencies Status ✅

All dependencies are complete and verified:

### SYOS-955: SYSTEM_FIELD_DEFINITIONS constant ✅

- **Location**: `convex/features/customFields/constants.ts`
- **Status**: COMPLETE
- **Contents**: 13 system fields (7 role + 6 circle)
- **Role systemKeys**: `purpose`, `decision_right`, `accountability`, `domain`, `policy`, `steering_metric`, `note`

### SYOS-956: roleTemplates schema ✅

- **Location**: `convex/core/roles/tables.ts`
- **Status**: COMPLETE
- **Format**: `defaultFieldValues: v.array(v.object({ systemKey: v.string(), values: v.array(v.string()) }))`

### SYOS-957: circleRoles schema ✅

- **Location**: `convex/core/circles/tables.ts`
- **Status**: Schema updated (purpose/decisionRights will be removed)
- **Note**: Fields still exist in schema but will be removed after this migration

### SYOS-959: Seeding ✅

- **Location**: `convex/admin/seed/`
- **Status**: COMPLETE
- **Verified**: customFieldDefinitions and roleTemplates are properly seeded

---

## 2. customFieldDefinitions Index Verification ✅

**Location**: `convex/features/customFields/tables.ts` (line 88)

**Index exists**: `by_workspace_system_key: ['workspaceId', 'systemKey']` ✅

This index allows efficient lookup of field definitions by systemKey:

```typescript
const definition = await ctx.db
	.query('customFieldDefinitions')
	.withIndex('by_workspace_system_key', (q) =>
		q.eq('workspaceId', workspaceId).eq('systemKey', 'purpose')
	)
	.first();
```

---

## 3. Current Role Creation Flow

### 3.1. Manual Role Creation

**Location**: `convex/core/roles/mutations.ts` (lines 541-605)

**Current implementation**:

```typescript
export const create = mutation({
  args: {
    sessionId: v.string(),
    circleId: v.id('circles'),
    name: v.string(),
    purpose: v.string(),
    decisionRights: v.array(v.string()),
    roleType: v.optional(...)
  },
  handler: async (ctx, args) => {
    // ... validation ...

    const roleId = await ctx.db.insert('circleRoles', {
      circleId: args.circleId,
      workspaceId,
      name: trimmedName,
      roleType,
      purpose: args.purpose,              // ❌ Stored on schema
      decisionRights: args.decisionRights, // ❌ Stored on schema
      status: 'active',
      isHiring: false,
      createdAt: now,
      updatedAt: now,
      updatedByPersonId: personId
    });

    // ❌ No customFieldValues created
  }
});
```

**Needs updating**: Yes - must create customFieldValues instead

### 3.2. Template-Based Role Creation

**Location**: `convex/core/circles/autoCreateRoles.ts` (lines 176-226)

**Current implementation**:

```typescript
// Extract purpose and decision rights from defaultFieldValues
const purposeValues = getFieldValues(template.defaultFieldValues, 'purpose');
const decisionRightValues = getFieldValues(template.defaultFieldValues, 'decision_right');
const purpose = purposeValues[0] ?? '';
const decisionRights = decisionRightValues;

// Validate template data (GOV-02, GOV-03)
validateRolePurpose(purpose);
validateRoleDecisionRights(decisionRights);

const roleId = await ctx.db.insert('circleRoles', {
	circleId,
	workspaceId,
	name: template.name,
	roleType: template.roleType,
	purpose, // ❌ Stored on schema
	decisionRights, // ❌ Stored on schema
	templateId: template._id,
	status: 'active',
	isHiring: false,
	createdAt: now,
	updatedAt: now,
	updatedByPersonId: personId
});

// ❌ No customFieldValues created
```

**Needs updating**: Yes - must create customFieldValues from template.defaultFieldValues

---

## 4. Template defaultFieldValues Format

**Example from `convex/admin/seed/roleTemplates.ts`**:

```typescript
{
  name: 'Circle Lead',
  roleType: 'circle_lead',
  appliesTo: CIRCLE_TYPES.HIERARCHY,
  isCore: true,
  defaultFieldValues: [
    {
      systemKey: 'purpose',
      values: ['Lead this circle toward its purpose with full decision authority']
    },
    {
      systemKey: 'decision_right',
      values: [
        'Decide all matters within circle scope',
        'Assign roles within circle',
        'Remove roles from circle'
      ]
    },
    {
      systemKey: 'accountability',
      values: ['Coordinate work across roles', 'Represent circle in parent circle']
    }
  ]
}
```

**Key observations**:

- Each field has a `systemKey` matching SYSTEM_FIELD_DEFINITIONS
- Each field has a `values` array (can be multiple values)
- systemKeys use singular form: `decision_right` (not `decision_rights`)

---

## 5. Implementation Plan

### 5.1. Create Helper Function for customFieldValues Creation

**New file**: `convex/features/customFields/mutations.ts` (or add to existing mutations)

```typescript
/**
 * Create customFieldValues from template defaultFieldValues
 *
 * For each field in template.defaultFieldValues:
 * 1. Look up customFieldDefinition by systemKey
 * 2. Create one customFieldValues record per value
 * 3. Populate searchText for indexing
 */
export async function createCustomFieldValuesFromTemplate(
	ctx: MutationCtx,
	args: {
		workspaceId: Id<'workspaces'>;
		entityType: 'role' | 'circle';
		entityId: Id<'circleRoles'> | Id<'circles'>;
		templateDefaultFieldValues: Array<{ systemKey: string; values: string[] }>;
		createdByPersonId: Id<'people'>;
	}
): Promise<void> {
	const now = Date.now();

	for (const fieldDefault of args.templateDefaultFieldValues) {
		// Look up definition by systemKey
		const definition = await ctx.db
			.query('customFieldDefinitions')
			.withIndex('by_workspace_system_key', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('systemKey', fieldDefault.systemKey)
			)
			.first();

		if (!definition) {
			console.warn(
				`[createCustomFieldValuesFromTemplate] Definition not found for systemKey "${fieldDefault.systemKey}" in workspace ${args.workspaceId}`
			);
			continue;
		}

		// Create one record per value (for searchability)
		for (const value of fieldDefault.values) {
			await ctx.db.insert('customFieldValues', {
				workspaceId: args.workspaceId,
				definitionId: definition._id,
				entityType: args.entityType,
				entityId: args.entityId as string,
				value,
				searchText: value, // For search indexing
				createdByPersonId: args.createdByPersonId,
				createdAt: now,
				updatedAt: now,
				updatedByPersonId: args.createdByPersonId
			});
		}
	}
}
```

### 5.2. Update Manual Role Creation

**File**: `convex/core/roles/mutations.ts`

**Changes to `create` mutation**:

1. Remove `purpose` and `decisionRights` from args
2. Remove validation calls for purpose/decisionRights
3. Remove `purpose` and `decisionRights` from db.insert
4. After creating role, create customFieldValues for manually provided values

**New flow**:

```typescript
export const create = mutation({
  args: {
    sessionId: v.string(),
    circleId: v.id('circles'),
    name: v.string(),
    // ❌ REMOVED: purpose: v.string(),
    // ❌ REMOVED: decisionRights: v.array(v.string()),
    // ✅ NEW: Accept field values as array
    fieldValues: v.optional(v.array(v.object({
      systemKey: v.string(),
      values: v.array(v.string())
    }))),
    roleType: v.optional(...)
  },
  handler: async (ctx, args) => {
    // ... validation ...

    // ✅ Create lean circleRole (no descriptive fields)
    const roleId = await ctx.db.insert('circleRoles', {
      circleId: args.circleId,
      workspaceId,
      name: trimmedName,
      roleType,
      status: 'active',
      isHiring: false,
      createdAt: now,
      updatedAt: now,
      updatedByPersonId: personId
    });

    // ✅ Create customFieldValues if provided
    if (args.fieldValues && args.fieldValues.length > 0) {
      await createCustomFieldValuesFromTemplate(ctx, {
        workspaceId,
        entityType: 'role',
        entityId: roleId,
        templateDefaultFieldValues: args.fieldValues,
        createdByPersonId: personId
      });
    }

    // ... history recording ...

    return { roleId };
  }
});
```

### 5.3. Update Template-Based Role Creation

**File**: `convex/core/circles/autoCreateRoles.ts`

**Changes to `createCoreRolesForCircle`** (lines 176-226):

1. Remove extraction of purpose/decisionRights from template
2. Remove validation calls for purpose/decisionRights
3. Remove `purpose` and `decisionRights` from db.insert
4. After creating role, call helper to create customFieldValues

**New flow**:

```typescript
for (const template of allTemplates) {
	// ... existing templateId check ...

	// ❌ REMOVED: Extract purpose and decision rights
	// ❌ REMOVED: validateRolePurpose(purpose);
	// ❌ REMOVED: validateRoleDecisionRights(decisionRights);

	const now = Date.now();

	// ✅ Create lean circleRole (no descriptive fields)
	const roleId = await ctx.db.insert('circleRoles', {
		circleId,
		workspaceId,
		name: template.name,
		roleType: template.roleType,
		// ❌ REMOVED: purpose,
		// ❌ REMOVED: decisionRights,
		templateId: template._id,
		status: 'active',
		isHiring: false,
		createdAt: now,
		updatedAt: now,
		updatedByPersonId: personId
	});

	// ✅ Create customFieldValues from template defaults
	await createCustomFieldValuesFromTemplate(ctx, {
		workspaceId,
		entityType: 'role',
		entityId: roleId,
		templateDefaultFieldValues: template.defaultFieldValues,
		createdByPersonId: personId
	});

	// ... existing history recording ...
}
```

### 5.4. Update Other Template-Based Creation Sites

**Search results show template-based creation in**:

- `convex/core/circles/autoCreateRoles.ts` - `handleStructuralRoleChange` (line 379+)

Need to check if there are other places that create roles from templates.

---

## 6. Validation Strategy

### Business Logic Validation

**Question**: Should we still validate purpose/decisionRights at role creation?

**Current approach**:

- `validateRolePurpose(purpose)` - Ensures purpose is non-empty (GOV-02)
- `validateRoleDecisionRights(decisionRights)` - Ensures at least one decision right (GOV-03)

**Options**:

1. **Move validation to customFieldValues creation**:
   - Check if required fields (purpose, decision_right) have values
   - Validate at the point of creating customFieldValues

2. **Remove validation entirely**:
   - Trust that templates have valid data
   - For manual creation, UI enforces required fields

**Recommendation**: Option 1 - Add validation in `createCustomFieldValuesFromTemplate`:

```typescript
// Validate required fields
const hasRequiredFields = {
	purpose: false,
	decision_right: false
};

for (const fieldDefault of args.templateDefaultFieldValues) {
	if (fieldDefault.systemKey === 'purpose' && fieldDefault.values.length > 0) {
		hasRequiredFields.purpose = true;
	}
	if (fieldDefault.systemKey === 'decision_right' && fieldDefault.values.length > 0) {
		hasRequiredFields.decision_right = true;
	}
}

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

---

## 7. Frontend Impact

### Current Frontend Usage

The frontend currently expects roles to have `purpose` and `decisionRights` fields directly on the role object.

**Search for frontend usage**:

- `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`
- Any other components that display role purpose/decision rights

**Migration strategy**:

1. Frontend queries need to join customFieldValues
2. Or create a query that returns roles with field values merged
3. Update all components to use the new data structure

**Note**: This is a breaking change for frontend - requires coordination

---

## 8. Migration Considerations

### Existing Roles

**Question**: What happens to existing roles with purpose/decisionRights on schema?

**Options**:

1. **Dual-read approach** (recommended for gradual migration):
   - Backend reads from both schema fields AND customFieldValues
   - Prioritize customFieldValues if they exist, fallback to schema fields
   - Run data migration to copy schema fields to customFieldValues
   - After migration complete, remove schema fields

2. **Big-bang migration**:
   - Create migration script to convert all existing roles
   - Update schema to remove fields
   - Update all code simultaneously

**Recommendation**: Option 1 - Dual-read approach for safety

---

## 9. Files to Modify

### Required Changes

1. **`convex/features/customFields/mutations.ts`** (new or add to existing)
   - Create `createCustomFieldValuesFromTemplate` helper

2. **`convex/core/roles/mutations.ts`**
   - Update `create` mutation args and logic
   - Remove purpose/decisionRights from schema insertion

3. **`convex/core/circles/autoCreateRoles.ts`**
   - Update `createCoreRolesForCircle` function (lines 176-226)
   - Update `handleStructuralRoleChange` function (if it creates roles)
   - Remove purpose/decisionRights extraction and validation

### Optional Changes (for dual-read migration)

4. **`convex/core/roles/queries.ts`**
   - Add helper to merge customFieldValues with role for backward compatibility
   - Update queries to return merged data

5. **`convex/core/roles/schema.ts`**
   - Add types for role with merged field values

---

## 10. Testing Strategy

### Unit Tests

1. Test `createCustomFieldValuesFromTemplate` helper:
   - Creates correct number of records (one per value)
   - Populates searchText correctly
   - Handles missing definitions gracefully
   - Validates required fields

2. Test `create` mutation:
   - Creates role without purpose/decisionRights on schema
   - Creates customFieldValues when fieldValues provided
   - Works without fieldValues (custom roles)

3. Test `createCoreRolesForCircle`:
   - Creates roles from templates correctly
   - Creates customFieldValues from template.defaultFieldValues
   - Validates all templates create expected field values

### Integration Tests

1. Seed database with templates and definitions
2. Create role from template
3. Query customFieldValues and verify:
   - All template fields were created
   - Values match template.defaultFieldValues
   - searchText is populated

### Manual Testing

1. Run seed: `npx convex run admin/seed/index:seedDatabase '{"includeDemo": true}'`
2. Create a circle with Circle Lead
3. Verify customFieldValues created in dashboard
4. Test manual role creation (if frontend is ready)

---

## 11. Acceptance Criteria Checklist

From SYOS-960:

- [ ] Role creation no longer sets purpose, decisionRights, etc. on schema
  - ✅ Identified: `mutations.ts` and `autoCreateRoles.ts` need updating
  - ⏳ Implementation: Pending

- [ ] Role creation creates customFieldValues for each template default
  - ✅ Identified: Need helper function `createCustomFieldValuesFromTemplate`
  - ⏳ Implementation: Pending

- [ ] One customFieldValues record per value (not one array)
  - ✅ Confirmed: Loop over values array and create one record per value
  - ⏳ Implementation: Pending

- [ ] searchText populated for search indexing
  - ✅ Confirmed: Set `searchText: value` when creating records
  - ⏳ Implementation: Pending

- [ ] Custom roles (no template) can still be created with manual field values
  - ✅ Confirmed: Accept optional `fieldValues` arg in create mutation
  - ⏳ Implementation: Pending

- [ ] `npm run check` passes
  - ⏳ Testing: After implementation

- [ ] Manual test: create role from template, verify customFieldValues created
  - ⏳ Testing: After implementation

---

## 12. Risk Assessment

### High Risk

- ⚠️ **Breaking change for frontend**: Role data structure changes
  - Need to coordinate frontend updates
  - Consider dual-read approach for gradual migration

### Medium Risk

- ⚠️ **Validation logic changes**: Moving GOV-02/GOV-03 validation
  - Need to ensure required fields still enforced
  - Add validation to helper function

- ⚠️ **Multiple creation sites**: Need to update all places that create roles
  - `mutations.ts` - manual creation
  - `autoCreateRoles.ts` - template-based creation
  - Check for other sites

### Low Risk

- ✅ **Schema changes**: circleRoles schema already updated (SYOS-957)
- ✅ **Index exists**: `by_workspace_system_key` ready to use
- ✅ **Templates ready**: defaultFieldValues format correct

---

## 13. Open Questions

1. **Frontend coordination**: When will frontend be updated to read customFieldValues?
   - Should we implement dual-read for backward compatibility?

2. **Data migration**: Should we migrate existing roles now or later?
   - Recommend creating migration ticket separately

3. **Validation enforcement**: Should validation be in helper or at mutation level?
   - Recommend in helper for consistency

4. **Other entity types**: Will circles also use customFieldValues?
   - Yes, but separate ticket (circles don't use templates yet)

---

## 14. Recommendation

**PROCEED** with implementation:

1. ✅ **All dependencies complete** (SYOS-955, 956, 957, 959)
2. ✅ **Index exists** for efficient lookup
3. ✅ **Template format correct** and seeded
4. ⚠️ **Coordinate with frontend** for data structure changes
5. ✅ **Clear implementation path** identified

**Priority**:

1. Create helper function first
2. Update template-based creation (autoCreateRoles.ts)
3. Update manual creation (mutations.ts)
4. Add validation to helper
5. Test thoroughly

**Estimated complexity**: Medium - Clear requirements, multiple files to update, needs frontend coordination

---

## 15. Implementation Summary

**Date**: 2025-12-17  
**Status**: IMPLEMENTATION COMPLETE ✅

### Changes Made

#### 1. Created Helper Function

**Files**:

- `convex/infrastructure/customFields/helpers.ts` (implementation)
- `convex/infrastructure/customFields/index.ts` (public export)
- `convex/features/customFields/mutations.ts` (re-export for convenience)

**Architecture Fix**: Initially placed in `features/customFields/`, but this violated **Principle #5** (`infrastructure/ ← core/ ← features/`). Core domains cannot import from features. Moved to `infrastructure/` so both core and features can access it.

Added `createCustomFieldValuesFromTemplate()` function that:

- Accepts workspace, entity type, entity ID, template defaultFieldValues, and creator person ID
- Looks up customFieldDefinition by systemKey using `by_workspace_system_key` index
- Creates one customFieldValues record per value (for searchability)
- Populates searchText for indexing
- Validates required fields for roles (GOV-02: purpose, GOV-03: decision_right)
- Throws validation errors if required fields missing

#### 2. Updated Template-Based Role Creation

**File**: `convex/core/circles/autoCreateRoles.ts`

**Changes to `createCoreRolesForCircle`**:

- Removed extraction of purpose/decisionRights from template
- Removed validation calls (now done in helper)
- Removed purpose/decisionRights from db.insert
- Added call to `createCustomFieldValuesFromTemplate` after role creation
- Validation (GOV-02, GOV-03) now handled by helper

**Changes to `handleStructuralRoleChange`**:

- Same updates as `createCoreRolesForCircle`
- Creates customFieldValues from template defaults

**Changes to `transformLeadRoleOnCircleTypeChange`**:

- Removed extraction of purpose/decisionRights from template
- Removed purpose/decisionRights from db.patch
- Added deletion of existing customFieldValues before transformation
- Added call to `createCustomFieldValuesFromTemplate` with new template values
- This ensures clean transformation when circle type changes

**Removed**:

- `getFieldValues` helper function (no longer needed)
- Import of `validateRolePurpose` and `validateRoleDecisionRights` (validation moved to helper)

#### 3. Updated Manual Role Creation

**File**: `convex/core/roles/mutations.ts`

**Changes to `create` mutation**:

- Removed `purpose: v.string()` and `decisionRights: v.array(v.string())` from args
- Added optional `fieldValues` arg with format matching template defaultFieldValues
- Removed purpose/decisionRights from db.insert
- Added call to `createCustomFieldValuesFromTemplate` if fieldValues provided
- Custom roles without fieldValues can still be created (fields can be added later via UI)

**Changes to `update` and `updateInline` mutations**:

- Removed `purpose: v.string()` and `decisionRights: v.array(v.string())` from args
- Added optional `fieldValues` arg with format matching template defaultFieldValues
- Removed validation calls (now done in helper if fieldValues provided)
- Removed purpose/decisionRights from db.insert
- Added call to `createCustomFieldValuesFromTemplate` if fieldValues provided
- Custom roles without fieldValues can still be created (fields can be added later via UI)

### Testing Results

- ✅ `npm run check` passes (0 errors, 0 warnings)
- ✅ No linting errors in modified files
- ⏳ Manual testing pending (requires seeded database and frontend updates)

### Files Modified

1. `convex/infrastructure/customFields/helpers.ts` - **NEW** - Helper function (moved to infrastructure per Principle #5)
2. `convex/infrastructure/customFields/index.ts` - **NEW** - Public exports
3. `convex/features/customFields/mutations.ts` - Re-exports helper from infrastructure
4. `convex/core/circles/autoCreateRoles.ts` - Updated 3 functions
5. `convex/core/roles/mutations.ts` - Updated create + update mutations

### Validation Approach

Validation (GOV-02, GOV-03) moved from mutation level to helper function level:

- Helper validates that roles have required fields (purpose, decision_right)
- Throws validation error if required fields missing or empty
- This ensures consistency across all role creation paths (template-based and manual)

### Breaking Changes

⚠️ **Frontend Impact**: The `create` mutation API has changed:

- **Before**: `{ name, purpose, decisionRights }`
- **After**: `{ name, fieldValues: [{ systemKey, values }] }`

Frontend components that create roles need to be updated to use the new API.

### Data Migration

**Current state**: Existing roles still have purpose/decisionRights on schema.

**Migration path** (separate ticket recommended):

1. Create migration script to copy schema fields to customFieldValues
2. Update queries to read from customFieldValues
3. Update frontend to display field values
4. After verification, remove schema fields (SYOS-957 schema changes)

### Next Steps

1. ✅ Implementation complete
2. ⏳ Update frontend role creation components
3. ⏳ Update role queries to return customFieldValues
4. ⏳ Create data migration script (separate ticket)
5. ⏳ Manual testing with seeded database

---

**Investigation Complete** ✅  
**Implementation Complete** ✅
