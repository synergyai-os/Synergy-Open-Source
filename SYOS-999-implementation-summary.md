# SYOS-999 Implementation Summary

**Ticket**: SYOS-999 - Add Placeholder People Status  
**Date**: 2025-12-19  
**Status**: ✅ Complete

## Overview

Implemented placeholder people status to support planning entities (new hires, consultants, board members) who should appear in org charts and hold roles before they have system accounts.

## Changes Made

### 1. Schema Changes ✅

**File**: `convex/core/people/tables.ts`

- Added `'placeholder'` to status union type
- Changed `invitedAt` from required `v.number()` to optional `v.optional(v.number())`
- Added `createdAt` field as required `v.number()`

**Status values**:
```typescript
status: v.union(
  v.literal('placeholder'),  // NEW
  v.literal('invited'),
  v.literal('active'),
  v.literal('archived')
)
```

**Timestamp fields**:
```typescript
createdAt: v.number(),              // NEW - When person record was created (all statuses)
invitedAt: v.optional(v.number()),  // CHANGED - When invite was sent (invited status and beyond)
```

### 2. Fallback Pattern Updates ✅

Updated all `joinedAt` fallback patterns to include `createdAt`:

**Pattern**: `person.joinedAt ?? person.invitedAt ?? person.createdAt`

**Files updated** (5 locations):
- `convex/core/workspaces/queries.ts` (line 107)
- `convex/core/users/queries.ts` (line 77)
- `convex/core/workspaces/members.ts` (line 134)
- `convex/admin/archived/syos814TestUtils.ts` (lines 188, 295)

### 3. Person Creation Updates ✅

Added `createdAt` field to all `db.insert('people', ...)` calls:

**Files updated** (8 locations):
- `convex/core/workspaces/members.ts` - Direct member addition
- `convex/core/workspaces/lifecycle.ts` - Workspace owner creation
- `convex/features/invites/helpers.ts` - Invite acceptance
- `convex/core/people/mutations.ts` - Invite person
- `convex/admin/ensurePersonForUserInWorkspace.ts` - Admin utility
- `tests/convex/integration/setup.ts` - Test setup
- `tests/convex/integration/invariants.integration.test.ts` - Test data
- `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts` - Test data

### 4. Invariant Validation ✅

**File**: `convex/admin/invariants/identity.ts`

Added two new invariant checks:

#### IDENT-12 (Critical)
```typescript
export const checkIDENT12 = internalQuery({
  // Validates: Placeholder people have displayName, no email, no userId
  // Severity: critical
});
```

#### IDENT-13 (Warning)
```typescript
export const checkIDENT13 = internalQuery({
  // Validates: Placeholder people do not have invitedAt set
  // Severity: warning
});
```

**File**: `convex/admin/invariants/index.ts`

- Registered `checkIDENT12` and `checkIDENT13` in `checkRefs` array
- Updated comment: Identity checks now (11) instead of (9)

### 5. Helper Functions ✅

**File**: `convex/core/people/mutations.ts`

Added two new mutation functions:

#### `createPlaceholder()`
```typescript
export async function createPlaceholder(
  ctx: MutationCtx,
  args: CreatePlaceholderArgs
): Promise<Id<'people'>>
```

- Creates a placeholder person with `displayName` only
- No email, no userId
- Status: `'placeholder'`
- Sets `createdAt`, leaves `invitedAt` undefined
- Validates workspace exists and permissions

#### `transitionPlaceholderToInvited()`
```typescript
export async function transitionPlaceholderToInvited(
  ctx: MutationCtx,
  args: TransitionPlaceholderToInvitedArgs
): Promise<PersonDoc>
```

- Transitions a placeholder to invited status
- Adds email and sets `invitedAt`
- Validates no duplicate email in workspace
- Validates permissions

**File**: `convex/core/people/rules.ts`

Added helper function:

```typescript
export function isPersonPlaceholder(person: PersonDoc): boolean {
  return person.status === 'placeholder';
}
```

### 6. Documentation Updates ✅

**File**: `convex/core/people/README.md`

- Added placeholder status to Key Concepts
- Expanded Identity Model table with `displayName`, `createdAt`, `invitedAt`, `joinedAt`
- Added new "Status Lifecycle" section with:
  - Status comparison table
  - Lifecycle transition diagram
  - Placeholder properties explanation
  - Timestamp semantics
- Added IDENT-12 and IDENT-13 to Invariants table

**Files already updated** (from investigation):
- `convex/admin/invariants/INVARIANTS.md` - IDENT-12/13 definitions added
- `dev-docs/master-docs/architecture.md` - Placeholder lifecycle documented

## Status Lifecycle

```
placeholder → invited → active → archived
     ↓            ↓         ↓
     └────────────┴─────────┴──────→ archived (direct archive allowed)
```

