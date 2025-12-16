# Users Domain Architecture Alignment Plan

**Date**: 2025-01-XX  
**Status**: Ready for Implementation  
**Related**: `ARCHITECTURE-ALIGNMENT-ANALYSIS.md`

## Overview

This plan aligns `convex/core/users` with the architecture specification in `dev-docs/master-docs/architecture.md` by consolidating scattered files into the standard domain structure.

## Target Structure

```
convex/core/users/
├── tables.ts       ✅ (exists - no changes)
├── schema.ts       🆕 (create - type exports)
├── constants.ts    🆕 (create - extract from validation.ts)
├── queries.ts      ✏️ (update - add orgLinks and authLinks queries)
├── mutations.ts    🆕 (create - consolidate lifecycle.ts + authLinks mutations)
├── rules.ts        🆕 (create - consolidate validation.ts + profile.ts + access.ts)
├── index.ts        ✏️ (update - new exports)
├── README.md       ✏️ (update - file structure section)
└── users.test.ts   🆕 (create - consolidate access.test.ts + add more tests)
```

## Migration Steps

### Phase 1: Create New Files (No Breaking Changes)

#### Step 1.1: Create `constants.ts`
**Purpose**: Extract constants from `validation.ts`

**Content:**
```typescript
export const MAX_LINK_DEPTH = 3;
export const MAX_TOTAL_ACCOUNTS = 10;
```

**Action:**
- Create `convex/core/users/constants.ts`
- Move constants from `validation.ts`
- Update `validation.ts` to import from `constants.ts` (temporary)

#### Step 1.2: Create `schema.ts`
**Purpose**: Type exports and re-exports (optional but recommended)

**Content:**
```typescript
import type { Doc } from '../../_generated/dataModel';

export type UserDoc = Doc<'users'>;
export type AccountLinkDoc = Doc<'accountLinks'>;
export type UserSettingsDoc = Doc<'userSettings'>;

// Re-export types from constants.ts if needed
export type { /* any types from constants */ } from './constants';
```

**Action:**
- Create `convex/core/users/schema.ts`
- Add type exports following `people/schema.ts` pattern

#### Step 1.3: Create `rules.ts`
**Purpose**: Consolidate all business rules

**Content Structure:**
```typescript
// Session/Access Rules
export async function requireSessionUserId(...)
export async function requireProfilePermission(...)

// Profile Rules
export function calculateProfileName(...)

// Account Linking Rules
export async function linkExists(...)
export async function getTransitiveLinks(...)
export async function checkLinkDepth(...)
export async function ensureLinkable(...)
```

**Action:**
- Create `convex/core/users/rules.ts`
- Copy functions from:
  - `access.ts` → session/access rules
  - `profile.ts` → profile rules
  - `validation.ts` → account linking rules
- Import constants from `constants.ts`
- Keep existing imports (infrastructure, etc.)

**Files to Copy From:**
- `access.ts` (27 lines) → `rules.ts` (session/access section)
- `profile.ts` (8 lines) → `rules.ts` (profile section)
- `validation.ts` (101 lines) → `rules.ts` (account linking section)

#### Step 1.4: Create `mutations.ts`
**Purpose**: Consolidate all write operations

**Content Structure:**
```typescript
// User Lifecycle Mutations
export const syncUserFromWorkOS = mutation({...})
export const ensureWorkosUser = mutation({...})
export const updateUserProfile = mutation({...})

// Account Linking Mutations
export const addAccountLink = mutation({...})
export const linkAccounts = mutation({...})
export const removeAccountLink = mutation({...})
export const unlinkAccounts = mutation({...})

// Internal Helpers
async function upsertWorkosUser(...)
async function updateProfile(...)
async function createDirectedLink(...)
async function createBidirectionalLink(...)
async function removeBidirectionalLink(...)
```

**Action:**
- Create `convex/core/users/mutations.ts`
- Copy mutations from:
  - `lifecycle.ts` → user lifecycle mutations
  - `authLinks.ts` → account linking mutations
- Copy internal helpers from both files
- Import rules from `rules.ts` instead of scattered files
- Import constants from `constants.ts`

**Files to Copy From:**
- `lifecycle.ts` (135 lines) → `mutations.ts` (lifecycle section)
- `authLinks.ts` (212 lines) → `mutations.ts` (account linking section)

#### Step 1.5: Update `queries.ts`
**Purpose**: Add missing queries from `orgLinks.ts` and `authLinks.ts`

**Content to Add:**
```typescript
// From orgLinks.ts
export async function listOrgLinksForUser(...)

// From authLinks.ts
export const validateAccountLink = query({...})
export const listLinkedAccounts = query({...})
```

**Action:**
- Add `listOrgLinksForUser` function (or convert to query)
- Add `validateAccountLink` query from `authLinks.ts`
- Add `listLinkedAccounts` query from `authLinks.ts`
- Import rules from `rules.ts` where needed

**Note**: `listOrgLinksForUser` is currently a helper function. Consider:
- Option A: Keep as helper function (exported from `rules.ts`)
- Option B: Convert to query (if needs reactivity)
- **Recommendation**: Keep as helper in `rules.ts` since it's used internally

#### Step 1.6: Create `users.test.ts`
**Purpose**: Consolidate all tests

**Content:**
```typescript
// Tests from access.test.ts
describe('users/access helpers', () => {...})

// Add tests for:
// - Profile rules (calculateProfileName)
// - Account linking rules (linkExists, checkLinkDepth)
// - Mutations (if not already covered)
```

**Action:**
- Create `convex/core/users/users.test.ts`
- Copy tests from `access.test.ts`
- Update imports to use `rules.ts` instead of `access.ts`
- Add additional test coverage for other rules

