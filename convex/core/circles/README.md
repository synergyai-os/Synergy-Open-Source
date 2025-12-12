# Circles Domain

## Purpose

Organizational containers for work within a workspace, with parent/child hierarchy and decision model.

## Status

**FROZEN** - Circle structure, lifecycle, and hierarchy rules are locked to preserve workspace hierarchy invariants.

## Key Concepts

- One root circle per workspace; all other circles have a parent.
- `circleType` and `decisionModel` define governance style.
- `slug` is unique per workspace for routing.
- Soft delete via `archivedAt`/`archivedByPersonId`; `status` is lifecycle, not deletion.

## Identity Model

| Field            | Type                                                             | Usage                    |
| ---------------- | ---------------------------------------------------------------- | ------------------------ |
| `circleId`       | `Id<'circles'>`                                                  | Primary identifier       |
| `workspaceId`    | `Id<'workspaces'>`                                               | Scope boundary           |
| `parentCircleId` | `Id<'circles'> \| null`                                          | Hierarchy (null = root)  |
| `slug`           | `string`                                                         | Workspace-unique URL key |
| `circleType`     | `'hierarchy' \| 'empowered_team' \| 'guild' \| 'hybrid' \| null` | Operating mode           |
| `status`         | `'draft' \| 'active'`                                            | Lifecycle state          |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID      | Rule                                                   |
| ------- | ------------------------------------------------------ |
| ORG-01  | Each workspace has exactly one root circle             |
| ORG-02  | Non-root circles have valid `parentCircleId`           |
| ORG-03  | No circular parent chains                              |
| ORG-04  | `circle.workspaceId` points to existing workspace      |
| ORG-05  | Parent circle is in the same workspace                 |
| ORG-06  | `circleType` is valid enum when set                    |
| ORG-07  | `status` is `draft` or `active`                        |
| ORG-08  | `slug` is unique within workspace                      |
| ORG-09  | `archivedByPersonId` implies `archivedAt`              |
| CMEM-01 | `circleMember.circleId` points to existing circle      |
| CMEM-02 | `circleMember.personId` points to existing person      |
| CMEM-03 | Circle member workspace matches circle workspace       |
| CMEM-04 | No duplicate active `(circleId, personId)` memberships |
| XDOM-03 | Foreign keys stay within the same workspace            |

## Relationship to Other Domains

| Domain        | Relationship                                       |
| ------------- | -------------------------------------------------- |
| `workspaces`  | Each workspace owns one root circle                |
| `roles`       | Circle roles belong to circles                     |
| `assignments` | Assignments reference `circleId`                   |
| `people`      | Circle membership uses `personId`                  |
| `authority`   | Circle Lead role/assignments drive authority       |
| `history`     | Circle changes are captured in org version history |
| `proposals`   | Proposals can target circles                       |

## Files

| File                 | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `tables.ts`          | Defines circles, circleMembers, circleRoles tables |
| `queries.ts`         | Read circles, children, and members                |
| `mutations.ts`       | Create/update/archive circles                      |
| `circleLifecycle.ts` | Lifecycle rules (activate/archive/restore)         |
| `circleAccess.ts`    | Access control helpers for circle operations       |
| `circleMembers.ts`   | Manage explicit circle membership                  |
| `circleCoreRoles.ts` | Core Circle Lead role management                   |
| `validation.ts`      | Name/slug validation helpers                       |
| `index.ts`           | Public exports                                     |
