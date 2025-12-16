# Users Domain Architecture Alignment Analysis

**Date**: 2025-01-XX  
**Status**: Analysis Complete - Plan Required

## Executive Summary

The `convex/core/users` folder does **not** match the architecture specification in `dev-docs/master-docs/architecture.md`. The main issues are:

1. **Missing `mutations.ts`** - Required per architecture, but mutations are scattered across `lifecycle.ts` and `authLinks.ts`
2. **Missing `rules.ts`** - Required per architecture, but business rules are scattered across `validation.ts`, `profile.ts`, and `access.ts`
3. **Non-standard file organization** - Multiple helper files that should be consolidated
4. **Test file naming** - Should be `users.test.ts` instead of `access.test.ts`
5. **Missing `schema.ts`** - Optional but recommended for type exports

## Architecture Requirements

Per `dev-docs/master-docs/architecture.md` (lines 877-892), core domains must follow this structure:

```
domain/
├── tables.ts       # REQUIRED - Table definitions
├── schema.ts       # OPTIONAL - Types, aliases, re-exports
├── constants.ts    # OPTIONAL - Runtime constants
├── queries.ts      # REQUIRED - Read operations
├── mutations.ts    # REQUIRED - Write operations
├── rules.ts        # REQUIRED - Business rules (pure + contextual)
├── index.ts        # REQUIRED - Public exports only
├── README.md       # REQUIRED - AI-friendly documentation
└── domain.test.ts  # REQUIRED - Co-located tests
```

**Principle #1** (architecture.md line 18): "Core domains are foundational and complete (tables + queries + mutations + rules)"

## Current Structure Analysis

### ✅ Correct Files

| File | Status | Notes |
|------|--------|-------|
| `tables.ts` | ✅ Correct | Defines `users`, `accountLinks`, `userSettings` tables |
| `queries.ts` | ✅ Correct | Contains read operations (`getUserById`, `getUserByWorkosId`, `getCurrentUser`) |
| `index.ts` | ✅ Correct | Public exports (but needs update after refactor) |
| `README.md` | ✅ Correct | Domain documentation exists |

### ❌ Missing Required Files

| File | Status | Impact |
|------|--------|--------|
| `mutations.ts` | ❌ Missing | Violates Principle #1 - mutations scattered in `lifecycle.ts` and `authLinks.ts` |
| `rules.ts` | ❌ Missing | Violates Principle #1 - business rules scattered in `validation.ts`, `profile.ts`, `access.ts` |
| `users.test.ts` | ❌ Missing | Test file should be co-located and named after domain |

### ⚠️ Non-Standard Files (Need Consolidation)

| File | Current Purpose | Should Be In |
|------|----------------|--------------|
| `lifecycle.ts` | User creation/update mutations (`syncUserFromWorkOS`, `ensureWorkosUser`, `updateUserProfile`) | `mutations.ts` |
| `authLinks.ts` | Account linking mutations (`addAccountLink`, `linkAccounts`, `removeAccountLink`, etc.) | `mutations.ts` |
| `orgLinks.ts` | Query for listing user's workspace links | `queries.ts` |
| `validation.ts` | Account linking validation rules (`linkExists`, `checkLinkDepth`, `getTransitiveLinks`) | `rules.ts` |
| `profile.ts` | Profile name calculation (`calculateProfileName`) | `rules.ts` |
| `access.ts` | Access control helpers (`requireSessionUserId`, `requireProfilePermission`) | `rules.ts` |
| `access.test.ts` | Tests for access helpers | `users.test.ts` |

### ⚠️ Optional but Recommended

| File | Status | Recommendation |
|------|--------|---------------|
| `schema.ts` | ❌ Missing | Add for type exports and re-exports (see `people/schema.ts` pattern) |

## Detailed File Analysis

### `lifecycle.ts` (135 lines)
**Current content:**
- `syncUserFromWorkOS` mutation
- `ensureWorkosUser` mutation
- `updateUserProfile` mutation
- `upsertWorkosUser` helper
- `updateProfile` helper

**Issue:** These are mutations and should be in `mutations.ts` per architecture.

### `authLinks.ts` (212 lines)
**Current content:**
- `addAccountLink` mutation
- `linkAccounts` mutation
- `removeAccountLink` mutation
- `unlinkAccounts` mutation
- `validateAccountLink` query
- `listLinkedAccounts` query
- Helper functions for linking logic

**Issues:**
- Mutations should be in `mutations.ts`
- Queries should be in `queries.ts`
- Helper functions should be in `rules.ts`

### `orgLinks.ts` (30 lines)
**Current content:**
- `listOrgLinksForUser` function (query helper)

**Issue:** Should be in `queries.ts` as a query or query helper.

