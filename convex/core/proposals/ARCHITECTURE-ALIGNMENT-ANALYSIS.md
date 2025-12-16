# Proposals Domain Architecture Alignment Analysis

**Date**: 2025-01-XX  
**Status**: Analysis Complete - Alignment Plan Required

---

## Executive Summary

The `convex/core/proposals` domain does **not** match the architecture patterns defined in `dev-docs/master-docs/architecture.md`. The domain has excessive file fragmentation, incorrect export patterns, and violates domain cohesion principles.

**Key Issues:**
1. Mutations scattered across 3 files instead of consolidated in `mutations.ts`
2. Queries in `proposalQueries.ts` instead of `queries.ts`
3. Business rules split across 4 files instead of consolidated in `rules.ts`
4. Circular/confusing export chains (`mutations.ts` → `queries.ts` → `proposalService.ts`)
5. Test file incorrectly named (`queries.test.ts` instead of `proposals.test.ts`)

---

## Architecture Requirements (from architecture.md)

### Expected File Structure

According to **architecture.md lines 877-892**, each core domain should follow:

```
domain/
├── tables.ts       # REQUIRED - Table definitions
├── schema.ts       # OPTIONAL - Types, aliases, re-exports
├── constants.ts    # OPTIONAL - Runtime constants with derived types
├── queries.ts      # Read operations
├── mutations.ts    # Write operations
├── rules.ts        # Business rules (pure + contextual)
├── index.ts        # Public exports only
├── README.md       # AI-friendly documentation
└── domain.test.ts  # Co-located tests
```

### Key Principles Violated

| Principle | Requirement | Current State | Violation |
|-----------|-------------|---------------|-----------|
| **#1** | Core domains are foundational and complete (tables + queries + mutations + rules) | ✅ Has all required files | ❌ But structure is wrong |
| **#18** | Functions do one thing at appropriate abstraction level | ✅ Functions are focused | ⚠️ But files are too fragmented |
| **#32** | Domain files ~300 lines guideline; split only with reason | ⚠️ Multiple small files | ❌ Violates cohesion |
| **#6** | Domains communicate through explicit interfaces (`index.ts` exports) | ⚠️ Has index.ts | ❌ But exports are confusing |

---

## Current Structure Analysis

### Files Present

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `tables.ts` | 79 | Table definitions | ✅ Correct |
| `schema.ts` | 10 | Type aliases | ✅ Correct (minimal) |
| `queries.ts` | 2 | Re-exports from `proposalService.ts` | ❌ **Wrong** - should contain actual queries |
| `mutations.ts` | 18 | Re-exports from `queries.ts` | ❌ **Wrong** - mutations shouldn't come from queries |
| `rules.ts` | 22 | Re-exports from `stateMachine` + `validation` | ⚠️ Partially correct |
| `index.ts` | 11 | Public exports | ✅ Correct structure |
| `README.md` | 71 | Documentation | ✅ Present |
| `proposalTypes.ts` | 10 | Type definitions | ⚠️ Should be in `schema.ts` or `constants.ts` |
| `proposalService.ts` | 7 | Re-export aggregator | ❌ **Anti-pattern** - unnecessary layer |
| `proposalQueries.ts` | 287 | Actual query implementations | ❌ **Wrong location** - should be in `queries.ts` |
| `proposalDrafts.ts` | 319 | Draft mutations | ❌ **Wrong location** - should be in `mutations.ts` |
| `proposalMeetings.ts` | 212 | Meeting-related mutations | ❌ **Wrong location** - should be in `mutations.ts` |
| `proposalDecision.ts` | 281 | Decision mutations | ❌ **Wrong location** - should be in `mutations.ts` |
| `proposalAccess.ts` | 46 | Access control rules | ⚠️ Should be in `rules.ts` |
| `stateMachine.ts` | 77 | State machine rules | ⚠️ Should be in `rules.ts` |
| `validation.ts` | 27 | Validation rules | ⚠️ Should be in `rules.ts` |
| `queries.test.ts` | 132 | Tests | ⚠️ Should be `proposals.test.ts` |
| `stateMachine.test.ts` | 87 | State machine tests | ⚠️ Should be in `proposals.test.ts` |

