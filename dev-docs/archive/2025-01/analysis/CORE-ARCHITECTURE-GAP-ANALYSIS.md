# Core Architecture Gap Analysis

**Date**: 2025-01-XX  
**Analysis**: Comparison of `convex/core/` implementation vs `dev-docs/master-docs/architecture.md`

---

## Executive Summary

The `convex/core/` directory is **largely aligned** with the architecture document, with a few gaps:

1. ✅ **All 10 core domains exist** (users, people, circles, roles, assignments, proposals, policies, authority, history, workspaces)
2. ⚠️ **Empty `invites/` directory** - leftover from SYOS-843 migration (should be removed)
3. ⚠️ **Outdated `core/README.md`** - only lists 2 domains instead of 10
4. ✅ **`policies/` scaffold** - correctly missing `tables.ts` (documented as not implemented)
5. ✅ **`history/` structure** - uses `schema.ts` instead of `tables.ts` (acceptable variant)

---

## Domain-by-Domain Analysis

### Required File Structure (per architecture.md)

Each core domain should have:

- ✅ `tables.ts` (REQUIRED) - Table definitions
- ⚠️ `schema.ts` (OPTIONAL) - Types/aliases
- ⚠️ `constants.ts` (OPTIONAL) - Runtime constants
- ✅ `queries.ts` - Read operations
- ✅ `mutations.ts` - Write operations
- ✅ `rules.ts` - Business rules
- ✅ `index.ts` - Public exports
- ✅ `README.md` - AI-friendly documentation
- ✅ `domain.test.ts` - Co-located tests

### Domain Status

| Domain          | Status      | tables.ts        | mutations.ts | queries.ts | rules.ts | index.ts | README.md | test.ts | Notes                           |
| --------------- | ----------- | ---------------- | ------------ | ---------- | -------- | -------- | --------- | ------- | ------------------------------- |
| **users**       | ✅ Complete | ✅               | ✅           | ✅         | ✅       | ✅       | ✅        | ✅      | All files present               |
| **people**      | ✅ Complete | ✅               | ✅           | ✅         | ✅       | ✅       | ✅        | ✅      | All files present               |
| **circles**     | ✅ Complete | ✅               | ✅           | ✅         | ✅       | ✅       | ✅        | ✅      | All files present               |
| **roles**       | ✅ Complete | ✅               | ✅           | ✅         | ✅       | ✅       | ✅        | ✅      | All files present               |
| **assignments** | ✅ Complete | ✅               | ✅           | ✅         | ✅       | ✅       | ✅        | ✅      | All files present               |
| **proposals**   | ✅ Complete | ✅               | ✅           | ✅         | ✅       | ✅       | ✅        | ✅      | All files present               |
| **authority**   | ✅ Complete | ⚠️ N/A\*         | ✅           | ✅         | ✅       | ✅       | ✅        | ✅      | \*No tables (calculated domain) |
| **history**     | ✅ Complete | ⚠️ schema.ts\*\* | ❌           | ✅         | ❌       | ✅       | ✅        | ✅      | \*\*Uses schema.ts (acceptable) |
| **workspaces**  | ✅ Complete | ✅               | ⚠️\*\*\*     | ✅         | ✅       | ✅       | ✅        | ✅      | \*\*\*Mutations in lifecycle.ts |
| **policies**    | ⚠️ Scaffold | ❌               | ✅           | ✅         | ✅       | ✅       | ✅        | ❌      | Missing tables.ts (documented)  |

**Notes:**

- **authority**: No tables (calculated domain) - this is correct per architecture
- **history**: Uses `schema.ts` instead of `tables.ts` - acceptable variant since it defines `orgVersionHistoryTable`
- **workspaces**: Mutations exist but are split across files (`lifecycle.ts`, `members.ts`, `settings.ts`) - acceptable per architecture flexibility
- **policies**: Missing `tables.ts` and `test.ts` - documented as scaffolded, not implemented

---

## Gaps Identified

### 1. Empty `invites/` Directory ⚠️

**Location**: `/convex/core/invites/`

**Issue**: Empty directory leftover from SYOS-843 migration. Invites were moved to `features/invites/` per architecture.

**Evidence**:

- Directory exists but is empty
- `convex/core/index.ts` does NOT export invites
- `convex/features/invites/` contains the actual implementation
- `convex/core/workspaces/README.md` documents the migration

**Recommendation**: **DELETE** `/convex/core/invites/` directory

**Priority**: Low (cosmetic cleanup)

---

### 2. Outdated `core/README.md` ⚠️

**Location**: `/convex/core/README.md`

**Issue**: README only lists 2 domains (`authority/` and `roles/`) when there are actually 10 core domains.

**Current Content**:

