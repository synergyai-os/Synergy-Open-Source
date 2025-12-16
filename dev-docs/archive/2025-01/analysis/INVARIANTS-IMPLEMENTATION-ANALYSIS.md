# Invariants Implementation Analysis

**Date**: 2025-12-11  
**Purpose**: Deep validation of `convex/admin/invariants` implementation to verify if SYOS-802 delivered schema-level checks or only data-level checks.

---

## Executive Summary

**Finding**: The invariants check **DATA** (records in the database), not **SCHEMA** (table definitions). This means:

1. ✅ They catch violations in existing records
2. ❌ They **DO NOT** catch schema definitions that allow violations
3. ❌ They **DO NOT** prevent new violations from being introduced via schema changes

**Critical Gap**: XDOM-01 and XDOM-02 claim to enforce architectural rules, but they only check data, not schema definitions. Schema violations can exist and new violations can be introduced without detection.

---

## What the Invariants Actually Do

### XDOM-01: "No userId references in core domain tables"

**What it checks** (from `crossDomain.ts:12-63`):

- Queries `circleItems`, `circleItemCategories`, `meetings`, `notes` tables
- Checks if **records** have `createdBy`, `updatedBy`, or `archivedBy` fields set
- Flags records that contain these fields

**What it does NOT check**:

- ❌ Schema definitions (`tables.ts` files)
- ❌ Whether schema allows `v.id('users')` in these fields
- ❌ TypeScript types that might allow violations

**Current Status**:

- Found **24 violations** in data (circleItemCategories with `createdBy` set)
- But schema **still allows** `createdBy: v.id('users')` in these tables

### XDOM-02: "All audit fields use personId pattern"

**What it checks** (from `crossDomain.ts:71-116`):

- Queries `circles`, `circleProposals`, `assignments` tables
- Checks if **records** have `createdByPersonId` field set
- Flags records missing `createdByPersonId`

**What it does NOT check**:

- ❌ Schema definitions
- ❌ Whether schema requires `createdByPersonId` vs allows `createdBy`
- ❌ Whether all `*By` fields follow the pattern

**Current Status**:

- ✅ Passes (no violations in data)
- But schema **still allows** `createdBy: v.id('users')` in other tables

---

## Schema Violations Found

### Core Domain Tables Using `userId` Instead of `personId`

| Table                  | Field        | Current Schema              | Should Be                                        | Status           |
| ---------------------- | ------------ | --------------------------- | ------------------------------------------------ | ---------------- |
| `circleItemCategories` | `createdBy`  | `v.id('users')`             | `createdByPersonId: v.id('people')`              | ❌ **VIOLATION** |
| `circleItemCategories` | `updatedBy`  | `v.optional(v.id('users'))` | `updatedByPersonId: v.optional(v.id('people'))`  | ❌ **VIOLATION** |
| `circleItemCategories` | `archivedBy` | `v.optional(v.id('users'))` | `archivedByPersonId: v.optional(v.id('people'))` | ❌ **VIOLATION** |
| `circleItems`          | `createdBy`  | `v.id('users')`             | `createdByPersonId: v.id('people')`              | ❌ **VIOLATION** |
| `circleItems`          | `updatedBy`  | `v.optional(v.id('users'))` | `updatedByPersonId: v.optional(v.id('people'))`  | ❌ **VIOLATION** |
| `circleItems`          | `archivedBy` | `v.optional(v.id('users'))` | `archivedByPersonId: v.optional(v.id('people'))` | ❌ **VIOLATION** |
| `projects`             | `createdBy`  | `v.id('users')`             | `createdByPersonId: v.id('people')`              | ❌ **VIOLATION** |
| `tasks`                | `createdBy`  | `v.id('users')`             | `createdByPersonId: v.id('people')`              | ❌ **VIOLATION** |

**Location**:

- `convex/core/circleItems/tables.ts:11,13,15,28,30,32`
- `convex/features/projects/tables.ts:21`
- `convex/features/tasks/tables.ts:19`

### Code Violations

**File**: `convex/core/workspaces/lifecycle.ts`

| Line | Issue                                                     | Expected                                |
| ---- | --------------------------------------------------------- | --------------------------------------- |
| 161  | `seedCircleItemCategories(ctx, workspaceId, userId, now)` | Should pass `personId`                  |
| 188  | `createdBy: userId`                                       | Should be `createdByPersonId: personId` |
| 217  | `createdBy: userId`                                       | Should be `createdByPersonId: personId` |

**Note**: Line 159 has a comment acknowledging this: `// NOTE: circleItemCategories schema still uses userId fields (createdBy: v.id('users'))`

---

## What Invariants Cannot Do

### Technical Limitation: Convex Queries Cannot Access Schema

Convex queries run at **runtime** and can only access:

- ✅ Database records via `ctx.db.query()`
- ✅ Computed values from records
- ❌ **NOT** schema definitions (`tables.ts` files)
- ❌ **NOT** TypeScript types
- ❌ **NOT** source code structure

**Implication**: Schema-level checks require **static analysis** (ESLint rules, TypeScript checks, or build-time scripts), not runtime queries.

---

## Comparison: What INVARIANTS.md Says vs What Code Does