**Total**: 18 files  
**Expected**: ~8 files (tables, schema, queries, mutations, rules, index, README, test)

---

## Detailed Violations

### 1. Mutations Scattered Across Multiple Files

**Violation**: Mutations are split across 3 files instead of consolidated in `mutations.ts`

**Current State:**
- `proposalDrafts.ts`: `create`, `addEvolution`, `removeEvolution`, `withdraw`, `createFromDiff`
- `proposalMeetings.ts`: `submit`, `importToMeeting`, `startProcessing`
- `proposalDecision.ts`: `approve`, `reject`

**Architecture Requirement** (line 210): `mutations.ts` should contain all write operations

**Impact**: 
- Violates domain cohesion (Principle #18, #32)
- Makes it hard to find all mutations
- Creates unnecessary import chains

---

### 2. Queries in Wrong File

**Violation**: Queries are in `proposalQueries.ts` instead of `queries.ts`

**Current State:**
- `queries.ts` (2 lines): Just re-exports `proposalService.ts`
- `proposalQueries.ts` (287 lines): Contains actual query implementations:
  - `list`, `get`, `getByAgendaItem`, `listByCircle`, `myListDrafts`, `listForMeetingImport`

**Architecture Requirement** (line 209): `queries.ts` should contain read operations

**Impact**:
- Violates expected file naming
- Creates confusion about where queries live
- Breaks AI navigation patterns

---

### 3. Business Rules Fragmented

**Violation**: Business rules split across 4 files instead of consolidated in `rules.ts`

**Current State:**
- `rules.ts` (22 lines): Only re-exports + `requireProposal` helper
- `stateMachine.ts` (77 lines): State machine logic
- `validation.ts` (27 lines): Validation helpers
- `proposalAccess.ts` (46 lines): Access control checks

**Architecture Requirement** (line 211): `rules.ts` should contain business rules (pure + contextual)

**Impact**:
- Violates single responsibility for rules file
- Makes it hard to find all business logic
- Creates unnecessary file navigation

---

### 4. Circular/Confusing Export Chain

**Violation**: `mutations.ts` re-exports from `queries.ts`, which re-exports from `proposalService.ts`

**Current Export Chain:**
```
index.ts
  → queries.ts
      → proposalService.ts
          → proposalQueries.ts (actual queries)
          → proposalDrafts.ts (mutations!)
          → proposalMeetings.ts (mutations!)
          → proposalDecision.ts (mutations!)
  → mutations.ts
      → queries.ts (wrong! mutations shouldn't come from queries)
```

**Architecture Requirement** (line 212): `index.ts` should export from `queries.ts`, `mutations.ts`, `rules.ts` directly

**Impact**:
- Mutations incorrectly exported through queries
- Creates circular dependency risk
- Violates explicit interface principle (#6)

---

### 5. Type Definitions Scattered

**Violation**: `proposalTypes.ts` exists separately when it should be in `schema.ts` or `constants.ts`

**Current State:**
- `proposalTypes.ts`: Contains `ProposalStatus` type
- `schema.ts`: Only has `CircleProposalDoc` and `ProposalEvolutionDoc` type aliases

**Architecture Guidance** (lines 894-936):
- `schema.ts`: Types and aliases, can re-export from `constants.ts`
- `constants.ts`: Runtime constants with derived types (for enums used at runtime)

**Recommendation**: Since `ProposalStatus` is used at runtime (state machine, validation), it should be in `constants.ts` with derived type, then re-exported from `schema.ts`

---

### 6. Test File Naming

**Violation**: Test file is `queries.test.ts` instead of `proposals.test.ts`

**Current State:**
- `queries.test.ts`: Tests for queries
- `stateMachine.test.ts`: Tests for state machine

**Architecture Requirement** (line 214): Co-located tests should be `{domain}.test.ts`

**Impact**:
- Violates naming convention
- Makes it unclear these are domain tests
- Should consolidate both test files into `proposals.test.ts`

---

## Comparison with Reference Domain (circles)

The `circles` domain follows the architecture correctly:

```
circles/
├── tables.ts          ✅ Table definitions
├── schema.ts          ✅ Types/aliases
├── constants.ts       ✅ Runtime constants
├── queries.ts         ✅ Actual query implementations
├── mutations.ts       ✅ Actual mutation implementations
├── rules.ts           ✅ Business rules
├── index.ts           ✅ Clean exports
├── README.md          ✅ Documentation
└── circles.test.ts    ✅ Co-located tests (correctly named)
```

**Additional files in circles** (acceptable per architecture):
- `circleAccess.ts`, `circleArchival.ts`, etc. - These are **helpers** extracted for readability
- They are **not** exported from `index.ts` directly
- They are used **internally** by `queries.ts` and `mutations.ts`

**Key Difference**: Circles domain extracts helpers but keeps main files (`queries.ts`, `mutations.ts`) as the primary implementations. Proposals domain has the main implementations scattered.

---

## Domain Cohesion Analysis

### Architecture Principle #32 (Clarified)

> **Domain files ~300 lines guideline; split only with reason**

**When to split:**
- File has multiple unrelated responsibilities ✅ (proposals has related responsibilities)
- You're scrolling constantly to find things ⚠️ (could consolidate)
- Tests for the file are hard to organize ⚠️ (tests are split)

**When NOT to split:**
- Domain is cohesive and the file is 400 lines ✅ (proposals is cohesive)
- Splitting would create circular imports ❌ (current structure has this risk)
- Splitting would scatter related logic across files ❌ (current state)

**The test:** Can you name the new file something meaningful?  
- `proposalDrafts.ts` ✅ (meaningful)
- `proposalMeetings.ts` ✅ (meaningful)
- `proposalDecision.ts` ✅ (meaningful)

**BUT**: These are **mutations**, not separate domains. They should be in `mutations.ts` with internal helper functions if needed.

---

## Impact Assessment

### High Priority Issues

1. **Mutations in wrong files** - Breaks expected structure, violates cohesion
2. **Queries in wrong file** - Breaks AI navigation patterns
3. **Export chain confusion** - Mutations exported through queries is wrong

### Medium Priority Issues

4. **Business rules fragmented** - Makes it harder to find all rules
5. **Test file naming** - Violates convention, should consolidate

### Low Priority Issues

6. **Type definitions** - Could be better organized but not blocking

---

## Recommendations

### Immediate Actions Required

1. **Consolidate mutations** into `mutations.ts`
   - Move all mutation exports from `proposalDrafts.ts`, `proposalMeetings.ts`, `proposalDecision.ts`
   - Keep helper functions internal or extract to helpers if >300 lines

2. **Move queries** from `proposalQueries.ts` to `queries.ts`
   - Delete `proposalQueries.ts` after migration
   - Update `index.ts` exports

3. **Consolidate business rules** into `rules.ts`
   - Move state machine, validation, and access control logic
   - Keep as internal helpers or extract if >300 lines

4. **Fix export chain**
   - `mutations.ts` should export mutations directly, not through `queries.ts`
   - Delete `proposalService.ts` (unnecessary layer)

5. **Rename test file** to `proposals.test.ts`
   - Consolidate `queries.test.ts` and `stateMachine.test.ts`

6. **Move types** to `constants.ts` or `schema.ts`
   - `ProposalStatus` → `constants.ts` (used at runtime)
   - Re-export from `schema.ts` if needed

### Optional Improvements

7. **Extract helpers** if `mutations.ts` or `queries.ts` exceed 300 lines
   - Follow circles domain pattern (internal helpers, not exported)
   - Keep main files as primary implementations

---

## Migration Strategy

See `ARCHITECTURE-ALIGNMENT-PLAN.md` for detailed step-by-step migration plan.

---

## References

- **Architecture Document**: `dev-docs/master-docs/architecture.md`
- **Domain Structure**: Lines 877-892
- **File Naming**: Lines 209-214
- **Domain Cohesion**: Lines 64-80 (Trade-off Guidance)
- **Reference Domain**: `convex/core/circles/` (correctly structured)

