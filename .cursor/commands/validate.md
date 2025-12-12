# validate

Verify completed work against ticket criteria and constraints. Read actual code. No assumptions.

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
2. **Read files** — `view` every file in scope, don't assume contents
3. **Run commands** — `grep`, `wc -l`, `vitest` — actual execution
4. **Evidence required** — Every ✅ needs tool output, not memory
5. **No auto-update** — Wait for explicit "confirm"
6. **Scope matters** — Ticket constraints block; repo standards inform

---

## Constraint Classification

### Ticket-Scoped Constraints (Block Merge)

These constraints are **directly relevant to the ticket's purpose**. Failures here mean the ticket isn't done.

| Category | Constraint IDs | When to Include |
|----------|----------------|-----------------|
| Auth patterns | `cvx-auth-before-write`, `hygiene-auth-helpers` | Any mutation work |
| Query purity | `cvx-queries-pure` | Any query work |
| Error handling | `err-code-format` | If AC mentions errors |
| Testing | `test-colocated`, `test-independent` | If AC mentions tests |
| Domain language | `lang-terminology` | Any new code |
| Dependencies | `dep-layer-direction`, `dep-explicit` | Cross-domain work |
| No classes | `cvx-no-classes` | Any new code |

### Repo-Wide Standards (Report, Don't Block)

These are **always-on enforcement standards** that apply to the whole codebase. They should be caught by CI gates or linting, not bundled into every ticket.

| Constraint | Enforcement Point | Why Not Ticket-Scoped |
|------------|-------------------|----------------------|
| `hygiene-file-size` | CI gate | Pre-existing violations aren't this ticket's job |
| `hygiene-handler-thin` | CI gate | Requires dedicated refactor tickets |
| `hygiene-no-casts` | Linting | Automated enforcement |
| `quality-no-magic` | Linting | Automated enforcement |

**Key principle:** If a file was already over 300 lines before this ticket started, the ticket shouldn't be blocked by that violation unless the ticket's explicit purpose is to fix it.

### Decision Tree: Is This Constraint Blocking?

```
Is the constraint explicitly in the ticket's ## Constraints section?
├─ YES → Is it directly related to the ticket's purpose?
│        ├─ YES → BLOCKING
│        └─ NO → REPORT AS WARNING, suggest removing from ticket
└─ NO → Is it a core safety constraint (auth, no-classes)?
         ├─ YES → BLOCKING (always applies to new code)
         └─ NO → REPORT ONLY (repo-wide standard)
```

---

## Execution

### Step 1: Fetch Ticket (MANDATORY FIRST ACTION)

```typescript
const ticket = await Linear.get_issue({ id: ticketId });
```

If no ticket ID provided:
> What ticket? (e.g., SYOS-123)

**This must be your first tool call. No exceptions.**

Do NOT:
- Use ticket details from earlier in the conversation
- Assume you know what the ticket says
- Skip this because "we just created it"

### Step 2: Parse Ticket

From the Linear response, extract:

**Acceptance Criteria** — checkbox items under `## Acceptance Criteria` or `## Done When`
**Files in Scope** — paths under `## Files in Scope`  
**Constraints** — IDs under `## Constraints`

Display what was found:
```markdown
## Parsed from SYOS-XXX

**Ticket Purpose:** [one-line summary of what this ticket is actually about]

**Acceptance Criteria:**
- [ ] AC-1: [text]
- [ ] AC-2: [text]

**Files in Scope:**
- convex/core/circles/mutations.ts
- convex/core/circles/rules.ts
- convex/core/circles/circles.test.ts

**Ticket Constraints:**
- `hygiene-auth-helpers`
- `cvx-auth-before-write`
- `err-code-format`
- `test-colocated`

**Inferred Core Constraints:** (always apply to new code)
- `cvx-no-classes`
- `lang-terminology`
- `dep-layer-direction`
```

### Step 3: Classify Constraints

Before running checks, classify each constraint:

```markdown
## Constraint Classification

**Blocking (ticket-scoped):**
- `hygiene-auth-helpers` — core purpose of ticket
- `cvx-auth-before-write` — required for mutation work
- `err-code-format` — in AC
- `test-colocated` — in AC

**Reporting Only (repo-wide):**
- `hygiene-file-size` — pre-existing condition, not ticket purpose
- `hygiene-handler-thin` — pre-existing condition, not ticket purpose
```

