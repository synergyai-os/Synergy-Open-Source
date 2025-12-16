# Invites Feature

## Purpose

Manages workspace invitations — creating, accepting, declining, and revoking invites for users to join workspaces.

## Status

**FEATURE** — Invites are a transient workflow feature, not core organizational truth. Extracted from workspaces for domain cohesion (SYOS-843).

## Key Concepts

- **Invite Code**: Unique code generated for each invite (format: `ORG-XXXXXX-XXXX`)
- **Invite Types**: Can target a specific user (`invitedUserId`) or an email address
- **Invite Lifecycle**: `created` → `accepted` | `declined` | `revoked` | `expired`
- **Workspace Role**: Each invite specifies the role (`owner`, `admin`, `member`) the user will have

## Identity Model

| Field               | Type                     | Usage                  |
| ------------------- | ------------------------ | ---------------------- |
| `inviteId`          | `Id<'workspaceInvites'>` | Primary identifier     |
| `workspaceId`       | `Id<'workspaces'>`       | Target workspace       |
| `invitedUserId`     | `Id<'users'>` (optional) | Specific user target   |
| `email`             | `string` (optional)      | Email-based invite     |
| `code`              | `string`                 | Unique invite code     |
| `invitedByPersonId` | `Id<'people'>`           | Who created the invite |

## Files

| File           | Purpose                                        |
| -------------- | ---------------------------------------------- |
| `tables.ts`    | `workspaceInvites` table definition            |
| `queries.ts`   | Public query endpoints                         |
| `mutations.ts` | Public mutation endpoints                      |
| `rules.ts`     | Validation rules (email format, no duplicates) |
| `helpers.ts`   | Internal operations (create, accept, decline)  |
| `index.ts`     | Public exports                                 |

## Relationship to Other Domains

| Domain       | Relationship                                |
| ------------ | ------------------------------------------- |
| `workspaces` | Invites are scoped to a workspace           |
| `people`     | Accepting an invite creates a person record |
| `users`      | Invites can target a specific user          |

## Public API

### Queries

- `findInviteByCode(sessionId, code)` — Get invite details for acceptance page
- `getWorkspaceInvites(sessionId, workspaceId)` — List all invites for a workspace (admin)
- `listWorkspaceInvites(sessionId)` — List pending invites for current user

### Mutations

- `createWorkspaceInvite(sessionId, workspaceId, email?, inviteeUserId?, role?)` — Create invite
- `acceptOrganizationInvite(sessionId, code)` — Accept invite
- `declineOrganizationInvite(sessionId, inviteId)` — Decline invite
- `resendOrganizationInvite(sessionId, inviteId)` — Resend invite email
