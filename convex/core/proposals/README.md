# Proposals Core Domain

Pure, side-effect-free helpers for proposal state transitions and validation. The application layer (`convex/proposals.ts`) handles DB operations and calls these helpers to keep business rules consistent and testable.

## State Machine

Valid transitions:

- draft → submitted | withdrawn
- submitted → in_meeting | withdrawn
- in_meeting → objections | integrated | approved | rejected | withdrawn
- objections → integrated | rejected | withdrawn
- integrated → approved | rejected | withdrawn
- approved/rejected/withdrawn → terminal (no further transitions)

## Exports

- `ProposalStatus`, `VALID_TRANSITIONS`, `PROPOSAL_STATUSES`, `TERMINAL_STATUSES`
- `canTransition`, `assertTransition`, `isTerminalState`
- `assertHasEvolutions`, `assertNotTerminal`

## Usage

- Guard every status change in app-layer mutations with `assertTransition`.
- Use validation helpers for common preconditions (e.g., evolutions required before submit/import).
- Keep any DB access in the application layer; keep this module pure.


