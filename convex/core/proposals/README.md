# Proposals Domain

## Purpose

Structured change mechanism for circles and roles, governed by a state machine.

## Status

**STABLE** - State machine and data shape are stable; only evolutions/fields may expand.

## Key Concepts

- State machine: `draft → submitted → in_meeting → objections/integrated/approved/rejected/withdrawn`.
- `entityType`/`entityId` target either a circle or a role.
- `createdByPersonId` is mandatory for audit; `processedAt` required when approved.
- Evolutions capture field-level changes; objections track validity/integration.
- Meeting linkage (`meetingId`, `agendaItemId`) ties proposals to sessions.

## Identity Model

| Field               | Type                    | Usage                             |
| ------------------- | ----------------------- | --------------------------------- |
| `proposalId`        | `Id<'circleProposals'>` | Primary identifier                |
| `workspaceId`       | `Id<'workspaces'>`      | Scope boundary                    |
| `entityType`        | `'circle' \| 'role'`    | Target domain                     |
| `entityId`          | `string`                | Target entity identifier          |
| `circleId`          | `Id<'circles'> \| null` | Circle context (optional)         |
| `createdByPersonId` | `Id<'people'>`          | Who authored the proposal         |
| `status`            | Proposal state enum     | Drives workflow transitions       |
| `processedAt`       | `number \| null`        | Required when `status='approved'` |

## Invariants

This domain is validated by the following invariants (see `convex/admin/invariants/INVARIANTS.md`):

| ID      | Rule                                                     |
| ------- | -------------------------------------------------------- |
| PROP-01 | `proposal.workspaceId` points to existing workspace      |
| PROP-02 | `proposal.circleId` (when set) points to existing circle |
| PROP-03 | `createdByPersonId` points to existing person            |
| PROP-04 | `status` is a valid enum value                           |
| PROP-05 | State transitions follow the state machine               |
| PROP-06 | Approved proposals have `processedAt` timestamp          |

## Relationship to Other Domains

| Domain      | Relationship                                            |
| ----------- | ------------------------------------------------------- |
| `circles`   | Proposals can target circles and link to circle context |
| `roles`     | Proposals can target circle roles                       |
| `people`    | `createdByPersonId` and objections use people           |
| `history`   | `versionHistoryEntryId` links proposal to audit trail   |
| `authority` | Approved proposals may change assignments/roles         |

## Files

| File              | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `tables.ts`       | Table definitions for proposals, evolutions, attachments, objections |
| `schema.ts`       | Types and aliases (re-exports from constants)          |
| `constants.ts`    | Runtime constants (ProposalStatus enum, state machine constants) |
| `queries.ts`      | Read operations (list, get, getByAgendaItem, etc.)   |
| `mutations.ts`    | Write operations (create, submit, approve, reject, etc.) |
| `rules.ts`        | Business rules (state machine, validation, access control) |
| `index.ts`        | Public exports                                         |
| `README.md`       | Domain documentation                                   |
| `proposals.test.ts` | Co-located tests                                      |
