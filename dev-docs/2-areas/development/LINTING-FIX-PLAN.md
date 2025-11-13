# Linting Fix Plan - 483 Errors

> **Status**: Linting is currently non-blocking (`continue-on-error: true`) to allow security PRs to merge. This document outlines the plan to systematically fix all 483 linting errors.

---

## 📊 **Error Breakdown**

| Category | Count | Severity | Priority |
|----------|-------|----------|----------|
| `@typescript-eslint/no-explicit-any` | ~250 | High | P1 |
| `svelte/no-navigation-without-resolve` | ~100 | Medium | P2 |
| `svelte/require-each-key` | ~50 | Medium | P2 |
| `@typescript-eslint/no-unused-vars` | ~50 | Low | P3 |
| `svelte/prefer-svelte-reactivity` | ~10 | Low | P3 |
| Other (XSS, @ts-ignore, etc.) | ~23 | Varies | P3 |

**Total**: 483 errors

---

## 🎯 **Strategy**

### **Phase 1: Prevention (Immediate)**

✅ **DONE**: Created `dev-docs/2-areas/development/coding-standards.md`
- Clear rules for AI agents/LLMs
- Examples of correct patterns
- Prevents new errors from being introduced

✅ **DONE**: Linting set to `continue-on-error: true` in CI
- Allows security PRs to merge
- Errors still visible in CI output
- Follows precedent (type check already non-blocking)

### **Phase 2: Systematic Fixes (Next Sprint)**

**Approach**: Fix by category, starting with highest impact.

#### **P1: Fix `any` Types (~250 errors)**

**Strategy**: 
1. Create script to find all `any` usages
2. Categorize by file/function
3. Fix systematically:
   - Replace with proper types
   - Use `unknown` + type guards
   - Use Convex generated types
   - Use discriminated unions

**Files to prioritize**:
- `src/lib/composables/useOrganizations.svelte.ts` (2 instances)
- `src/routes/settings/permissions-test/+page.svelte` (4 instances)
- `src/routes/(authenticated)/flashcards/+page.svelte` (1 instance)

**Estimated time**: 2-3 days

#### **P2: Fix Navigation (~100 errors)**

**Strategy**:
1. Find all `goto()` calls without `resolveRoute()`
2. Replace with `resolveRoute()` pattern
3. Test navigation still works

**Files**:
- `src/lib/components/Sidebar.svelte` (4 instances)
- `src/routes/register/+page.svelte` (2 instances)

**Estimated time**: 1 day

#### **P2: Fix `{#each}` Keys (~50 errors)**

**Strategy**:
1. Find all `{#each}` blocks without keys
2. Add appropriate keys (usually `item._id` or `index`)

**Files**:
- `src/routes/settings/permissions-test/+page.svelte` (1 instance)
- `src/lib/components/tags/ShareTagModal.svelte` (1 instance)
- `src/routes/(authenticated)/tags/+page.svelte` (2 instances)
- `src/routes/(authenticated)/flashcards/+page.svelte` (1 instance)

**Estimated time**: 2-3 hours

#### **P3: Fix Unused Variables (~50 errors)**

**Strategy**:
1. Run ESLint with `--fix` flag (auto-removes unused imports)
2. Manually review remaining cases
3. Prefix intentionally unused vars with `_`

**Estimated time**: 1-2 hours

#### **P3: Fix SvelteMap/SvelteSet (~10 errors)**

**Strategy**:
1. Find all `Map`/`Set` usage in reactive contexts
2. Replace with `SvelteMap`/`SvelteSet` or plain objects/arrays

**Estimated time**: 1 hour

#### **P3: Fix Other Issues (~23 errors)**

**Strategy**:
- Review each case individually
- Fix XSS warnings
- Remove unnecessary `@ts-ignore`
- Fix other rule violations

**Estimated time**: 2-3 hours

---

## 📋 **Implementation Plan**

### **Week 1: Setup & P1 (any types)**

- [x] Create coding standards document
- [x] Set linting to non-blocking
- [ ] Create script to find all `any` types
- [ ] Fix `any` types in composables
- [ ] Fix `any` types in routes
- [ ] Fix `any` types in components

### **Week 2: P2 (Navigation & Keys)**

- [ ] Fix navigation calls (add `resolveRoute()`)
- [ ] Fix `{#each}` blocks (add keys)
- [ ] Test navigation still works
- [ ] Test reactivity still works

### **Week 3: P3 (Cleanup)**

- [ ] Fix unused variables
- [ ] Fix SvelteMap/SvelteSet usage
- [ ] Fix other issues
- [ ] Run full lint check
- [ ] Enable linting as blocking in CI

---

## 🛠️ **Tools & Scripts**

### **Find All `any` Types**

```bash
# Find all 'any' types (excluding test files)
grep -r ": any" src --include="*.ts" --include="*.svelte" | grep -v ".test.ts" | grep -v ".spec.ts"

# Count occurrences
grep -r ": any" src --include="*.ts" --include="*.svelte" | grep -v ".test.ts" | grep -v ".spec.ts" | wc -l
```

### **Find All `goto()` Calls**

```bash
# Find all goto() calls
grep -r "goto(" src --include="*.ts" --include="*.svelte"

# Check if resolveRoute is imported
grep -r "resolveRoute" src --include="*.ts" --include="*.svelte"
```

### **Find All `{#each}` Without Keys**

```bash
# Find {#each} blocks
grep -r "{#each" src --include="*.svelte"

# Manual review needed - check if key expression present
```

### **Auto-fix Unused Imports**

```bash
# ESLint can auto-fix unused imports
npm run lint -- --fix
```

---

## ✅ **Success Criteria**

- [ ] Zero linting errors in CI
- [ ] All `any` types replaced with proper types
- [ ] All navigation uses `resolveRoute()`
- [ ] All `{#each}` blocks have keys
- [ ] No unused imports/variables
- [ ] Linting enabled as blocking in CI

---

## 📚 **References**

- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md`
- **Pattern Index**: `dev-docs/2-areas/patterns/INDEX.md`
- **Svelte Patterns**: `dev-docs/2-areas/patterns/svelte-reactivity.md`
- **Convex Patterns**: `dev-docs/2-areas/patterns/convex-integration.md`
- **CI Config**: `.github/workflows/quality-gates.yml`

---

## 🚨 **Important Notes**

1. **Don't break functionality**: Test after each category fix
2. **Preserve type safety**: Don't replace `any` with `unknown` without type guards
3. **Follow patterns**: Use existing patterns from `dev-docs/2-areas/patterns/`
4. **Incremental**: Fix one category at a time, commit frequently
5. **Test thoroughly**: Run full test suite after fixes

---

**Created**: 2025-01-XX  
**Status**: Planning phase  
**Next Step**: Create script to find all `any` types