If ticket lists constraints that seem unrelated to its purpose:
> ⚠️ Ticket includes `hygiene-file-size` but ticket purpose is auth refactor. Treating as report-only. Remove from ticket if this is correct.

### Step 4: Run Constraint Checks

#### Grep-Based Checks (Zero matches = Pass)

| Constraint | Command | Pass |
|------------|---------|------|
| `cvx-no-classes` | `grep -n "^class " [scoped files]` | 0 matches |
| `dep-layer-direction` | `grep -r "from.*features" convex/core/` | 0 matches |
| `hygiene-no-casts` | `grep -n "as unknown as" [scoped files]` | 0 matches |
| `lang-terminology` | `grep -in '"team"\|"manager"\|"permission"\|"user"' [scoped]` | 0 matches |
| `test-independent` | `grep -r "import.*\.test" [scoped tests]` | 0 matches |

#### Size Checks

| Constraint | Command | Pass |
|------------|---------|------|
| `hygiene-file-size` | `wc -l [each scoped file]` | All ≤300 |
| `hygiene-handler-thin` | `view` + count handler lines | All handlers ≤20 |

#### Content Checks (Require `view`)

**`cvx-auth-before-write`:**
```
View mutation file. For each mutation handler:
1. Find first auth call (requireAuth, validateSessionAndGetUserId, getAuthenticatedUser)
2. Find first ctx.db write (insert, patch, replace, delete)
3. Pass if: auth line < write line
4. Fail if: any write before auth, or auth missing
```

**`hygiene-auth-helpers`:**
```
View scoped files. Check that:
- All auth uses validateSessionAndGetUserId (not getAuthUserId)
- No public handler accepts client-supplied userId for acting user
- Acting user always derived from session
Pass if: consistent auth helper usage
```

**`cvx-queries-pure`:**
```
View query file. For each query handler:
- No ctx.db.insert/patch/replace/delete
- No mutations called
- Pass if: read-only operations only
```

**`hygiene-handler-thin`:**
```
View file. For each handler:
1. Find `handler: async (ctx, args) => {`
2. Count lines to closing `}`
3. Exclude blank lines and comment-only lines
4. Pass if: ≤20 lines
```

**`hygiene-validation-rules`:**
```
View mutations file. Check that:
- Input validation calls functions from rules.ts
- No inline validation logic (if statements checking args)
Pass if: validation delegated to rules.ts
```