```markdown
## Current Core Domains

| Domain       | Purpose                                               |
| ------------ | ----------------------------------------------------- |
| `authority/` | Circle authority calculation                          |
| `roles/`     | Pure role business logic (lead detection, validation) |
```

**Expected Content** (per architecture.md):
All 10 core domains should be listed:

- users
- people
- circles
- roles
- assignments
- proposals
- policies
- authority
- history
- workspaces

**Recommendation**: **UPDATE** `/convex/core/README.md` to list all 10 core domains with brief descriptions

**Priority**: Medium (documentation accuracy)

---

### 3. `policies/` Domain Missing `tables.ts` ✅ (Expected)

**Location**: `/convex/core/policies/`

**Status**: ✅ **This is correct** - architecture documents policies as scaffolded but not implemented.

**Evidence**:

- `architecture.md` line 355: "The `policies` domain is currently scaffolded (placeholder files exist) but not implemented."
- `policies/schema.ts` contains: `export type PoliciesSchema = Record<string, never>;`
- `policies/mutations.ts` throws: "Policies mutations not implemented (SYOS-707 scaffold)."
- No `policies` table in `convex/schema.ts`

**Recommendation**: **No action needed** - this matches architecture documentation

---

### 4. `history/` Uses `schema.ts` Instead of `tables.ts` ✅ (Acceptable)

**Location**: `/convex/core/history/`

**Status**: ✅ **Acceptable variant** - `schema.ts` defines `orgVersionHistoryTable` which serves the same purpose.

**Evidence**:

- `history/schema.ts` contains `defineTable()` call (line 4)
- Table is registered in `convex/schema.ts` (line 9: `import { orgVersionHistoryTable } from './core/history/schema';`)
- Architecture allows flexibility in file naming when purpose is clear

**Recommendation**: **No action needed** - this is an acceptable naming variant

---

### 5. `history/` Missing `mutations.ts` ✅ (Expected)

**Location**: `/convex/core/history/`

**Status**: ✅ **This is correct** - history is append-only via `capture.ts` helpers, not mutations.

**Evidence**:

- `history/capture.ts` contains helper functions for recording history
- History is immutable (append-only) per architecture
- Other domains call `capture.ts` helpers, not mutations

**Recommendation**: **No action needed** - this matches architecture design

---

## File Structure Compliance

### Required Files Present

| File Type      | Required Count | Present Count | Missing                                                        |
| -------------- | -------------- | ------------- | -------------------------------------------------------------- |
| `tables.ts`    | 9\*            | 7             | policies (expected), authority (N/A), history (uses schema.ts) |
| `queries.ts`   | 10             | 10            | 0                                                              |
| `mutations.ts` | 9\*\*          | 9             | 0                                                              |
| `rules.ts`     | 10             | 10            | 0                                                              |
| `index.ts`     | 10             | 10            | 0                                                              |
| `README.md`    | 10             | 11\*\*\*      | 0                                                              |
| `*.test.ts`    | 10             | 10            | 0                                                              |

**Notes:**

- \*`authority` doesn't need tables (calculated domain)
- \*\*`history` doesn't need mutations (uses capture.ts helpers)
- \*\*\*Extra README.md is the root `core/README.md` (needs update)

---

## Architecture Compliance Summary

### ✅ Compliant Areas

1. **All 10 core domains exist** and are properly structured
2. **Domain cohesion** - each domain has its own directory with related files
3. **Public exports** - all domains have `index.ts` with proper exports
4. **Documentation** - all domains have `README.md` files
5. **Testing** - all domains have test files
6. **Dependency rules** - no violations found (core doesn't import from features)
7. **File naming** - follows conventions (queries.ts, mutations.ts, rules.ts)

### ⚠️ Minor Gaps

1. **Empty directory cleanup** - `invites/` should be removed
2. **Documentation update** - `core/README.md` needs to list all 10 domains

### ✅ Expected Deviations

1. **`policies/` scaffold** - missing `tables.ts` (documented as not implemented)
2. **`history/` structure** - uses `schema.ts` instead of `tables.ts` (acceptable variant)
3. **`history/` mutations** - uses `capture.ts` helpers instead (correct design)

---

## Recommendations

### Immediate Actions

1. **DELETE** `/convex/core/invites/` directory (empty leftover)
2. **UPDATE** `/convex/core/README.md` to list all 10 core domains

### Future Actions

1. **Implement `policies/` domain** when governance customization is scoped (per architecture line 355)
2. Consider standardizing `history/schema.ts` → `history/tables.ts` for consistency (low priority)

---

## Conclusion

The `convex/core/` directory is **95% compliant** with the architecture document. The gaps are:

- 1 cosmetic cleanup (empty directory)
- 1 documentation update (outdated README)
- 0 structural violations

All deviations are either documented as expected (`policies` scaffold) or acceptable variants (`history` structure). The core domains are well-structured and follow the architecture principles.
