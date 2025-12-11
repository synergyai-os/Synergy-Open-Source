# Core Invariants

Explicit, testable statements about what must be true for CORE to be sound.

> **Context**: These invariants define the minimum viable organizational truth.
> Violations of critical invariants block launch; warnings should be fixed before production.

---

## How to Read This

| Field     | Meaning                                             |
| --------- | --------------------------------------------------- |
| ID        | Unique identifier (e.g., IDENT-01)                  |
| Invariant | What must be true                                   |
| Why       | What breaks if violated                             |
| Check     | How to verify                                       |
| Severity  | `critical` (blocks launch) / `warning` (should fix) |

---

## Quick Reference by Domain

| Domain                   | Invariant IDs          | Count  |
| ------------------------ | ---------------------- | ------ |
| Identity Chain           | IDENT-01 to IDENT-09   | 9      |
| Organizational Structure | ORG-01 to ORG-09       | 9      |
| Circle Membership        | CMEM-01 to CMEM-04     | 4      |
| Role Definitions         | ROLE-01 to ROLE-05     | 5      |
| Assignments              | ASSIGN-01 to ASSIGN-06 | 6      |
| Legacy Assignments       | UCROLE-01 to UCROLE-04 | 4      |
| Authority                | AUTH-01 to AUTH-04     | 4      |
| Proposals                | PROP-01 to PROP-06     | 6      |
| History                  | HIST-01 to HIST-04     | 4      |
| Workspaces               | WS-01 to WS-05         | 5      |
| Cross-Domain             | XDOM-01 to XDOM-05     | 5      |
| **Total**                |                        | **61** |

---

## Identity Chain Invariants (IDENT-\*)

The identity chain (`sessionId → userId → personId → workspaceId`) is foundational.
Changing how identity works breaks every other domain.

| ID       | Invariant                                                   | Why                              | Check                                                       | Severity |
| -------- | ----------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------- | -------- |
| IDENT-01 | Active people (`status=active`) must have `userId` set      | Can't link to auth identity      | `people.status='active' AND userId IS NULL` → 0 rows        | critical |
| IDENT-02 | Invited people (`status=invited`) must have `email` set     | Can't identify for signup        | `people.status='invited' AND email IS NULL` → 0 rows        | critical |
| IDENT-03 | Active people should NOT have `email` set (use users.email) | Denormalization, stale data risk | `people.status='active' AND email IS NOT NULL` → 0 rows     | warning  |
| IDENT-04 | Every `person.workspaceId` points to existing workspace     | Orphaned person, security risk   | All `people.workspaceId` resolve via `db.get()`             | critical |
| IDENT-05 | Every `person.userId` (when set) points to existing user    | Broken identity chain            | All `people.userId` resolve via `db.get()`                  | critical |
| IDENT-06 | No duplicate `(workspaceId, userId)` pairs in active people | Identity confusion               | `by_workspace_user` index returns max 1 active per pair     | critical |
| IDENT-07 | No duplicate `(workspaceId, email)` pairs in invited people | Invite confusion                 | `by_workspace_email` index returns max 1 invited per pair   | critical |
| IDENT-08 | Previously-active archived people preserve `userId`         | History integrity                | Archived people with activity evidence must retain `userId` | warning  |
| IDENT-09 | Every `user.email` is unique                                | Auth identity uniqueness         | `users.by_email` index is unique                            | critical |

> **IDENT-06 & IDENT-08 Interaction (Rejoin Scenario)**:
> When a user leaves and rejoins a workspace, the old person is archived (keeps `userId` for audit trail),
> and a new active person is created. IDENT-06 only checks active people, so no conflict occurs.
> IDENT-08 ensures the archived person's `userId` is preserved for history.
>
> **IDENT-08 Exception**: Invited people archived before accepting (invited→archived) legitimately
> have no `userId`. The check only flags archived people with assignment/activity history.

---

## Organizational Structure Invariants (ORG-\*)

These define organizational structure — the nouns of the system.

