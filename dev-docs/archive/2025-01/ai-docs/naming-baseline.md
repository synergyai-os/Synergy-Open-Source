# Naming Convention Audit Baseline

**Last Updated**: 2025-12-07
**Architecture Version**: 2.1
**Linter Version**: 1.1 (with expanded ALLOWED_BASES)

## Current State

| Date | Total | unknown_prefix | delete_prefix | list_returns_nullable | get_returns_nullable | list_not_array |
|------|-------|----------------|---------------|----------------------|---------------------|----------------|
| 2025-12-07 | 0 | 0 | 0 | 0 | 0 | 0 |

## Target State

- Keep all categories at 0; fail CI on regressions.

## Refactor Backlog

### P0 — Security/Correctness
- [ ] None currently

### P1 — Architecture Violations
- [ ] None (kept here for future regressions)

### P2 — Convention Cleanup
- [ ] None (kept here for future regressions)

### P3 — Allowlist Expansion
- [ ] None (kept here for future regressions)

## Allowlisted Functions

Functions verified to follow conventions but undetectable by regex:

| Function | File | Reason |
|----------|------|--------|
| listFlashcardsByCollection | convex/features/flashcards/index.ts | Multi-line Query<> type |
| listInboxItems | convex/features/inbox/index.ts | Multi-line Query<> type |
| listNotes | convex/features/notes/index.ts | Multi-line Query<> type |
| listAllTags | convex/features/tags/index.ts | Multi-line Query<> type |
| listUserTags | convex/features/tags/index.ts | Multi-line Query<> type |

## Excluded Paths

Files/patterns intentionally excluded from linting:

| Path | Reason |
|------|--------|
| `convex/admin/migrate*.ts` | One-time migrations, different naming conventions acceptable |
| `convex/admin/seed*.ts` | Seeding scripts |

## History

### 2025-12-07
- Initial baseline: 198 violations → reduced to 0
- Expanded allowed bases to match architecture
- Wired naming audit into ci:quick/precommit (post-fix)