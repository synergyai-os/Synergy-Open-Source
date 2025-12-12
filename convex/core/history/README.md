# History Domain

## Purpose

Immutable audit log of structural changes to circles, roles, memberships, and related entities.

## Status

**FROZEN** - History shape and immutability rules are locked to preserve audit integrity.

## Key Concepts

- Append-only records; no updates after creation.
- `changedByPersonId` captures the actor (person-scoped, never `userId`).
- Supports multiple entity types (circles, circleRoles, userCircleRoles, circleMembers, circleItems, categories).
- `before`/`after` snapshots capture relevant fields for each entity type.

## Identity Model

| Field               | Type                                                                                                                                    | Usage                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `historyId`         | `Id<'orgVersionHistory'>`                                                                                                               | Primary identifier            |
| `workspaceId`       | `Id<'workspaces'>`                                                                                                                      | Scope boundary for the change |
| `entityType`        | `'circle' \| 'circleRole' \| 'userCircleRole' \| 'circleMember' \| 'circleItemCategory' \| 'circleItem'`                                | Type of entity being recorded |
| `entityId`          | `Id<'circles'> \| Id<'circleRoles'> \| Id<'userCircleRoles'> \| Id<'circleMembers'> \| Id<'circleItemCategories'> \| Id<'circleItems'>` | Entity reference              |
| `changedByPersonId` | `Id<'people'>`                                                                                                                          | Who made the change           |
| `changedAt`         | `number`                                                                                                                                | When the change occurred      |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID      | Rule                                                   |
| ------- | ------------------------------------------------------ |
| HIST-01 | History uses `changedByPersonId` (not `userId`)        |
| HIST-02 | `changedByPersonId` points to existing/archived person |
| HIST-03 | History records are immutable after creation           |
| HIST-04 | `history.workspaceId` points to existing workspace     |

## Relationship to Other Domains

| Domain        | Relationship                                       |
| ------------- | -------------------------------------------------- |
| `circles`     | Circle lifecycle changes recorded                  |
| `roles`       | Role lifecycle changes recorded                    |
| `assignments` | Legacy `userCircleRoles` changes recorded          |
| `proposals`   | `versionHistoryEntryId` links proposals to history |
| `people`      | Actors referenced via `changedByPersonId`          |
| `workspaces`  | Workspace scope for all history entries            |

## Files

| File              | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `schema.ts`       | Defines `orgVersionHistory` table        |
| `capture.ts`      | Helpers to record history entries        |
| `queries.ts`      | History reads by workspace/entity/person |
| `types.ts`        | Shared types for history payloads        |
| `history.test.ts` | Tests for capture and integrity          |
| `index.ts`        | Public exports                           |
