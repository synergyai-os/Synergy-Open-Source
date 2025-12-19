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
| Identity Chain           | IDENT-01 to IDENT-13   | 13     |
| Organizational Structure | ORG-01 to ORG-10       | 10     |
| Circle Membership        | CMEM-01 to CMEM-04     | 4      |
| Role Definitions         | ROLE-01 to ROLE-06     | 6      |
| Assignments              | ASSIGN-01 to ASSIGN-06 | 6      |
| Authority                | AUTH-01 to AUTH-04     | 4      |
| Governance               | GOV-01 to GOV-08       | 8      |
| Proposals                | PROP-01 to PROP-06     | 6      |
| History                  | HIST-01 to HIST-04     | 4      |
| Workspaces               | WS-01 to WS-05         | 5      |
| Guest Access             | GUEST-01 to GUEST-05   | 5      |
| RBAC                     | RBAC-01 to RBAC-06     | 6      |
| Cross-Domain             | XDOM-01 to XDOM-05     | 5      |
| **Total**                |                        | **82** |

### Legacy Invariants (Retire After Migration)

| Domain             | Invariant IDs          | Count |
| ------------------ | ---------------------- | ----- |
| Legacy Assignments | UCROLE-01 to UCROLE-04 | 4     |

> **Note:** UCROLE-\* invariants will be retired after `userCircleRoles` → `assignments` migration completes (SYOS-815).

---

## Identity Chain Invariants (IDENT-\*)

The identity chain (`sessionId → userId → personId → workspaceId`) is foundational.
Changing how identity works breaks every other domain.

| ID       | Invariant                                                                               | Why                                   | Check                                                                                | Severity |
| -------- | --------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ | -------- |
| IDENT-01 | Active people (`status=active`) must have `userId` set                                  | Can't link to auth identity           | `people.status='active' AND userId IS NULL` → 0 rows                                 | critical |
| IDENT-02 | Invited people (`status=invited`) must have `email` set                                 | Can't identify for signup             | `people.status='invited' AND email IS NULL` → 0 rows                                 | critical |
| IDENT-03 | Active people should NOT have `email` set (use users.email)                             | Denormalization, stale data risk      | `people.status='active' AND email IS NOT NULL` → 0 rows                              | warning  |
| IDENT-04 | Every `person.workspaceId` points to existing workspace                                 | Orphaned person, security risk        | All `people.workspaceId` resolve via `db.get()`                                      | critical |
| IDENT-05 | Every `person.userId` (when set) points to existing user                                | Broken identity chain                 | All `people.userId` resolve via `db.get()`                                           | critical |
| IDENT-06 | No duplicate `(workspaceId, userId)` pairs in active people                             | Identity confusion                    | `by_workspace_user` index returns max 1 active per pair                              | critical |
| IDENT-07 | No duplicate `(workspaceId, email)` pairs in invited people                             | Invite confusion                      | `by_workspace_email` index returns max 1 invited per pair                            | critical |
| IDENT-08 | Previously-active archived people preserve `userId`                                     | History integrity                     | Archived people with activity evidence must retain `userId`                          | warning  |
| IDENT-09 | Every `user.email` is unique                                                            | Auth identity uniqueness              | `users.by_email` index is unique                                                     | critical |
| IDENT-10 | Guest people (`isGuest=true`) should have `guestExpiry` set                             | Guests need defined access period     | `people.isGuest=true AND guestExpiry IS NULL` → 0 rows                               | warning  |
| IDENT-11 | Expired guests (`guestExpiry < now`) should be deactivated                              | Stale access risk                     | Periodic check for expired guests still active                                       | warning  |
| IDENT-12 | Placeholder people (`status='placeholder'`) have `displayName`, no `email`, no `userId` | Ensures placeholder state consistency | `people.status='placeholder' AND (email IS NOT NULL OR userId IS NOT NULL)` → 0 rows | critical |
| IDENT-13 | Placeholder people do not have `invitedAt` set                                          | Semantic clarity (use `createdAt`)    | `people.status='placeholder' AND invitedAt IS NOT NULL` → 0 rows                     | warning  |

