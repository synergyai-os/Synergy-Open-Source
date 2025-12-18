# Users Domain

## Purpose

Global authentication identity for every human that can log in.

## Status

**FROZEN** - Identity chain is locked; auth identity must stay stable globally.

## Key Concepts

- `userId` is global; each workspace links it to a `personId`.
- `workosId` and `email` come from WorkOS and stay unique.
- Linked accounts (`accountLinks`) let multiple WorkOS users merge into one human.
- Per-user preferences live in `userSettings` keyed by `userId`.
- Branding updates (infra-level) use `userId` by exception (see XDOM notes); replace with `personId` once branding is migrated.

## Identity Model

| Field                        | Type          | Usage                                     |
| ---------------------------- | ------------- | ----------------------------------------- |
| `userId`                     | `Id<'users'>` | Primary identifier (global auth identity) |
| `workosId`                   | `string`      | External WorkOS id for auth               |
| `email`                      | `string`      | Unique login email (IDENT-09)             |
| `accountLinks.primaryUserId` | `Id<'users'>` | Owner of a linked account set             |
| `userSettings.userId`        | `Id<'users'>` | Preferences (theme, API keys)             |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID       | Rule                                                    |
| -------- | ------------------------------------------------------- |
| IDENT-09 | Every `user.email` is unique                            |
| XDOM-01  | Core domains should not store `userId` (use `personId`) |

## Relationship to Other Domains

| Domain       | Relationship                                                    |
| ------------ | --------------------------------------------------------------- |
| `people`     | Links `userId` to workspace-scoped `personId`                   |
| `workspaces` | Invites and membership use `userId` at the infrastructure layer |
| `authority`  | Uses `personId`; `userId` only resolves the person              |
| `history`    | Audit uses `personId`; `userId` should not appear               |

## Files

| File           | Purpose                                                |
| -------------- | ------------------------------------------------------ |
| `tables.ts`    | Defines `users`, `accountLinks`, `userSettings` tables |
| `schema.ts`    | Type exports and re-exports                            |
| `constants.ts` | Runtime constants (MAX_LINK_DEPTH, MAX_TOTAL_ACCOUNTS) |
| `queries.ts`   | Reads user records, settings, and account links        |
| `mutations.ts` | Creates, updates users and manages account linking     |
| `rules.ts`     | Business rules (access, profile, account linking)      |
| `index.ts`     | Public exports                                         |
