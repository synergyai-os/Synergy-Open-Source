# Assignments Domain

## Purpose

Connects people to roles in specific circles to define who holds which accountabilities.

## Status

**FROZEN** - Assignment shape and lifecycle are locked for authority correctness.

## Key Concepts

- Triplet identity: `(personId, roleId, circleId)`.
- Lifecycle status: `active` or `ended`, with `endedAt/endedByPersonId`.
- Optional term bounds via `startDate`/`endDate`.
- `assignedByPersonId` tracks the actor creating the assignment.
- Legacy `userCircleRoles` exists until migration completes; end state is assignments-only authority input, so remove legacy references once the migration is finished.

## Identity Model

| Field                | Type                   | Usage                                 |
| -------------------- | ---------------------- | ------------------------------------- |
| `assignmentId`       | `Id<'assignments'>`    | Primary identifier                    |
| `personId`           | `Id<'people'>`         | Who is assigned                       |
| `roleId`             | `Id<'circleRoles'>`    | What role they hold                   |
| `circleId`           | `Id<'circles'>`        | Where the role lives                  |
| `status`             | `'active' \| 'ended'`  | Lifecycle of the assignment           |
| `assignedAt`         | `number`               | Timestamp when assignment was created |
| `assignedByPersonId` | `Id<'people'> \| null` | Who created the assignment            |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID        | Rule                                                  |
| --------- | ----------------------------------------------------- |
| ASSIGN-01 | `assignment.personId` points to existing person       |
| ASSIGN-02 | `assignment.roleId` points to existing role           |
| ASSIGN-03 | `assignment.circleId` points to existing circle       |
| ASSIGN-04 | Person workspace matches role's circle workspace      |
| ASSIGN-05 | No duplicate active `(personId, roleId)` pairs        |
| ASSIGN-06 | `status` is `active` or `ended`                       |
| UCROLE-01 | Legacy `userCircleRole.personId` exists               |
| UCROLE-02 | Legacy `userCircleRole.circleRoleId` exists           |
| UCROLE-03 | Legacy person workspace matches role workspace        |
| UCROLE-04 | No duplicate active legacy `(personId, circleRoleId)` |
| XDOM-03   | Foreign keys stay within the same workspace           |

## Relationship to Other Domains

| Domain      | Relationship                                      |
| ----------- | ------------------------------------------------- |
| `people`    | Assigns a person                                  |
| `roles`     | Assigns a circle role                             |
| `circles`   | Scope of the assignment                           |
| `authority` | Authority calculation consumes active assignments |
| `history`   | Assignment changes captured in version history    |
| `proposals` | Proposals may create or end assignments           |

## Files

| File                  | Purpose                                 |
| --------------------- | --------------------------------------- |
| `tables.ts`           | Defines assignments table and indexes   |
| `queries.ts`          | Reads assignments by person/role/circle |
| `mutations.ts`        | Creates and ends assignments            |
| `rules.ts`            | Validation and helper logic             |
| `assignments.test.ts` | Unit tests                              |
| `index.ts`            | Public exports                          |
