# Architecture Audit Baseline

Date: 2025-12-07  
Architecture version: 2.1 (dev-docs/master-docs/architecture.md)

## Checks Run (manual)
- Handler length >20 non-blank lines (convex/core, convex/features queries.ts/mutations.ts)
- File size >300 lines (convex, excluding _generated, tests, backups)
- `throw new Error` outside tests (convex)
- Inline casts `as unknown as` (features, infrastructure)
- Smoke check for dependency direction (no core→features or infra→core hits)
- Test file presence (`find convex -name "*.test.ts"`)

## Findings
- Handler length: 32 violations, all in core. Worst offenders include `convex/core/roles/queries.ts` (`listByWorkspace` 104 lines) and `convex/core/proposals/queries.ts` (`approve` 103). Circles/roles/proposals dominate the list.
- File size: 30 files >300 lines. Largest: `convex/core/roles/queries.ts` (1465), `convex/schema.ts` (1457), `convex/features/workspaces/index.ts` (1433), `convex/features/meetings/meetings.ts` (1188), `convex/core/proposals/queries.ts` (1064), `convex/core/circles/queries.ts` (895), `convex/infrastructure/featureFlags.ts` (837), `convex/features/tags/index.ts` (909). Many legacy single-file modules also exceed the limit.
- Error formatting: Numerous `throw new Error` usages in features (tags, notes, flashcards, inbox, meetings/invitations) and infrastructure (featureFlags, email), plus legacy scripts (syncReadwise, blogExport, testReadwiseApi). Not using `createError(ErrorCodes.*)`.
- Inline casts: Multiple `as unknown as` in `convex/features/workspaces/index.ts`, `convex/infrastructure/featureFlags.ts` (and a commented one in tags). Violates hygiene rule 29.
- Tests: Only a handful of core tests exist (circles slug/validation, roles detection/lead/validation, authority calculator, proposals state machine) and infra access/db. Missing tests for people, assignments, policies, and all features → principle 21 unmet.
- Layering drift: Many legacy top-level Convex modules remain (`convex/circles.ts`, `convex/tasks.ts`, `convex/users.ts`, `convex/rbac/*.ts`, etc.), suggesting incomplete migration to core/features/infrastructure.

## Suggested Remediations (prioritized)
1) Split long handlers: extract validation/auth/rules into helpers; target circles/roles/proposals first.
2) Replace `throw new Error` with `createError(ErrorCodes.*)` and ensure codes cover cases.
3) Eliminate `as unknown as` by typing lookups/records properly.
4) Break up >300-line files; many will shrink after handler extraction and helper moves.
5) Add co-located unit tests for missing core domains and start feature test coverage.
6) Plan migration/retirement of legacy top-level Convex modules to align with core/features/infrastructure.

