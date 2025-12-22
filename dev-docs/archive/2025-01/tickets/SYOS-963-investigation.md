# SYOS-963 Investigation: Update RoleDetailPanel (Read from customFieldValues Only)

**Date**: 2025-12-17  
**Status**: Investigation Complete  
**Agent**: Claude Sonnet 4.5

---

## Summary

Investigation of RoleDetailPanel component to migrate from mixed schema/customFieldValues reading to customFieldValues-only approach.

**Task**: Update RoleDetailPanel to read ALL role fields from customFieldValues instead of mixing schema fields (role.purpose) with customFieldValues.

---

## 1. Dependencies Status ✅

All dependencies are complete:

### SYOS-957: circleRoles schema update ✅

- **Status**: Schema updated (purpose/decisionRights marked for removal)
- **Note**: Fields still exist but are being phased out

### SYOS-960: Role creation mutations ✅

- **Status**: COMPLETE
- **Change**: Role creation now creates customFieldValues instead of storing on schema
- **File**: `convex/infrastructure/customFields/helpers.ts`
- **Format**: One customFieldValues record per value (for searchability)

### SYOS-959: Seeding ✅

- **Status**: COMPLETE
- **Change**: System field definitions seeded with correct systemKeys (singular: `purpose`, `decision_right`, etc.)
- **File**: `convex/admin/seed/customFieldDefinitions.ts`

### SYOS-961: Secretary fix ✅

- **Status**: COMPLETE
- **Change**: Secretary role templates now include decision_right field

---

## 2. Current RoleDetailPanel Implementation

**Location**: `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`

### 2.1. Mixed Reading Approach (Current)

**Purpose field** (lines 508-581): MIXED ⚠️

```svelte
{#if customFields.getFieldBySystemKey('purpose')}
	{@const purposeField = customFields.getFieldBySystemKey('purpose')}
	{@const purposeValue = getFieldValueAsString('purpose') || role?.purpose || ''}
	<!-- Shows customField OR fallback to role.purpose -->
{:else}
	<!-- Fallback: Shows role.purpose from schema -->
	<InlineEditText value={role.purpose || ''} ... />
{/if}
```

**Status**:

- ✅ Reads from customFields FIRST
- ⚠️ Falls back to schema `role.purpose` if customField not found
- ❌ Still has `{:else}` block that reads directly from schema

**Other fields** (lines 613-695): CLEAN ✅

```svelte
{#each customFields.fields as field (field.definition._id)}
	{@const systemKey = field.definition.systemKey}
	{@const isMultiItem = ['domains', 'accountabilities', 'policies', 'decision_rights'].includes(
		systemKey ?? ''
	)}
	<!-- Dynamically renders all custom fields -->
{/each}
```

**Status**: ✅ Already reads from customFieldValues only

---

## 3. useCustomFields Composable

**Location**: `src/lib/modules/org-chart/composables/useCustomFields.svelte.ts`

### 3.1. Current Implementation

```typescript
export function useCustomFields(options: UseCustomFieldsOptions): UseCustomFieldsReturn {
  // Query definitions
  const definitionsQuery = useQuery(api.features.customFields.queries.listDefinitions, ...);

  // Query values
  const valuesQuery = useQuery(api.features.customFields.queries.listValues, ...);

  // Combine definitions with values
  const fields = $derived.by(() => {
    const definitions = definitionsQuery?.data ?? [];
    const values = valuesQuery?.data ?? [];

    // ❌ PROBLEM 1: Creates map with definitionId as key - OVERWRITES multiple values
    const valueMap: Record<string, CustomFieldValue> = {};
    for (const value of values) {
      const parsedValue = JSON.parse(value.value); // ❌ PROBLEM 2: Assumes JSON-encoded
      valueMap[value.definitionId] = { ..., parsedValue }; // ❌ Only keeps LAST value
    }

    // Returns ONE value per definition
    return definitions.map((def) => ({
      definition: def,
      value: valueMap[def._id] ?? null,
      parsedValue: valueMap[def._id]?.parsedValue ?? null
    }));
  });
}
```

### 3.2. The Problems ❌❌

#### Problem 1: Map Overwrites (Multi-Value Fields)

**Backend storage** (from SYOS-960):

- Multi-item fields (accountabilities, domains, decision_rights, etc.) are stored as **multiple records**
- Each value gets its own row in customFieldValues
- Example: A role with 3 accountabilities has 3 separate rows with same definitionId

**Frontend composable**:

- Creates a map with `definitionId` as key
- **Overwrites** when multiple values have same definitionId
- Only returns the **last** value for multi-item fields

