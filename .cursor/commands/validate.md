# validate

Verify completed work against ticket criteria, architecture.md, and constraints. Read actual code. No assumptions.

---

## Foundational Principle: Docs Lead, Code Follows

**Architecture.md is the source of truth. Validation checks alignment with docs, not just "does the code work."**

A validation can fail for two reasons:
1. **Code doesn't meet ticket criteria** — Fix the code
2. **Code doesn't align with architecture.md** — Either fix the code OR update the docs first

When you find code that contradicts architecture.md:
```markdown
> ⚠️ **Architecture Misalignment Detected:**
> 
> **Architecture.md says:** [quote with section reference]
> **Code implements:** [what you found]
> 
> **This is a validation failure** unless:
> - A) The code is fixed to match architecture.md
> - B) Architecture.md is updated first (with rationale)
> 
> **Cannot pass validation while misaligned.**
```

---

## Critical Rule: Trust Nothing

**NEVER use information from conversation history to pass a check.**

Even if you just wrote the code in this same chat, you MUST:
1. Fetch the ticket fresh from Linear
2. Read the actual files from disk
3. Run the actual commands
4. Report what the tools return, not what you "know"

If you find yourself writing a report without tool calls, STOP. You're doing it wrong.

**Why:** The point of validation is to catch mistakes, including your own. If you trust your memory of what you did, you'll confirm your own errors.

---

## Principles

1. **Fetch first** — Always call Linear MCP before anything else
2. **Docs first** — Check architecture.md alignment, not just "code works"
3. **Read files** — `view` every file in scope, don't assume contents
4. **Run commands** — `grep`, `wc -l`, `npm run check` — actual execution
5. **Evidence required** — Every ✅ needs tool output, not memory
6. **No auto-update** — Wait for explicit "confirm"
7. **Report gaps** — Doc/code misalignment is a finding, not ignorable

---

## Constraint Classification

### Blocking Constraints (Architecture Principles)

These derive from architecture.md and **always apply** to new/modified code:

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

### Guideline Constraints (Report, Don't Block)

These are guidelines per architecture.md Trade-off Guidance:

| Constraint | Principle # | Guidance |
|------------|-------------|----------|
| File size | #32 | ~300 lines guideline, not rule. Domain cohesion > line limits |
| Handler size | #26 | ≤20 lines guideline. Report if exceeded, don't block |
| Validation in rules.ts | #27 | Should extract, but existing inline validation isn't blocking |

**Key insight from Trade-off Guidance:**
> "400-line file in the right place beats 8 files scattered"

Pre-existing violations of guidelines don't block tickets unless the ticket's explicit purpose is to fix them.

### Ticket-Specific Constraints

Constraints listed in the ticket's `## Constraints` section. Classify each:
- If it's an architecture principle → Blocking
- If it's a guideline → Report only (unless ticket purpose is to fix it)

---

## Execution

### Step 1: Fetch Ticket (MANDATORY FIRST ACTION)

```typescript
const ticket = await Linear.get_issue({ id: ticketId });
```

If no ticket ID provided:
> What ticket? (e.g., SYOS-123)

**This must be your first tool call. No exceptions.**

### Step 2: Parse Ticket

From the Linear response, extract:

**Acceptance Criteria** — checkbox items under `## Acceptance Criteria` or `## Done When`
**Files in Scope** — paths under `## Files in Scope`  
**Constraints** — IDs under `## Constraints`

Display what was found:
```markdown
## Parsed from SYOS-XXX

**Ticket Purpose:** [one-line summary]

**Acceptance Criteria:**
- [ ] AC-1: [text]
- [ ] AC-2: [text]

**Files in Scope:**
- convex/core/circles/mutations.ts
- convex/core/circles/rules.ts

**Ticket Constraints:**
- [list from ticket]

**Architecture Principles (Always Apply):**
- #9: Auth before writes
- #11: No classes
- #15-16: Domain terminology
- XDOM-01: personId for audit fields
```

### Step 3: Read Architecture.md (Required)

Before checking code, refresh on relevant architecture sections:

```bash
view architecture.md
```

Note the current:
- Identity chain pattern
- Auth helper name
- Domain terminology rules
- Layer dependency direction
- RBAC scope model (if RBAC-related)

### Step 4: Read Files and Check Architecture Alignment

For each file in scope:

```bash
view [file]
wc -l [file]
```

**While reading, check alignment with architecture.md:**

#### Identity Chain Check
```
For each mutation:
1. Find session validation call
2. Verify pattern: sessionId → userId → personId
3. Verify audit fields use personId, not userId

Pass: Chain is correct
Fail: Wrong order, missing step, or userId in audit fields
```

