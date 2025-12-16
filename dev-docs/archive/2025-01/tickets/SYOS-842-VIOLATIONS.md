# SYOS-842: Schema-Level Validation Violations

**Created**: 2025-12-13  
**Status**: ESLint rule implemented and active in CI

---

## Summary

ESLint rule `no-userid-in-audit-fields` now enforces XDOM-01 and XDOM-02 invariants at the schema level.

**Current State:**

- ✅ Rule implemented: `eslint-rules/no-userid-in-audit-fields.js`
- ✅ Rule active in CI: Will catch violations in PRs
- ✅ Tests passing: `eslint-rules/__tests__/no-userid-in-audit-fields.test.js`
- ⚠️ **2 tables with violations** (pre-existing)

---

## Current Violations

### 1. `convex/features/projects/tables.ts`

**Field:** `createdBy: v.id('users')` (line 21)

**Issue:**

- Uses `v.id('users')` instead of `v.id('people')`
- Field name should be `createdByPersonId`

**Fix Required:**

```typescript
// ❌ Current
createdBy: v.id('users'),

// ✅ Should be
createdByPersonId: v.id('people'),
```

**Migration Impact:**

- Need to migrate existing `projects` records
- Update all code that references `createdBy` field

**Tracking:** SYOS-851

---

### 2. `convex/features/tasks/tables.ts`

**Field:** `createdBy: v.id('users')` (line 19)

**Issue:**

- Uses `v.id('users')` instead of `v.id('people')`
- Field name should be `createdByPersonId`

**Fix Required:**

```typescript
// ❌ Current
createdBy: v.id('users'),

// ✅ Should be
createdByPersonId: v.id('people'),
```

**Migration Impact:**

- Need to migrate existing `tasks` records
- Update all code that references `createdBy` field
- Note: Tasks also has `assigneeUserId` field (line 11) - this is ALLOWED per architecture.md (whitelisted target identifier)

**Tracking:** SYOS-852

---

## Known Exceptions (Working as Intended)

These are **NOT** violations - they are legitimate uses of `userId` in infrastructure-level code:

### 1. `convex/core/workspaces/tables.ts`

**Field:** `branding.updatedBy: v.id('users')` (line 19)

**Why Allowed:**

- Infrastructure-level feature (workspace branding)
- Explicitly listed in INVARIANTS.md Known Exceptions
- ESLint rule has explicit exception for this field

### 2. `convex/infrastructure/rbac/` tables

**Why Allowed:**

- RBAC tables are infrastructure, not core domain
- They track system-level permissions that may span workspaces
- Entire directory is excluded from ESLint rule

### 3. `convex/core/workspaces/tables.ts` - Invite fields

**Fields:** `invitedBy`, `invitedUserId`

**Why Allowed:**

- Pre-person creation flow (invites sent before user accepts)
- No `personId` exists yet at invite time
- Explicitly listed in INVARIANTS.md Known Exceptions

---

## Recommended Action Plan

### Phase 1: Prevent New Violations ✅

- [x] Implement ESLint rule (SYOS-842)
- [x] Add to CI pipeline
- [x] Document violations

### Phase 2: Fix Existing Violations

Create tickets for each violation (ticket IDs TBD):

1. **SYOS-851**: Migrate `projects` table `createdBy` → `createdByPersonId`
   - Schema migration
   - Data migration
   - Code updates (queries/mutations)
2. **SYOS-852**: Migrate `tasks` table `createdBy` → `createdByPersonId`
   - Schema migration
   - Data migration
   - Code updates (queries/mutations)

**Priority:** Medium (can be done incrementally)  
**Blocking:** No - new code won't introduce violations (ESLint prevents it)

### Phase 3: Verify Compliance

After migrations:

- [ ] Run `npm run lint` → 0 violations
- [ ] Run invariant checks → All pass
- [ ] Update this document → Close SYOS-842

---

## ESLint Rule Details

**Rule:** `synergyos/no-userid-in-audit-fields`  
**File:** `eslint-rules/no-userid-in-audit-fields.js`  
**Active:** Yes (runs in `npm run lint` and CI)

**What it checks:**

- All `*.tables.ts` files in `convex/` directory
- Fields matching audit patterns: `createdBy`, `updatedBy`, `archivedBy`, `deletedBy`, `modifiedBy`, `changedBy`
- Flags if these fields use `v.id('users')` instead of `v.id('people')`
- Flags if field name doesn't end with `PersonId`

**Exceptions:**

- RBAC tables (`convex/infrastructure/rbac/`, `convex/rbac/`)
- Workspace branding (`branding.updatedBy`)
- Workspace invites (`invitedBy`, `invitedUserId`)

**Error messages:**

```
Audit field "createdBy" should be renamed to "createdByPersonId"
Audit field "createdBy" uses v.id('users') instead of v.id('people')
```

---

## Related Documentation

- `convex/admin/invariants/INVARIANTS.md` - XDOM-01, XDOM-02 definitions
- `dev-docs/master-docs/architecture.md` - Identity Architecture section
- `eslint-rules/no-userid-in-audit-fields.js` - Implementation
- `eslint-rules/__tests__/no-userid-in-audit-fields.test.js` - Tests

---

## Success Criteria (SYOS-842)

- [x] ESLint rule created
- [x] Rule runs in CI
- [x] Current violations documented
- [x] INVARIANTS.md updated with clarification
- [ ] Follow-up tickets created (SYOS-843, SYOS-844)

**SYOS-842 can be closed once follow-up tickets are created.**

---

_This document tracks schema-level violations. Update it as violations are fixed._