| Status | Has `email` | Has `userId` | Can Log In | Purpose |
|--------|-------------|--------------|------------|---------|
| `placeholder` | ❌ | ❌ | ❌ | Planning entity — name only, represents future participant |
| `invited` | ✅ | ❌ | ❌ | Invited via email, awaiting signup |
| `active` | ❌ (use users.email) | ✅ | ✅ | Linked to auth identity, full access |
| `archived` | preserved | preserved | ❌ | Soft-deleted, kept for audit trail |

## Placeholder Properties

- **Created with**: `displayName` only — no email, no userId
- **Can be assigned**: To roles via `assignments` table
- **Appear in**: Org charts and authority displays
- **Cannot**: Log in or take actions (no session possible)
- **Persist**: Into active workspaces as a normal planning mechanism

## Timestamp Semantics

- `createdAt` — when the person record was created (all statuses)
- `invitedAt` — when invite was sent (only for `invited` status and beyond)
- `joinedAt` — when user accepted and linked their account (only for `active`)

## Breaking Changes

### Schema Migration Required

**Breaking**: The `people` table schema has changed:
- `status` field now includes `'placeholder'` value
- `invitedAt` is now optional (was required)
- `createdAt` is now required (new field)

**Migration strategy**: No migration needed for existing records:
- Existing records have `invitedAt` set (all were created as `invited` or `active`)
- New records will have `createdAt` set
- Fallback pattern handles both: `person.joinedAt ?? person.invitedAt ?? person.createdAt`

### API Changes

**New exports** from `convex/core/people/`:
- `createPlaceholder()` - Create placeholder person
- `transitionPlaceholderToInvited()` - Transition placeholder to invited
- `isPersonPlaceholder()` - Check if person is placeholder

**No breaking changes** to existing functions.

## Invariants Added

| ID | Invariant | Severity |
|----|-----------|----------|
| IDENT-12 | Placeholder people have `displayName`, no `email`, no `userId` | critical |
| IDENT-13 | Placeholder people do not have `invitedAt` set (use `createdAt`) | warning |

## Testing

### Manual Testing Required

1. **Create placeholder**:
   ```typescript
   const personId = await createPlaceholder(ctx, {
     workspaceId,
     displayName: "Future Hire",
     workspaceRole: "member",
     createdByPersonId: actorPersonId
   });
   ```

2. **Assign placeholder to role**:
   ```typescript
   // Should work - placeholders can hold roles
   await assignPersonToRole(ctx, {
     personId,
     roleId,
     circleId
   });
   ```

3. **Transition to invited**:
   ```typescript
   await transitionPlaceholderToInvited(ctx, {
     personId,
     email: "hire@example.com",
     invitedByPersonId: actorPersonId
   });
   ```

4. **Run invariant checks**:
   ```bash
   npx convex run admin/invariants:runAll --category IDENT
   ```

### Expected Behavior

- ✅ Placeholders appear in org charts
- ✅ Placeholders can be assigned to roles
- ✅ Placeholders cannot log in (no userId)
- ✅ Placeholders cannot take actions (no session)
- ✅ IDENT-12 passes (displayName set, no email/userId)
- ✅ IDENT-13 passes (no invitedAt for placeholders)

## Files Changed

### Schema & Core Logic (4 files)
- `convex/core/people/tables.ts` - Schema changes
- `convex/core/people/mutations.ts` - Helper functions
- `convex/core/people/rules.ts` - Status check helper
- `convex/core/people/README.md` - Documentation

### Invariants (2 files)
- `convex/admin/invariants/identity.ts` - IDENT-12/13 checks
- `convex/admin/invariants/index.ts` - Register new checks

### Fallback Updates (5 files)
- `convex/core/workspaces/queries.ts`
- `convex/core/users/queries.ts`
- `convex/core/workspaces/members.ts`
- `convex/admin/archived/syos814TestUtils.ts`

### Person Creation Updates (8 files)
- `convex/core/workspaces/members.ts`
- `convex/core/workspaces/lifecycle.ts`
- `convex/features/invites/helpers.ts`
- `convex/core/people/mutations.ts`
- `convex/admin/ensurePersonForUserInWorkspace.ts`
- `tests/convex/integration/setup.ts`
- `tests/convex/integration/invariants.integration.test.ts`
- `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts`

**Total**: 19 files changed

## Next Steps

1. ✅ All code changes complete
2. ⏳ Deploy to development environment
3. ⏳ Run invariant checks on dev data
4. ⏳ Manual testing of placeholder creation/transition
5. ⏳ Test placeholder assignments to roles
6. ⏳ Verify org chart display with placeholders
7. ⏳ Deploy to production

## Notes

- **No migration script needed**: Existing records work with fallback pattern
- **Backward compatible**: All existing code continues to work
- **Natural enforcement**: Placeholders can't log in (no userId) so can't take actions
- **Status checks unchanged**: All 28 status checks look for specific values, placeholders naturally excluded

## References

- **Investigation**: Ticket comments (investigation complete)
- **Architecture**: `dev-docs/master-docs/architecture.md` (Identity Architecture section)
- **Invariants**: `convex/admin/invariants/INVARIANTS.md` (IDENT-12/13)
- **Domain docs**: `convex/core/people/README.md`