**Example**:

Backend data:

```
definitionId: "abc", value: "Accountability 1"
definitionId: "abc", value: "Accountability 2"
definitionId: "abc", value: "Accountability 3"
```

Current composable result:

```typescript
valueMap['abc'] = { parsedValue: 'Accountability 3' }; // ❌ Only last one
```

Expected result:

```typescript
valueMap['abc'] = { parsedValue: ['Accountability 1', 'Accountability 2', 'Accountability 3'] };
```

#### Problem 2: Inconsistent Value Encoding ⚠️ CRITICAL

**Backend has TWO DIFFERENT ways of storing values**:

1. **Via UI (setValue mutation)** - `convex/features/customFields/mutations.ts` line 210:

   ```typescript
   value: JSON.stringify(args.value); // ✅ JSON-encoded
   ```

2. **Via Template (createCustomFieldValuesFromTemplate)** - `convex/infrastructure/customFields/helpers.ts` line 84:
   ```typescript
   value,  // ❌ Plain string (NOT JSON-encoded)
   ```

**Frontend composable** (line 167):

```typescript
const parsedValue = JSON.parse(value.value); // ❌ Assumes ALL values are JSON-encoded
```

**Result**: Template-created values will cause JSON parse errors!

**Example**:

- Template stores: `value: "Lead this circle toward its purpose"`
- Frontend tries: `JSON.parse("Lead this circle toward its purpose")`
- Error: `Unexpected token L in JSON at position 0`

**This is why it might not be working currently!** 🚨

---

## 4. RoleDetailPanel Helper Functions

**Lines 115-184**: Component has workaround helpers

```typescript
// Helper: Get field value as string (for single fields like Purpose)
function getFieldValueAsString(systemKey: string): string {
	const field = customFields.getFieldBySystemKey(systemKey);
	if (!field || !field.parsedValue) return '';
	return typeof field.parsedValue === 'string' ? field.parsedValue : String(field.parsedValue);
}

// Helper: Get field value as array (for multi-item fields like Domains, Accountabilities)
function getFieldValueAsArray(systemKey: string): string[] {
	const field = customFields.getFieldBySystemKey(systemKey);
	if (!field || !field.parsedValue) return [];
	if (Array.isArray(field.parsedValue)) {
		return field.parsedValue.map((v) => String(v));
	}
	return [];
}
```

**Problem**: These helpers expect `parsedValue` to be an array for multi-item fields, but the composable only returns a single value.

**Current workaround** (lines 133-149):

- Component creates temporary adapter for CategoryItemsList
- Converts array items to CircleItem format
- **BUT**: This won't work if composable only returns ONE value instead of array

---

## 5. Backend Data Format

From `convex/infrastructure/customFields/helpers.ts` (SYOS-960):

```typescript
// Create one record per value (for searchability per SYOS-960)
for (const value of fieldDefault.values) {
	await ctx.db.insert('customFieldValues', {
		workspaceId: args.workspaceId,
		definitionId: definition._id,
		entityType: args.entityType,
		entityId: args.entityId,
		value, // ✅ Single string value
		searchText: value // ✅ For search indexing
		// ... audit fields
	});
}
```

**Key points**:

- Each value is a **separate record**
- Values are stored as **plain strings** (not JSON arrays)
- Multiple values for same field = multiple rows with same definitionId

---

## 6. Implementation Plan

### Phase 0: Fix Backend Value Encoding ⚠️ CRITICAL (NEW!)

**Problem**: `createCustomFieldValuesFromTemplate` stores plain strings, but `setValue` mutation stores JSON-encoded strings. Frontend expects all values to be JSON-encoded.

**Options**:

**Option A: Fix Template Helper to JSON-encode** (Recommended ✅)

```typescript
// In convex/infrastructure/customFields/helpers.ts line 79-90
await ctx.db.insert('customFieldValues', {
	// ...
	value: JSON.stringify(value), // ✅ JSON-encode like setValue mutation
	searchText: value // ✅ Keep plain for search
	// ...
});
```

**Option B: Fix Frontend to Handle Both**

```typescript
// In useCustomFields.svelte.ts
let parsedValue;
try {
	parsedValue = JSON.parse(value.value); // Try JSON first
} catch {
	parsedValue = value.value; // Fallback to plain string
}
```

**Recommendation**: Option A - Consistency is better. Backend should always store the same format.

### Phase 1: Fix useCustomFields Composable ⚠️ CRITICAL

**Problem 1**: Composable only returns ONE value per definition, but backend stores multiple records for multi-item fields.