### Phase 2: Update Exports and Dependencies

#### Step 2.1: Update `index.ts`
**Purpose**: Maintain public API stability

**New Content:**
```typescript
export * from './tables';
export * from './schema';
export * from './constants';
export * from './queries';
export * from './mutations';
export * from './rules';
```

**Action:**
- Update `index.ts` to export from new files
- Ensure all public exports are maintained
- Test that existing imports still work

#### Step 2.2: Update Internal Imports
**Purpose**: Fix imports within domain

**Files to Update:**
- `mutations.ts` - Import from `rules.ts` instead of `access.ts`, `profile.ts`, `validation.ts`
- `queries.ts` - Import from `rules.ts` if needed

**Action:**
- Search for imports of old files within `users/` directory
- Replace with imports from new consolidated files
- Run `npm run check` to verify

#### Step 2.3: Update External Imports
**Purpose**: Find and update all external references

**Action:**
- Search codebase for imports from:
  - `convex/core/users/lifecycle`
  - `convex/core/users/authLinks`
  - `convex/core/users/orgLinks`
  - `convex/core/users/validation`
  - `convex/core/users/profile`
  - `convex/core/users/access`
- Update to import from:
  - `convex/core/users/mutations` (for mutations)
  - `convex/core/users/queries` (for queries)
  - `convex/core/users/rules` (for rules)
  - `convex/core/users` (for public API)

**Command to find imports:**
```bash
grep -r "from.*users/(lifecycle|authLinks|orgLinks|validation|profile|access)" convex/ src/
```

### Phase 3: Cleanup and Validation

#### Step 3.1: Delete Old Files
**Action:**
- Delete `lifecycle.ts`
- Delete `authLinks.ts`
- Delete `orgLinks.ts`
- Delete `validation.ts`
- Delete `profile.ts`
- Delete `access.ts`
- Delete `access.test.ts`

**Verification:**
- Run `npm run check` - should pass
- Run `npm run lint` - should pass
- Run `npm run test:unit:server` - should pass

#### Step 3.2: Update README.md
**Purpose**: Document new file structure

**Action:**
- Update "Files" section in `README.md`:
```markdown
## Files

| File           | Purpose                                                |
| -------------- | ------------------------------------------------------ |
| `tables.ts`    | Defines `users`, `accountLinks`, `userSettings` tables |
| `schema.ts`    | Type exports and re-exports                           |
| `constants.ts` | Runtime constants (MAX_LINK_DEPTH, MAX_TOTAL_ACCOUNTS) |
| `queries.ts`   | Reads user records, settings, and account links        |
| `mutations.ts` | Creates, updates users and manages account linking     |
| `rules.ts`     | Business rules (access, profile, account linking)     |
| `index.ts`     | Public exports                                         |
```

#### Step 3.3: Final Validation
**Checklist:**
- [ ] All mutations in `mutations.ts`
- [ ] All queries in `queries.ts`
- [ ] All business rules in `rules.ts`
- [ ] All constants in `constants.ts`
- [ ] All types exported from `schema.ts`
- [ ] All tests in `users.test.ts`
- [ ] `index.ts` exports all public API
- [ ] No imports from deleted files
- [ ] `npm run check` passes
- [ ] `npm run lint` passes
- [ ] `npm run test:unit:server` passes
- [ ] README.md updated

## Implementation Order

### Recommended Sequence

1. **Create new files** (Phase 1) - No breaking changes yet
   - `constants.ts` → `schema.ts` → `rules.ts` → `mutations.ts` → update `queries.ts` → `users.test.ts`

2. **Update exports** (Phase 2) - Maintain API compatibility
   - Update `index.ts` → Update internal imports → Update external imports

3. **Cleanup** (Phase 3) - Remove old files
   - Delete old files → Update README → Final validation

### Why This Order?

- **Phase 1** creates new structure without breaking existing code
- **Phase 2** migrates usage gradually
- **Phase 3** removes old code only after migration complete

## Risk Mitigation

### Potential Issues

1. **Breaking Changes**: External code imports from old files
   - **Mitigation**: Search and update all imports before deleting files
   - **Verification**: Run `grep` to find all references

2. **Circular Dependencies**: New structure might create cycles
   - **Mitigation**: `rules.ts` should not import from `mutations.ts` or `queries.ts`
   - **Verification**: Run `npm run check` after each phase

3. **Test Coverage**: Some tests might be missed
   - **Mitigation**: Copy all tests from `access.test.ts`, add coverage for other rules
   - **Verification**: Run `npm run test:unit:server`

4. **Public API Changes**: Exports might change
   - **Mitigation**: Keep `index.ts` exports stable, re-export from new files
   - **Verification**: Check that `index.ts` exports match old structure

## Success Criteria

✅ Domain follows standard structure:
- `tables.ts`, `queries.ts`, `mutations.ts`, `rules.ts`, `index.ts`, `README.md`, `users.test.ts`

✅ All code migrated:
- No references to old files (`lifecycle.ts`, `authLinks.ts`, etc.)
- All imports updated

✅ Tests pass:
- `npm run check` passes
- `npm run lint` passes
- `npm run test:unit:server` passes

✅ Documentation updated:
- README.md reflects new structure
- File purposes documented

## Estimated Effort

- **Phase 1**: 2-3 hours (create new files, copy code)
- **Phase 2**: 1-2 hours (update imports, verify)
- **Phase 3**: 30 minutes (cleanup, validation)

**Total**: ~4-6 hours

## Notes

- This is a **refactoring** task, not a feature change
- No functional changes - only file organization
- Follows same pattern as `people` domain (reference implementation)
- Maintains backward compatibility via `index.ts` exports

