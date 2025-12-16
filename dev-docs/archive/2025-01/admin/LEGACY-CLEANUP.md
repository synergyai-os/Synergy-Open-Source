# Legacy Table Cleanup

**Ticket:** SYOS-809  
**Date:** 2025-12-11  
**Status:** Evaluated - Decisions Documented

---

## Summary

| Table              | Status          | Replacement   | References | Decision                       |
| ------------------ | --------------- | ------------- | ---------- | ------------------------------ |
| `workspaceMembers` | **✅ Complete** | `people`      | 0          | Table removed (SYOS-814)       |
| `workspaceInvites` | **NOT Legacy**  | N/A           | 23         | Keep as-is (different purpose) |
| `userCircleRoles`  | **Legacy**      | `assignments` | 56         | Keep with `// legacy` comment  |

---

## Detailed Evaluation

### workspaceMembers

**Status:** ✅ **Migration Complete** (SYOS-814)  
**Replacement:** `people` table  
**References found:** 0 (table removed from schema)

**Migration Status:**

- ✅ Table removed from schema
- ✅ All core code migrated to `people` table
- ✅ Remaining references are only in comments, verification scripts, and function names (concept, not table)

**Documentation:**

- architecture.md: Migration marked as complete (SYOS-814)
- INVARIANTS.md: XDOM-01 exception updated (workspaceMembers removed)

**Tracking:** SYOS-814 (completed), SYOS-840 (cleanup of remaining references)

---

### workspaceInvites

**Status:** NOT Legacy  
**Replacement:** None (serves different purpose)  
**References found:** 23 across convex/

**Key Reference Locations:**

- `convex/core/workspaces/inviteDetails.ts` - Invite information
- `convex/core/workspaces/inviteOperations.ts` - Create/accept invites
- `convex/core/workspaces/inviteValidation.ts` - Validate invite codes
- `convex/core/workspaces/invites.ts` - Public invite API

**Decision:** Keep as-is. This table is **NOT being replaced** by `people (status=invited)`.

**Rationale:**

The ticket description assumed `workspaceInvites` would be absorbed into `people`, but they serve **complementary purposes**:

| Table              | Purpose                 | Key Fields                                     |
| ------------------ | ----------------------- | ---------------------------------------------- |
| `people`           | Who exists in workspace | `status` (invited/active/archived), `email`    |
| `workspaceInvites` | Invite link lifecycle   | `code`, `expiresAt`, `acceptedAt`, `revokedAt` |

**Workflow:**

1. Invite someone → Create `workspaceInvites` record (with code) + Create `people` record (status=invited)
2. They accept → Mark invite as `acceptedAt` + Change person to `status=active`

The tables work together:

- `people` tracks the **person's existence** in the workspace
- `workspaceInvites` tracks the **invite code/link** (can expire, be revoked, be reused)

**No changes needed.**

---

### userCircleRoles

**Status:** Kept (legacy)  
**Replacement:** `assignments` table  
**References found:** 56 across convex/

**Key Reference Locations:**

- `convex/core/roles/roleAssignments.ts` - Role assignment CRUD
- `convex/core/roles/roleQueries*.ts` - Role queries
- `convex/core/authority/context.ts` - Authority calculation
- `convex/core/circles/triggers.ts` - Trigger on changes
- `convex/admin/invariants/legacyAssignments.ts` - Invariant checks

**Decision:** Cannot remove yet. Both tables are used in authority calculation, and the migration is in progress.

**Documentation:**

- INVARIANTS.md (lines 137-150): Entire section "Legacy Assignment Invariants (UCROLE-\*)"
- Line 149: "Note: `userCircleRoles` is being migrated to `assignments` table."
- Line 150: "Once migration is complete, UCROLE-\* invariants can be retired."
- `convex/core/assignments/README.md` (line 43): "`userCircleRoles` remains legacy during transition"
- `synergyos-core-architecture.md` (line 581): Migration tracking in Appendix D

**Invariants:** UCROLE-01 through UCROLE-04 (see `convex/admin/invariants/legacyAssignments.ts`)

**Tracking:** SYOS-802 (invariants system), future migration ticket needed

---

## Schema Changes

Added legacy comments to `convex/schema.ts` for:

```typescript
// legacy - replaced by `assignments` table (SYOS-809)
// Still used: authority calculation, role queries, history, triggers
// Invariants: UCROLE-* (convex/admin/invariants/legacyAssignments.ts)
// TODO: Complete migration and retire UCROLE-* invariants
userCircleRoles: userCircleRolesTable,
```

**Note:** `workspaceMembers` table has been removed from schema (SYOS-814 complete).

---

## Future Work

| Table              | Next Step                                  | Tracking           |
| ------------------ | ------------------------------------------ | ------------------ |
| `workspaceMembers` | ✅ Complete - cleanup remaining references | SYOS-840           |
| `userCircleRoles`  | Complete migration to `assignments`        | SYOS-809, SYOS-815 |

---

## Acceptance Criteria Status

- [x] All 3 legacy tables evaluated
- [x] Decision documented for each
- [x] ~~Unused tables removed from schema~~ (none were unused)
- [x] Kept tables have `// legacy` comments with tracking ticket
- [x] No orphaned code referencing removed tables (none were removed)

---

## Document History

| Version | Date       | Change                                                           |
| ------- | ---------- | ---------------------------------------------------------------- |
| 1.1     | 2025-12-13 | Updated workspaceMembers status to Complete (SYOS-814, SYOS-840) |
| 1.0     | 2025-12-11 | Initial evaluation per SYOS-809                                  |
