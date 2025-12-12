# Authority Domain

## Purpose

Calculates what a person can do in a circle based on assignments, circle configuration, and core role coverage.

## Status

**FROZEN** - Authority model and required inputs are locked to keep permission calculations stable.

## Key Concepts

- Authority is **calculated, not stored** (see `schema.ts` scaffold).
- Inputs: `personId`, `circleId`, circle context, and active assignments (or legacy userCircleRoles during migration).
- During migration, authority can be fed by userCircleRoles; end state is assignments-only authority input. Remove legacy path once migration is complete.
- Circle Lead coverage is required for each circle; root circles must have active leads.
- Output is a set of permission flags (approve proposals, assign roles, manage circles, facilitate, raise objections).

## Identity Model

| Field         | Type                | Usage                                    |
| ------------- | ------------------- | ---------------------------------------- |
| `personId`    | `Id<'people'>`      | Subject of the authority calculation     |
| `circleId`    | `Id<'circles'>`     | Circle context being evaluated           |
| `workspaceId` | `Id<'workspaces'>`  | Derived from circle/person for safety    |
| `assignments` | `Array<Assignment>` | Active assignments powering authority    |
| `authority`   | `Authority`         | Derived permission flags (not persisted) |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID      | Rule                                                        |
| ------- | ----------------------------------------------------------- |
| AUTH-01 | Every active circle has at least one Circle Lead assignment |
| AUTH-02 | Root circle has Circle Lead assignment per workspace        |
| AUTH-03 | Each circle has a Circle Lead role (even if unfilled)       |
| AUTH-04 | `calculateAuthority` returns a valid Authority object       |

## Relationship to Other Domains

| Domain        | Relationship                                        |
| ------------- | --------------------------------------------------- |
| `assignments` | Primary input for authority context                 |
| `roles`       | Circle Lead template/role detection                 |
| `circles`     | Circle type/decision model shape permissions        |
| `people`      | Authority is scoped to `personId`                   |
| `proposals`   | Permissions gate proposal actions                   |
| `history`     | Authority decisions recorded via person-based audit |

## Files

| File            | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `calculator.ts` | Pure authority calculation                             |
| `context.ts`    | Builds authority context from assignments/legacy roles |
| `queries.ts`    | Reads authority context helpers                        |
| `mutations.ts`  | Authority-related mutations (if any)                   |
| `policies.ts`   | Hooks for policy-driven adjustments                    |
| `rules.ts`      | Guards/validation for authority inputs                 |
| `types.ts`      | Authority types and interfaces                         |
| `schema.ts`     | Empty schema to signal computed domain                 |
| `index.ts`      | Public exports                                         |