**`err-code-format`:**
```
View files. For each `throw new Error(`:
- Must match pattern: "ERR_CODE: message"
- ERR_CODE should be SCREAMING_SNAKE
- Should use createError(ErrorCodes.X, ...) helper
Pass if: all errors follow format
```

**`test-colocated`:**
```
For each domain in scope:
- Check that {domain}.test.ts exists next to source files
Pass if: test file exists in same directory
```

**`dep-explicit`:**
```
View index.ts files. Check that:
- Only types and rule functions exported
- No schema definitions exported
- No internal helpers exported
Pass if: clean public API
```

#### Test Execution

```bash
# Run scoped tests
npx vitest run [scoped test files]

# For core domains needing coverage
npx vitest run --coverage [scoped test files]
```

### Step 5: Check Acceptance Criteria

For each AC, determine verification method:

| AC Pattern | Method |
|------------|--------|
| "X exists" | `view` or `ls` |
| "X returns Y" | Run test or `view` test assertions |
| "X ≤ N lines" | `wc -l` |
| "X uses pattern Y" | `view` + inspect |
| "Tests pass" | `npx vitest run` |
| "Handles error case" | `view` test file for error case |

### Step 6: Report

```markdown
# Validation: SYOS-XXX

## Ticket Purpose
[One-line summary: what this ticket is actually trying to accomplish]

## Tool Calls
| # | Tool | Target | Result |
|---|------|--------|--------|
| 1 | Linear:get_issue | SYOS-XXX | ✅ |
| 2 | view | mutations.ts | ✅ read |
| 3 | grep | getAuthUserId | 0 matches |
| 4 | grep | throw new Error | 6 matches |
| 5 | vitest | circles.test.ts | 12/12 passed |

## Blocking Constraints (Ticket-Scoped)

| ID | Constraint | Status | Evidence |
|----|------------|--------|----------|
| `hygiene-auth-helpers` | Auth helper migration | ✅ | All files use validateSessionAndGetUserId |
| `cvx-auth-before-write` | Auth before writes | ✅ | mutations.ts:23 auth, :45 write |
| `err-code-format` | Error format | ❌ | 6 throws without ERR_CODE (see details) |
| `test-colocated` | Tests co-located | ❌ | Missing for 3 files |

### Failed Constraint Details

**`err-code-format`** — 6 violations:
- `circleLifecycle.ts:200-205` — name validation throws raw error
- `roleLifecycle.ts:193-197` — "Circle not found" without code
- `orgChartPermissions.ts:85-90` — "Circle not found" without code
- `orgChartPermissions.ts:195-216` — 3 quick-edit errors without codes

**`test-colocated`** — 3 missing test files:
- `orgStructureImport.ts` — no `orgStructureImport.test.ts`
- `orgChartPermissions.ts` — no `orgChartPermissions.test.ts`
- `roleTemplates.ts` — no `roleTemplates.test.ts`

## Repo-Wide Standards (Report Only)

| ID | Status | Notes |
|----|--------|-------|
| `hygiene-file-size` | ⚠️ | settings.ts: 384, roleTemplates.ts: 380 |
| `hygiene-handler-thin` | ⚠️ | Multiple handlers >20 lines |

*These are pre-existing conditions. Address in separate cleanup tickets if desired.*

## Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | All files use validateSessionAndGetUserId | ✅ | grep getAuthUserId: 0 matches |
| AC-2 | No client-supplied acting userId | ✅ | All handlers derive from session |
| AC-3 | Errors use createError with ErrorCodes | ❌ | 6 raw throws remain |
| AC-4 | Tests added/updated next to source | ❌ | 3 files missing tests |

## Summary

**Blocking Constraints:** 2/4 passed
**Acceptance Criteria:** 2/4 passed
**Repo Standards:** 2 warnings (non-blocking)

## Recommendation

❌ **FIX FIRST**

### Required Fixes (Blocking)

1. **Error formatting** (6 locations)
   - Replace `throw new Error(...)` with `throw createError(ErrorCodes.X, ...)`
   - Add error codes to `convex/infrastructure/errors/codes.ts` if needed

2. **Colocated tests** (3 files)
   - Add `orgStructureImport.test.ts`
   - Add `orgChartPermissions.test.ts`
   - Add `roleTemplates.test.ts`

### Optional Fixes (Repo-Wide, Not Blocking)

- Consider splitting `settings.ts` (384 lines) in a future ticket
- Consider splitting `roleTemplates.ts` (380 lines) in a future ticket
- Consider extracting handler helpers to reduce line counts

---

Say **"fix errors"** to address the 6 error format violations.
Say **"fix tests"** to scaffold the 3 missing test files.
Say **"fix all"** to address all blocking issues.
Say **"confirm anyway"** to update ticket with partial results (not recommended).
```

### Step 7: Update Ticket (on confirm)

Only after user says "confirm":

1. Check boxes ONLY for passed items
2. Add comment to ticket:

```markdown
## Validation: [timestamp]

**Result:** [X]/[Y] blocking constraints passed, [A]/[B] AC passed

**Blocking (Passed):**
- `hygiene-auth-helpers` ✅
- `cvx-auth-before-write` ✅

**Blocking (Failed):**
- `err-code-format`: 6 raw throws without ERR_CODE
- `test-colocated`: Missing tests for orgStructureImport, orgChartPermissions, roleTemplates

**Repo-Wide (Non-Blocking):**
- `hygiene-file-size`: 2 files over 300 lines (pre-existing)
- `hygiene-handler-thin`: Multiple handlers over 20 lines (pre-existing)

**Validated by:** /validate command
```

3. Update ticket state based on results:
   - All blocking passed → "Done" (or prompt user)
   - Some blocking failed → Keep current state

---

## Constraint Reference

### Always Blocking (Core Safety)

| ID | Check | Pass Criteria |
|----|-------|---------------|
| `cvx-auth-before-write` | Auth call before any ctx.db write | Auth line < write line |
| `cvx-queries-pure` | No writes in query handlers | Zero write operations |
| `cvx-no-classes` | `grep "^class "` | 0 matches |
| `dep-layer-direction` | Core doesn't import features | 0 matches |

### Blocking When Listed

| ID | Check | Pass Criteria |
|----|-------|---------------|
| `hygiene-auth-helpers` | Correct auth helper usage | All use validateSessionAndGetUserId |
| `err-code-format` | Error format | All errors: `ERR_CODE: message` |
| `test-colocated` | Tests next to source | `{domain}.test.ts` exists |
| `test-independent` | No cross-test imports | 0 matches |
| `lang-terminology` | Domain language | No team/manager/permission/user |
| `dep-explicit` | Clean exports | Only types + rules in index.ts |
| `hygiene-validation-rules` | Validation in rules.ts | No inline validation |

### Report Only (Repo-Wide)

| ID | Check | Notes |
|----|-------|-------|
| `hygiene-file-size` | `wc -l` ≤300 | Pre-existing violations don't block |
| `hygiene-handler-thin` | Handler ≤20 lines | Requires dedicated refactor |
| `hygiene-no-casts` | No `as unknown as` | Should be linting rule |
| `quality-no-magic` | No hardcoded values | Should be linting rule |

---

## Handling Misclassified Constraints

If ticket lists repo-wide constraints as blocking:

```markdown
## Constraint Scope Issue

The following constraints are listed on the ticket but appear to be repo-wide 
standards rather than ticket-specific requirements:

- `hygiene-file-size` — files were already >300 lines before this ticket
- `hygiene-handler-thin` — handlers were already >20 lines before this ticket

**Options:**
1. Remove these from ticket constraints (recommended)
2. Create separate cleanup tickets for these issues
3. Expand this ticket's scope to include refactoring (not recommended)

Treating as **report-only** for this validation.
```

---

## Self-Check: Is This Validation Real?

Before presenting your report, verify:

| Question | Required |
|----------|----------|
| Did I call `Linear:get_issue`? | Must see it in tool calls |
| Did I `view` every file in scope? | Must see it in tool calls |
| Did I run `wc -l` for size checks? | Must see actual line counts |
| Did I run `grep` for pattern checks? | Must see actual match counts |
| Did I run tests if AC mentions them? | Must see vitest output |
| Does every ✅ have evidence from a tool? | No "I know because I wrote it" |
| Did I classify constraints before reporting? | Blocking vs report-only |
| Did I focus on ticket purpose? | Not just checking everything |

**If any answer is NO, you haven't validated. Go back and run the tools.**

---

## Red Flag: Scope Creep Validation

If your report blocks on constraints unrelated to the ticket's purpose:

```markdown
❌ WRONG:
Ticket: "Migrate auth helpers"
Blocked by: hygiene-file-size (384 lines in settings.ts)

✅ RIGHT:
Ticket: "Migrate auth helpers"
Blocked by: err-code-format (6 throws need ERR_CODE)
Reported: hygiene-file-size (384 lines — pre-existing, not blocking)
```

The validation should answer: **"Did this ticket accomplish its stated purpose?"**

Not: **"Is every file this ticket touched now perfect?"**

---

## Repo-Wide Checks (Always Run, Never Block)

After scoped checks, run full repo checks:

```bash
npm run check    # TypeScript
npm run lint     # ESLint
```

Report results but don't block:

```markdown
## Repo Health

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript | ✅ | Clean |
| ESLint | ⚠️ | 3 warnings in unrelated files |

*Repo health issues don't block ticket completion.*
```

---

## Quick Reference: Common Ticket Types

### Auth Refactor Ticket
**Blocking:** `hygiene-auth-helpers`, `cvx-auth-before-write`
**Report only:** `hygiene-file-size`, `hygiene-handler-thin`

### New Feature Ticket
**Blocking:** `cvx-no-classes`, `lang-terminology`, `dep-layer-direction`, `test-colocated`
**Report only:** `hygiene-file-size` (unless creating new files)

### Bug Fix Ticket
**Blocking:** Specific to the bug being fixed
**Report only:** Most hygiene constraints

### Refactor Ticket
**Blocking:** `hygiene-file-size`, `hygiene-handler-thin` (this IS the purpose)
**Report only:** None — these are the point

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-08 | Separated blocking vs report-only constraints. Added constraint classification step. Focus on ticket purpose. |
| 1.0 | 2025-12-07 | Original version |