#### Auth Pattern Check
```
For each mutation:
1. Find auth call (should be validateSessionAndGetUserId)
2. Find first DB write (insert, patch, replace, delete)
3. Verify: auth line number < write line number

Pass: Auth before write, correct helper
Fail: Write before auth, wrong helper, or missing auth
```

**Deprecated helpers (architecture.md doesn't list these):**
- `getAuthUserId` — replaced by `validateSessionAndGetUserId`
- `requireAuth` — replaced by `validateSessionAndGetUserId`
- `getAuthenticatedUser` — replaced by `validateSessionAndGetUserId`

#### Layer Dependency Check
```bash
# Core importing from features (violation)
grep -r "from.*features" convex/core/

# Features importing from other features (violation)  
grep -r "from.*features" convex/features/[current-feature]/
```

Pass: 0 matches
Fail: Any matches

#### Terminology Check
```bash
# In NEW code only (not string literals or comments about external systems)
grep -in '"team"\|"manager"\|"boss"' [scoped files]
```

Pass: 0 matches in domain logic
Note: "user" is valid in auth context (users domain, userId)

#### No Classes Check
```bash
grep -n "^class \|^export class " [scoped files]
```

Pass: 0 matches
Fail: Any matches

#### Error Format Check
```bash
grep -n "throw new Error" [scoped files]
```

For each match, verify format: `ERR_CODE: message` or uses `createError(ErrorCodes.X, ...)`

#### RBAC Scope Check (if RBAC-related)
```
Per architecture.md RBAC Scope Model:
- System scope: systemRoles table, uses userId
- Workspace scope: workspaceRoles table, uses personId

Verify correct scope and identifier used.
```

### Step 5: Run Validation Commands

```bash
# TypeScript compilation (must pass)
npm run check

# Linting (report warnings)
npm run lint

# Tests if applicable
npm run test:unit:server -- --filter=[domain]

# Invariants if schema changed
npm run invariants:critical
```

### Step 6: Check Acceptance Criteria

For each AC, determine verification method:

| AC Pattern | Method |
|------------|--------|
| "X exists" | `view` or `ls` |
| "X returns Y" | Run test or `view` test assertions |
| "X uses pattern Y" | `view` + inspect against architecture.md |
| "Tests pass" | `npm run test:unit:server` |
| "Handles error case" | `view` test file for error case |

### Step 7: Generate Report

```markdown
# Validation: SYOS-XXX

## Ticket Purpose
[One-line summary: what this ticket is actually trying to accomplish]

## Tool Calls Made
| # | Tool | Target | Result |
|---|------|--------|--------|
| 1 | Linear:get_issue | SYOS-XXX | ✅ |
| 2 | view | architecture.md | ✅ read |
| 3 | view | mutations.ts | ✅ read |
| 4 | grep | class declarations | 0 matches |
| 5 | npm run check | — | ✅ pass |

## Architecture Alignment (Blocking)

| Principle | Check | Status | Evidence |
|-----------|-------|--------|----------|
| Identity Chain | sessionId → userId → personId | ✅ / ❌ | [line numbers or gap description] |
| XDOM-01 | Audit fields use personId | ✅ / ❌ | [field names found] |
| #9 Auth Before Write | validateSessionAndGetUserId first | ✅ / ❌ | [line numbers] |
| #11 No Classes | Zero class declarations | ✅ / ❌ | grep: 0 matches |
| #5 Layer Dependencies | No upward imports | ✅ / ❌ | grep: 0 matches |
| #15-16 Terminology | circle/role/person | ✅ / ❌ | [any violations] |
| #33 Error Format | ERR_CODE: message | ✅ / ❌ | [violations if any] |

### Architecture Gaps Found

**If any ❌ above:**

```markdown
> ⚠️ **Architecture Misalignment:**
> 
> **Principle #X:** [description]
> **Architecture.md says:** [quote]
> **Code shows:** [what was found]
> **Location:** [file:line]
> 
> **Must fix before passing validation.**
```

## Guidelines (Report Only, Non-Blocking)

| Guideline | Status | Notes |
|-----------|--------|-------|
| #32 File Size (~300) | ⚠️ / ✅ | [file]: [X] lines |
| #26 Handler Size (≤20) | ⚠️ / ✅ | [handlers over if any] |

*Per Trade-off Guidance: "Domain cohesion > line limits." These don't block unless ticket purpose is to fix them.*

## Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | [text] | ✅ / ❌ | [evidence from tool] |
| AC-2 | [text] | ✅ / ❌ | [evidence from tool] |

## Validation Commands

| Command | Result |
|---------|--------|
| `npm run check` | ✅ Pass / ❌ Fail |
| `npm run lint` | ✅ Pass / ⚠️ X warnings |
| Tests | ✅ Pass / ❌ X failures |
| Invariants | ✅ Pass / ⚠️ X issues |

## Summary

**Architecture Alignment:** X/Y passed
**Acceptance Criteria:** X/Y passed
**Guidelines:** X warnings (non-blocking)

## Recommendation

### If all blocking checks pass:
✅ **PASS** — Ready to merge.

### If architecture alignment fails:
❌ **ARCHITECTURE MISALIGNMENT** — Cannot pass.

**Required fixes:**
1. [Specific fix with file:line]
2. [Specific fix with file:line]

### If AC fails but architecture aligned:
❌ **INCOMPLETE** — Ticket criteria not met.

**Required fixes:**
1. [Specific AC and what's missing]

---

**Next steps:**
- Say **"fix [issue]"** to address specific issues
- Say **"fix all"** to address all blocking issues
- Say **"confirm"** to update ticket (only if PASS)
```

### Step 8: Update Ticket (on explicit confirm only)

Only after user says "confirm" AND validation passed:

1. Check boxes for passed items
2. Add comment to ticket:

```markdown
## Validation: [timestamp]

**Result:** ✅ PASS

**Architecture Alignment:** All principles satisfied
**Acceptance Criteria:** All met
**Guidelines:** [X warnings noted, non-blocking]

**Validated by:** /validate command
```

3. Update ticket state to appropriate status

---

## Architecture Principle Reference

### Always Blocking (From architecture.md)

| ID | Principle | Check Method |
|----|-----------|--------------|
| #5 | Layer dependencies | grep for upward imports |
| #8 | Queries pure | No writes in query handlers |
| #9 | Auth before write | Line number comparison |
| #11 | No classes | grep for class declarations |
| #15-16 | Domain terminology | grep for forbidden terms |
| #33 | Error format | grep + manual check |
| XDOM-01 | personId in audit fields | View schema/mutations |

### Identity Chain (Critical)

```
sessionId → userId → personId → workspaceId
```

**Correct pattern:**
```typescript
const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
// Use person._id for all workspace operations
```

**Wrong patterns:**
- `userId` in audit fields (violates XDOM-01)
- `personId` derived before `userId` (wrong order)
- Missing workspace scoping step

### RBAC Scopes (If Relevant)

| Scope | Table | Identifier | Check |
|-------|-------|------------|-------|
| System | `systemRoles` | `userId` | Platform-wide access |
| Workspace | `workspaceRoles` | `personId` | Org-specific access |

Using wrong identifier for scope is a blocking issue.

### Terminology Rules

| ✅ Valid | ❌ Invalid | Context |
|----------|------------|---------|
| circle | team | Always |
| role | job, position | Always |
| person | member | Workspace context |
| user, userId | — | Auth context only |
| authority | permission | Domain context |

**Note:** "user" is valid in auth context. Don't flag `userId` in auth code.

### Guidelines (Non-Blocking)

| Guideline | Target | Flexibility |
|-----------|--------|-------------|
| File size | ~300 lines | 400+ OK if cohesive |
| Handler size | ≤20 lines | Can exceed if readable |
| Validation location | rules.ts | Existing inline OK |

---

## Common Validation Mistakes

| Mistake | Why Wrong | Correct |
|---------|-----------|---------|
| Blocking on file size | It's a guideline | Report, don't block |
| Flagging "user" in auth code | Valid in auth context | Only flag in workspace context |
| Passing without tool calls | Memory isn't evidence | Must run actual commands |
| Ignoring doc/code gaps | Docs are truth | Report misalignment |
| Checking code patterns only | Must check architecture | Always compare to docs |

---

## Self-Check Before Reporting

| Question | Required |
|----------|----------|
| Did I fetch from Linear? | Must see Linear:get_issue in tool calls |
| Did I read architecture.md? | Must reference specific principles |
| Did I view every scoped file? | Must see view calls |
| Did I run validation commands? | Must see npm run output |
| Does every ✅ have tool evidence? | No "I know because..." |
| Did I check architecture alignment? | Not just "does code work" |
| Did I classify blocking vs guideline? | Per Trade-off Guidance |

**If any NO, you haven't validated. Go back and run the tools.**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-14 | Aligned with architecture.md v3.5. Added docs-first validation, architecture alignment checks, identity chain validation, RBAC scope checks, corrected terminology rules, clarified blocking vs guideline per Trade-off Guidance. |
| 1.0 | 2025-12-07 | Original version |