| Invariant   | INVARIANTS.md Says                                        | What Code Actually Checks                                                                                                        |
| ----------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **XDOM-01** | "No `userId` references in core domain tables"            | ✅ Checks if **records** have `createdBy`/`updatedBy`/`archivedBy` fields<br>❌ Does NOT check if **schema** allows these fields |
| **XDOM-02** | "All `createdBy`/`updatedBy` audit fields use `personId`" | ✅ Checks if **records** have `createdByPersonId`<br>❌ Does NOT check if **schema** requires `*ByPersonId` pattern              |

---

## Test Results

### Running Invariants

```bash
npx convex run admin/invariants:runAll
```

**Results**:

- **Total**: 62 invariants
- **Passed**: 59
- **Failed**: 3 (all critical)
  - AUTH-01: 2 circles missing Lead assignment
  - AUTH-02: 2 workspaces missing Lead on root circle
  - **XDOM-01: 24 records still use userId-based references**

### XDOM-01 Violations Found

The invariant found **24 violations** in `circleItemCategories` records that have `createdBy` set. However:

1. ✅ **Data violations detected** (good)
2. ❌ **Schema violations NOT detected** (gap)
3. ❌ **New violations can still be introduced** via schema changes

---

## The Real Problem

### Scenario 1: Existing Violations

**Current State**:

- Schema allows `createdBy: v.id('users')` ✅ (schema validation disabled)
- Data has 24 records with `createdBy` set ✅ (detected by XDOM-01)
- Code passes `userId` where `personId` required ✅ (detected by manual review)

**What invariants catch**: ✅ Data violations  
**What invariants miss**: ❌ Schema violations, code violations

### Scenario 2: New Violations

**If a developer adds**:

```typescript
// New table definition
export const newTable = defineTable({
	createdBy: v.id('users') // ❌ Violates XDOM-01
	// ...
});
```

**What happens**:

- ✅ Schema compiles (validation disabled)
- ✅ Code can insert records with `createdBy`
- ❌ XDOM-01 will catch data violations **after** records are created
- ❌ **No prevention** - violations can be introduced and only caught later

---

## Recommendations

### Option 1: Add ESLint Rule for Schema Validation

**Create**: `eslint-rules/no-userid-in-core-tables.js`

```javascript
// Check tables.ts files for v.id('users') in core domain tables
// Flag: circleItemCategories, circleItems, projects, tasks, etc.
```

**Pros**:

- ✅ Catches violations at development time
- ✅ Prevents violations from being introduced
- ✅ Works with existing CI/CD

**Cons**:

- ❌ Requires maintaining list of "core" tables
- ❌ May need updates as schema evolves

### Option 2: TypeScript-Based Schema Validator

**Create**: `scripts/validate-schema.ts`

```typescript
// Parse schema.ts and all tables.ts files
// Check field names and types against rules
// Run in CI before deployment
```

**Pros**:

- ✅ More comprehensive than ESLint
- ✅ Can check field naming patterns (`*ByPersonId`)
- ✅ Can validate against architectural rules

**Cons**:

- ❌ Requires custom tooling
- ❌ May be complex to maintain

### Option 3: Hybrid Approach (Recommended)

1. **Keep runtime invariants** (XDOM-01, XDOM-02) for data validation
2. **Add ESLint rule** for schema validation
3. **Add pre-commit hook** to run both

**Benefits**:

- ✅ Runtime checks catch data violations (current)
- ✅ Static checks prevent schema violations (new)
- ✅ Comprehensive coverage

---

## Conclusion

### What SYOS-802 Delivered

✅ **Data-level invariant checks** - Working correctly  
✅ **Runtime validation** - Catches violations in existing records  
✅ **CI integration** - Can block deployments on violations

❌ **Schema-level validation** - **NOT IMPLEMENTED**  
❌ **Prevention of violations** - **NOT IMPLEMENTED**  
❌ **Architectural enforcement** - **PARTIAL** (data only, not schema)

### The Gap

**XDOM-01 and XDOM-02 claim to enforce architectural rules**, but they:

- ✅ Check **data** (records)
- ❌ Do **NOT** check **schema** (table definitions)
- ❌ Do **NOT** prevent new violations

**Result**: Schema violations can exist and new violations can be introduced without detection until data is created.

### Next Steps

1. **Acknowledge the gap**: Invariants check data, not schema
2. **Decide on approach**: ESLint rule, TypeScript validator, or hybrid
3. **Implement schema validation**: Add static checks to complement runtime checks
4. **Update INVARIANTS.md**: Clarify what invariants check (data) vs what needs separate tooling (schema)

---

## Appendix: Files Analyzed

- `convex/admin/invariants/index.ts` - Main runner
- `convex/admin/invariants/crossDomain.ts` - XDOM-01, XDOM-02 implementation
- `convex/admin/invariants/INVARIANTS.md` - Documentation
- `convex/core/circleItems/tables.ts` - Schema violations
- `convex/features/projects/tables.ts` - Schema violations
- `convex/features/tasks/tables.ts` - Schema violations
- `convex/core/workspaces/lifecycle.ts` - Code violations
- `convex/schema.ts` - Schema registration

---

**Report Generated**: 2025-12-11  
**Method**: Code analysis + runtime testing  
**Validation**: Invariants run against live database
