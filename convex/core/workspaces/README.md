# Workspaces Domain

## Purpose

Multi-tenant container that scopes people, circles, roles, and authority.

## Status

**STABLE** - Workspace model is stable; archival rules are defined.

## Key Concepts

- Workspace is the isolation boundary for all core data.
- One root circle per workspace; all circles, roles, people inherit workspaceId.
- Slug must be unique; aliases provide additional routable slugs.
- Workspace-level roles (`owner/admin/member`) live on people and workspaceMembers (legacy).
- Branding updates are infrastructure-level and use `userId` (infra exception); migrate to `personId` when branding moves into core.

## Identity Model

| Field                | Type                   | Usage                                 |
| -------------------- | ---------------------- | ------------------------------------- |
| `workspaceId`        | `Id<'workspaces'>`     | Primary identifier                    |
| `slug`               | `string`               | Unique URL slug                       |
| `name`               | `string`               | Display name                          |
| `plan`               | `string`               | Billing/plan tier                     |
| `archivedAt`         | `number \| null`       | Soft-delete timestamp                 |
| `archivedByPersonId` | `Id<'people'> \| null` | Who archived the workspace            |
| `alias.slug`         | `string`               | Alternate slug via `workspaceAliases` |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID    | Rule                                          |
| ----- | --------------------------------------------- |
| WS-01 | Each workspace has at least one active person |
| WS-02 | Each workspace has at least one owner         |
| WS-03 | Workspace `slug` is unique                    |
| WS-04 | Workspace aliases point to existing workspace |
| WS-05 | No workspace slug conflicts with aliases      |

## Relationship to Other Domains

| Domain        | Relationship                                |
| ------------- | ------------------------------------------- |
| `people`      | People are scoped to a single workspace     |
| `circles`     | Each workspace owns one root circle         |
| `roles`       | Roles inherit workspace scope from circles  |
| `assignments` | Assignments must align with workspace scope |
| `authority`   | Authority scoped by workspace and circle    |
| `history`     | History entries carry `workspaceId`         |
| `proposals`   | Proposals are workspace-scoped              |

## Files

| File           | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| `tables.ts`    | Defines workspaces, aliases, members, invites, settings |
| `queries.ts`   | Workspace reads (by slug, id)                           |
| `lifecycle.ts` | Creation, update, archival helpers                      |
| `members.ts`   | Workspace membership helpers                            |
| `invites.ts`   | Invite flow (codes, accept, revoke)                     |
| `aliases.ts`   | Alias management                                        |
| `roles.ts`     | Workspace role operations                               |
| `settings.ts`  | Workspace settings (API keys, org settings)             |
| `index.ts`     | Public exports                                          |
