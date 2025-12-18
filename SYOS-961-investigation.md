# SYOS-961 Investigation: Update Circle Creation Mutation (Create customFieldValues)

**Date**: 2025-12-17  
**Status**: Investigation Complete  
**Agent**: Claude Sonnet 4.5

---

## Summary

Investigation of circle creation mutations to update them to create `customFieldValues` for circle's purpose field (and any other initial field values) instead of storing them directly on the `circles` schema.

---

## 1. Dependencies Status ✅

All dependencies are complete and verified:

### SYOS-955: SYSTEM_FIELD_DEFINITIONS constant ✅

- **Location**: `convex/features/customFields/constants.ts`
- **Status**: COMPLETE
- **Circle systemKeys**: `purpose`, `domain`, `strategy`

### SYOS-958: circles schema ✅

- **Location**: `convex/core/circles/tables.ts`
- **Status**: Schema has optional `purpose` field (will be removed after migration)
- **Current**: Lines 22-48 show lean schema with only core operational fields

### SYOS-959: Seeding ✅

- **Location**: `convex/admin/seed/`
- **Status**: COMPLETE
- **Verified**: customFieldDefinitions are properly seeded when root circle is created

### SYOS-960: Role creation flow ✅

- **Status**: COMPLETE
- **Pattern**: Role creation already uses `createCustomFieldValuesFromTemplate()` helper
- **Reference**: `convex/core/circles/autoCreateRoles.ts` lines 189-195, 316-322, 400-406

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

**Additional useful index**: `by_workspace_entity: ['workspaceId', 'entityType']` (line 86)

---

## 3. Current Circle Creation Flow

### 3.1. Circle Creation Entry Point

**Location**: `convex/core/circles/mutations.ts` (lines 15-43)

**Pattern**: Delegates to `createCircleInternal()` in `circleLifecycle.ts`

```typescript
export const create = mutation({
  args: {
    sessionId: v.string(),
    workspaceId: v.id('workspaces'),
    name: v.string(),
    purpose: v.optional(v.string()),  // ❌ Still accepting purpose
    parentCircleId: v.optional(v.id('circles')),
    circleType: v.optional(...),
    decisionModel: v.optional(...)
  },
  handler: async (ctx, args): Promise<Id<'circles'>> => {
    const { circleId } = await createCircleInternal(ctx, args);
    return circleId;
  }
});
```

### 3.2. Circle Creation Implementation

**Location**: `convex/core/circles/circleLifecycle.ts` (lines 18-112)

**Current implementation** (lines 78-90):

```typescript
const circleId = await ctx.db.insert('circles', {
	workspaceId: args.workspaceId,
	name: trimmedName,
	slug,
	purpose: args.purpose, // ❌ Stored directly on schema
	parentCircleId: args.parentCircleId,
	circleType,
	decisionModel,
	status: 'active',
	createdAt: now,
	updatedAt: now,
	updatedByPersonId: actorPersonId
});
```

**Seeds customFieldDefinitions** (lines 100-106):

```typescript
// If this is a root circle (first circle in workspace), seed workspace resources
if (args.parentCircleId === undefined) {
	// Seed custom field definitions (workspace-scoped)
	await createSystemCustomFieldDefinitions(ctx, args.workspaceId, actorPersonId);

	// Seed meeting templates (workspace-scoped, generic templates)
	await seedWorkspaceResources(ctx, args.workspaceId, actorPersonId);
}
```

**Auto-creates Circle Lead role** (line 97):

```typescript
await createCoreRolesForCircle(ctx, circleId, args.workspaceId, actorPersonId, circleType);
```

### 3.3. Circle Update Flow

**Location**: `convex/core/circles/circleLifecycle.ts`

Two update mutations exist:

1. **`updateCircleInternal()`** (lines 114-186): Updates name, purpose, parentCircleId
2. **`updateInlineCircle()`** (lines 188-283): Updates name, purpose, circleType, decisionModel

Both currently update `purpose` directly on schema (lines 155-157, 234-236):

```typescript
if (args.purpose !== undefined) {
	updates.purpose = args.purpose; // ❌ Updates schema directly
}
```

---

## 4. Circle Lead Auto-Creation Analysis ✅

**Location**: `convex/core/circles/autoCreateRoles.ts`

### 4.1. Auto-creation Already Uses New Pattern ✅

**Function**: `createCoreRolesForCircle()` (lines 116-208)

**Pattern** (lines 173-195):

