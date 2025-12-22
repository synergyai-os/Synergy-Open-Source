# audit-plan

Evaluate a proposed change against architecture principles BEFORE implementation.

**Approach**: Skeptical senior architect. Read actual code. Separate symptom from root cause.

---

## Mission

1. Clarify what problem is being solved
2. Read affected code
3. Check proposal against principles
4. Identify gaps and risks
5. Recommend: **Approve** / **Approve with Changes** / **Reject**

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
- Identity Architecture — three-layer chain (sessionId → userId → personId)
- Authority vs Access Control (RBAC) — two scopes
- Governance Foundation — workspace lifecycle, circle types
- Frontend Patterns — Svelte 5 composables, `.svelte.ts` vs `.ts`
- Core Domains — FROZEN vs STABLE status
- Common AI Mistakes — known failure patterns

### Step 4: Principle Check

**Only check categories relevant to the change.**

#### Foundation (if touching core domains)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Domain cohesion (schema + queries + mutations + rules) | ✅/⚠️/❌/N/A | |
| 2 | Core domains: circles, roles, people, assignments, proposals, authority | ✅/⚠️/❌/N/A | |
| 3 | Circle Lead authority at core level | ✅/⚠️/❌/N/A | |
| 4 | Authority calculated, never stored | ✅/⚠️/❌/N/A | |

#### Dependencies (if affecting imports)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 5 | infrastructure/ ← core/ ← features/ | ✅/⚠️/❌/N/A | |
| 6 | Explicit interfaces (index.ts) | ✅/⚠️/❌/N/A | |
| 7 | No circular dependencies | ✅/⚠️/❌/N/A | |

#### Convex Patterns (if touching backend)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 8 | Queries are pure reads | ✅/⚠️/❌/N/A | |
| 9 | Auth before write | ✅/⚠️/❌/N/A | |
| 10 | Business logic in Convex, not Svelte | ✅/⚠️/❌/N/A | |
| 11 | No classes — functions only | ✅/⚠️/❌/N/A | |

#### Authorization Flow (if touching auth/permissions)

| Step | Check | Status | Evidence |
|------|-------|--------|----------|
| 1 | Get authenticated user (AUTH_REQUIRED if missing) | ✅/⚠️/❌/N/A | |
| 2 | RBAC capability check (AUTHZ_INSUFFICIENT_RBAC if false) | ✅/⚠️/❌/N/A | |
| 3 | Authority check via domain rule | ✅/⚠️/❌/N/A | |
| 4 | Order preserved (RBAC before Authority) | ✅/⚠️/❌/N/A | |

#### Svelte Patterns (if touching UI)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 12 | Components thin and presentational | ✅/⚠️/❌/N/A | |
| 13 | Delegate to Convex for logic | ✅/⚠️/❌/N/A | |
| 14 | Svelte 5 runes ($state, $derived, $effect) | ✅/⚠️/❌/N/A | |
| 14a | `.svelte.ts` for reactive, `.ts` for pure | ✅/⚠️/❌/N/A | |
| — | Recipe usage (no hardcoded Tailwind) | ✅/⚠️/❌/N/A | |

#### Domain Language

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 15 | Practitioner terms: circles, roles, tensions | ✅/⚠️/❌/N/A | |
| 16 | Function names match domain | ✅/⚠️/❌/N/A | |
| — | Approved function prefixes only | ✅/⚠️/❌/N/A | |

#### Code Quality

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 17 | Pure functions preferred | ✅/⚠️/❌/N/A | |
| 18 | Single responsibility | ✅/⚠️/❌/N/A | |
| 19 | Rule of three (refactor on 3rd) | ✅/⚠️/❌/N/A | |
| 20 | No magic values | ✅/⚠️/❌/N/A | |

#### Testing

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 21 | Unit tests co-located | ✅/⚠️/❌/N/A | |
| 22 | Integration tests in /tests/integration/ | ✅/⚠️/❌/N/A | |
| 23 | Tests independent | ✅/⚠️/❌/N/A | |
| 24 | Core domains full coverage | ✅/⚠️/❌/N/A | |

#### Code Hygiene

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| 26 | Handlers ≤ 20 lines | ✅/⚠️/❌/N/A | |
| 27 | Validation in rules.ts | ✅/⚠️/❌/N/A | |
| 28 | Repeated patterns (3x+) extracted | ✅/⚠️/❌/N/A | |
| 29 | No inline casts (`as unknown as`) | ✅/⚠️/❌/N/A | |
| 32 | File ~300 lines guideline | ✅/⚠️/❌/N/A | |
| 33 | Error format: ERR_CODE: message | ✅/⚠️/❌/N/A | |

### Step 5: Red Flags Verification

Run these checks on affected files:

```bash
# Business logic in UI (violates #10, #12)
grep -rn "ctx.db" src/

# Core importing features (violates #5)
grep -r "from.*features" convex/core/

# Classes (violates #11)
grep -rn "^class " convex/ src/

# Inline casts (violates #29)
grep -rn "as unknown as" convex/

# Wrong terminology (violates #15)
grep -rin '"team"' convex/ src/

# File sizes (guideline #32)
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
| File > 300 lines | ✅ Clean / ⚠️ Found | |
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

```markdown
## Immediate Fix (stop the symptom)

**Changes:**
1. [Change]

**Limitations:** [What this doesn't solve]

---

## Proper Fix (address root cause)

**Root cause addressed:** Principle #[X]

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
- Logic at root level instead of `/convex/core/{domain}/`
- Authority check hardcoded instead of using calculator
- Circle Lead logic in features instead of core

### Dependencies
- Core imports from features
- Feature imports from another feature
- Exporting internal helpers directly

### Convex Patterns
- Mutation writes before auth check
- Auth check after DB read ("check if exists first")
- Business logic in Svelte component
- Handler > 20 lines

### Frontend Patterns
- Component > 20 lines of non-UI logic
- Component calls ctx.db directly
- Hardcoded Tailwind instead of recipes/tokens

### Domain Language
- Uses "team" instead of "circle"
- Uses "permission" instead of "authority"
- Uses "member" instead of "person"
- Unapproved function prefix

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
**Root cause:** Principle #[X] violated
**Fixed state:** [expected]

---

## Current State

[Code snippets with file:line]

---

## Principle Check

[Tables for relevant categories]

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
4. **Reference principle numbers** — From architecture.md
5. **Provide both fixes** — Immediate and proper
6. **Mark N/A** — Don't force-check irrelevant principles
7. **Run Red Flags checks** — Executable verification

---

## Begin

Look for a proposed plan in the conversation.

If found: Extract → Analyze → Read code → Check principles → Run Red Flags → Recommend

If not found: Ask "What change should I evaluate?"

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2025-12-19 | Complete rewrite aligned with architecture.md v4.1. Streamlined principle checks. Removed outdated semantic IDs. |