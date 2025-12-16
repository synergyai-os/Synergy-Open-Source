# Workspaces Domain

## Purpose

Multi-tenant container that scopes people, circles, roles, and authority.

## Status

**STABLE** - Workspace model is stable; archival rules are defined.

**SYOS-843**: Restructured from 26 files to ≤8 core files. Invites moved to `features/invites/`.
**SYOS-855**: Consolidated to ≤8 files. Branding, settings, and roles moved to features/infrastructure.

## Key Concepts

- Workspace is the isolation boundary for all core data.
- One root circle per workspace; all circles, roles, people inherit workspaceId.
- Slug must be unique; aliases provide additional routable slugs.
- Workspace-level roles (`owner/admin/member`) live on people table.
- **Invites**: Moved to `features/invites/` (SYOS-843).
- **Branding**: Moved to `features/workspace-branding/` (SYOS-855).
- **Org Settings**: Moved to `features/workspace-settings/` (SYOS-855).
- **RBAC Role Queries**: Moved to `infrastructure/access/workspaceRoles.ts` (SYOS-855).

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

| Domain        | Relationship                                 |
| ------------- | -------------------------------------------- |
| `people`      | People are scoped to a single workspace      |
| `circles`     | Each workspace owns one root circle          |
| `roles`       | Roles inherit workspace scope from circles   |
| `assignments` | Assignments must align with workspace scope  |
| `authority`   | Authority scoped by workspace and circle     |
| `history`     | History entries carry `workspaceId`          |
| `proposals`   | Proposals are workspace-scoped               |
| `invites`     | Invites target a workspace (separate domain) |

## Files (Post-SYOS-855)

| File           | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `tables.ts`    | Workspace + settings table definitions             |
| `queries.ts`   | Workspace reads (by slug, id, list, aliases)       |
| `lifecycle.ts` | Create workspace, update slug, aliases, slug utils |
| `access.ts`    | Access control helpers                             |
| `members.ts`   | Member management (list, remove)                   |
| `index.ts`     | Public exports                                     |
| `settings.ts`  | User settings (API keys) - **TODO: move to users** |
| `README.md`    | This file                                          |

**Note**: `settings.ts` move to `core/users/` is blocked by SYOS-854.

## Extracted to Features/Infrastructure (SYOS-855)

| Old Location           | New Location                              | Purpose                     |
| ---------------------- | ----------------------------------------- | --------------------------- |
| `branding.ts`          | `features/workspace-branding/`            | Workspace branding (colors) |
| `workspaceSettings.ts` | `features/workspace-settings/`            | Org chart settings          |
| `roles.ts`             | `infrastructure/access/workspaceRoles.ts` | RBAC role queries           |
| `slug.ts`              | Merged into `lifecycle.ts`                | Slug utilities              |
| `user.ts`              | Merged into `lifecycle.ts`                | User field helpers          |
| `aliases.ts`           | Merged into `lifecycle.ts` + `queries.ts` | Alias management            |

## Related Domains

- **`features/invites/`** - Workspace invitations (extracted SYOS-843)
- **`features/workspace-branding/`** - Workspace branding (extracted SYOS-855)
- **`features/workspace-settings/`** - Org chart settings (extracted SYOS-855)
- **`infrastructure/access/workspaceRoles.ts`** - RBAC role queries (extracted SYOS-855)
- **`core/people/`** - Workspace members
- **`infrastructure/urls.ts`** - URL utilities (extracted SYOS-843)