**Problem 2**: Composable assumes all values are JSON-encoded, but template-created values are plain strings (after Phase 0, all will be JSON).

**Solution**: Aggregate values by definitionId AND handle parsing correctly

```typescript
const fields = $derived.by(() => {
	const definitions = definitionsQuery?.data ?? [];
	const values = valuesQuery?.data ?? [];

	// ✅ Group values by definitionId (handle multiple values per field)
	const valueGroups: Record<string, CustomFieldValue[]> = {};
	for (const value of values) {
		// ✅ Parse JSON safely (after Phase 0, all values will be JSON-encoded)
		let parsedValue;
		try {
			parsedValue = JSON.parse(value.value);
		} catch (err) {
			console.error('[useCustomFields] Failed to parse value:', err, value);
			parsedValue = value.value; // Fallback to plain string for backward compat
		}

		if (!valueGroups[value.definitionId]) {
			valueGroups[value.definitionId] = [];
		}
		valueGroups[value.definitionId].push({
			_id: value._id,
			definitionId: value.definitionId,
			value: value.value,
			parsedValue
		});
	}

	// ✅ Return fields with proper value structure
	return definitions.map((def): CustomFieldWithValue => {
		const fieldValues = valueGroups[def._id] ?? [];

		// Determine if field should be array or single value
		const isMultiValueField = [
			'domains',
			'accountabilities',
			'policies',
			'decision_rights',
			'steering_metrics'
		].includes(def.systemKey ?? '');

		if (isMultiValueField) {
			// ✅ Return array of values
			return {
				definition: def,
				value: fieldValues[0] ?? null, // Keep first for backward compat
				parsedValue: fieldValues.map((v) => v.parsedValue) // ✅ Array of parsed values
			};
		} else {
			// ✅ Return single value
			return {
				definition: def,
				value: fieldValues[0] ?? null,
				parsedValue: fieldValues[0]?.parsedValue ?? null // ✅ Single parsed value
			};
		}
	});
});
```

### Phase 2: Update RoleDetailPanel

**Change 1**: Remove fallback to schema fields

**Before** (lines 508-581):

```svelte
{#if customFields.getFieldBySystemKey('purpose')}
	<!-- Read from customFields -->
{:else}
	<!-- ❌ REMOVE: Fallback to role.purpose -->
{/if}
```

**After**:

```svelte
{@const purposeField = customFields.getFieldBySystemKey('purpose')}
{#if purposeField}
	{@const purposeValue = getFieldValueAsString('purpose')}
	<!-- Show customField value only -->
{/if}
```

**Change 2**: Simplify helper functions (if needed)

After composable fix, `getFieldValueAsArray` should work correctly:

```typescript
function getFieldValueAsArray(systemKey: string): string[] {
	const field = customFields.getFieldBySystemKey(systemKey);
	if (!field || !field.parsedValue) return [];
	if (Array.isArray(field.parsedValue)) {
		return field.parsedValue; // ✅ Already strings from composable
	}
	return [];
}
```

---

## 7. Acceptance Criteria Checklist

From SYOS-963:

- [ ] RoleDetailPanel reads purpose from customFieldValues
  - ⚠️ Currently reads from customFields BUT has fallback to schema
  - Need to remove `{:else}` block (lines 546-581)

- [ ] RoleDetailPanel reads decision_rights from customFieldValues
  - ✅ Already implemented (lines 613-695)

- [ ] RoleDetailPanel reads accountabilities from customFieldValues
  - ✅ Already implemented (lines 613-695)

- [ ] RoleDetailPanel reads domains from customFieldValues
  - ✅ Already implemented (lines 613-695)

- [ ] RoleDetailPanel reads policies from customFieldValues (if displayed)
  - ✅ Already implemented (lines 613-695)

- [ ] No references to `role.purpose`, `role.decisionRights`, etc. on schema
  - ⚠️ Lines 511, 556, 566, 567, 577 reference `role?.purpose` or `role.purpose`
  - Need to remove all schema references

- [ ] `npm run check` passes
  - ⏳ Testing after implementation

- [ ] Visual verification: role details display correctly
  - ⏳ Testing after implementation
  - ⚠️ **CRITICAL**: Need to test with roles that have multiple accountabilities/domains

---

## 8. Risk Assessment

### CRITICAL Risk 🚨

- 🚨 **Inconsistent value encoding**: Template helper stores plain strings, setValue stores JSON
  - **Impact**: Frontend JSON.parse() will FAIL on template-created values
  - **Symptoms**: Errors when viewing role details, "Unexpected token" in console
  - **Mitigation**: Fix backend helper FIRST to JSON-encode values