### `validation.ts` (101 lines)
**Current content:**
- `linkExists` - checks if accounts are linked
- `getTransitiveLinks` - gets all linked accounts
- `checkLinkDepth` - validates link depth constraints
- Constants: `MAX_LINK_DEPTH`, `MAX_TOTAL_ACCOUNTS`

**Issues:**
- Should be in `rules.ts` (business rules)
- Constants should be in `constants.ts` if used across domain

### `profile.ts` (8 lines)
**Current content:**
- `calculateProfileName` - pure function for name calculation

**Issue:** Should be in `rules.ts` (business rule).

### `access.ts` (27 lines)
**Current content:**
- `requireSessionUserId` - session validation helper
- `requireProfilePermission` - permission check helper

**Issue:** Should be in `rules.ts` (business rules/validation).

### `access.test.ts` (43 lines)
**Current content:**
- Tests for `requireSessionUserId` and `requireProfilePermission`

**Issue:** Should be `users.test.ts` and include all domain tests.

## Comparison with Reference Domain

**`convex/core/people`** (correctly aligned):
```
people/
├── tables.ts       ✅
├── schema.ts       ✅
├── constants.ts    ✅
├── queries.ts      ✅
├── mutations.ts    ✅
├── rules.ts        ✅
├── index.ts        ✅
├── README.md       ✅
└── people.test.ts  ✅
```

**`convex/core/users`** (current):
```
users/
├── tables.ts       ✅
├── queries.ts      ✅
├── index.ts        ✅
├── README.md       ✅
├── lifecycle.ts    ❌ (should be mutations.ts)
├── authLinks.ts    ❌ (should be mutations.ts + queries.ts + rules.ts)
├── orgLinks.ts     ❌ (should be queries.ts)
├── validation.ts   ❌ (should be rules.ts)
├── profile.ts      ❌ (should be rules.ts)
├── access.ts       ❌ (should be rules.ts)
└── access.test.ts  ❌ (should be users.test.ts)
```

## Impact Assessment

### Violations

1. **Principle #1 Violation**: Domain is not "complete" - missing `mutations.ts` and `rules.ts`
2. **Domain Cohesion Violation**: Related logic scattered across 7 files instead of 4-5 standard files
3. **AI Development Rules Violation**: Architecture says "Add user mutation → `/convex/core/users/mutations.ts`" but mutations are in `lifecycle.ts` and `authLinks.ts`
4. **Test Organization**: Tests not co-located in single `users.test.ts` file

### Functional Impact

- **Low**: Code works, but violates architecture principles
- **Medium**: Makes it harder for AI agents to find mutations/rules (violates "no judgment calls" rule)
- **High**: Inconsistent with other core domains (`people`, `circles`)

## Dependencies Analysis

### External Dependencies
- `infrastructure/sessionValidation` - Used in `access.ts` ✅ (correct layer)
- `infrastructure/rbac/permissions` - Used in `access.ts` ✅ (correct layer)
- `infrastructure/errors/codes` - Used throughout ✅ (correct layer)
- `core/people/queries` - Used in `orgLinks.ts` ✅ (core can import core)

### Internal Dependencies
- `lifecycle.ts` imports from `access.ts` and `profile.ts`
- `authLinks.ts` imports from `validation.ts`
- All files import from `tables.ts` (via `_generated/dataModel`)

**No circular dependencies detected** ✅

## Migration Complexity

### Low Risk
- Moving `profile.ts` → `rules.ts` (8 lines, pure function)
- Moving `orgLinks.ts` → `queries.ts` (30 lines, single function)
- Renaming `access.test.ts` → `users.test.ts`

### Medium Risk
- Consolidating `lifecycle.ts` → `mutations.ts` (135 lines, 3 mutations)
- Consolidating `authLinks.ts` → `mutations.ts` + `queries.ts` + `rules.ts` (212 lines, needs splitting)
- Consolidating `validation.ts` → `rules.ts` (101 lines, 3 functions + constants)

### High Risk
- Updating all imports across codebase
- Ensuring no breaking changes to public API (`index.ts` exports)

## Recommendations

1. **Create `mutations.ts`** - Consolidate all mutations from `lifecycle.ts` and `authLinks.ts`
2. **Create `rules.ts`** - Consolidate business rules from `validation.ts`, `profile.ts`, and `access.ts`
3. **Update `queries.ts`** - Move `orgLinks.ts` query and `authLinks.ts` queries into it
4. **Create `schema.ts`** - Add type exports (optional but recommended)
5. **Create `users.test.ts`** - Consolidate all tests
6. **Update `index.ts`** - Ensure public API remains stable
7. **Delete old files** - Remove `lifecycle.ts`, `authLinks.ts`, `orgLinks.ts`, `validation.ts`, `profile.ts`, `access.ts`, `access.test.ts`

## Next Steps

See `ARCHITECTURE-ALIGNMENT-PLAN.md` for detailed migration plan.

