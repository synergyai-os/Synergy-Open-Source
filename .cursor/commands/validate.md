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
7. **Run Red Flags checks** — Executable verification# validate

Verify completed work against ticket criteria and architecture.md. Read actual code. No assumptions.

---

## Critical Rule: Trust Nothing

**NEVER use information from conversation history to pass a check.**

Even if you just wrote the code in this same chat, you MUST:
1. Fetch the ticket fresh from Linear
2. Read the actual files from disk
3. Run the actual commands
4. Report what the tools return, not what you "know"

**Why:** The point of validation is to catch mistakes, including your own.

---

## Constraint Classification

### Blocking Constraints (Architecture Principles)

These **always apply** to new/modified code:

| Category | Principle # | Check | Blocking? |
|----------|-------------|-------|-----------|
| **Identity** | XDOM-01 | Audit fields use `personId`, not `userId` | **Always** |
| **Identity** | — | Auth chain: sessionId → userId → personId | **Always** |
| **Auth** | #9 | Auth before any DB write | **Always** |
| **Auth** | — | Uses `validateSessionAndGetUserId` | **Always** |
| **No Classes** | #11 | Zero class declarations | **Always** |
| **Dependencies** | #5 | Layer direction: infra ← core ← features | **Always** |
| **Queries** | #8 | Queries are pure reads | **Always** |
| **Terminology** | #15-16 | Domain language (circle, role, person) | **Always** |
| **Exports** | #6 | Only via index.ts | **Always** |
| **Errors** | #33 | Format: `ERR_CODE: message` | **Always** |

### Guidelines (Report, Don't Block)

Per Trade-off Guidance — domain cohesion > line limits:

| Constraint | Principle # | Guidance |
|------------|-------------|----------|
| File size | #32 | ~300 lines guideline. 400+ OK if cohesive |
| Handler size | #26 | ≤20 lines guideline. Report if exceeded |

---

## Execution

### Step 1: Fetch Ticket (MANDATORY FIRST ACTION)

```typescript
const ticket = await Linear.get_issue({ id: ticketId });
```

If no ticket ID provided:
> What ticket? (e.g., SYOS-123)

**This must be your first tool call.**

### Step 2: Parse Ticket

Extract from Linear response:

```markdown
## Parsed from SYOS-XXX

**Ticket Purpose:** [one-line summary]

**Acceptance Criteria:**
- [ ] AC-1: [text]
- [ ] AC-2: [text]

**Files in Scope:**
- convex/core/circles/mutations.ts

**Ticket Constraints:**
- [from ticket]

**Architecture Principles (Always Apply):**
- #9: Auth before writes
- #11: No classes
- #15-16: Domain terminology
- XDOM-01: personId for audit fields
```

### Step 3: Read Architecture.md

Before checking code, refresh on relevant sections:

- Identity chain pattern (sessionId → userId → personId)
- Auth helper name (validateSessionAndGetUserId)
- Domain terminology (circle/role/person)
- Layer dependency direction
- Function naming conventions

### Step 4: Read Files and Check Alignment

For each file in scope:

```bash
view [file]
wc -l [file]
```

**While reading, check architecture alignment:**

#### Identity Chain Check
```
For each mutation:
1. Find session validation call
2. Verify pattern: sessionId → userId → personId
3. Verify audit fields use personId

Pass: Chain correct
Fail: Wrong order, missing step, or userId in audit fields
```

#### Auth Pattern Check
```
For each mutation:
1. Find auth call (validateSessionAndGetUserId)
2. Find first DB write
3. Verify: auth line < write line

Pass: Auth before write, correct helper
Fail: Write before auth, wrong helper
```

#### Layer Dependency Check
```bash
# Core importing from features (violation)
grep -r "from.*features" convex/core/
```

Pass: 0 matches

#### No Classes Check
```bash
grep -n "^class \|^export class " [scoped files]
```

Pass: 0 matches

### Step 5: Run Validation Commands

```bash
npm run check
npm run lint
npm run test:unit:server -- --filter=[domain]  # if applicable
npm run invariants:critical  # if schema changed
```

### Step 6: Check Acceptance Criteria

For each AC:

| AC Pattern | Method |
|------------|--------|
| "X exists" | `view` or `ls` |
| "X returns Y" | View test assertions |
| "X uses pattern Y" | `view` + inspect against architecture.md |
| "Tests pass" | `npm run test` |