### High Risk

- ⚠️ **useCustomFields composable bug**: Currently only returns ONE value for multi-item fields
  - **Impact**: Accountabilities, domains, decision_rights will only show last value
  - **Mitigation**: Fix composable AFTER backend encoding fixed

### Medium Risk

- ⚠️ **Data migration incomplete**: Existing roles may still have data on schema but not in customFieldValues
  - **Impact**: Role details will be empty if customFieldValues not created yet
  - **Mitigation**: Run data migration script OR rely on dual-read approach temporarily

### Low Risk

- ✅ **Component mostly correct**: Most fields already read from customFieldValues
- ✅ **Backend structure correct**: SYOS-960 complete - new roles create customFieldValues correctly

---

## 9. Testing Strategy

### Unit Tests (Composable)

Test `useCustomFields` with multi-value data:

```typescript
// Mock backend data
const mockValues = [
	{ definitionId: 'def1', value: 'Accountability 1' },
	{ definitionId: 'def1', value: 'Accountability 2' },
	{ definitionId: 'def1', value: 'Accountability 3' }
];

// Verify composable aggregates correctly
const field = customFields.getFieldBySystemKey('accountability');
expect(field.parsedValue).toEqual(['Accountability 1', 'Accountability 2', 'Accountability 3']);
```

### Integration Tests

1. Create role from template with multiple accountabilities
2. Query customFieldValues - verify multiple records exist
3. Load RoleDetailPanel - verify all accountabilities displayed

### Manual Testing

1. Run seed: `npx convex run admin/seed/index:seedDatabase '{"includeDemo": true}'`
2. Create circle (auto-creates Circle Lead with accountabilities)
3. Open RoleDetailPanel for Circle Lead
4. Verify:
   - ✅ Purpose displays
   - ✅ Decision rights display (should be 3+ items)
   - ✅ Accountabilities display (should be 2+ items)
   - ✅ No errors in console

---

## 10. Files to Modify

### Critical Changes (Must Do)

1. **`src/lib/modules/org-chart/composables/useCustomFields.svelte.ts`** ⚠️ **FIX FIRST**
   - Update value aggregation logic
   - Group values by definitionId
   - Return arrays for multi-value fields

2. **`src/lib/modules/org-chart/components/RoleDetailPanel.svelte`**
   - Remove `{:else}` block for purpose (lines 546-581)
   - Remove all references to `role.purpose` (lines 511, 556, 566, 567, 577)
   - Simplify to only read from customFields

### Optional Changes

3. **Helper functions** (lines 115-184)
   - May need simplification after composable fix
   - Test if existing helpers work correctly with fixed composable

---

## 11. Backend Query Verification

**Query**: `api.features.customFields.queries.listValues`

**Current implementation** (`convex/features/customFields/queries.ts`, lines 68-98):

```typescript
export const listValues = query({
  args: {
    sessionId: v.string(),
    entityType: v.union(v.literal('circle'), v.literal('role'), ...),
    entityId: v.string()
  },
  handler: async (ctx, args) => {
    const values = await ctx.db
      .query('customFieldValues')
      .withIndex('by_entity', (q) =>
        q.eq('entityType', args.entityType).eq('entityId', args.entityId)
      )
      .collect();

    return values; // ✅ Returns ALL values (multiple rows for same definitionId)
  }
});
```

**Status**: ✅ Backend correctly returns all values - frontend composable needs to handle them

---

## 12. Migration Considerations

### Existing Roles

**Question**: What if roles still have `purpose` on schema but NOT in customFieldValues?

**Current behavior**:

- Component has fallback: `getFieldValueAsString('purpose') || role?.purpose || ''`
- If customField not found, shows schema value

**After migration**:

- Component only reads customFieldValues
- If customField not found, shows empty/placeholder

**Options**:

1. **Run data migration BEFORE deploying** (Recommended)
   - Create migration script to copy schema → customFieldValues
   - Ensure all existing roles have customFieldValues
   - Deploy component changes

2. **Keep dual-read temporarily**
   - Keep fallback to schema in component
   - Log when fallback used (tracking)
   - Gradually migrate data
   - Remove fallback after migration complete

**Recommendation**: Option 1 - Clean migration

---

## 13. Data Migration Script (Separate Ticket)

**Not part of SYOS-963** but needed before deployment:

