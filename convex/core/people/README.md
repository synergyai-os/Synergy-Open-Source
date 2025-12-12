# People Domain

## Purpose

Workspace-scoped organizational identity for humans participating in a workspace.

## Status

**FROZEN** - Identity chain is fixed; people remains the mandatory bridge from global `userId` to workspace context.

## Key Concepts

- Identity chain: `sessionId → userId → personId → workspaceId`.
- Invite lifecycle: email only while invited; email moves to `users` after signup.
- Workspace role (`owner/admin/member`) lives on people and gates workspace-level actions.
- `personId` is the only identifier allowed in core domains (not `userId`).

## Identity Model

| Field           | Type                                  | Usage                                       |
| --------------- | ------------------------------------- | ------------------------------------------- |
| `personId`      | `Id<'people'>`                        | Primary identifier per workspace            |
| `workspaceId`   | `Id<'workspaces'>`                    | Scope boundary for the person               |
| `userId`        | `Id<'users'> \| null`                 | Links to global auth identity (active only) |
| `email`         | `string \| null`                      | Invite-only identifier before signup        |
| `workspaceRole` | `'owner' \| 'admin' \| 'member'`      | Workspace-level RBAC                        |
| `status`        | `'invited' \| 'active' \| 'archived'` | Lifecycle for the person record             |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID       | Rule                                                     |
| -------- | -------------------------------------------------------- |
| IDENT-01 | Active people must have `userId`                         |
| IDENT-02 | Invited people must have `email`                         |
| IDENT-03 | Active people should not have `email` set                |
| IDENT-04 | Every `person.workspaceId` points to existing workspace  |
| IDENT-05 | Every `person.userId` (when set) points to existing user |
| IDENT-06 | No duplicate `(workspaceId, userId)` for active people   |
| IDENT-07 | No duplicate `(workspaceId, email)` for invited people   |
| IDENT-08 | Archived people with history preserve `userId`           |
| XDOM-02  | Audit fields use `personId`, not `userId`                |

## Relationship to Other Domains

| Domain        | Relationship                                               |
| ------------- | ---------------------------------------------------------- |
| `users`       | Links global `userId` to workspace `personId`              |
| `circles`     | Circle membership uses `personId`                          |
| `roles`       | Role templates and circle roles reference people for audit |
| `assignments` | Assigns a person to a role in a circle                     |
| `authority`   | Authority calculation input is `personId`                  |
| `proposals`   | `createdByPersonId` tracks who authored changes            |
| `history`     | Audit log uses `changedByPersonId`                         |
| `workspaces`  | People belong to exactly one workspace                     |

## Files

| File           | Purpose                                                |
| -------------- | ------------------------------------------------------ |
| `tables.ts`    | Defines `people` table and indexes                     |
| `queries.ts`   | Reads people by workspace, user, and status            |
| `mutations.ts` | Creates, updates, and archives people                  |
| `rules.ts`     | Helpers (email resolution, validation, identity chain) |
| `constants.ts` | Shared constants (role options, statuses)              |
| `index.ts`     | Public exports                                         |