```typescript
// Create lean circleRole (no descriptive fields per SYOS-960)
const roleId = await ctx.db.insert('circleRoles', {
	circleId,
	workspaceId,
	name: template.name,
	roleType: template.roleType,
	templateId: template._id,
	status: 'active',
	isHiring: false,
	createdAt: now,
	updatedAt: now,
	updatedByPersonId: personId
});

// Create customFieldValues from template defaults (SYOS-960)
// This also validates required fields (GOV-02, GOV-03)
await createCustomFieldValuesFromTemplate(ctx, {
	workspaceId,
	entityType: 'role',
	entityId: roleId,
	templateDefaultFieldValues: template.defaultFieldValues,
	createdByPersonId: personId
});
```

**Verdict**: ✅ Circle Lead auto-creation ALREADY uses the new customFieldValues pattern. No changes needed.

### 4.2. Helper Function Available

**Location**: `convex/infrastructure/customFields/helpers.ts`

**Function**: `createCustomFieldValuesFromTemplate()` (lines 33-106)

**Pattern**:

1. For each field in template.defaultFieldValues
2. Look up customFieldDefinition by systemKey
3. Create one customFieldValues record per value (for searchability)
4. Populate searchText for indexing

**Usage for circles** (adapted from role pattern):

```typescript
await createCustomFieldValuesFromTemplate(ctx, {
	workspaceId,
	entityType: 'circle',
	entityId: circleId,
	templateDefaultFieldValues: [{ systemKey: 'purpose', values: [args.purpose] }],
	createdByPersonId: actorPersonId
});
```

---

## 5. Seeding Trigger Analysis

**Location**: `convex/core/circles/circleLifecycle.ts` (lines 99-106)

**Current logic**:

```typescript
// If this is a root circle (first circle in workspace), seed workspace resources
if (args.parentCircleId === undefined) {
	// Seed custom field definitions (workspace-scoped)
	await createSystemCustomFieldDefinitions(ctx, args.workspaceId, actorPersonId);

	// Seed meeting templates (workspace-scoped, generic templates)
	await seedWorkspaceResources(ctx, args.workspaceId, actorPersonId);
}
```

**Issue**: customFieldDefinitions are seeded AFTER circle is created, but we need them BEFORE we can create customFieldValues.

**Solution**: Move seeding BEFORE circle creation:

```typescript
// If this is a root circle, ensure customFieldDefinitions exist first
if (args.parentCircleId === undefined) {
  await createSystemCustomFieldDefinitions(ctx, args.workspaceId, actorPersonId);
}

const circleId = await ctx.db.insert('circles', { ... });

// Create customFieldValue for purpose if provided
if (args.purpose) {
  const purposeDefinition = await ctx.db
    .query('customFieldDefinitions')
    .withIndex('by_workspace_system_key', (q) =>
      q.eq('workspaceId', args.workspaceId)
       .eq('systemKey', 'purpose')
    )
    .first();

  if (purposeDefinition) {
    await ctx.db.insert('customFieldValues', { ... });
  }
}

// Then seed meeting templates
if (args.parentCircleId === undefined) {
  await seedWorkspaceResources(ctx, args.workspaceId, actorPersonId);
}
```

---

## 6. Circles Table Schema

**Location**: `convex/core/circles/tables.ts` (lines 22-54)

**Current schema**:

```typescript
export const circlesTable = defineTable({
  workspaceId: v.id('workspaces'),
  name: v.string(),
  slug: v.string(),
  parentCircleId: v.optional(v.id('circles')),
  status: v.union(v.literal('draft'), v.literal('active')),
  circleType: v.optional(v.union(...)),
  decisionModel: v.optional(v.union(...)),
  createdAt: v.number(),
  updatedAt: v.number(),
  updatedByPersonId: v.optional(v.id('people')),
  archivedAt: v.optional(v.number()),
  archivedByPersonId: v.optional(v.id('people'))
})
```

**Note**: `purpose` field is NOT in the schema definition, which is GOOD! This means:

- Schema validation is disabled (line 133 in `convex/schema.ts`)
- We can safely read/write purpose during migration
- Once migration is complete, purpose writes will be ignored

---

## 7. Implementation Plan

### Phase 1: Update Circle Creation (createCircleInternal)

**File**: `convex/core/circles/circleLifecycle.ts`

**Changes**:

1. ✅ Move customFieldDefinitions seeding BEFORE circle creation (for root circles)
2. ✅ Remove `purpose: args.purpose` from circle insert
3. ✅ Create customFieldValue for purpose if provided (after circle creation)
4. ✅ Use existing `createSystemCustomFieldDefinitions()` helper
5. ✅ Keep Circle Lead auto-creation (already uses new pattern)

### Phase 2: Update Circle Updates

**Files**:

