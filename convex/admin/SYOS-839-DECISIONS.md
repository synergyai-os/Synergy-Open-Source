# Admin Scripts Review: workspaceMembers References

**Ticket:** SYOS-839  
**Date:** 2025-12-13  
**Status:** ✅ Complete

---

## Context

SYOS-814 migration is complete. The `workspaceMembers` table has been removed from schema. This ticket reviews admin/migration scripts that still reference `workspaceMembers` and decides whether to archive, update, or delete them.

---

## Script Decisions

### Migration Scripts (One-Time, Already Ran)

| File                            | Decision        | Rationale                                                                                                               | Action Taken                   |
| ------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `migrateTagsToPersonId.ts`      | ✅ **Keep**     | Updated to use `people` table. Comments document migration. Still useful for reference.                                 | No change needed               |
| `migrateAddCoreRoles.ts`        | ✅ **Keep**     | Updated to use `people` table. Comments document migration. Still useful for reference.                                 | No change needed               |
| `migrateVersionHistory.ts`      | ✅ **Keep**     | Updated to use `people` table. Comments document migration. Still useful for reference.                                 | No change needed               |
| `migrateCirclesToWorkspaces.ts` | ✅ **Archived** | Contains active code querying/inserting into removed `workspaceMembers` table. Marked obsolete but code still executes. | Moved to `archived/` directory |
| `migrateRootCircles.ts`         | ✅ **Keep**     | Updated to use `people` table. Comments document migration. Still useful for reference.                                 | No change needed               |
| `migrateDefaultCategories.ts`   | ✅ **Keep**     | Updated to use `people` table. Comments document migration. Still useful for reference.                                 | No change needed               |

### Utility Scripts (Still Useful)

| File                          | Decision         | Rationale                                                                                                                 | Action Taken                   |
| ----------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `reportMissingUsersPeople.ts` | ⚠️ **Not Found** | File doesn't exist in codebase. May have been deleted or renamed. Referenced in `_generated/api.d.ts` but source missing. | No action (file doesn't exist) |
| `seedOrgChart.ts`             | ✅ **Keep**      | Updated to use `people` table. Comments document migration. Still useful for seeding org charts.                          | No change needed               |
| `orgStructureImport.ts`       | ✅ **Keep**      | Updated to use `people` table. Comments document migration. Still useful for importing org structures.                    | No change needed               |
| `validateRoleTemplates.ts`    | ✅ **Keep**      | Updated to use `people` table. Comments document migration (lines 57, 128, 199). Still useful for validation.             | No change needed               |

### Invariant Code

| File                        | Decision       | Rationale                                                                      | Action Taken                       |
| --------------------------- | -------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| `invariants/crossDomain.ts` | ✅ **Updated** | Previously listed `workspaceMembers` as exception. Exception has been removed. | Already updated (no action needed) |

---

## Summary

**Total Scripts Reviewed:** 11  
**Archived:** 1 (`migrateCirclesToWorkspaces.ts`)  
**Updated:** 9 (already using `people` table)  
**Not Found:** 1 (`reportMissingUsersPeople.ts`)  
**No Change Needed:** 1 (`crossDomain.ts` already updated)

---

## Verification

### Active Queries Check

```bash
# Check for active database queries to workspaceMembers (excluding archived)
grep -rn "\.(query|insert|patch|replace|delete)\(['\"]workspaceMembers" convex/admin/ --exclude-dir=archived
```

**Result:** ✅ 0 matches (all queries are in archived file or comments only)

### Remaining References

All remaining `workspaceMembers` references are:

- ✅ Comments explaining migration (SYOS-814)
- ✅ Documentation files (`LEGACY-CLEANUP.md`, `INVARIANTS.md`)
- ✅ Test files with migration notes
- ✅ Archived migration script (kept for reference)

---

## Acceptance Criteria Status

- [x] Each script reviewed and decision documented
- [x] Migration scripts that already ran → archived or deleted
  - `migrateCirclesToWorkspaces.ts` → archived
  - All others kept (updated to use `people` table)
- [x] Utility scripts that are still needed → updated to use people table
  - All utility scripts use `people` table
- [x] `crossDomain.ts` invariant exception list updated
  - Exception already removed (no action needed)
- [x] No admin script queries removed `workspaceMembers` table (except archived)
  - Only archived file contains queries
  - All active scripts use `people` table

---

## Related Tickets

- **SYOS-814:** Original migration (completed)
- **SYOS-840:** Parent epic for post-migration cleanup
- **SYOS-836:** Architecture documentation update
- **SYOS-837:** Test files update
- **SYOS-838:** Internal documentation update

---

## Notes

1. **`reportMissingUsersPeople.ts`**: File referenced in generated API but source missing. May have been deleted in a previous cleanup. No action needed as file doesn't exist.

2. **Archived Directory**: Created `convex/admin/archived/` directory to store obsolete migration scripts. This keeps them for reference while preventing accidental execution.

3. **Comment References**: All remaining `workspaceMembers` references in active code are comments documenting the migration. These are intentional and help future developers understand the migration history.
