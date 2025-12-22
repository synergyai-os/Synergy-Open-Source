# Secretary Role Template Fix

**Date**: 2025-12-17  
**Issue**: Secretary roles missing `decision_right` field, causing GOV-03 validation error during circle creation

---

## Problem

When creating a circle during onboarding, the following error occurred:

```
SYNERGYOS_ERROR|VALIDATION_REQUIRED_FIELD|GOV-03: Role must have at least one decision right
```

**Root Cause**: Secretary role templates only had `purpose` and `accountability` fields, but were missing `decision_right`. The validation in `helpers.ts` correctly requires all roles to have at least one decision right (GOV-03).

---

## Solution

Added `decision_right` to all 4 Secretary role templates:

```typescript
{
  systemKey: 'decision_right',
  values: ['Decide what to record in meeting notes']
}
```

**Rationale**: Secretary roles DO make decisions - they decide what to record, how to interpret governance records, and what level of detail to capture in meeting notes.

---

## Files Changed

### `convex/admin/seed/roleTemplates.ts`

Updated all 4 Secretary templates:

1. ✅ Secretary (hierarchy) - Added decision_right
2. ✅ Secretary (empowered_team) - Added decision_right
3. ✅ Secretary (guild) - Added decision_right
4. ✅ Secretary (hybrid) - Added decision_right

**Pattern** (same for all):

```typescript
defaultFieldValues: [
	{
		systemKey: 'purpose',
		values: ['Maintain circle records and support governance integrity']
	},
	{
		systemKey: 'decision_right',
		values: ['Decide what to record in meeting notes'] // ✅ ADDED
	},
	{
		systemKey: 'accountability',
		values: [
			'Record meeting outputs',
			'Maintain governance records',
			'Interpret governance records'
		]
	}
];
```

Also fixed missing import:

```typescript
import { CIRCLE_TYPES, type CircleType } from '../../core/circles/constants';
```

---

## Re-seeding Instructions

The system role templates need to be re-seeded to pick up the new `decision_right` field.

### Option 1: Manual Seed (Recommended)

Run the seed script directly:

```bash
npx convex run admin/seed/index:seedDatabase
```

This will:

- Update existing system role templates with new `decision_right` field
- Be idempotent (won't duplicate templates)

### Option 2: Delete Workspace and Re-onboard

If you want a fresh start:

1. Delete the test workspace from Convex dashboard
2. Go through onboarding again
3. Templates will be seeded automatically when creating the first circle

---

## Verification

After re-seeding, test circle creation:

1. Go to onboarding step 3 (Create Circle)
2. Enter circle name and purpose
3. Click "Create Circle"
4. ✅ Should succeed without GOV-03 error
5. ✅ Verify Secretary role created with decision_right customFieldValue

---

## Related

- **SYOS-961**: Update circle creation mutation (parent ticket)
- **SYOS-960**: Update role creation to use customFieldValues
- **GOV-03**: Governance rule - all roles must have at least one decision right
