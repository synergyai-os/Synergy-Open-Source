# Roles Domain

## Purpose

Authority distribution units within circles; defines accountabilities and enables assignments.

## Status

**FROZEN** - Role lifecycle, templates, and lead rules are locked to keep authority calculations consistent.

## Key Concepts

- Circle roles belong to circles and inherit workspace scope.
- Role templates define reusable patterns; core templates (Circle Lead) must exist per workspace.
- Lifecycle uses `draft`/`active`; soft delete via `archivedAt`.
- Roles can be marked `isHiring` to advertise openings.
- Legacy `userCircleRoles` remains during migration but should be superseded by `assignments`.

## Identity Model

| Field         | Type                          | Usage                                 |
| ------------- | ----------------------------- | ------------------------------------- |
| `roleId`      | `Id<'circleRoles'>`           | Primary identifier for a circle role  |
| `workspaceId` | `Id<'workspaces'>`            | Scope boundary (mirrors circle)       |
| `circleId`    | `Id<'circles'>`               | Circle that owns the role             |
| `templateId`  | `Id<'roleTemplates'> \| null` | Role template backing (core/optional) |
| `status`      | `'draft' \| 'active'`         | Lifecycle state                       |
| `isHiring`    | `boolean`                     | Whether the role is advertised        |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID      | Rule                                                   |
| ------- | ------------------------------------------------------ |
| ROLE-01 | `circleRoles.circleId` points to existing circle       |
| ROLE-02 | `circleRoles.workspaceId` matches circle workspace     |
| ROLE-03 | `circleRoles.templateId` (when set) points to template |
| ROLE-04 | Role `status` is `draft` or `active`                   |
| ROLE-05 | Core role templates exist per workspace                |
| ROLE-06 | `archivedByPersonId` implies `archivedAt`              |
| AUTH-03 | Each circle has a Circle Lead role (even if unfilled)  |

## Relationship to Other Domains

| Domain        | Relationship                                            |
| ------------- | ------------------------------------------------------- |
| `circles`     | Roles belong to circles and match workspace scope       |
| `assignments` | Assign people to roles                                  |
| `authority`   | Authority calculation consumes roles and templates      |
| `people`      | Audit fields (`createdByPersonId`, `updatedByPersonId`) |
| `history`     | Role changes are captured for audit                     |
| `proposals`   | Proposals can target roles                              |

## Files

### Core Domain Files (Architecture Pattern)

| File            | Purpose                                    |
| --------------- | ------------------------------------------ |
| `tables.ts`     | Table definitions (roleTemplates, circleRoles) |
| `schema.ts`     | Type aliases and exports                   |
| `queries.ts`    | **All** role queries (consolidated)        |
| `mutations.ts`  | **All** role mutations (consolidated)      |
| `rules.ts`      | Business rules (validation, governance)    |
| `index.ts`      | Public API exports                         |
| `README.md`     | Domain documentation                       |
| `roles.test.ts` | **All** tests (consolidated)               |

### Helper Files

| File            | Purpose                                    | Why Separate? |
| --------------- | ------------------------------------------ | ------------- |
| `roleAccess.ts` | Access control helpers (contextual, needs ctx) | Contextual functions used across queries/mutations |
| `roleRbac.ts`   | RBAC integration handlers (infrastructure integration) | Infrastructure integration, not pure business logic |

**Note**: Pure validation and business logic functions (`validation.ts`, `lead.ts`, `detection.ts`) were consolidated into `rules.ts` per architecture.md Principle #27: "Validation logic extracted to `rules.ts`".

### Subdomain

| Directory      | Purpose                                    |
| -------------- | ------------------------------------------ |
| `templates/`   | Role template subdomain (queries, mutations, rules) |

**Note**: This domain follows the architecture.md 8-file domain structure. Queries and mutations were consolidated from fragmented files in January 2025.
