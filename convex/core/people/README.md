# People Domain

## Purpose

Workspace-scoped organizational identity for humans participating in a workspace.

## Status

**FROZEN** - Identity chain is fixed; people remains the mandatory bridge from global `userId` to workspace context.

## Key Concepts

- Identity chain: `sessionId → userId → personId → workspaceId`.
- Status lifecycle: `placeholder → invited → active → archived` (direct archive allowed from any status).
- Placeholders: Planning entities with `displayName` only — no email, no userId, can't log in.
- Invite lifecycle: email only while invited; email moves to `users` after signup.
- Workspace role (`owner/admin/member`) lives on people and gates workspace-level actions.
- `personId` is the only identifier allowed in core domains (not `userId`).

## Identity Model

| Field           | Type                                                     | Usage                                       |
| --------------- | -------------------------------------------------------- | ------------------------------------------- |
| `personId`      | `Id<'people'>`                                           | Primary identifier per workspace            |
| `workspaceId`   | `Id<'workspaces'>`                                       | Scope boundary for the person               |
| `userId`        | `Id<'users'> \| null`                                    | Links to global auth identity (active only) |
| `email`         | `string \| null`                                         | Invite-only identifier before signup        |
| `displayName`   | `string \| null`                                         | Workspace-specific name (required for placeholders) |
| `workspaceRole` | `'owner' \| 'admin' \| 'member'`                         | Workspace-level RBAC                        |
| `status`        | `'placeholder' \| 'invited' \| 'active' \| 'archived'`   | Lifecycle for the person record             |
| `createdAt`     | `number`                                                 | When person record was created (all statuses) |
| `invitedAt`     | `number \| null`                                         | When invite was sent (invited status and beyond) |
| `joinedAt`      | `number \| null`                                         | When user accepted and linked account (active only) |

## Status Lifecycle

| Status | Has `email` | Has `userId` | Can Log In | Purpose |
|--------|-------------|--------------|------------|---------|
| `placeholder` | ❌ | ❌ | ❌ | Planning entity — name only, represents future participant |
| `invited` | ✅ | ❌ | ❌ | Invited via email, awaiting signup |
| `active` | ❌ (use users.email) | ✅ | ✅ | Linked to auth identity, full access |
| `archived` | preserved | preserved | ❌ | Soft-deleted, kept for audit trail |

**Lifecycle transitions:**
```
placeholder → invited → active → archived
     ↓            ↓         ↓
     └────────────┴─────────┴──────→ archived (direct archive allowed)
```

**Placeholders** represent known future participants (new hires, consultants, board members) who should appear in the org chart and hold roles before they have system accounts. Key properties:

- Created with `displayName` only — no email, no userId
- Can be assigned to roles via `assignments` table
- Appear in org charts and authority displays
- Cannot log in or take actions (no session possible)
- Persist into active workspaces as a normal planning mechanism

**Timestamps:**
- `createdAt` — when the person record was created (all statuses)
- `invitedAt` — when invite was sent (only for `invited` status and beyond)
- `joinedAt` — when user accepted and linked their account (only for `active`)

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
| IDENT-12 | Placeholder people have `displayName`, no `email`, no `userId` |
| IDENT-13 | Placeholder people do not have `invitedAt` set (use `createdAt`) |
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