- `convex/core/circles/circleLifecycle.ts` - `updateCircleInternal()` and `updateInlineCircle()`
- `convex/core/circles/mutations.ts` - Keep mutation args for backward compatibility

**Changes**:

1. ✅ Update/create customFieldValue when purpose is updated
2. ✅ Remove `updates.purpose = args.purpose` assignments
3. ✅ Keep mutation signatures (for backward compatibility during migration)

### Phase 3: Schema Cleanup (Future)

**Note**: This should be done AFTER all frontend code is updated

- Remove `purpose` field from circles schema
- Update all queries that read circle.purpose
- Remove `purpose` from mutation args (breaking change)

---

## 8. Edge Cases & Considerations

### 8.1. customFieldDefinitions Not Seeded Yet

**Scenario**: Creating a circle in a workspace where customFieldDefinitions haven't been seeded.

**Current behavior**: Seeding happens on root circle creation.

**New behavior**:

- For root circles: Seed customFieldDefinitions BEFORE creating circle (so purpose customFieldValue can be created)
- For non-root circles: customFieldDefinitions should already exist (seeded with root circle)

### 8.2. Purpose Not Provided

**Scenario**: Creating a circle without a purpose (optional).

**Solution**: Only create customFieldValue if purpose is provided:

```typescript
if (args.purpose) {
	// Create customFieldValue
}
```

### 8.3. Multiple Values for Purpose

**Scenario**: Purpose is a single text field, not multi-value.

**Solution**: Create one customFieldValue record with single value (following SYOS-960 pattern):

```typescript
await ctx.db.insert('customFieldValues', {
	// ...
	value: args.purpose, // Single value (not array)
	searchText: args.purpose
});
```

### 8.4. Backward Compatibility

**Migration period**: Frontend code may still read `circle.purpose` during migration.

**Solution**:

- Keep schema validation disabled (`schemaValidation: false`)
- Purpose field will be silently ignored on writes
- Frontend should be updated to read from customFieldValues instead

---

## 9. Files to Update

### Core Changes

1. ✅ `convex/core/circles/circleLifecycle.ts`
   - Update `createCircleInternal()` (lines 18-112)
   - Update `updateCircleInternal()` (lines 114-186)
   - Update `updateInlineCircle()` (lines 188-283)

2. ✅ `convex/core/circles/mutations.ts`
   - Keep mutation signatures (backward compatibility)
   - May add comments about migration

### No Changes Needed

- ✅ `convex/core/circles/autoCreateRoles.ts` - Already uses new pattern
- ✅ `convex/infrastructure/customFields/helpers.ts` - Reuse existing helper
- ✅ `convex/features/customFields/tables.ts` - Indexes already exist

---

## 10. Testing Strategy

### Manual Tests

1. **Create root circle with purpose**:
   - Verify customFieldDefinitions are seeded first
   - Verify circle created without purpose field
   - Verify customFieldValue created for purpose
   - Verify Circle Lead role created with customFieldValues

2. **Create child circle with purpose**:
   - Verify customFieldValue created for purpose
   - Verify Circle Lead role created

3. **Create circle without purpose**:
   - Verify circle created successfully
   - Verify no customFieldValue created

4. **Update circle purpose**:
   - Verify customFieldValue created/updated
   - Verify searchText populated

### Integration Tests

- Run existing circle creation tests
- Verify `npm run check` passes
- Verify no TypeScript errors

---

## 11. Key Findings Summary

✅ **Circle creation flow**: Found in `circleLifecycle.ts:createCircleInternal()`  
✅ **Circle Lead auto-creation**: Already uses new pattern via `createCoreRolesForCircle()`  
✅ **customFieldDefinitions index**: `by_workspace_system_key` exists and is correct  
✅ **Helper available**: `createCustomFieldValuesFromTemplate()` in infrastructure layer  
✅ **Schema clean**: circles table doesn't have purpose field in schema definition  
⚠️ **Seeding order**: Need to move customFieldDefinitions seeding BEFORE circle creation

**Ready to implement**: All dependencies verified, pattern established by SYOS-960, clear implementation path.

---

## 12. Implementation Confidence

**Confidence Level**: 95%

**Risks**:

- Seeding order needs careful handling (root circle case)
- Need to verify customFieldDefinition exists before creating customFieldValue

**Mitigations**:

- Follow SYOS-960 pattern exactly (role creation)
- Reuse existing `createSystemCustomFieldDefinitions()` helper
- Add null checks for customFieldDefinition lookups
- Keep backward-compatible mutation signatures

---

## Next Steps

1. ✅ Investigation complete
2. → Implement changes in `circleLifecycle.ts`
3. → Test manually with root and child circles
4. → Run `npm run check`
5. → Document any findings
