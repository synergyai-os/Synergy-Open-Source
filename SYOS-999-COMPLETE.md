# SYOS-999 - Placeholder People Status ✅ COMPLETE

**Date**: 2025-12-19  
**Status**: ✅ Implementation Complete - Ready for Testing

## Summary

Successfully implemented placeholder people status to support planning entities (new hires, consultants, board members) who should appear in org charts and hold roles before they have system accounts.

## What Was Implemented

### ✅ Schema Changes

- Added `'placeholder'` status to people table
- Made `invitedAt` optional (was required)
- Added `createdAt` field (required for all statuses)

### ✅ Fallback Pattern Updates

- Updated 5 locations with new fallback: `person.joinedAt ?? person.invitedAt ?? person.createdAt`
- Ensures backward compatibility with existing records

### ✅ Person Creation Updates

- Added `createdAt` to all 8 `db.insert('people', ...)` calls
- Ensures all new records have creation timestamp

### ✅ Invariant Validation

- Implemented IDENT-12 (critical): Placeholder people have displayName, no email, no userId
- Implemented IDENT-13 (warning): Placeholder people do not have invitedAt set
- Registered both checks in invariant runner

### ✅ Helper Functions

- `createPlaceholder()` - Create placeholder with displayName only
- `transitionPlaceholderToInvited()` - Transition placeholder to invited status
- `isPersonPlaceholder()` - Check if person is placeholder

### ✅ Documentation

- Updated `convex/core/people/README.md` with full lifecycle documentation
- Added status comparison table and lifecycle diagram
- Documented placeholder properties and timestamp semantics

## Status Lifecycle

```
placeholder → invited → active → archived
     ↓            ↓         ↓
     └────────────┴─────────┴──────→ archived (direct archive allowed)
```

| Status      | email     | userId    | Can Log In | Purpose                     |
| ----------- | --------- | --------- | ---------- | --------------------------- |
| placeholder | ❌        | ❌        | ❌         | Planning entity (name only) |
| invited     | ✅        | ❌        | ❌         | Awaiting signup             |
| active      | ❌        | ✅        | ✅         | Full access                 |
| archived    | preserved | preserved | ❌         | Audit trail                 |

## Key Features

### Placeholders Can:

- ✅ Be assigned to roles via `assignments` table
- ✅ Appear in org charts and authority displays
- ✅ Have workspace roles (owner/admin/member)
- ✅ Be transitioned to invited status
- ✅ Be directly archived

### Placeholders Cannot:

- ❌ Log in (no userId = no session)
- ❌ Take actions (no session = no mutations)
- ❌ Have email addresses (until transitioned to invited)

## Migration Strategy

**No migration needed!** ✅

- Existing records have `invitedAt` set (all were created as `invited` or `active`)
- New records will have `createdAt` set
- Fallback pattern handles both cases gracefully

## Files Changed (19 total)

### Core Implementation (4 files)

- `convex/core/people/tables.ts` - Schema
- `convex/core/people/mutations.ts` - Helper functions
- `convex/core/people/rules.ts` - Status check
- `convex/core/people/README.md` - Documentation

### Invariants (2 files)

- `convex/admin/invariants/identity.ts` - IDENT-12/13
- `convex/admin/invariants/index.ts` - Registration

### Fallback Updates (5 files)

- `convex/core/workspaces/queries.ts`
- `convex/core/users/queries.ts`
- `convex/core/workspaces/members.ts`
- `convex/admin/archived/syos814TestUtils.ts` (2 locations)

### Person Creation (8 files)

- `convex/core/workspaces/members.ts`
- `convex/core/workspaces/lifecycle.ts`
- `convex/features/invites/helpers.ts`
- `convex/core/people/mutations.ts`
- `convex/admin/ensurePersonForUserInWorkspace.ts`
- `tests/convex/integration/setup.ts`
- `tests/convex/integration/invariants.integration.test.ts`
- `src/lib/infrastructure/workspaces/__tests__/workspaces.integration.test.ts`

## Testing Checklist

### Unit Tests

- [ ] Test `createPlaceholder()` with valid data
- [ ] Test `createPlaceholder()` without displayName (should fail)
- [ ] Test `transitionPlaceholderToInvited()` with valid placeholder
- [ ] Test `transitionPlaceholderToInvited()` with non-placeholder (should fail)
- [ ] Test `isPersonPlaceholder()` helper

### Integration Tests

- [ ] Create placeholder and assign to role
- [ ] Create placeholder and verify in org chart
- [ ] Transition placeholder to invited
- [ ] Transition invited to active (existing flow)
- [ ] Archive placeholder directly
- [ ] Run invariant checks: `npx convex run admin/invariants:runAll --category IDENT`

### Manual Testing

1. Create placeholder person
2. Assign placeholder to a role in a circle
3. View org chart - placeholder should appear
4. Transition placeholder to invited (add email)
5. Complete signup flow (invited → active)
6. Verify timestamps are correct

### Expected Results

- ✅ IDENT-12 passes (displayName set, no email/userId)
- ✅ IDENT-13 passes (no invitedAt for placeholders)
- ✅ Placeholders appear in org charts
- ✅ Placeholders can hold roles
- ✅ Placeholders cannot log in
- ✅ Existing records continue to work

## API Usage Examples

### Create Placeholder

```typescript
import { createPlaceholder } from 'convex/core/people';

const personId = await createPlaceholder(ctx, {
	workspaceId,
	displayName: 'Future Hire (Starting Q2)',
	workspaceRole: 'member',
	createdByPersonId: actorPersonId
});
```

### Transition to Invited

```typescript
import { transitionPlaceholderToInvited } from 'convex/core/people';

await transitionPlaceholderToInvited(ctx, {
	personId,
	email: 'newhire@company.com',
	invitedByPersonId: actorPersonId
});
```

### Check Status

```typescript
import { isPersonPlaceholder } from 'convex/core/people';

if (isPersonPlaceholder(person)) {
	// Handle placeholder-specific logic
}
```

## Breaking Changes

### None! ✅

This is a backward-compatible addition:

- New status value added to union type
- Existing statuses unchanged
- Fallback pattern handles old and new records
- All existing code continues to work

## Next Steps

1. ✅ Code implementation complete
2. ⏳ Deploy to development environment
3. ⏳ Run invariant checks on dev data
4. ⏳ Manual testing of placeholder workflows
5. ⏳ Write unit tests for new functions
6. ⏳ Update frontend to support placeholder creation
7. ⏳ Deploy to production

## References

- **Ticket**: SYOS-999
- **Investigation**: Ticket comments (investigation complete ✅)
- **Architecture**: `dev-docs/master-docs/architecture.md` (lines 452-481)
- **Invariants**: `convex/admin/invariants/INVARIANTS.md` (lines 69-70, 84-88)
- **Domain docs**: `convex/core/people/README.md`
- **Implementation summary**: `SYOS-999-implementation-summary.md`

## Notes

- ✅ No migration script needed
- ✅ Backward compatible
- ✅ Natural enforcement (placeholders can't log in)
- ✅ All linting passes
- ✅ TypeScript compilation verified
- ✅ All TODO items completed

---

**Status**: Ready for deployment and testing! 🚀
