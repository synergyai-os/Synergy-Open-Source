# audit-codebase

Full codebase audit against SynergyOS architecture principles.

**Approach**: Skeptical senior architect. Grep for verification. Evidence for every finding.

**Reference**: `dev-docs/master-docs/architecture.md` (Architecture principles + Code Hygiene #26–33)

---

## Mission

Systematic audit of entire codebase:
1. Map structure
2. Verify core foundation
3. Check dependency flow
4. Audit Convex patterns
5. Audit frontend patterns
6. Check domain language
7. Assess test coverage
8. Produce prioritized findings

---

## Phase 1: Discover Structure

Map the codebase before auditing:

```bash
# Backend structure
view /convex

# Frontend structure  
view /src

# Expected structure per architecture.md:
# /convex/core/{domain}/     - Foundational domains
# /convex/features/{feature}/ - Application features
# /convex/infrastructure/    - Cross-cutting concerns
# /src/lib/components/       - Shared components (atoms/molecules/organisms)
# /src/lib/modules/          - Feature-specific frontend
```

**Report findings before proceeding:**
- What directories exist?
- What's at root level that shouldn't be?
- Missing expected directories?

---

## Phase 2: Core Foundation Audit

**Expected core domains** (per architecture.md):
- circles, roles, people, assignments, proposals, policies, authority

For each domain:

| Check | Method |
|-------|--------|
| Exists in `/convex/core/`? | `view /convex/core/{domain}` |
| Has required files? | schema.ts, queries.ts, mutations.ts, rules.ts, index.ts |
| Has co-located tests? | `{domain}.test.ts` |
| Is isolated? | Check imports don't reach outside core |

**Output table:**

| Domain | Location | Complete? | Has Tests? | Notes |
|--------|----------|-----------|------------|-------|
| circles | /convex/core/circles | ✅/❌ | ✅/❌ | |
| roles | | | | |
| ... | | | | |

---

## Phase 3: Dependency Flow Audit

**Principle #5**: `infrastructure/ ← core/ ← features/` — never reversed

### 3a: Core must not import from features or application

```bash
grep -r "from '.*features" convex/core/
grep -r "from '.*modules" convex/core/
grep -r "from '\.\./\.\." convex/core/
```

**Any results = VIOLATION**

### 3b: Features must not import from each other

```bash
grep -r "from '.*features" convex/features/ | grep -v "from './\|from '../"
```

### 3c: Check for circular dependencies

```bash
# Look for mutual imports
grep -rn "from './circles" convex/ | head -20
grep -rn "from './roles" convex/ | head -20
```

**Output:**

```
Core outward imports: [list or "none"]
Feature cross-imports: [list or "none"]  
Circular dependencies: [list or "none found"]
```

---

## Phase 4: Convex Patterns Audit

### 4a: Find all mutations

```bash
grep -rn "mutation(" convex/ --include="*.ts"
```

### 4b: Verify auth before writes (Principle #9)

For each mutation:
1. Read the function
2. Find where data is written (`db.insert`, `db.patch`, `db.delete`)
3. Verify auth check happens BEFORE the write

**Output table:**

| File | Mutation | Auth Before Write? | Evidence |
|------|----------|-------------------|----------|
| circles/mutations.ts | create | ✅ | Line 45: `await checkAuth(ctx)` before insert |
| | delete | ❌ | No auth check |

### 4c: Verify queries are pure reads (Principle #8)

```bash
grep -rn "query(" convex/ --include="*.ts"
```

Check queries don't call mutations or have side effects.

### 4d: No classes (Principle #11)

```bash
grep -rn "^class \|^export class " convex/ src/
```

**Any results = VIOLATION**

### 4e: Code Hygiene (#26–33)

Checks to run:
- #26: Handler bodies ≤20 lines (`queries.ts`/`mutations.ts`) — count per handler.
- #27: Validation extracted to `rules.ts`, not inline in handlers.
- #28: Patterns repeated 3x+ are extracted to helpers.
- #29: No `as unknown as` casts (`grep -rn "as unknown as" convex/`).
- #30: Auth composed via helpers (e.g., `withCircleAccess`, `withAuthority`), not hardcoded conditionals.
- #31: Archive queries use a helper (e.g., `queryActive`) rather than branching in handlers.
- #32: Domain files ≤300 lines (`wc -l convex/**/*.ts | sort -nr | head`).
- #33: Errors follow `ERR_CODE: message` (`grep -rn "Error(" convex/ src/ --include="*.ts"` and spot-check).

---

## Phase 5: Frontend Architecture Audit

### 5a: Component locations

```bash
# Check component structure
view /src/lib/components
view /src/lib/modules
```

**Expected per architecture.md:**
- `/src/lib/components/atoms/` - Single elements
- `/src/lib/components/molecules/` - Combined atoms
- `/src/lib/components/organisms/` - Complex sections
- `/src/lib/modules/[module]/components/` - Feature-specific

### 5b: No cross-module imports

```bash
grep -rn "from '.*modules/" src/lib/modules/ | grep -v "from '\./\|from '\.\./"
```

**Any cross-module imports = VIOLATION**

### 5c: Business logic in components (Principle #12-13)

```bash
grep -rn "ctx\.db\|\.insert\|\.patch\|\.delete" src/ --include="*.svelte"
```

**Any results = VIOLATION** (business logic should be in Convex)

### 5d: Recipe usage (Design System compliance)

```bash
# Check for hardcoded Tailwind in components
grep -rn "gap-[0-9]\|px-[0-9]\|py-[0-9]\|bg-gray\|bg-blue\|text-gray" src/lib/components/ --include="*.svelte"
```

**Results indicate design system violations**

---

## Phase 6: Domain Language Audit

**Principle #15-16**: Use practitioner terminology

```bash
grep -rin '"team"' convex/ src/ --include="*.ts" --include="*.svelte"
grep -rin '"job"' convex/ src/ --include="*.ts" --include="*.svelte"
grep -rin '"issue"' convex/ src/ --include="*.ts" --include="*.svelte"
grep -rin '"ticket"' convex/ src/ --include="*.ts" --include="*.svelte"
grep -rin '"permission"' convex/ src/ --include="*.ts" --include="*.svelte"
```

**Output table:**

| Wrong Term | Correct Term | Location | Context |
|------------|--------------|----------|---------|
| "team" | "circle" | file:line | [context] |

Note: Some uses may be legitimate (external APIs). Flag uncertain cases.

---

## Phase 7: Test Coverage Audit

### 7a: Find test files

```bash
find convex/ -name "*.test.ts"
find src/ -name "*.test.ts"
find tests/ -type f -name "*.ts"
```

### 7b: Core domain coverage (Principle #24)

| Domain | Test File | Status |
|--------|-----------|--------|
| authority | authority.test.ts | ✅/❌ |
| circles | circles.test.ts | ✅/❌ |
| ... | | |

### 7c: Test independence (Principle #23)

```bash
grep -r "import.*from.*\.test" tests/ convex/ src/
```

**Any results = VIOLATION** (tests importing from other tests)

---

## Phase 8: Red Flags Checklist

Go through each explicitly with evidence:

```markdown
- [ ] Business logic in UI components
      Command: grep -rn "ctx\.db" src/ --include="*.svelte"
      Evidence: [results or "none found"]

- [ ] Core importing from features
      Command: grep -r "from '.*features" convex/core/
      Evidence: [results or "verified clean"]

- [ ] Classes in codebase
      Command: grep -rn "^class " convex/ src/
      Evidence: [results or "none found"]

- [ ] Hardcoded auth checks (not using authority calculator)
      Command: grep -rn "role ===" convex/ src/
      Evidence: [results or "none found"]

- [ ] Queries modifying state
      Evidence: [file:line or "none found"]

- [ ] Missing auth on mutations
      Evidence: [list mutations without auth or "all have auth"]

- [ ] Hardcoded Tailwind in components
      Command: grep -rn "gap-[0-9]" src/lib/components/
      Evidence: [results or "using semantic tokens"]
- [ ] Handler >20 lines or domain file >300 lines
      Command: wc -l on handlers/files
      Evidence: [list or "within limits"]
- [ ] Inline casts (`as unknown as`)
      Command: grep -rn "as unknown as" convex/
      Evidence: [list or "none found"]
- [ ] Errors missing `ERR_CODE:` format
      Command: grep -rn "Error(" convex/ src/
      Evidence: [list or "consistent"]
- [ ] Archive queries branching instead of helper
      Evidence: [file:line or "uses helper"]
```

---

## Output Format

```markdown
# SynergyOS Codebase Audit Report

**Date:** [date]
**Reference:** dev-docs/master-docs/architecture.md (Architecture + Code Hygiene #26–33)

## Executive Summary

[2-3 sentences: Foundation solid? Biggest risk?]

---

## Critical Issues (fix immediately)

### [CRITICAL-1] [Title]
- **Principle violated:** #[number] - [name]
- **Location:** [file:line]
- **Evidence:** [grep output or code]
- **Impact:** [why this matters]
- **Fix:** [recommendation]

---

## High Priority Issues

[Same structure]

---

## Medium Priority Issues

[Same structure]

---

## Low Priority Issues

[Same structure]

---

## Systematic Verification

### Core Domain Status

| Domain | Location | Complete? | Has Tests? |
|--------|----------|-----------|------------|
| | | | |

### Dependency Flow

```
Core outward imports: [list or "none"]
Feature cross-imports: [list or "none"]
Circular dependencies: [list or "none"]
```

### Mutations Auth Audit

| File | Mutation | Auth Before Write? |
|------|----------|-------------------|
| | | |

### Frontend Compliance

| Check | Status | Evidence |
|-------|--------|----------|
| Component locations correct | ✅/❌ | |
| No cross-module imports | ✅/❌ | |
| No business logic in UI | ✅/❌ | |
| Using recipes/tokens | ✅/❌ | |

### Domain Language

| Wrong | Correct | Location |
|-------|---------|----------|
| | | |

### Test Coverage

| Area | Has Tests? |
|------|------------|
| | |

### Red Flags Checklist

[Completed checklist with evidence]

---

## Architecture Health

| Area | Status | Notes |
|------|--------|-------|
| Core Foundation | ✅/⚠️/❌ | |
| Dependency Flow | ✅/⚠️/❌ | |
| Convex Patterns | ✅/⚠️/❌ | |
| Code Hygiene | ✅/⚠️/❌ | |
| Frontend Patterns | ✅/⚠️/❌ | |
| Domain Language | ✅/⚠️/❌ | |
| Test Coverage | ✅/⚠️/❌ | |

---

## Uncertainties

[What you couldn't verify or need clarification on]

---

## Recommended Actions

1. [Highest priority]
2. [Second priority]
3. [Third priority]

---

## What's Working Well

[Positives worth preserving]
```

---

## Critical Rules

1. **Read actual files** — Never report on unread files
2. **Grep for verification** — Don't spot-check
3. **Evidence required** — File paths, line numbers, grep output
4. **Reference principle numbers** — From architecture.md
5. **Complete red flags checklist** — Every item needs evidence
6. **Use Uncertainties section** — Don't guess

---

## Begin

Start by mapping directory structure:

```
Step 1: view /convex
Step 2: view /src  
Step 3: Report structure
Step 4: Proceed through phases
```