# audit-code

Audit a single file or module against architecture principles.

**Approach**: Focused review. Read actual code. Reference principles.

**Reference**: `dev-docs/master-docs/architecture.md` (Architecture principles + Code Hygiene #26–33)

---

## Usage

```
/audit-code [file or module path]
```

Examples:
- `/audit-code /convex/core/proposals/mutations.ts`
- `/audit-code /convex/core/circles`
- `/audit-code /src/lib/components/atoms/Button.svelte`

---

## Execution

### Step 1: Read the Code

```bash
view [path]
```

If directory, read key files (schema, queries, mutations, index).

### Step 2: Determine Context

| Question | Determines |
|----------|------------|
| Is this in `/convex/core/`? | Core domain rules apply |
| Is this in `/convex/features/`? | Feature rules apply |
| Is this a `.svelte` file? | Frontend rules apply |
| Is this in `/src/lib/components/`? | Shared component rules apply |
| Is this in `/src/lib/modules/`? | Feature component rules apply |

### Step 3: Check Relevant Principles

#### For Core Domain Code

| Principle | Check |
|-----------|-------|
| #1 Domain cohesion | All domain code together? (schema, queries, mutations, rules) |
| #5 Dependencies | Imports only from infrastructure or other core? |
| #6 Explicit interface | Exports via index.ts? |
| #8 Queries pure | No side effects in queries? |
| #9 Auth before writes | Mutations check auth before db operations? |
| #11 No classes | Functions only? |
| #21 Co-located tests | Test file present? |
| #24 Full coverage | Core logic tested? |
| #26 Handler ≤20 lines | Each handler within 20 lines? |
| #27 Validation in rules | Validation extracted to rules.ts? |
| #29 No inline casts | Avoid `as unknown as`? |
| #30 Auth via helpers | Uses composed helpers (e.g., withCircleAccess)? |
| #31 Archive helper | Archives handled via helper, not branching? |
| #32 File ≤300 lines | File length within limit? |
| #33 Error format | Errors use `ERR_CODE: message`? |

#### For Feature Code

| Principle | Check |
|-----------|-------|
| #5 Dependencies | Imports only from core/infrastructure? |
| #7 No cross-feature | Doesn't import from other features? |
| #9 Auth before writes | Mutations check auth? |
| #11 No classes | Functions only? |
| #26 Handler ≤20 lines | Each handler within 20 lines? |
| #27 Validation in rules | Validation extracted to rules.ts? |
| #29 No inline casts | Avoid `as unknown as`? |
| #30 Auth via helpers | Uses composed helpers? |
| #31 Archive helper | Archives handled via helper? |
| #32 File ≤300 lines | File length within limit? |
| #33 Error format | Errors use `ERR_CODE: message`? |

#### For Svelte Components

| Principle | Check |
|-----------|-------|
| #12 Thin components | Presentational only? |
| #13 Delegate to Convex | No business logic? |
| #14 Svelte 5 patterns | Using $state, $derived, $effect? |
| Recipe usage | Using recipes for variants? |
| Token usage | Using semantic tokens? |
| Component location | Correct atomic level? (atom/molecule/organism) |
| #32 File ≤300 lines | File length within limit? |
| #33 Error format | Errors follow `ERR_CODE: message`? |

#### Always Check

| Principle | Check |
|-----------|-------|
| #15-16 Domain language | Using circles/roles/tensions/proposals? |
| #17 Pure functions | Functions pure where possible? |
| #18 Single responsibility | Each function does one thing? |
| #20 No magic values | No hardcoded values? |
| #26 Handler ≤20 lines | Applies to handlers and long component functions |
| #27 Validation in rules | Validation not inline where rules.ts exists |
| #28 Extract repeated patterns | Third repetition => helper |
| #29 No inline casts | Avoid `as unknown as` |
| #30 Composed auth helpers | Use helpers instead of inline conditionals |
| #31 Archive via helper | Avoid branching per archive state |
| #32 File ≤300 lines | Keep file size within limit |
| #33 Error format | Use `ERR_CODE: message` |

### Step 4: Produce Report

```markdown
# Audit: [path]

**Type:** [Core domain / Feature / Component]
**Status:** ✅ COMPLIANT / ⚠️ ISSUES / ❌ VIOLATIONS

---

## Summary

[1-2 sentences: Does this follow standards?]

---

## Findings

### Violations (must fix)

| Principle | Issue | Location | Fix |
|-----------|-------|----------|-----|
| #[X] | [Problem] | line [N] | [Recommendation] |

### Warnings (should fix)

| Concern | Location | Recommendation |
|---------|----------|----------------|
| [Issue] | line [N] | [Fix] |

### Good Practices (preserve)

- [What's done well]

---

## Questions

- [Anything unclear]

---

## Recommended Actions

1. [Priority fix]
2. [Secondary fix]
```

---

## Quick Checks by File Type

### `mutations.ts`
```bash
# Find all mutations
grep -n "mutation(" [file]

# Check each has auth before writes
# Look for: await checkAuth / getAuthUserId / verifyAuthority BEFORE db.insert/patch/delete
# Check handler length (≤20 lines), validation extracted to rules.ts, and error codes use `ERR_*:`
```

### `queries.ts`
```bash
# Verify no mutations called
grep -n "mutation\|db\.insert\|db\.patch\|db\.delete" [file]
# Should return nothing
# Check handler length (≤20 lines) and archive logic via helper
```

### `*.svelte`
```bash
# Check for business logic (violations)
grep -n "ctx\.db\|\.insert\|\.patch" [file]

# Check for hardcoded styling (violations)
grep -n "gap-[0-9]\|px-[0-9]\|bg-gray\|bg-blue" [file]

# Check for Svelte 5 patterns (should use)
grep -n "\$state\|\$derived\|\$effect" [file]
# Check file length (≤300 lines) and error format (`ERR_CODE: message`)
```

### `index.ts`
```bash
# Should only have exports, no logic
cat [file]
```

---

## Critical Rules

1. **Read the actual file** — Don't assume from name
2. **Context matters** — Core vs feature vs component have different rules
3. **Reference principle numbers** — From architecture.md
4. **Be specific** — Line numbers, code snippets
5. **Prioritize findings** — Violations > Warnings > Suggestions

---

## Begin

Read the specified file/module with `view` tool, then apply relevant checks.