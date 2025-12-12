# Violations Log

Records of invariant violations found and how they were resolved.

---

## 2025-12-11: Initial Invariants Run (SYOS-806)

### Summary

| Metric           | Before | After | Change |
| ---------------- | ------ | ----- | ------ |
| Total Invariants | 61     | 61    | -      |
| Passed           | 46     | 56    | +10    |
| Critical Failed  | 12     | 5     | -7     |
| Warning Failed   | 3      | 3     | -      |

---

## Fixed Violations

### ORG-07: Circle status is valid enum value

- **Count:** 25 circles
- **Root cause:** Status field was `null`/`undefined` instead of `'draft'` or `'active'` (legacy data before schema enforcement)
- **Fix:** Migration set all invalid statuses to `'active'`
- **Prevention:** Schema now enforces `v.union(v.literal('draft'), v.literal('active'))`

### ROLE-04: Role status is valid enum value

- **Count:** 91 roles
- **Root cause:** Same as ORG-07 - status field was `null`/`undefined`
- **Fix:** Migration set all invalid statuses to `'active'`
- **Prevention:** Schema enforcement

### CMEM-01: Every circleMember.circleId points to existing circle

- **Count:** 1
- **Root cause:** Circle was deleted but membership record remained (orphaned data)
- **Fix:** Deleted orphaned circleMember record
- **Prevention:** Cascade deletes should clean up related records

### CMEM-02: Every circleMember.personId points to existing person

- **Count:** 4
- **Root cause:** People were deleted but membership records remained
- **Fix:** Deleted orphaned circleMember records
- **Prevention:** Cascade deletes should clean up related records

### UCROLE-01: Every userCircleRole.personId points to existing person

- **Count:** 3 → 0
- **Root cause:** Legacy assignments with missing or null personId
- **Fix:** Deleted orphaned userCircleRole records
- **Prevention:** userCircleRoles table is being migrated to assignments table

### UCROLE-02: Every userCircleRole.circleRoleId points to existing role

- **Count:** 2 → 0
- **Root cause:** Roles were deleted but legacy assignment records remained
- **Fix:** Deleted orphaned userCircleRole records
- **Prevention:** userCircleRoles table is being migrated to assignments table

### PROP-05: Proposal state transitions follow state machine

- **Count:** 11 proposals
- **Root cause:** Non-draft proposals missing `submittedAt` timestamp (created before timestamp enforcement)
- **Fix:** Backfilled `submittedAt` from `_creationTime`
- **Prevention:** Proposal state machine now enforces timestamp on submission

### XDOM-01: No userId references in core domain tables

- **Count:** 261 → 0
- **Root cause:** circleItemCategories, circleItems, and meetings still using legacy `createdBy` (userId) instead of `createdByPersonId`
- **Fix:** Migrated all records to use `createdByPersonId` and cleared legacy fields
- **Prevention:** Schema and code now require `createdByPersonId`

### XDOM-05: circleItems domain migrated to use personId

- **Count:** 31 → 0
- **Root cause:** Same as XDOM-01 - circleItems using userId-based audit fields
- **Fix:** Migrated to personId-based audit fields
- **Prevention:** Schema enforcement

### HIST-01: All history records use changedByPersonId (partial)

- **Count:** 434 → 215
- **Root cause:** History records created before personId migration, or belonging to workspaces with no active people
- **Fix:** Migrated 219 records by attributing to workspace owner
- **Remaining:** 215 records in abandoned workspaces (no active person to attribute to)
- **Prevention:** New history records require `changedByPersonId`

---

## Known Exceptions (Abandoned Workspaces)

The following violations are caused by **14-15 abandoned workspaces** with no active people. These are test/dev workspaces that were created but never properly used or had all users depart.

### ORG-01: Every workspace has exactly one root circle

- **Count:** 14 workspaces
- **Root cause:** Abandoned workspaces had their root circles archived, leaving no active root
- **Status:** Documented exception - abandoned workspaces cannot have active root circles without active people
- **Recommendation:** Add `archivedAt` field to workspaces table to mark abandoned workspaces

### AUTH-01: Every active circle has at least one Circle Lead assignment

- **Count:** 18 circles (includes circles in non-abandoned workspaces)
- **Root cause:** Active circles without anyone assigned as Circle Lead
- **Status:** Requires manual review - some may be legitimate active circles needing Lead assignments
- **Recommendation:** Create ticket to audit and assign Circle Leads to these circles

### AUTH-02: Root circle Circle Lead exists for every workspace

- **Count:** 18 workspaces
- **Root cause:** Includes abandoned workspaces (14) plus workspaces with active root circles but no Lead assignment (4)
- **Status:** Documented exception for abandoned workspaces
- **Recommendation:** Audit the 4 non-abandoned workspaces to ensure they have Circle Lead assignments

### HIST-01: All history records use changedByPersonId (remaining)

- **Count:** 215 records
- **Root cause:** History records in workspaces with no active people
- **Status:** Cannot fix without a person to attribute changes to
- **Recommendation:** Accept as legacy data or backfill with a "system" person record

### WS-02: Every workspace has at least one owner

- **Count:** 15 workspaces
- **Root cause:** Abandoned workspaces where all members have left
- **Status:** Documented exception - cannot add owner without an active user to assign
- **Recommendation:** Mark these workspaces as archived at the workspace level

---

## Recommendations

### Short-term

1. **Archive abandoned workspaces**: Add `archivedAt` field to workspaces table and mark abandoned workspaces
2. **Update invariants**: Exclude archived workspaces from ORG-01, AUTH-01, AUTH-02, WS-02 checks
3. **Audit active workspaces**: Review the 4 non-abandoned workspaces missing Circle Leads

### Long-term

1. **Implement workspace lifecycle**: Create proper workspace archival flow
2. **Add invariant exceptions**: Allow documented exceptions for legacy data
3. **Create "System" person**: For attributing automated/legacy changes in history

---

## Migration Scripts Used

All fixes applied via `/convex/admin/fixInvariantViolations.ts`:

| Function                                 | Purpose                                       |
| ---------------------------------------- | --------------------------------------------- |
| `fixStatusEnums`                         | Fix ORG-07, ROLE-04                           |
| `fixOrphanedCircleMembers`               | Fix CMEM-01, CMEM-02                          |
| `fixOrphanedLegacyAssignments`           | Fix UCROLE-01, UCROLE-02                      |
| `fixProposalTimestamps`                  | Fix PROP-05                                   |
| `fixHistoryPersonIds`                    | Fix HIST-01 (partial)                         |
| `fixCircleItemCategoryUserIds`           | Fix XDOM-01 (categories)                      |
| `fixCircleItemUserIds`                   | Fix XDOM-05                                   |
| `fixMeetingUserIds`                      | Fix XDOM-01 (meetings)                        |
| `archiveAbandonedWorkspaces`             | Archive circles/roles in abandoned workspaces |
| `fixOrphanedLegacyAssignmentsNullPerson` | Fix remaining UCROLE-01                       |

Run with: `npx convex run admin/fixInvariantViolations:fixAll`

---

## Document History

| Date       | Change                                      |
| ---------- | ------------------------------------------- |
| 2025-12-11 | Initial violations run and fixes (SYOS-806) |
