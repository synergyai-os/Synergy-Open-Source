# audit-plan

Evaluate a proposed change against architecture principles BEFORE implementation.

**Approach**: Skeptical senior architect. Read actual code. Separate symptom from root cause.

**Reference**: `dev-docs/master-docs/architecture.md` v4.0 (25 Architecture principles + Code Hygiene #26–33, source of truth)

---

## Mission

1. Clarify what problem is being solved
2. Read affected code
3. Check proposal against principles
4. Identify gaps and risks
5. Recommend: Approve / Approve with changes / Reject

---

## Execution

### Step 1: Extract Proposal

From conversation, identify:

```markdown
**What is being proposed?**
[Specific changes - files, code]

**What problem does this solve?**
[Observable issue]

**What files are affected?**
[List all files]
```

If vague, ask for clarification.

### Step 2: Separate Symptom from Root Cause

```markdown
## Problem Analysis

**Symptom:** [What's observed]

**Immediate trigger:** [What directly causes it]

**Root cause:** [Which principle is violated]

**Fixed state:** [Expected behavior when done]
```

### Step 3: Read Affected Code

**Do not evaluate from proposal description alone.**

```markdown
## Current State

### [file:lines]
```
[code]
```

### Related code not in proposal
- [file]: [why relevant]
```

**Architecture.md sections to consult:**
- Identity Architecture — three-layer identity chain (sessionId → userId → personId)
- Authority vs Access Control (RBAC) — two separate systems with two scopes
- Governance Foundation — workspace lifecycle, role auto-creation, circle types
- Frontend Patterns — Svelte 5 composables, runes, `.svelte.ts` vs `.ts`
- Core Domains — FROZEN vs STABLE status, domain file structure
- Common AI Mistakes — known failure patterns to watch for

### Step 4: Principle Check

**Only check categories relevant to the change.** Reference principle numbers OR semantic IDs from architecture.md.

#### Foundation (if touching core domains)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `core-complete` Domain cohesion (schema + queries + mutations + rules) | ✅/⚠️/❌/N/A | |
| 2 | `core-domains` Core domains: circles, roles, people, assignments, proposals, policies, authority | ✅/⚠️/❌/N/A | |
| 3 | `core-lead` Circle Lead authority implemented at core level | ✅/⚠️/❌/N/A | |
| 4 | `core-authority` Authority calculated from roles, never stored | ✅/⚠️/❌/N/A | |

#### Dependencies (if affecting imports)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 5 | `dep-layer-direction` infrastructure/ ← core/ ← features/ (never reversed) | ✅/⚠️/❌/N/A | |
| 6 | `dep-explicit` Domains communicate through explicit interfaces (index.ts) | ✅/⚠️/❌/N/A | |
| 7 | `dep-no-circular` No circular dependencies between domains | ✅/⚠️/❌/N/A | |

#### Convex Patterns (if touching backend)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 8 | `cvx-queries-pure` Queries are pure reads with reactive subscriptions | ✅/⚠️/❌/N/A | |
| 9 | `cvx-auth-before-write` Mutations validate authorization BEFORE writing | ✅/⚠️/❌/N/A | |
| 10 | `cvx-logic-in-convex` All business logic lives in Convex, not Svelte | ✅/⚠️/❌/N/A | |
| 11 | `cvx-no-classes` Zero classes anywhere — functions only | ✅/⚠️/❌/N/A | |

#### Authorization Flow (if touching auth/permissions)

Per architecture.md, authorization follows this exact sequence:

| Step | Check | Status | Evidence |
|------|-------|--------|----------|
| 1 | Get authenticated user (throw `AUTH_REQUIRED` if missing) | ✅/⚠️/❌/N/A | |
| 2 | RBAC capability check (throw `AUTHZ_INSUFFICIENT_RBAC` if false) | ✅/⚠️/❌/N/A | |
| 3 | Authority check via domain rule (throw domain-specific error if false) | ✅/⚠️/❌/N/A | |
| 4 | Both must pass; order preserved (RBAC before Authority) | ✅/⚠️/❌/N/A | |

#### Svelte Patterns (if touching UI)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 12 | `svelte-thin-components` Components are thin and presentational | ✅/⚠️/❌/N/A | |
| 13 | `svelte-delegate` Components delegate to Convex for all logic | ✅/⚠️/❌/N/A | |
| 14 | `svelte-runes` Svelte 5 runes used correctly ($state, $derived, $effect) | ✅/⚠️/❌/N/A | |
| 14a | `.svelte.ts` for reactive state, `.ts` for pure functions | ✅/⚠️/❌/N/A | |
| — | Recipe usage (no hardcoded Tailwind for variants) | ✅/⚠️/❌/N/A | |
| — | Semantic tokens (no hardcoded colors/spacing) | ✅/⚠️/❌/N/A | |

**See also**: `dev-docs/master-docs/architecture.md` → Frontend Patterns section for detailed Svelte 5 patterns, composables, and reactive state management.

#### Domain Language

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 15 | `lang-terminology` Use practitioner terms: circles, roles, tensions, proposals, consent | ✅/⚠️/❌/N/A | |
| 16 | `lang-naming` Function and variable names match domain language | ✅/⚠️/❌/N/A | |
| — | Convex function naming (approved prefixes only: get/find/list, create/update/archive, etc.) | ✅/⚠️/❌/N/A | |

#### Code Quality

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 17 | `quality-pure-functions` Pure functions preferred where possible | ✅/⚠️/❌/N/A | |
| 18 | `quality-single-responsibility` Functions do one thing at appropriate abstraction | ✅/⚠️/❌/N/A | |
| 19 | `quality-rule-of-three` Duplication tolerated twice, refactored on third | ✅/⚠️/❌/N/A | |
| 20 | `quality-no-magic` No hardcoded magic values — use constants or config | ✅/⚠️/❌/N/A | |

#### Testing

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 21 | `test-colocated` Unit tests co-located: {domain}.test.ts next to source | ✅/⚠️/❌/N/A | |
| 22 | `test-integration-location` Integration tests in /tests/integration/ | ✅/⚠️/❌/N/A | |
| 23 | `test-independent` Tests are independent — no test imports from another test | ✅/⚠️/❌/N/A | |
| 24 | `test-core-coverage` Core domains have full test coverage | ✅/⚠️/❌/N/A | |

**Required test cases per mutation:** success, no auth (`AUTH_REQUIRED`), wrong role/RBAC (`AUTHZ_*`), invalid input (`VALIDATION_*`), business rule violation (domain-specific error)

**Required test cases per query:** success, unauthorized, not found (returns null/empty)

#### Immutability (if touching history/audit data)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 25 | `immutable-history` Organizational history is immutable and auditable | ✅/⚠️/❌/N/A | |

#### Code Hygiene (apply to all handlers/files in scope)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 26 | `hygiene-handler-thin` Query/mutation handlers ≤ 20 lines | ✅/⚠️/❌/N/A | |
| 27 | `hygiene-validation-rules` Validation logic extracted to rules.ts | ✅/⚠️/❌/N/A | |
| 28 | `hygiene-extract-patterns` Repeated patterns (3x+) extracted to helpers | ✅/⚠️/❌/N/A | |
| 29 | `hygiene-no-casts` No inline type casts (`as unknown as`) — use type helpers | ✅/⚠️/❌/N/A | |
| 30 | `hygiene-auth-helpers` Auth/access via composed helpers (e.g., withCircleAccess) | ✅/⚠️/❌/N/A | |
| 31 | `hygiene-archive-helper` Archive queries via helper (e.g., queryActive), not branching | ✅/⚠️/❌/N/A | |
| 32 | `hygiene-file-size` Domain files ≤ 300 lines; split if larger | ✅/⚠️/❌/N/A | |
| 33 | `err-code-format` Error format consistent: ERR_CODE: message | ✅/⚠️/❌/N/A | |

### Step 5: Red Flags Verification

Run these checks on affected files. Any match requires investigation.

```bash
# Business logic in UI (violates #10, #12)
grep -rn "ctx.db" src/

# Core importing features (violates #5)
grep -r "from.*features" convex/core/

# Classes in codebase (violates #11)
grep -rn "^class " convex/ src/

# Inline type casts (violates #29)
grep -rn "as unknown as" convex/

# Wrong terminology (violates #15)
grep -rin '"team"' convex/ src/
grep -rin '"permission"' convex/ src/
grep -rin '"user"' convex/ src/  # should be "person"

# Test interdependencies (violates #23)
grep -r "import.*\.test" convex/ tests/

# Hardcoded fallbacks (violates config rules)
grep -rn "|| 'http://localhost" convex/ src/

# Handler line counts (violates #26)
# Check queries.ts and mutations.ts handler bodies manually

# File sizes (violates #32)
wc -l [affected files] | awk '$1 > 300'
```

```markdown
## Red Flags Check

| Check | Result | Files/Lines |
|-------|--------|-------------|
| ctx.db in src/ | ✅ Clean / ❌ Found | |
| Core imports features | ✅ Clean / ❌ Found | |
| Classes | ✅ Clean / ❌ Found | |
| Inline casts | ✅ Clean / ❌ Found | |
| Wrong terminology | ✅ Clean / ❌ Found | |
| Test interdependencies | ✅ Clean / ❌ Found | |
| Hardcoded fallbacks | ✅ Clean / ❌ Found | |
| Handler > 20 lines | ✅ Clean / ❌ Found | |
| File > 300 lines | ✅ Clean / ❌ Found | |
```

### Step 6: Identify Gaps and Risks

```markdown
## Gaps and Risks

### What the proposal doesn't address
- [Gap]

### What could go wrong
- [Risk]

### Questions before proceeding
- [Question]
```

### Step 7: Define Fixes

Always provide both:

```markdown
## Immediate Fix (stop the symptom)

**Changes:**
1. [Change]

**Limitations:** [What this doesn't solve]

---

## Proper Fix (address root cause)

**Root cause addressed:** Principle #[X] / `semantic-id` - [name]

**Changes:**
1. [Change]

**Why this prevents recurrence:** [Explanation]
```

### Step 8: Recommendation

```markdown
## Recommendation

**Verdict:** [APPROVE / APPROVE WITH CHANGES / REJECT]

**Summary:** [1-2 sentences]

### Required changes (if approving with changes):
- [ ] [Change]

### Alternative approach (if rejecting):
[What to do instead]

### Implementation order:
- "Immediate fix now, proper fix as follow-up"
- "Proper fix is small, do it now"
- "Immediate fix only"
```

---

## Proposal Smells

Patterns that indicate a proposal needs more thought:

### Foundation

- Adds logic to root level instead of `/convex/core/{domain}/`
- Authority check hardcoded instead of using calculator
- New domain concept not in core
- Circle Lead logic placed in features instead of core

### Dependencies

- Core imports from features
- Feature imports from another feature
- Circular imports
- Exporting internal helpers directly instead of via index.ts

### Convex Patterns

- Mutation writes before auth check
- Auth check missing RBAC step before authority step
- Authority check without RBAC check (or vice versa)
- Auth check after DB read ("check if exists first" pattern)
- Business logic in Svelte component
- Query has side effects
- Class introduced
- Handler > 20 lines or file > 300 lines
- Inline cast (`as unknown as`) instead of proper typing
- Errors not using `ERR_CODE: message`
- Archive logic branched instead of helper
- Validation left inline instead of `rules.ts`
- Creating new type instead of reusing existing from schema.ts

### Frontend Patterns

- Component > 20 lines of non-UI logic
- Component calls ctx.db directly
- Hardcoded Tailwind instead of recipes/tokens
- Not using Svelte 5 runes ($state, $derived, $effect)

### Domain Language

- Uses "team" instead of "circle"
- Uses "permission" instead of "authority"
- Uses "issue" or "ticket" instead of "tension" or "proposal"
- Uses "user" or "member" instead of "person"
- Uses "manager" or "boss" instead of "Circle Lead"
- Uses "organization" instead of "workspace"
- Uses "approval" or "sign-off" instead of "consent"
- Convex function uses unapproved prefix

### Code Quality

- Same value in multiple places (drift risk)
- Silent fallback that masks errors
- Function does multiple things

### Testing

- Tests exist but missing required mutation cases
- Tests exist but missing required query cases
- Test imports from another test file
- Integration test placed next to source instead of /tests/integration/
- Unit test placed in /tests/ instead of next to source

### Immutability

- Mutation modifies historical records instead of appending
- Audit trail can be altered

---

## Output Format

```markdown
# Plan Audit: [Short description]

**Proposal:** [1-2 sentence summary]
**Affected files:** [list]

---

## Problem Analysis

**Symptom:** [observed]
**Trigger:** [cause]
**Root cause:** Principle #[X] / `semantic-id` violated
**Fixed state:** [expected]

---

## Current State

[Code snippets with file:line]

---

## Principle Check

[Tables for relevant categories only]

---

## Red Flags Check

[Table with grep results]

---

## Gaps and Risks

[Lists]

---

## Immediate Fix

[Changes and limitations]

---

## Proper Fix

[Root cause, changes, prevention]

---

## Recommendation

**Verdict:** [APPROVE / APPROVE WITH CHANGES / REJECT]
[Details]
```

---

## Critical Rules

1. **Separate symptom from root cause** — Always identify both
2. **Read actual code** — Not just proposal description
3. **Check related code** — Proposals miss affected areas
4. **Reference principle numbers OR semantic IDs** — From architecture.md
5. **Provide both fixes** — Immediate and proper
6. **Mark N/A** — Don't force-check irrelevant principles
7. **Tie to principles** — "Violates #9 / `cvx-auth-before-write`" not "I don't like this"
8. **Check auth flow sequence** — Not just "auth exists" but correct order
9. **Run Red Flags checks** — Executable verification, not just visual inspection
10. **All 25 + 8 principles available** — Use the complete checklist, mark N/A for irrelevant

---

## Quick Reference: Principle to Semantic ID

| # | Semantic ID | Short Name |
|---|-------------|------------|
| 1 | `core-complete` | Domain cohesion |
| 2 | `core-domains` | Seven pillars |
| 3 | `core-lead` | Circle Lead in core |
| 4 | `core-authority` | Authority calculated |
| 5 | `dep-layer-direction` | Layer flow |
| 6 | `dep-explicit` | Explicit interfaces |
| 7 | `dep-no-circular` | No circular deps |
| 8 | `cvx-queries-pure` | Pure queries |
| 9 | `cvx-auth-before-write` | Auth before write |
| 10 | `cvx-logic-in-convex` | Logic in Convex |
| 11 | `cvx-no-classes` | No classes |
| 12 | `svelte-thin-components` | Thin components |
| 13 | `svelte-delegate` | Delegate to Convex |
| 14 | `svelte-runes` | Svelte 5 runes |
| 15 | `lang-terminology` | Practitioner terms |
| 16 | `lang-naming` | Domain naming |
| 17 | `quality-pure-functions` | Pure functions |
| 18 | `quality-single-responsibility` | Single responsibility |
| 19 | `quality-rule-of-three` | Rule of three |
| 20 | `quality-no-magic` | No magic values |
| 21 | `test-colocated` | Co-located tests |
| 22 | `test-integration-location` | Integration location |
| 23 | `test-independent` | Independent tests |
| 24 | `test-core-coverage` | Core coverage |
| 25 | `immutable-history` | Immutable history |
| 26 | `hygiene-handler-thin` | Handler ≤ 20 lines |
| 27 | `hygiene-validation-rules` | Validation in rules.ts |
| 28 | `hygiene-extract-patterns` | Extract patterns |
| 29 | `hygiene-no-casts` | No inline casts |
| 30 | `hygiene-auth-helpers` | Auth via helpers |
| 31 | `hygiene-archive-helper` | Archive via helper |
| 32 | `hygiene-file-size` | File ≤ 300 lines |
| 33 | `err-code-format` | Error format |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | 2025-12-17 | Aligned with architecture.md v4.0. Added principle 14a (.svelte.ts vs .ts), Frontend Patterns reference, updated architecture section references, clarified document paths. |
| 2.0 | 2025-12-14 | Aligned with architecture.md v3.5. Added semantic IDs, authorization flow check, red flags verification. |
| 1.0 | 2025-12-07 | Original version |

---

## Begin

Look for a proposed plan in the conversation.

If found: Extract → Analyze → Read code → Check principles → Run Red Flags → Recommend

If not found: Ask "What change should I evaluate?"