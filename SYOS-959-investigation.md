# SYOS-959 Investigation: Update Seeding (customFieldDefinitions + roleTemplates)

**Date**: 2025-12-17
**Status**: Investigation Complete
**Agent**: Claude Sonnet 4.5

---

## Summary

Investigation of current seeding implementation for customFieldDefinitions and roleTemplates before implementing SYOS-959 updates.

## 1. Current Seeding Location

### Files Involved

```
/convex/admin/seed/
├── index.ts                      # Main entry point - seedDatabase()
├── customFieldDefinitions.ts     # System field definitions seeding
├── roleTemplates.ts              # System role templates seeding
├── meetingTemplates.ts           # Meeting templates seeding
├── workspaceSeed.ts              # Workspace orchestration
├── bootstrap.ts                  # Minimum viable workspace setup
└── README.md                     # Documentation
```

### Seeding Flow

1. **System-level seeding** (`index.ts:seedDatabase()`):
   - Creates system role templates (workspaceId = undefined)
   - Optionally creates demo workspace

2. **Workspace-level seeding** (triggered by `circleLifecycle.ts`):
   - When root circle is created with circleType → `createSystemCustomFieldDefinitions()`
   - Then → `seedWorkspaceResources()` → meeting templates
   - Also triggered when setting circleType on non-root circles for the first time

### Entry Points

- **Manual seed**: `npx convex run admin/seed/index:seedDatabase`
- **Automatic seed**: When root circle gets its circleType set (onboarding step 3)
- Located in: `convex/core/circles/circleLifecycle.ts` lines 102 & 247

---

## 2. customFieldDefinitions Table Schema ✅

**Location**: `convex/features/customFields/tables.ts`

**Schema matches expectations:**

- ✅ `workspaceId: v.id('workspaces')`
- ✅ `entityType: v.union(v.literal('circle'), v.literal('role'), ...)`
- ✅ `systemKey: v.optional(v.string())`
- ✅ `name: v.string()`
- ✅ `fieldType: customFieldTypes` (text, longText, number, boolean, date, select, etc.)
- ✅ `isRequired: v.boolean()`
- ✅ `isSystemField: v.boolean()`
- ✅ `searchable: v.boolean()`
- ✅ `aiIndexed: v.boolean()`
- ✅ `order: v.number()`
- ✅ Audit fields: `createdByPersonId`, `updatedByPersonId`, etc.

**Indexes:**

- `by_workspace: ['workspaceId']`
- `by_workspace_entity: ['workspaceId', 'entityType']`
- `by_workspace_system_key: ['workspaceId', 'systemKey']`
- `by_searchable: ['workspaceId', 'searchable']`
- `by_ai_indexed: ['workspaceId', 'aiIndexed']`

**Verdict**: Schema is complete and ready ✅

---

## 3. roleTemplates Schema Update (SYOS-956) ✅

**Location**: `convex/core/roles/tables.ts`

**Schema matches expectations:**

- ✅ `workspaceId: v.optional(v.id('workspaces'))` - System templates use undefined
- ✅ `name: v.string()`
- ✅ `roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom'))`
- ✅ `appliesTo: v.union(v.literal('hierarchy'), v.literal('empowered_team'), v.literal('guild'), v.literal('hybrid'))`
- ✅ `defaultFieldValues: v.array(v.object({ systemKey: v.string(), values: v.array(v.string()) }))`
- ✅ `isCore: v.boolean()`
- ✅ Audit fields

**Verdict**: Schema is complete ✅

---

## 4. SYSTEM_FIELD_DEFINITIONS Constant (SYOS-955) ⚠️

**Location**: `convex/features/customFields/constants.ts`

**Status**: EXISTS but has CRITICAL DISCREPANCY

### The Constant (lines 54-205)

```typescript
export const SYSTEM_FIELD_DEFINITIONS = [
  // Role fields (7 total)
  { entityType: 'role', systemKey: 'purpose', name: 'Purpose', fieldType: 'text', order: 1, ... },
  { entityType: 'role', systemKey: 'decision_right', name: 'Decision Rights', fieldType: 'text', order: 2, ... },
  { entityType: 'role', systemKey: 'accountability', name: 'Accountabilities', fieldType: 'text', order: 3, ... },
  { entityType: 'role', systemKey: 'domain', name: 'Domains', fieldType: 'text', order: 4, ... },
  { entityType: 'role', systemKey: 'policy', name: 'Policies', fieldType: 'text', order: 5, ... },
  { entityType: 'role', systemKey: 'steering_metric', name: 'Steering Metrics', fieldType: 'text', order: 6, ... },
  { entityType: 'role', systemKey: 'note', name: 'Notes', fieldType: 'longText', order: 7, ... },

  // Circle fields (6 total)
  { entityType: 'circle', systemKey: 'purpose', name: 'Purpose', fieldType: 'text', order: 1, ... },
  { entityType: 'circle', systemKey: 'domain', name: 'Domains', fieldType: 'text', order: 2, ... },
  { entityType: 'circle', systemKey: 'accountability', name: 'Accountabilities', fieldType: 'text', order: 3, ... },
  { entityType: 'circle', systemKey: 'policy', name: 'Policies', fieldType: 'text', order: 4, ... },
  { entityType: 'circle', systemKey: 'decision_right', name: 'Decision Rights', fieldType: 'text', order: 5, ... },
  { entityType: 'circle', systemKey: 'note', name: 'Notes', fieldType: 'longText', order: 6, ... }
] as const;
```