| ID     | Invariant                                                                              | Why                           | Check                                                                                 | Severity |
| ------ | -------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- | -------- |
| ORG-01 | Every workspace has exactly one root circle (`parentCircleId=null`, `archivedAt=null`) | No org structure possible     | Count circles per workspace where `parentCircleId IS NULL AND archivedAt IS NULL` = 1 | critical |
| ORG-02 | Every non-root circle has valid `parentCircleId`                                       | Orphaned circle               | All `circles.parentCircleId` resolve via `db.get()`                                   | critical |
| ORG-03 | No circular references in `circle.parentCircleId` chain                                | Infinite loop, crash          | Traverse parents; never revisit same `_id`                                            | critical |
| ORG-04 | Every `circle.workspaceId` points to existing workspace                                | Orphaned circle               | All `circles.workspaceId` resolve via `db.get()`                                      | critical |
| ORG-05 | Circle's parent belongs to same workspace                                              | Cross-workspace leak          | `circles.workspaceId === parent.workspaceId`                                          | critical |
| ORG-06 | Circle `circleType` is valid enum value when set                                       | Invalid authority calculation | Value in `['hierarchy', 'empowered_team', 'guild', 'hybrid']` or null                 | critical |
| ORG-07 | Circle `status` is `draft` or `active` only                                            | Invalid lifecycle state       | Value in `['draft', 'active']`; no `deleted` status                                   | critical |
| ORG-08 | Circle `slug` is unique within workspace                                               | Broken URL routing            | `by_slug` index unique per workspace                                                  | critical |
| ORG-09 | Circles with `archivedByPersonId` must have `archivedAt`                               | Incomplete soft delete        | `archivedByPersonId` set → `archivedAt` must also be set                              | warning  |

> **Circle Deletion Model**: Circles use soft delete via `archivedAt` timestamp, not a status change.
> When a circle is "deleted", `archivedAt` is set and `archivedByPersonId` records who deleted it.
> The `status` field (`draft`/`active`) represents lifecycle state, not deletion state.

---

## Circle Membership Invariants (CMEM-\*)

Circle members track explicit membership (separate from role assignments).

| ID      | Invariant                                                       | Why                  | Check                                                           | Severity |
| ------- | --------------------------------------------------------------- | -------------------- | --------------------------------------------------------------- | -------- |
| CMEM-01 | Every `circleMember.circleId` points to existing circle         | Orphaned membership  | All `circleMembers.circleId` resolve via `db.get()`             | critical |
| CMEM-02 | Every `circleMember.personId` points to existing person         | Orphaned membership  | All `circleMembers.personId` resolve via `db.get()`             | critical |
| CMEM-03 | Circle member's person belongs to same workspace as circle      | Cross-workspace leak | `person.workspaceId === circle.workspaceId`                     | critical |
| CMEM-04 | No duplicate `(circleId, personId)` pairs in active memberships | Double membership    | Count per `(circleId, personId)` where `archivedAt IS NULL` ≤ 1 | warning  |

---

## Role Definition Invariants (ROLE-\*)

Roles define positions that can be filled by assignments.

| ID      | Invariant                                                             | Why                         | Check                                                | Severity |
| ------- | --------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------- | -------- |
| ROLE-01 | Every `circleRoles.circleId` points to existing circle                | Orphaned role               | All `circleRoles.circleId` resolve via `db.get()`    | critical |
| ROLE-02 | Every `circleRoles.workspaceId` matches `circle.workspaceId`          | Cross-workspace leak        | `circleRoles.workspaceId === circle.workspaceId`     | critical |
| ROLE-03 | Every `circleRoles.templateId` (when set) points to existing template | Broken template reference   | All `circleRoles.templateId` resolve via `db.get()`  | warning  |
| ROLE-04 | Role `status` is valid enum value                                     | Invalid lifecycle state     | Value in `['draft', 'active']`                       | critical |
| ROLE-05 | Core role templates (`isCore=true`) exist for every workspace         | Bootstrap authority missing | Each workspace has Circle Lead template instantiated | critical |

---

## Assignment Invariants (ASSIGN-\*)

Assignments connect people to roles in circles.

| ID        | Invariant                                                     | Why                     | Check                                                 | Severity |
| --------- | ------------------------------------------------------------- | ----------------------- | ----------------------------------------------------- | -------- |
| ASSIGN-01 | Every `assignment.personId` points to existing person         | Orphaned assignment     | All `assignments.personId` resolve via `db.get()`     | critical |
| ASSIGN-02 | Every `assignment.roleId` points to existing role             | Orphaned assignment     | All `assignments.roleId` resolve via `db.get()`       | critical |
| ASSIGN-03 | Every `assignment.circleId` points to existing circle         | Orphaned assignment     | All `assignments.circleId` resolve via `db.get()`     | critical |
| ASSIGN-04 | Assignment person belongs to same workspace as role's circle  | Cross-workspace leak    | `person.workspaceId === circle.workspaceId`           | critical |
| ASSIGN-05 | No duplicate `(personId, roleId)` pairs in active assignments | Double assignment       | Count active assignments per `(personId, roleId)` ≤ 1 | warning  |
| ASSIGN-06 | Assignment `status` is valid enum value                       | Invalid lifecycle state | Value in `['active', 'ended']`                        | critical |

