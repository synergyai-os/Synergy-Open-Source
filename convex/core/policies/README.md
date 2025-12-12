# Policies Domain

## Purpose

Circle-level rules and constraints that shape governance and operating modes.

## Status

**STABLE** - Domain scaffold exists; modeling and enforcement are pending SYOS-707/803.

## Key Concepts

- Policies are scoped to circles and inherit workspace boundaries.
- Domain is currently a scaffold; mutations/queries are placeholders.
- Enforcement will feed authority calculations once modeled.

## Identity Model

| Field         | Type  | Usage                                    |
| ------------- | ----- | ---------------------------------------- |
| `policyId`    | _TBD_ | Domain schema not implemented (SYOS-707) |
| `circleId`    | _TBD_ | Policies will be circle-scoped           |
| `workspaceId` | _TBD_ | Policies will inherit workspace scope    |

## Invariants (TBD - SYOS-707/803)

This domain will be validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md` when defined):

| ID  | Rule                                                           |
| --- | -------------------------------------------------------------- |
| TBD | No policy-specific invariants defined yet (SYOS-803 follow-up) |

## Relationship to Other Domains

| Domain      | Relationship                                |
| ----------- | ------------------------------------------- |
| `circles`   | Policies are defined per circle             |
| `authority` | Policies will inform permission calculation |
| `proposals` | Proposals will create/update policies       |
| `people`    | Policy changes audited via `personId`       |

## Files

| File           | Purpose                            |
| -------------- | ---------------------------------- |
| `schema.ts`    | Placeholder schema (empty record)  |
| `queries.ts`   | Scaffold for future reads          |
| `mutations.ts` | Scaffold for future writes         |
| `rules.ts`     | Throws until domain is implemented |
| `index.ts`     | Public exports                     |