**Properties**: `entityType`, `systemKey`, `name`, `fieldType`, `isRequired`, `isSystemField`, `searchable`, `aiIndexed`, `order`

---

## 5. CRITICAL ISSUE: Duplicate Constants ❌

### Problem

**TWO DIFFERENT** `SYSTEM_FIELD_DEFINITIONS` exist:

#### Location 1: `convex/features/customFields/constants.ts` (SYOS-955) ✅

- **13 fields total** (7 role + 6 circle)
- **Singular keys**: `accountability`, `domain`, `policy`, `note`, `decision_right`
- **Proper field types**: `text`, `longText`
- **Has all metadata**: `fieldType`, `isRequired`, `isSystemField`, `searchable`, `aiIndexed`
- **Order starts at 1**

#### Location 2: `convex/admin/seed/customFieldDefinitions.ts` lines 35-53 ❌

- **14 fields total** (8 role + 6 circle)
- **Plural keys**: `accountabilities`, `domains`, `policies`, `notes`, `decision_rights`, `steering_metrics`, `role_filling`
- **Missing field types**: Not included in definition
- **Missing metadata**: No `fieldType`, `isRequired`, etc.
- **Order starts at 0**
- **Extra role field**: `role_filling` (not in constants.ts)

### Impact

- ❌ **Seed file does NOT use SYOS-955 constant**
- ❌ **Inconsistent systemKey naming** (plural vs singular)
- ❌ **Field type hardcoded to `longText`** in seed (line 113)
- ❌ **Missing proper field types** from constant

### Example Discrepancy

**constants.ts (SYOS-955)**:

```typescript
{ entityType: 'role', systemKey: 'accountability', name: 'Accountabilities', fieldType: 'text', order: 3 }
```

**seed/customFieldDefinitions.ts (OLD)**:

```typescript
{ entityType: 'role', systemKey: 'accountabilities', name: 'Accountabilities', order: 1 }
// Then hardcoded: fieldType: 'longText'
```

---

## 6. roleTemplates Seeding Status ✅

**Location**: `convex/admin/seed/roleTemplates.ts`

**Status**: MOSTLY CORRECT - Already uses new format

### Current Implementation (lines 37-194)

Creates **10 system templates**:

- ✅ Circle Lead (hierarchy) - Full authority
- ✅ Secretary (hierarchy)
- ✅ Team Lead (empowered_team) - Facilitative
- ✅ Facilitator (empowered_team)
- ✅ Secretary (empowered_team)
- ✅ Steward (guild) - Convening authority
- ✅ Secretary (guild)
- ✅ Circle Lead (hybrid) - Flexible authority
- ✅ Facilitator (hybrid)
- ✅ Secretary (hybrid)

### Format Example (Circle Lead for hierarchy)

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
      values: ['Decide all matters within circle scope', 'Assign roles within circle']
    }
  ],
  description: '...'
}
```

### Comparison with SYOS-959 Requirements

**SYOS-959 wants**:

```typescript
defaultFieldValues: [
  { systemKey: 'purpose', values: [...] },
  { systemKey: 'decision_right', values: [...] },
  { systemKey: 'accountability', values: [...] }
]
```

**Current implementation uses**: `decision_right` ✅

**But SYOS-955 constant uses**: `decision_right` (singular) ✅

**Match**: YES - roleTemplates already uses singular `decision_right` matching constants.ts ✅

### Minor Differences from SYOS-959 Spec

1. **Team Lead vs Circle Lead**: Current uses "Team Lead" for empowered_team, spec shows "Circle Lead"
2. **Accountability field**: Not included in current templates (could be added)
3. **Values wording**: Slightly different wording than spec

---

## 7. Implementation Plan

### Phase 1: Fix customFieldDefinitions Seeding ⚠️ CRITICAL

**Issue**: Seed file has its own constant with wrong systemKeys

**Solution**:

1. Remove local `SYSTEM_FIELD_DEFINITIONS` from `customFieldDefinitions.ts` (lines 35-53)
2. Import from `convex/features/customFields/constants.ts`
3. Update seeding logic to use all fields from constant (fieldType, isRequired, etc.)
4. Remove hardcoded `fieldType: 'longText'` (line 113)

**Before**:

```typescript
const SYSTEM_FIELD_DEFINITIONS: CustomFieldDefinition[] = [
	{ entityType: 'circle', systemKey: 'purpose', name: 'Purpose', order: 0 }
	// ...
];

