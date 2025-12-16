# Circles Domain Architecture Alignment Analysis

**Date**: 2025-01-XX  
**Status**: Analysis Complete - Plan Required

## Executive Summary

The `convex/core/circles` folder does not match the architecture specification in `dev-docs/master-docs/architecture.md`. The main issues are:

1. **Mutations are in queries.ts** - Violates separation of concerns
2. **mutations.ts is just a re-export** - Should contain actual mutation implementations
3. **Multiple scattered helper files** - Should be consolidated into `rules.ts` or kept as internal helpers
4. **Test files not consolidated** - Should be in single `circles.test.ts` file
5. **Documentation files in domain folder** - Should be moved to `dev-docs/` or removed

## Current Structure

```
convex/core/circles/
├── tables.ts                    ✅ REQUIRED - Correct
├── schema.ts                    ✅ OPTIONAL - Correct
├── constants.ts                 ✅ OPTIONAL - Correct
├── queries.ts                   ⚠️ ISSUE - Contains mutations!
├── mutations.ts                 ⚠️ ISSUE - Just re-exports from queries.ts
├── rules.ts                     ✅ Correct (but minimal)
├── index.ts                     ✅ Correct
├── README.md                    ✅ Correct
│
├── circleLifecycle.ts           ⚠️ Should be in rules.ts or mutations.ts
├── circleCoreRoles.ts           ⚠️ Should be in rules.ts
├── circleArchival.ts            ⚠️ Should be in rules.ts or mutations.ts
├── circleMembers.ts             ⚠️ Should be in rules.ts or mutations.ts
├── circleAccess.ts              ⚠️ Should be in rules.ts
├── circleList.ts                ⚠️ Should be in queries.ts
├── validation.ts                ⚠️ Should be in rules.ts
├── slug.ts                      ⚠️ Should be in rules.ts
├── triggers.ts                  ⚠️ Not in architecture spec (but may be needed)
│
├── queries.test.ts              ⚠️ Should be consolidated
├── circleLifecycle.test.ts      ⚠️ Should be consolidated
├── circleArchival.test.ts       ⚠️ Should be consolidated
├── circleMembers.test.ts        ⚠️ Should be consolidated
├── validation.test.ts           ⚠️ Should be consolidated
├── slug.test.ts                 ⚠️ Should be consolidated
│
├── CONSTANTS-ANALYSIS.md        ❌ Should be in dev-docs/
├── CONSTANTS-MIGRATION.md       ❌ Should be in dev-docs/
└── ESLINT-VIOLATIONS-REPORT.md  ❌ Should be in dev-docs/ or removed
```

## Architecture Requirements

According to `dev-docs/master-docs/architecture.md` §877-892:

```
domain/
├── tables.ts       # REQUIRED - Table definitions
├── schema.ts       # OPTIONAL - Types, aliases, re-exports
├── constants.ts    # OPTIONAL - Runtime constants
├── queries.ts      # Read operations ONLY
├── mutations.ts    # Write operations ONLY
├── rules.ts        # Business rules (pure + contextual)
├── index.ts        # Public exports only
├── README.md       # AI-friendly documentation
└── domain.test.ts  # Co-located tests (SINGLE FILE)
```

## Detailed Findings

### 1. Mutations in queries.ts (CRITICAL)

**Issue**: `queries.ts` contains both queries AND mutations:

- Lines 86-114: `create` mutation
- Lines 116-127: `update` mutation
- Lines 129-157: `updateInline` mutation
- Lines 159-167: `archive` mutation
- Lines 169-177: `restore` mutation
- Lines 179-188: `addMember` mutation
- Lines 190-199: `removeMember` mutation

**Architecture Violation**: Principle #8 states "Queries are pure reads with reactive subscriptions". Mutations should be in `mutations.ts`.

**Impact**:

- Violates separation of concerns
- Makes it harder to find write operations
- Confuses AI agents following architecture

### 2. mutations.ts is a Re-export (CRITICAL)

**Issue**: `mutations.ts` only contains:

```typescript
export { create, update, updateInline, archive, restore, addMember, removeMember } from './queries';
```

**Architecture Violation**: `mutations.ts` should contain actual mutation implementations, not re-exports.

**Impact**:

- Misleading file name
- Violates architecture pattern
- Makes mutations harder to find

### 3. Helper Files Scattered (MODERATE)

**Issue**: Business logic is split across multiple files:

- `circleLifecycle.ts` (284 lines) - Create/update logic
- `circleCoreRoles.ts` (340 lines) - Role auto-creation
- `circleArchival.ts` (124 lines) - Archive/restore logic
- `circleMembers.ts` (147 lines) - Member management
- `circleAccess.ts` (60 lines) - Access control helpers
- `circleList.ts` (107 lines) - List query logic
- `validation.ts` (49 lines) - Validation helpers
- `slug.ts` (65 lines) - Slug generation