> **IDENT-06 & IDENT-08 Interaction (Rejoin Scenario)**:
> When a user leaves and rejoins a workspace, the old person is archived (keeps `userId` for audit trail),
> and a new active person is created. IDENT-06 only checks active people, so no conflict occurs.
> IDENT-08 ensures the archived person's `userId` is preserved for history.
>
> **IDENT-08 Exception**: Invited people archived before accepting (invited→archived) legitimately
> have no `userId`. The check only flags archived people with assignment/activity history.
>
> **IDENT-10 & IDENT-11 (Guest Access)**:
> Guests are people with `isGuest=true`. They have limited, time-bound access to specific resources.
> See GUEST-\* invariants for resource-level access rules.
>
> **IDENT-12 & IDENT-13 (Placeholder People)**:
> Placeholders are planning entities representing known future participants (new hires, consultants, board members).
> They have `displayName` only — no `email` (not yet invited) and no `userId` (can't log in).
> Use `createdAt` for creation timestamp; `invitedAt` is set only when transitioning to `invited` status.
> Placeholders can be assigned to roles and appear in org charts, but cannot take actions.

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
| ORG-10 | Root circle type must not be `'guild'` (only checked at activation)                    | Guilds are advisory only      | Workspace root circle `circleType` ≠ `'guild'` when `phase='active'`                  | critical |

> **Circle Deletion Model**: Circles use soft delete via `archivedAt` timestamp, not a status change.
> When a circle is "deleted", `archivedAt` is set and `archivedByPersonId` records who deleted it.
> The `status` field (`draft`/`active`) represents lifecycle state, not deletion state.
>
> **ORG-10 (Workspace Activation)**: During design phase, any circle structure is allowed (including guild as root).
> ORG-10 is only enforced when activating a workspace (`design` → `active` transition).
> Guilds are cross-cutting advisory communities and cannot serve as the organizational root.

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

| ID      | Invariant                                                             | Why                         | Check                                                    | Severity |
| ------- | --------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------- | -------- |
| ROLE-01 | Every `circleRoles.circleId` points to existing circle                | Orphaned role               | All `circleRoles.circleId` resolve via `db.get()`        | critical |
| ROLE-02 | Every `circleRoles.workspaceId` matches `circle.workspaceId`          | Cross-workspace leak        | `circleRoles.workspaceId === circle.workspaceId`         | critical |
| ROLE-03 | Every `circleRoles.templateId` (when set) points to existing template | Broken template reference   | All `circleRoles.templateId` resolve via `db.get()`      | warning  |
| ROLE-04 | Role `status` is `draft` or `active` only                             | Invalid lifecycle state     | Value in `['draft', 'active']`; no `deleted` status      | critical |
| ROLE-05 | Core role templates (`isCore=true`) exist for every workspace         | Bootstrap authority missing | Each workspace has Circle Lead template instantiated     | critical |
| ROLE-06 | Roles with `archivedByPersonId` must have `archivedAt`                | Incomplete soft delete      | `archivedByPersonId` set → `archivedAt` must also be set | warning  |

> **Role Deletion Model**: Roles use soft delete via `archivedAt` timestamp, not a status change.
> When a role is "deleted", `archivedAt` is set and `archivedByPersonId` records who deleted it.
> The `status` field (`draft`/`active`) represents lifecycle state, not deletion state.

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

## Authority Invariants (AUTH-\*)

Authority is calculated, not stored. These invariants ensure authority can be calculated.

| ID      | Invariant                                                   | Why                         | Check                                                                     | Severity |
| ------- | ----------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------- | -------- |
| AUTH-01 | Every active circle has at least one Circle Lead assignment | No one can make decisions   | Each circle has at least one active assignment with lead role             | critical |
| AUTH-02 | Root circle Circle Lead exists for every workspace          | Bootstrap authority missing | Workspace root circle has Circle Lead assignment                          | critical |
| AUTH-03 | Circle Lead role exists in every circle (even if unfilled)  | Can't assign leadership     | Each circle has a role with `templateId` pointing to Circle Lead template | warning  |
| AUTH-04 | Authority calculation returns valid Authority object        | Broken permission system    | `calculateAuthority()` never throws, returns all boolean flags            | critical |

---

## Governance Invariants (GOV-\*)

Governance foundation invariants from governance-design.md. These enforce role clarity and decision rights.

| ID     | Invariant                                                                          | Why                         | Check                                                                           | Severity |
| ------ | ---------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------- | -------- |
| GOV-01 | Every circle has exactly one role with `roleType: 'circle_lead'`                   | No authority structure      | Query `by_circle_roleType`, count per circle where `roleType='circle_lead'` = 1 | critical |
| GOV-02 | Every role has a `purpose` (non-empty string)                                      | No role clarity             | All roles have customFieldValue with systemKey='purpose' and non-empty value    | critical |
| GOV-03 | Every role has at least one `decisionRight`                                        | No explicit authority       | All roles have at least one customFieldValue with systemKey='decision_right'    | critical |
| GOV-04 | Circle lead role cannot be deleted while circle exists                             | Lost authority chain        | Mutation validation prevents lead role deletion (enforced in code, not query)   | critical |
| GOV-05 | Role assignments are traceable (who assigned, when)                                | Audit trail gaps            | All `assignments` have `createdAt`, `createdByPersonId`                         | warning  |
| GOV-06 | Governance changes create history records (when phase = 'active')                  | Lost change history         | `orgVersionHistory` entries exist for governance changes in active workspaces   | warning  |
| GOV-07 | Person can fill 0-N roles; role can have 0-N people (many-to-many via assignments) | Invalid assignment model    | Schema supports many-to-many (verified by structure, not query)                 | critical |
| GOV-08 | Circle type is explicit, never null for active circles                             | Authority calculation fails | Active circles (`status='active'`) have `circleType` set (not null)             | critical |

> **GOV-01 Auto-Creation**: Enforced via auto-creation on circle creation. See `convex/core/circles/autoCreateRoles.ts`.
>
> **GOV-02 & GOV-03 Validation**:
>
> - Enforced at mutation time via `convex/infrastructure/customFields/helpers.ts` (role creation)
> - Enforced at data level via `convex/admin/invariants/governance.ts` (SYOS-962)
>
> **GOV-04 Protection**: Lead role deletion blocked in `convex/core/roles/roleArchival.ts`.
>
> **GOV-06 Phase-Dependent**: History tracking only required when `workspace.phase='active'`.
> Design phase changes are not tracked (allows free experimentation).

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

## Guest Access Invariants (GUEST-\*)

Guests are external users with limited, time-bound access to specific resources.
Per architecture.md, guests are `people` records with `isGuest: true`.

| ID       | Invariant                                                          | Why                          | Check                                                         | Severity |
| -------- | ------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------- | -------- |
| GUEST-01 | Every `resourceGuests.personId` points to existing person          | Orphaned access grant        | All `resourceGuests.personId` resolve via `db.get()`          | critical |
| GUEST-02 | Every `resourceGuests.grantedByPersonId` points to existing person | Broken audit trail           | All `resourceGuests.grantedByPersonId` resolve via `db.get()` | critical |
| GUEST-03 | `resourceGuests.personId` must reference a guest (`isGuest=true`)  | Non-guests use normal access | All `resourceGuests.personId` → `person.isGuest === true`     | warning  |
| GUEST-04 | `resourceGuests` person belongs to same workspace as granter       | Cross-workspace leak         | `person.workspaceId === granter.workspaceId`                  | critical |
| GUEST-05 | Expired resource access (`expiresAt < now`) should be cleaned up   | Stale access data            | Periodic check for expired `resourceGuests` records           | warning  |

> **Guest Access Model** (per architecture.md v3.6):
>
> - Guests ARE people — they can energize roles, participate in circles
> - `resourceGuests` table grants view access to specific resources without role assignment
> - Presence = access: if record exists and not expired, guest can view
> - `resourceGuests` uses `personId` (workspace-scoped), NOT `userId`

### `resourceGuests` Table Schema

```typescript
resourceGuests: {
  personId: Id<'people'>,           // The guest (must have isGuest: true)
  resourceType: string,              // 'circles' | 'proposals' | 'documents'
  resourceId: string,                // Specific resource ID
  grantedByPersonId: Id<'people'>,  // Who granted access
  grantedAt: number,                 // When granted
  expiresAt?: number,                // Optional expiry
}
```

---

## RBAC Invariants (RBAC-\*)

RBAC (Role-Based Access Control) operates at two scopes per architecture.md v3.6:

- **System scope**: `systemRoles` table, uses `userId` (platform-wide access)
- **Workspace scope**: `workspaceRoles` table, uses `personId` (org-specific access)

| ID      | Invariant                                                                     | Why                     | Check                                                                     | Severity |
| ------- | ----------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------- | -------- |
| RBAC-01 | Every `systemRoles.userId` points to existing user                            | Orphaned system role    | All `systemRoles.userId` resolve via `db.get()`                           | critical |
| RBAC-02 | Every `workspaceRoles.personId` points to existing person                     | Orphaned workspace role | All `workspaceRoles.personId` resolve via `db.get()`                      | critical |
| RBAC-03 | Every `workspaceRoles.grantedByPersonId` (when set) points to existing person | Broken audit trail      | All `workspaceRoles.grantedByPersonId` resolve via `db.get()`             | warning  |
| RBAC-04 | `workspaceRoles.sourceCircleRoleId` (when set) points to existing assignment  | Broken cleanup tracking | All `workspaceRoles.sourceCircleRoleId` resolve via `db.get()`            | warning  |
| RBAC-05 | `systemRoles.role` is valid enum value                                        | Invalid role            | Value in `['platform_admin', 'platform_manager', 'developer', 'support']` | critical |
| RBAC-06 | `workspaceRoles.role` is valid enum value                                     | Invalid role            | Value in `['billing_admin', 'workspace_admin', 'member']`                 | critical |

> **RBAC Two-Scope Model** (per architecture.md v3.6):
>
> - System scope uses `userId` — platform operations independent of workspaces
> - Workspace scope uses `personId` — maintains workspace isolation
> - `sourceCircleRoleId` tracks auto-granted permissions for cleanup when role removed

### RBAC Table Schemas

```typescript
// System-level — uses userId (global identity)
systemRoles: {
  userId: v.id('users'),
  role: v.string(),  // 'platform_admin' | 'platform_manager' | 'developer' | 'support'
  grantedAt: v.number(),
  grantedBy: v.optional(v.id('users')),
}

// Workspace-level — uses personId (workspace-scoped identity)
workspaceRoles: {
  personId: v.id('people'),
  role: v.string(),  // 'billing_admin' | 'workspace_admin' | 'member'
  grantedAt: v.number(),
  grantedByPersonId: v.optional(v.id('people')),
  sourceCircleRoleId: v.optional(v.id('assignments')),  // For auto-assignment cleanup
}
```

---

## Cross-Domain Invariants (XDOM-\*)

Rules that span multiple domains.

| ID      | Invariant                                                           | Why                          | Check                                                        | Severity |
| ------- | ------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ | -------- |
| XDOM-01 | No `userId` references in core domain tables (except users, people) | Wrong identity model         | Audit all `ByUserId` fields in core → should be `ByPersonId` | critical |
| XDOM-02 | All `createdBy`/`updatedBy` audit fields use `personId`             | Inconsistent audit           | All `*By` fields reference `people` table                    | warning  |
| XDOM-03 | All foreign keys point to same workspace (no cross-workspace leaks) | Security breach              | Transitive workspace equality check                          | critical |
| XDOM-04 | Archived entities are never hard-deleted                            | Data loss, broken references | No `DELETE` operations on core tables                        | critical |
| XDOM-05 | `customFields` domain uses `personId` for audit fields              | Wrong identity model         | `customFieldValues.createdByPersonId` pattern                | warning  |

> **XDOM-05 Note**: `circleItems` was migrated to `features/customFields/` (SYOS-790).
> The invariant ensures the migrated domain follows the `personId` audit pattern.

---

## Known Exceptions

The following use `userId` by design (infrastructure layer, not core domain):

### Uses `userId` (Global Identity)

| Table/Field             | Reason                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| `systemRoles.userId`    | Platform-level access (admin console, developer tools) — global identity needed |
| `systemRoles.grantedBy` | System-level audit — may be granted by platform admin                           |
| `rbacAuditLog`          | May log cross-workspace actions                                                 |

### Uses `personId` (Workspace-Scoped Identity)

| Table/Field                        | Reason                                               |
| ---------------------------------- | ---------------------------------------------------- |
| `workspaceRoles.personId`          | Workspace-level RBAC — scoped identity               |
| `workspaceRoles.grantedByPersonId` | Workspace-level audit                                |
| `resourceGuests.personId`          | Guest access to specific resources — scoped identity |
| `resourceGuests.grantedByPersonId` | Workspace-level audit                                |

### Deprecated (To Be Removed)

| Table             | Replacement                      | Tracking           |
| ----------------- | -------------------------------- | ------------------ |
| `userRoles`       | `systemRoles` + `workspaceRoles` | SYOS-791           |
| `userCircleRoles` | `assignments`                    | SYOS-809, SYOS-815 |

> **Note:** `workspaceMembers` table has been removed (SYOS-814 complete).
> Workspace membership is now tracked via `people` table.

---

## Legacy Invariants (UCROLE-\*)

These invariants apply to the deprecated `userCircleRoles` table during migration.
**Retire after SYOS-815 completes.**

| ID        | Invariant                                                       | Why               | Check                                                 | Severity |
| --------- | --------------------------------------------------------------- | ----------------- | ----------------------------------------------------- | -------- |
| UCROLE-01 | Every `userCircleRoles.userId` points to existing user          | Orphaned role     | All `userCircleRoles.userId` resolve via `db.get()`   | critical |
| UCROLE-02 | Every `userCircleRoles.circleId` points to existing circle      | Orphaned role     | All `userCircleRoles.circleId` resolve via `db.get()` | critical |
| UCROLE-03 | Every `userCircleRoles.roleId` points to existing role          | Orphaned role     | All `userCircleRoles.roleId` resolve via `db.get()`   | critical |
| UCROLE-04 | No duplicate `(userId, circleId, roleId)` in active assignments | Double assignment | Count active per `(userId, circleId, roleId)` ≤ 1     | warning  |

---

## Policies Domain (Placeholder)

The `policies` domain is currently scaffolded but not implemented per architecture.md v3.6.

> **Status**: Placeholder files exist, no tables.ts, not implemented.
> **POLICY-\* invariants**: TBD when domain is implemented for governance customization.

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

Invariants are validated at two levels:

#### 1. Data-Level Validation (Runtime)

**What:** Checks existing data records in the database.  
**How:** Convex queries that scan tables and return violations.  
**Where:** `convex/admin/invariants/` - Runtime checks  
**Run:** `npx convex run admin/invariants:runAllChecks`

**Example:** "Are there any `people` records with `userId=null` and `status='active'`?"

#### 2. Schema-Level Validation (Static Analysis)

**What:** Checks table definitions in `*.tables.ts` files.  
**How:** ESLint rules that parse TypeScript AST.  
**Where:** `eslint-rules/no-userid-in-audit-fields.js` - Static checks  
**Run:** `npm run lint` (part of CI pipeline)

**Example:** "Does `projects` table define `createdBy: v.id('users')` instead of `createdByPersonId: v.id('people')`?"

**Why Both Are Needed:**

- **Data-level checks** catch violations in existing records
- **Schema-level checks** catch violations in table definitions before they create bad data
- Runtime checks can't access schema definitions → ESLint fills the gap

**Invariants with schema-level validation:**

- **XDOM-01**: ESLint rule `no-userid-in-audit-fields` (SYOS-842)
- **XDOM-02**: ESLint rule `no-userid-in-audit-fields` (SYOS-842)

### Severity Guidelines

- **Critical**: System cannot function correctly. Blocks production use.
- **Warning**: System works but has data quality issues. Should fix before production.

### Completed Work

1. **SYOS-804**: Implement invariant checker (runs all checks) ✓
2. **SYOS-806**: CI integration for invariant checks ✓
3. **SYOS-842**: Schema-level validation for XDOM-01/XDOM-02 (ESLint rule) ✓
4. **SYOS-814**: Remove `workspaceMembers` table ✓
5. **SYOS-790**: Migrate `circleItems` to `customFields` ✓

### Future Work

1. **SYOS-805**: Pre-commit hook for invariant validation
2. **SYOS-811**: Workspace archival implementation
3. **SYOS-815**: Complete `userCircleRoles` → `assignments` migration (retire UCROLE-\*)
4. **SYOS-791**: Delete deprecated `userRoles` table
5. **TBD**: Implement GUEST-_ and RBAC-_ runtime checks

---

## Document History

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 2025-12-11 | Initial creation per SYOS-803                                                                                                                                                                                                                                                                                                                                            |
| 1.1     | 2025-12-11 | IDENT-08 refined for invited→archived edge case (SYOS-806)                                                                                                                                                                                                                                                                                                               |
| 1.2     | 2025-12-11 | Add archived workspace exclusion notes (SYOS-811)                                                                                                                                                                                                                                                                                                                        |
| 1.3     | 2025-12-11 | Clarify ORG-07/ORG-09 soft delete model                                                                                                                                                                                                                                                                                                                                  |
| 1.4     | 2025-12-11 | Add ROLE-06, clarify role soft delete model                                                                                                                                                                                                                                                                                                                              |
| 1.5     | 2025-12-13 | Add schema vs data validation clarification (SYOS-842)                                                                                                                                                                                                                                                                                                                   |
| 2.0     | 2025-12-14 | Aligned with architecture.md v3.6. Added: IDENT-10/11 for guest identity, GUEST-01 to GUEST-05 for guest access, RBAC-01 to RBAC-06 for two-scope RBAC model. Updated: Known Exceptions to reflect `systemRoles`/`workspaceRoles` split, deprecated `userRoles`. Added: XDOM-05 for customFields, policies domain placeholder. Total invariants: 71 (+ 4 legacy UCROLE). |
| 2.1     | 2025-12-19 | Added IDENT-12/13 for placeholder people status. Placeholders are planning entities with `displayName` only (no email, no userId). Documents lifecycle: `placeholder` → `invited` → `active` → `archived`. Total invariants: 82 (+ 4 legacy UCROLE). SYOS-999.                                                                                                           |

---

_This document defines invariants. For implementation, see `/convex/admin/invariants/` scripts._
_For architectural context, see `architecture.md` (source of truth)._