---

## Legacy Assignment Invariants (UCROLE-\*)

`userCircleRoles` is the legacy assignment table (pre-assignments table).
These invariants apply during migration period.

| ID        | Invariant                                                           | Why                  | Check                                                     | Severity |
| --------- | ------------------------------------------------------------------- | -------------------- | --------------------------------------------------------- | -------- |
| UCROLE-01 | Every `userCircleRole.personId` points to existing person           | Orphaned assignment  | All `userCircleRoles.personId` resolve via `db.get()`     | critical |
| UCROLE-02 | Every `userCircleRole.circleRoleId` points to existing role         | Orphaned assignment  | All `userCircleRoles.circleRoleId` resolve via `db.get()` | critical |
| UCROLE-03 | Assignment person belongs to same workspace as role's circle        | Cross-workspace leak | `person.workspaceId === circleRole.circle.workspaceId`    | critical |
| UCROLE-04 | No duplicate `(personId, circleRoleId)` pairs in active assignments | Double assignment    | Count where `archivedAt IS NULL` per pair ≤ 1             | warning  |

> **Note**: `userCircleRoles` is being migrated to `assignments` table.
> Once migration is complete, UCROLE-\* invariants can be retired.

---

## Authority Invariants (AUTH-\*)

Authority is calculated, not stored. These invariants ensure authority can be calculated.

| ID      | Invariant                                                   | Why                         | Check                                                                     | Severity |
| ------- | ----------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------- | -------- |
| AUTH-01 | Every active circle has at least one Circle Lead assignment | No one can make decisions   | Each circle has at least one active assignment with lead role             | critical |
| AUTH-02 | Root circle Circle Lead exists for every workspace          | Bootstrap authority missing | Workspace root circle has Circle Lead assignment                          | critical |
| AUTH-03 | Circle Lead role exists in every circle (even if unfilled)  | Can't assign leadership     | Each circle has a role with `templateId` pointing to Circle Lead template | warning  |
| AUTH-04 | Authority calculation returns valid Authority object        | Broken permission system    | `calculateAuthority()` never throws, returns all boolean flags            | critical |

---

## Proposal Invariants (PROP-\*)

Proposals are the mechanism for deliberate change.

| ID      | Invariant                                                      | Why                             | Check                                                                                                            | Severity |
| ------- | -------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| PROP-01 | Every `proposal.workspaceId` points to existing workspace      | Orphaned proposal               | All `circleProposals.workspaceId` resolve via `db.get()`                                                         | critical |
| PROP-02 | Every `proposal.circleId` (when set) points to existing circle | Orphaned proposal               | All `circleProposals.circleId` resolve via `db.get()`                                                            | critical |
| PROP-03 | Every `proposal.createdByPersonId` points to existing person   | Orphaned proposal, broken audit | All `circleProposals.createdByPersonId` resolve via `db.get()`                                                   | critical |
| PROP-04 | Proposal `status` is valid enum value                          | Invalid state machine           | Value in `['draft', 'submitted', 'in_meeting', 'objections', 'integrated', 'approved', 'rejected', 'withdrawn']` | critical |
| PROP-05 | Proposal state transitions follow state machine                | Invalid workflow                | State changes only via allowed transitions                                                                       | critical |
| PROP-06 | Approved proposals have `processedAt` timestamp                | Incomplete approval record      | `status='approved' → processedAt IS NOT NULL`                                                                    | warning  |

---

## History Invariants (HIST-\*)

History is immutable by definition.

| ID      | Invariant                                                             | Why                  | Check                                                      | Severity |
| ------- | --------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------- | -------- |
| HIST-01 | All history records use `changedByPersonId` (not userId)              | Wrong identity model | `orgVersionHistory.changedByPersonId` is always set        | critical |
| HIST-02 | All `history.changedByPersonId` points to existing or archived person | Orphaned history     | All `changedByPersonId` resolve via `db.get()`             | warning  |
| HIST-03 | History records are immutable (no updates after creation)             | Audit integrity      | No mutation touches existing history records               | critical |
| HIST-04 | Every `history.workspaceId` points to existing workspace              | Orphaned history     | All `orgVersionHistory.workspaceId` resolve via `db.get()` | warning  |