**Architecture Guidance**:

- Architecture says "rules.ts" is for "Business rules (pure + contextual)"
- Architecture also says "300-line guideline" is a smell, not a rule
- Trade-off guidance: "Domain cohesion over technical purity"

**Analysis**:

- These files are cohesive (all circle-related)
- Total ~1,176 lines - splitting into rules.ts would create a 1,200+ line file
- Current organization is actually MORE readable than one giant file

**Recommendation**: Keep helper files but document them as "internal implementation details" in README.md. They're not exported via `index.ts`, so they're implementation details.

### 4. Test Files Not Consolidated (MODERATE)

**Issue**: Tests are split across 6 files:

- `queries.test.ts`
- `circleLifecycle.test.ts`
- `circleArchival.test.ts`
- `circleMembers.test.ts`
- `validation.test.ts`
- `slug.test.ts`

**Architecture Requirement**: Single `circles.test.ts` file

**Impact**:

- Harder to find all tests
- Violates architecture pattern
- But: Tests are co-located with source files (good)

**Recommendation**: Consolidate into `circles.test.ts` OR keep separate if total would exceed 500+ lines (readability trade-off).

### 5. Documentation Files in Domain Folder (LOW)

**Issue**: Three markdown files that don't belong:

- `CONSTANTS-ANALYSIS.md` - Historical analysis
- `CONSTANTS-MIGRATION.md` - Historical migration notes
- `ESLINT-VIOLATIONS-REPORT.md` - Linter report

**Architecture**: Domain folders should only contain code and README.md

**Recommendation**: Move to `dev-docs/2-areas/patterns/` or delete if obsolete.

### 6. triggers.ts Not in Architecture Spec (INFO)

**Issue**: `triggers.ts` exists but isn't mentioned in architecture

**Analysis**:

- File comments say "Triggers are registered but not active"
- Used for future automatic history capture
- May be needed for infrastructure

**Recommendation**: Keep if needed, or remove if truly unused.

## Comparison with Other Core Domains

### roles/ Domain Structure

```
roles/
├── tables.ts
├── schema.ts
├── queries.ts
├── mutations.ts
├── rules.ts
├── index.ts
├── README.md
├── [many helper files similar to circles]
└── [multiple test files]
```

**Observation**: `roles/` domain also has scattered helper files and multiple test files. This suggests the architecture pattern may need clarification OR both domains need alignment.

## Impact Assessment

| Issue                   | Severity | Impact                              | Effort |
| ----------------------- | -------- | ----------------------------------- | ------ |
| Mutations in queries.ts | CRITICAL | High - Violates core principle      | Medium |
| mutations.ts re-export  | CRITICAL | High - Misleading                   | Low    |
| Scattered helpers       | MODERATE | Low - Actually improves readability | High   |
| Test consolidation      | MODERATE | Medium - Consistency                | Medium |
| Doc files cleanup       | LOW      | Low - Just cleanup                  | Low    |

## Recommendations

### Priority 1: Fix Critical Issues

1. **Move mutations from queries.ts to mutations.ts**
   - Extract all mutation handlers from `queries.ts`
   - Implement them properly in `mutations.ts`
   - Update `index.ts` exports

2. **Keep queries.ts pure**
   - Only query handlers in `queries.ts`
   - Move `listCircles` helper into `queries.ts` (it's query logic)

### Priority 2: Consolidate Tests

3. **Consolidate test files**
   - Merge all test files into `circles.test.ts`
   - Use describe blocks to organize by feature
   - Keep tests co-located with domain

### Priority 3: Cleanup Documentation

4. **Move or remove doc files**
   - Move historical docs to `dev-docs/2-areas/patterns/`
   - Remove obsolete files

### Priority 4: Document Helper Files

5. **Update README.md**
   - Document that helper files are internal implementation details
   - Explain why they're separate (readability, cohesion)
   - Reference architecture trade-off guidance

## Questions for Architecture Review

1. **Helper Files**: Should domains with 1,000+ lines of business logic be allowed to split into helper files for readability, or should everything go into `rules.ts`?

2. **Test Files**: Should test consolidation be enforced even if it creates 500+ line test files?

3. **triggers.ts**: Should infrastructure files like triggers be documented in architecture, or are they implementation details?

## Next Steps

1. Review this analysis with team
2. Get clarification on helper files vs rules.ts
3. Create implementation plan
4. Execute Priority 1 fixes
5. Execute Priority 2-4 cleanup