```typescript
// Pseudocode for migration script
export const migrateRolesToCustomFieldValues = mutation({
	handler: async (ctx) => {
		const roles = await ctx.db.query('circleRoles').collect();

		for (const role of roles) {
			// Copy purpose from schema to customFieldValues
			if (role.purpose) {
				const purposeDef = await ctx.db
					.query('customFieldDefinitions')
					.withIndex('by_workspace_system_key', (q) =>
						q.eq('workspaceId', role.workspaceId).eq('systemKey', 'purpose')
					)
					.first();

				if (purposeDef && !(await hasCustomFieldValue(role._id, purposeDef._id))) {
					await ctx.db.insert('customFieldValues', {
						definitionId: purposeDef._id,
						entityType: 'role',
						entityId: role._id,
						value: role.purpose
						// ...
					});
				}
			}

			// Copy decisionRights from schema to customFieldValues
			if (role.decisionRights && role.decisionRights.length > 0) {
				// Similar logic for decision_rights
			}
		}
	}
});
```

**Ticket**: Create SYOS-964 for data migration

---

## 14. Open Questions

1. **Data migration timing**: Should we migrate data now or run dual-read approach?
   - **Answer**: Run data migration FIRST (cleaner approach)

2. **Backward compatibility**: Do we need to support old schema fields temporarily?
   - **Answer**: No if we migrate data first

3. **Testing coverage**: Do we have E2E tests for RoleDetailPanel?
   - **Check**: `e2e/` directory for existing tests
   - **Add**: Test for multi-value fields display

---

## 15. Recommendation

**PROCEED** with implementation in this order:

0. 🚨 **Fix backend value encoding FIRST** (CRITICAL - blocks everything)
   - Update `createCustomFieldValuesFromTemplate` to JSON-encode values
   - Match behavior of `setValue` mutation
   - File: `convex/infrastructure/customFields/helpers.ts` line 79-90
   - Change: `value: JSON.stringify(value)`

1. ⚠️ **Fix useCustomFields composable** (Critical)
   - Group values by definitionId
   - Return arrays for multi-value fields
   - Handle JSON parsing safely
   - Test thoroughly

2. ✅ **Update RoleDetailPanel** (After composable fixed)
   - Remove schema fallbacks
   - Remove all `role.purpose`, `role.decisionRights` references
   - Test with multi-value fields

3. ✅ **Create data migration script** (SYOS-964 - separate ticket)
   - Migrate existing roles to customFieldValues
   - Re-encode template-created values as JSON
   - Run in staging environment
   - Verify all roles have customFieldValues

4. ✅ **Test end-to-end**
   - Manual testing in browser
   - E2E test coverage
   - Visual verification

**Priority**:

- 🚨 **BLOCKER**: Fix backend encoding inconsistency (Phase 0)
- **CRITICAL**: Fix composable bugs (Phase 1)
- **HIGH**: Update component (Phase 2)
- **MEDIUM**: Data migration (Phase 3)

**Estimated complexity**: Medium-High

- Backend encoding fix: Trivial (one line change)
- Composable fix: Non-trivial (requires careful aggregation logic + safe parsing)
- Component update: Straightforward (mostly deletions)
- Testing: Important (multi-value fields must work)

**Why Phase 0 is critical**: Without JSON encoding consistency, the frontend will crash with parse errors when viewing ANY role created from templates. This must be fixed before the composable fix will work correctly.

---

## 16. Next Steps

1. 🚨 **Fix backend encoding** (`convex/infrastructure/customFields/helpers.ts`)
   - Change line 84: `value,` → `value: JSON.stringify(value),`
   - Run `npm run check` - verify no TypeScript errors
   - Test: Create role from template, verify value is JSON-encoded in database

2. ⚠️ **Fix composable** (`src/lib/modules/org-chart/composables/useCustomFields.svelte.ts`)
   - Aggregate values by definitionId (handle multi-value fields)
   - Parse JSON safely with try/catch
   - Return arrays for multi-value systemKeys
   - Test with multi-value data

3. ✅ **Update component** (`src/lib/modules/org-chart/components/RoleDetailPanel.svelte`)
   - Remove `{:else}` fallback block (lines 546-581)
   - Remove all `role.purpose` references
   - Test component displays all fields correctly

4. 📝 **Create migration ticket** (SYOS-964)
   - Migrate existing role schema → customFieldValues
   - Re-encode plain string values as JSON
   - Run in staging before production

5. 🧪 **Testing**
   - Run `npm run check` after all changes
   - Manual testing with seeded database
   - Add E2E test for multi-value fields display
   - Visual verification of all field types

---

**Investigation Complete** ✅  
**Critical Issue Found** 🚨 (Backend encoding inconsistency)  
**Ready for Implementation** ✅ (Clear path forward)