await ctx.db.insert('customFieldDefinitions', {
	// ...
	fieldType: 'longText' // ❌ HARDCODED
	// ...
});
```

**After**:

```typescript
import { SYSTEM_FIELD_DEFINITIONS } from '../../features/customFields/constants';

await ctx.db.insert('customFieldDefinitions', {
	// ...
	fieldType: field.fieldType, // ✅ FROM CONSTANT
	isRequired: field.isRequired
	// ...
});
```

### Phase 2: Update roleTemplates (Optional Enhancements)

**Current status**: Already uses correct format ✅

**Optional updates to match SYOS-959 exactly**:

1. Rename "Team Lead" → "Circle Lead" for empowered_team
2. Add `accountability` field to templates where appropriate
3. Update wording to match spec exactly

**Priority**: LOW - Current implementation is correct, just different wording

### Phase 3: Testing

1. ✅ Verify `npm run check` passes
2. ✅ Run dev seed: `npx convex run admin/seed/index:seedDatabase '{"includeDemo": true}'`
3. ✅ Verify customFieldDefinitions created with correct systemKeys (singular)
4. ✅ Verify roleTemplates created with defaultFieldValues format
5. ✅ Check that both system fields match between constants.ts and database

---

## 8. Dependencies Status

### SYOS-955: SYSTEM_FIELD_DEFINITIONS constant ✅

- **Status**: COMPLETE
- **Location**: `convex/features/customFields/constants.ts`
- **Issue**: Seed file doesn't use it yet (will fix in this task)

### SYOS-956: roleTemplates schema ✅

- **Status**: COMPLETE
- **Location**: `convex/core/roles/tables.ts`
- **Implementation**: Already in use in `roleTemplates.ts`

---

## 9. Acceptance Criteria Checklist

- [ ] SYSTEM_FIELD_DEFINITIONS seeded to customFieldDefinitions per workspace
  - ⚠️ Currently seeded with WRONG keys (plural instead of singular)
  - Need to fix seed file to use SYOS-955 constant
- [x] roleTemplates seeded with new defaultFieldValues format
  - ✅ Already implemented correctly
- [x] Each circle type has its own Circle Lead template
  - ✅ Already implemented (hierarchy, empowered_team, hybrid)
- [x] Guild has Steward template
  - ✅ Already implemented
- [x] Facilitator and Secretary templates created
  - ✅ Already implemented
- [ ] `npm run check` passes
  - Needs testing after implementation
- [ ] Dev seed creates expected records
  - Needs testing after implementation

---

## 10. Implementation Steps

### Step 1: Update customFieldDefinitions.ts ⚠️ REQUIRED

1. Import SYSTEM_FIELD_DEFINITIONS from constants.ts
2. Remove local duplicate constant
3. Update seeding logic to use all fields from constant
4. Use field.fieldType instead of hardcoding 'longText'
5. Use field.isRequired instead of hardcoding false

### Step 2: (Optional) Update roleTemplates.ts

1. Consider renaming "Team Lead" → "Circle Lead" for empowered_team
2. Add accountability field to templates if needed
3. Update wording to match spec

### Step 3: Test

1. Run `npm run check`
2. Run seed with demo: `npx convex run admin/seed/index:seedDatabase --arg includeDemo=true`
3. Verify database records match SYSTEM_FIELD_DEFINITIONS
4. Verify roleTemplates have correct defaultFieldValues

---

## 11. Risk Assessment

### High Risk

- ⚠️ **Changing systemKeys**: Existing workspaces may have customFieldValues with OLD keys (plural)
  - Need migration if any workspaces exist in production
  - Safe for fresh databases

### Medium Risk

- ⚠️ **Field type changes**: Changing from `longText` to `text` for some fields
  - Should be safe (text is more restrictive)
  - Existing values should be compatible

### Low Risk

- ✅ **roleTemplates changes**: Optional enhancements only
- ✅ **New fields**: Adding proper metadata to definitions

---

## 12. Recommendation

**PROCEED** with implementation:

1. ✅ **All schemas are ready**
2. ✅ **Dependencies complete** (SYOS-955, SYOS-956)
3. ⚠️ **Critical fix required**: customFieldDefinitions must use SYOS-955 constant
4. ✅ **roleTemplates mostly correct**: Optional enhancements only

**Priority**: Fix customFieldDefinitions seeding first (required), roleTemplates updates optional.

**Migration consideration**: If any workspaces exist with OLD systemKeys (plural), will need data migration. For fresh databases, direct implementation is safe.

---

## 13. Files to Modify

### Required Changes

- `convex/admin/seed/customFieldDefinitions.ts` - Import and use SYSTEM_FIELD_DEFINITIONS from constants.ts

### Optional Changes

- `convex/admin/seed/roleTemplates.ts` - Update naming/wording to match spec exactly

### No Changes Needed

- `convex/features/customFields/constants.ts` - Already correct ✅
- `convex/core/roles/tables.ts` - Already correct ✅
- `convex/features/customFields/tables.ts` - Already correct ✅

---

**Investigation Complete** ✅
**Ready for Implementation** ✅
