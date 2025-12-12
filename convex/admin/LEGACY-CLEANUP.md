# Legacy Table Cleanup

**Ticket:** SYOS-809  
**Date:** 2025-12-11  
**Status:** Evaluated - Decisions Documented

---

## Summary

| Table              | Status         | Replacement   | References | Decision                       |
| ------------------ | -------------- | ------------- | ---------- | ------------------------------ |
| `workspaceMembers` | **Legacy**     | `people`      | 56         | Keep with `// legacy` comment  |
| `workspaceInvites` | **NOT Legacy** | N/A           | 23         | Keep as-is (different purpose) |
| `userCircleRoles`  | **Legacy**     | `assignments` | 56         | Keep with `// legacy` comment  |

---

## Detailed Evaluation

### workspaceMembers

**Status:** Kept (legacy)  
**Replacement:** `people` table  
**References found:** 56 across convex/

**Key Reference Locations:**

- `convex/core/workspaces/access.ts` - Access checks
- `convex/core/workspaces/members.ts` - Member management
- `convex/infrastructure/access/permissions.ts` - Permission checks
- `convex/infrastructure/featureFlags/targeting.ts` - Feature flag targeting
- Various admin/migration scripts

**Decision:** Cannot remove yet. The `people` table is the architectural replacement, but `workspaceMembers` is still heavily used across access control, member management, and infrastructure code.

**Documentation:**

- INVARIANTS.md (line 226): "Legacy table tracking workspace membership. Being superseded by `people` table."
- people/README.md (line 94): "**Do NOT delete** `workspaceMembers` yet - that's Phase 7"

**Tracking:** Phase 7 cleanup (see `convex/core/people/README.md`)

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
// legacy - replaced by `people` table (SYOS-809)
// Still used: access checks, member management, feature flags, migrations
// TODO: Remove in Phase 7 (see people/README.md)
workspaceMembers: workspaceMembersTable,

// legacy - replaced by `assignments` table (SYOS-809)
// Still used: authority calculation, role queries, history, triggers
// Invariants: UCROLE-* (convex/admin/invariants/legacyAssignments.ts)
// TODO: Complete migration and retire UCROLE-* invariants
userCircleRoles: userCircleRolesTable,
```

---

## Future Work

| Table              | Next Step                                | Tracking      |
| ------------------ | ---------------------------------------- | ------------- |
| `workspaceMembers` | Migrate remaining references to `people` | Phase 7       |
| `userCircleRoles`  | Complete migration to `assignments`      | Create ticket |

---

## Acceptance Criteria Status

- [x] All 3 legacy tables evaluated
- [x] Decision documented for each
- [x] ~~Unused tables removed from schema~~ (none were unused)
- [x] Kept tables have `// legacy` comments with tracking ticket
- [x] No orphaned code referencing removed tables (none were removed)

---

## Document History

| Version | Date       | Change                          |
| ------- | ---------- | ------------------------------- |
| 1.0     | 2025-12-11 | Initial evaluation per SYOS-809 |