### Step 7: Generate Report

```markdown
# Validation: SYOS-XXX

## Ticket Purpose
[One-line summary]

## Tool Calls Made
| # | Tool | Target | Result |
|---|------|--------|--------|
| 1 | Linear:get_issue | SYOS-XXX | ✅ |
| 2 | view | mutations.ts | ✅ read |
| 3 | grep | class declarations | 0 matches |
| 4 | npm run check | — | ✅ pass |

## Architecture Alignment (Blocking)

| Principle | Check | Status | Evidence |
|-----------|-------|--------|----------|
| Identity Chain | sessionId → userId → personId | ✅ / ❌ | [line numbers] |
| XDOM-01 | Audit fields use personId | ✅ / ❌ | [field names] |
| #9 Auth Before Write | validateSessionAndGetUserId first | ✅ / ❌ | [line numbers] |
| #11 No Classes | Zero class declarations | ✅ / ❌ | grep: 0 matches |
| #5 Layer Dependencies | No upward imports | ✅ / ❌ | grep: 0 matches |
| #15-16 Terminology | circle/role/person | ✅ / ❌ | [any violations] |

### Architecture Gaps Found

**If any ❌:**
> ⚠️ **Architecture Misalignment:**
> 
> **Principle #X:** [description]
> **Architecture.md says:** [quote]
> **Code shows:** [what was found]
> 
> **Must fix before passing validation.**

## Guidelines (Report Only, Non-Blocking)

| Guideline | Status | Notes |
|-----------|--------|-------|
| #32 File Size (~300) | ⚠️ / ✅ | [file]: [X] lines |
| #26 Handler Size (≤20) | ⚠️ / ✅ | [handlers over] |

## Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | [text] | ✅ / ❌ | [evidence] |
| AC-2 | [text] | ✅ / ❌ | [evidence] |

## Validation Commands

| Command | Result |
|---------|--------|
| `npm run check` | ✅ Pass / ❌ Fail |
| `npm run lint` | ✅ Pass / ⚠️ X warnings |

## Summary

**Architecture Alignment:** X/Y passed
**Acceptance Criteria:** X/Y passed

## Recommendation

### If all blocking checks pass:
✅ **PASS** — Ready to merge.

### If architecture fails:
❌ **ARCHITECTURE MISALIGNMENT** — Cannot pass.

**Required fixes:**
1. [Specific fix with file:line]

### If AC fails but architecture aligned:
❌ **INCOMPLETE** — Criteria not met.

**Required fixes:**
1. [Specific AC and what's missing]

---

**Next steps:**
- "fix [issue]" to address specific issues
- "fix all" to address all blocking issues
- "confirm" to update ticket (only if PASS)
```

### Step 8: Update Ticket (on explicit confirm only)

Only after user says "confirm" AND validation passed:

1. Add comment to ticket with validation results
2. Update ticket state

---

## Quick Reference

### Always Blocking (From architecture.md)

| ID | Principle | Check Method |
|----|-----------|--------------|
| #5 | Layer dependencies | grep for upward imports |
| #8 | Queries pure | No writes in query handlers |
| #9 | Auth before write | Line number comparison |
| #11 | No classes | grep for class declarations |
| #14a | `.svelte.ts` for reactive, `.ts` for pure | File extension |
| #15-16 | Domain terminology | grep for forbidden terms |
| #33 | Error format | grep + manual check |
| XDOM-01 | personId in audit fields | View schema/mutations |

### Identity Chain (Critical)

```
sessionId → userId → personId → workspaceId
```

**Correct:**
```typescript
const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
// Use person._id for all workspace operations
```

### Terminology Rules

| ✅ Valid | ❌ Invalid |
|----------|------------|
| circle | team |
| role | job, position |
| person | member (workspace context) |
| user, userId | — (auth context only) |

---

## Self-Check Before Reporting

| Question | Required |
|----------|----------|
| Did I fetch from Linear? | Must see Linear:get_issue in tool calls |
| Did I view every scoped file? | Must see view calls |
| Did I run validation commands? | Must see npm run output |
| Does every ✅ have tool evidence? | No "I know because..." |
| Did I check architecture alignment? | Not just "code works" |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2025-12-19 | Complete rewrite aligned with architecture.md v4.1. Streamlined checks. Removed outdated references. |

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