---

## Workspace Invariants (WS-\*)

Workspaces are the multi-tenant boundary.

| ID    | Invariant                                                        | Why                     | Check                                                                      | Severity |
| ----- | ---------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------- | -------- |
| WS-01 | Every workspace has at least one active person                   | Dead workspace          | Count `people.status='active'` per workspace ≥ 1                           | warning  |
| WS-02 | Every workspace has at least one owner (`workspaceRole='owner'`) | No admin access         | Count `people.workspaceRole='owner' AND status='active'` per workspace ≥ 1 | critical |
| WS-03 | Workspace `slug` is unique                                       | Broken URL routing      | `workspaces.by_slug` index is unique                                       | critical |
| WS-04 | Workspace aliases point to existing workspace                    | Broken alias resolution | All `workspaceAliases.workspaceId` resolve via `db.get()`                  | critical |
| WS-05 | No workspace slug conflicts with workspace aliases               | URL routing confusion   | `workspaces.slug` not in `workspaceAliases.slug`                           | critical |

---

## Cross-Domain Invariants (XDOM-\*)

Rules that span multiple domains.

| ID      | Invariant                                                                             | Why                          | Check                                                        | Severity |
| ------- | ------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ | -------- |
| XDOM-01 | No `userId` references in core domain tables (except users, people, workspaceMembers) | Wrong identity model         | Audit all `ByUserId` fields in core → should be `ByPersonId` | critical |
| XDOM-02 | All `createdBy`/`updatedBy` audit fields use `personId`                               | Inconsistent audit           | All `*By` fields reference `people` table                    | warning  |
| XDOM-03 | All foreign keys point to same workspace (no cross-workspace leaks)                   | Security breach              | Transitive workspace equality check                          | critical |
| XDOM-04 | Archived entities are never hard-deleted                                              | Data loss, broken references | No `DELETE` operations on core tables                        | critical |
| XDOM-05 | `circleItems` domain migrated to use `personId` (SYOS-790)                            | Wrong identity model         | `circleItems.createdBy` → `createdByPersonId`                | warning  |

### Known Exceptions

The following use `userId` by design (infrastructure layer):

- **RBAC tables** (`userRoles`, `resourceGuests`, `permissionAuditLog`): These are infrastructure, not core domain. They track system-level permissions that may span workspaces.
- **`workspaceMembers`**: Legacy table tracking workspace membership. Being superseded by `people` table.
- **`workspaces.branding.updatedBy`**: Uses `userId` for branding changes (infrastructure-level).

---

## Implementation Notes

### Archived Workspace Exclusion

Several invariants exclude **archived workspaces** (workspaces with `archivedAt` set) from checks:

- **ORG-01**: Root circle check
- **AUTH-01**: Circle Lead assignment check
- **AUTH-02**: Root circle Lead check
- **WS-01**: Active person check
- **WS-02**: Owner check
- **HIST-01**: History `changedByPersonId` check

This prevents false positives from intentionally archived workspaces. See SYOS-811 for workspace archival implementation.

### Validation Approach

Each invariant can be checked by:

1. **Database Query**: Run a query that returns violations
2. **Count Check**: Expect zero violations
3. **Report Format**: Return `{ invariantId, violationCount, samples }`

### Severity Guidelines

- **Critical**: System cannot function correctly. Blocks production use.
- **Warning**: System works but has data quality issues. Should fix before production.

### Future Work

1. **SYOS-804**: Implement invariant checker (runs all checks) ✓
2. **SYOS-805**: Pre-commit hook for invariant validation
3. **SYOS-806**: CI integration for invariant checks ✓
4. **SYOS-811**: Workspace archival implementation

---

## Document History

| Version | Date       | Change                                                     |
| ------- | ---------- | ---------------------------------------------------------- |
| 1.0     | 2025-12-11 | Initial creation per SYOS-803                              |
| 1.1     | 2025-12-11 | IDENT-08 refined for invited→archived edge case (SYOS-806) |
| 1.2     | 2025-12-11 | Add archived workspace exclusion notes (SYOS-811)          |
| 1.3     | 2025-12-11 | Clarify ORG-07/ORG-09 soft delete model                    |

---

_This document defines invariants. For implementation, see `/convex/admin/invariants/` scripts._
