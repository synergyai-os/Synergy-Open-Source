# /start

Begin work on a task. Read ticket from Linear, understand constraints, confirm before coding.

---

## Core Principle: Never Assume, Always Validate

**When uncertain about ANY of these, STOP and ask:**

- Scope ambiguity ("Should I also update X?")
- Architectural decisions ("Should this be a new file or extend existing?")
- Missing information ("Ticket doesn't specify error handling for Y")
- Conflicting constraints ("File is 280 lines, adding 30 would exceed limit")
- Domain terminology ("Is this a 'member' or 'person' in this context?")
- Implicit expectations ("Does 'update' mean patch or replace?")

**Format for clarifying questions:**

```markdown
> ❓ **Clarification needed before proceeding:**
> 
> **Question:** [Specific question]
> 
> **Options I see:**
> - A) [option]
> - B) [option]
> 
> **My lean:** [option] because [reason]
> 
> **Waiting for your input before continuing.**
```

**Do not proceed with assumptions. Explicit > implicit.**

---

## Workflow

### Step 1: Fetch Ticket from Linear

**Always fetch the ticket - never work from memory or conversation context.**

```typescript
// Use Linear MCP to get the ticket
const ticket = await Linear.get_issue({ id: ticketId });
```

If no ticket ID provided:
> ❓ What ticket should I work on? (e.g., SYOS-123)

**Do not proceed without fetching from Linear.**

### Step 2: Load Full Context (Parent + Children)

#### 2a: Check for Parent Ticket

If ticket has `parentId`:

```typescript
// Fetch parent for architectural context
const parent = await Linear.get_issue({ id: ticket.parentId });
```

Extract from parent:
- Overall goal / architectural decisions
- Key constraints that apply to ALL sub-tickets
- Identity model, terminology, patterns to follow
- Phase number (e.g., "This is Phase 1 of 7")

#### 2b: Check for Sub-tickets (if working on parent)

If working on a parent epic:

```typescript
// List all sub-tickets
const children = await Linear.list_issues({ parentId: ticket.id });
```

Understand:
- Execution order and dependencies
- Which sub-ticket to start with
- What each phase delivers

#### 2c: Check Blockers

If ticket has "Blocked By" references:

```typescript
// Fetch each blocker
for (const blockerId of blockers) {
  const blocker = await Linear.get_issue({ id: blockerId });
  if (blocker.status !== 'Done') {
    // STOP - cannot proceed
  }
}
```

If blocker not complete:

```markdown
> ⚠️ **Blocker not complete:**
> 
> - [SYOS-XXX: Title] is in status **[status]**
> - This ticket cannot proceed until blocker is resolved
> 
> **Options:**
> - A) Work on the blocker first
> - B) Wait for blocker to be completed
> - C) Check if blocker is actually required
> 
> **What would you like me to do?**
```

### Step 3: Parse Ticket Details

Extract from the ticket description:

```markdown
## Ticket Summary

**ID:** SYOS-XXX
**Title:** [title]
**Type:** [feature/bug/tech-debt from labels]
**Parent:** [SYOS-YYY if exists] — [parent title]
**Phase:** [X of Y if sub-ticket]

## Acceptance Criteria

- [ ] AC-1: [text]
- [ ] AC-2: [text]
- [ ] AC-3: [text]

## Files in Scope

- `path/to/file1.ts` — [what changes]
- `path/to/file2.ts` — [what changes]

## Key Constraints (from ticket + parent)

- `constraint-id-1`: [description]
- `constraint-id-2`: [description]

## Out of Scope (explicitly stated)

- [thing not to do]
- [thing deferred to later phase]
```

#### Auto-Infer Constraints

If constraints section missing, apply based on files:

| If files touch... | Apply these constraints |
|-------------------|------------------------|
| `convex/core/` | `core-complete`, `dep-layer-direction`, `test-core-coverage` |
| Any mutation | `cvx-auth-before-write`, `hygiene-handler-thin`, `err-code-format` |
| Any query | `cvx-queries-pure`, `hygiene-handler-thin` |
| Any Convex file | `cvx-no-classes`, `hygiene-file-size`, `lang-terminology` |
| `src/` components | `svelte-thin-components`, `svelte-delegate`, `svelte-runes` |
| Any test file | `test-colocated`, `test-independent` |
| New domain folder | `README.md` required, standard file structure |

### Step 4: Read Current State

For each file in scope:

```bash
# Check if file exists
ls -la [file]

# Read current content
view [file]

# Note line count for hygiene check
wc -l [file]
```

Document:
- Current line counts (for `hygiene-file-size` ≤300 limit)
- Existing patterns to follow
- Related code that might be affected
- Whether file exists or needs creation

### Step 5a: Identify Approach

Based on architecture.md principles:

| If working on... | Approach |
|------------------|----------|
| New domain | Create full structure: tables.ts, schema.ts, queries.ts, mutations.ts, rules.ts, index.ts, README.md, tests |
| New mutation | Auth → RBAC → Authority → Validate → Write pattern |
| New query | Pure read, no side effects, proper indexes |
| New rule | Pure function if possible, contextual if needs ctx |
| UI component | Thin, delegate to Convex, use recipes |
| Tests | Co-located, independent, cover required cases |
| Schema change | Update tables.ts, register in schema.ts, add indexes |

---

### Step 5b: Edge Case Check

Before presenting plan, consider:
- Bootstrap/first-record scenarios
- Empty state handling
- Circular dependencies (e.g., invitedBy references people, but first person has no inviter)
- Status transition edge cases

If any found, include in "Open Questions" section.

### Step 6: Present Plan (Wait for Confirmation)

```markdown
## Task: SYOS-XXX — [Title]

### Context
- **Parent:** SYOS-YYY — [parent title]
- **Phase:** X of Y
- **Key constraint from parent:** [e.g., "Use personId for org identity, userId for auth only"]

### What I'll Do

1. **[Logical unit 1]**
   - Create `path/to/file.ts`
   - Implement [specific thing]

2. **[Logical unit 2]**
   - Update `path/to/other.ts`
   - Add [specific thing]

3. **[Logical unit 3]**
   - Add tests in `path/to/tests.ts`

### Files to Touch

| File | Exists? | Current Lines | Action | Final Lines |
|------|---------|---------------|--------|-------------|
| tables.ts | No | 0 | Create | ~40 |
| queries.ts | No | 0 | Create | ~80 |
| mutations.ts | No | 0 | Create | ~120 |
| rules.ts | No | 0 | Create | ~60 |
| README.md | No | 0 | Create | ~50 |

### Constraints I'll Follow

- `constraint-1`: [How I'll satisfy it]
- `constraint-2`: [How I'll satisfy it]
- `hygiene-file-size`: All files under 300 lines ✓

### Acceptance Criteria Mapping

| AC | Satisfied By |
|----|--------------|
| AC-1 | Step 1, Step 2 |
| AC-2 | Step 3 |
| AC-3 | Step 2 |

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| [e.g., Schema change might affect X] | [Will verify Y first] |
| [e.g., New table needs registration] | [Will update schema.ts] |

### Open Questions (if any)

> ❓ **Questions before I proceed:**
> 
> 1. [Specific question about ambiguity]
> 2. [Specific question about scope]
>
> Or if none: "No ambiguities identified. Ready to proceed."

---

**Waiting for confirmation before starting implementation.**

Reply with:
- ✅ "Go" or "Proceed" to start
- 🔄 "Adjust [X]" to modify the plan
- ❓ "[Question]" for clarification
```

**Do not proceed without explicit confirmation.**

### Step 7: Execute with Checkpoints

After confirmation, implement the plan.

#### During Implementation

**Continuously verify:**

- [ ] Auth before writes (don't "check exists" first)
- [ ] Handler staying under 20 lines (extract if growing)
- [ ] Using domain language (circles not teams, person not member)
- [ ] Error format: `ERR_CODE: message`
- [ ] No classes anywhere
- [ ] Following patterns from existing code

#### Checkpoint After Each Logical Unit

After completing each logical unit from the plan:

```bash
# Type check - must pass before continuing
npm run check
```

If checkpoint fails:

```markdown
> ⚠️ **Checkpoint failed after [step X]:**
> 
> **Error:**
> ```
> [error message]
> ```
> 
> **Fixing before proceeding to next step...**
```

**Do not accumulate errors across steps. Fix before continuing.**

#### If You Encounter Ambiguity During Implementation

```markdown
> ❓ **Encountered ambiguity during implementation:**
> 
> **Context:** Working on [step X], specifically [what you're doing]
> 
> **Issue:** [What's unclear]
> 
> **Options:**
> - A) [option]
> - B) [option]
> 
> **Pausing for guidance.**
```

### Step 8: Self-Check Before Completion

Before saying "done", run these checks:

```bash
# File sizes (must be ≤300)
wc -l [all touched files]

# No classes
grep -n "^class " [touched files]

# Terminology (should find 0)
grep -in '"team"\|"manager"\|"permission"' [touched files]

# Error format (should use ERR_CODE pattern)
grep -n "throw new Error" [touched files]

# Type check
npm run check

# Tests pass (if tests exist)
npm run test -- --filter=[domain]
```

Report results:

```markdown
## Self-Check Complete

| Check | Result |
|-------|--------|
| File sizes ≤300 | ✅ tables.ts: 42, queries.ts: 78, mutations.ts: 115 |
| No classes | ✅ 0 matches |
| Terminology | ✅ 0 violations |
| Error format | ✅ All use ERR_CODE: message |
| Type check | ✅ npm run check passes |
| Tests | ✅ All passing |

## Acceptance Criteria

- [x] AC-1: [evidence]
- [x] AC-2: [evidence]
- [x] AC-3: [evidence]

## Files Created/Modified

| File | Lines | Change |
|------|-------|--------|
| `core/people/tables.ts` | 42 | Created |
| `core/people/queries.ts` | 78 | Created |
| ... | ... | ... |

---

**Ready for validation.** Run `/validate SYOS-XXX` to verify against ticket criteria.
```

---

## Architecture Quick Reference

### Documents to Read (if needed)

| Topic | Document |
|-------|----------|
| Backend/domain structure | `dev-docs/master-docs/architecture.md` |
| UI/styling/tokens | `dev-docs/master-docs/design-system.md` |
| Authentication | `dev-docs/master-docs/workos-convex-auth-architecture.md` |
| Access control | `dev-docs/master-docs/rbac/rbac-architecture.md` |

### File Locations

| Domain | Path |
|--------|------|
| Users (auth) | `/convex/core/users/` |
| People (org) | `/convex/core/people/` |
| Circles | `/convex/core/circles/` |
| Roles | `/convex/core/roles/` |
| Assignments | `/convex/core/assignments/` |
| Proposals | `/convex/core/proposals/` |
| Authority | `/convex/core/authority/` |
| History | `/convex/core/history/` |
| Workspaces | `/convex/core/workspaces/` |
| Meetings | `/convex/features/meetings/` |
| Tags | `/convex/features/tags/` |

### Identity Model (Critical)

```
sessionId → personId → userId → authenticated

sessionId  = "Which browser session?" (temporary, auth mechanism)
personId   = "Who in THIS workspace?" (scoped, 1 per workspace)
userId     = "Which human logged in?" (global, exactly 1 per human)
```

| When you need... | Use | Location |
|------------------|-----|----------|
| Auth identity | `userId` | `infrastructure/auth`, `rbac` only |
| Org identity | `personId` | Everywhere else |

### Standard Domain Structure

```
convex/core/{domain}/
├── tables.ts         # Table definitions (defineTable)
├── schema.ts         # Schema export for convex/schema.ts
├── queries.ts        # Read operations
├── mutations.ts      # Write operations
├── rules.ts          # Business rules (pure + contextual)
├── index.ts          # Public API exports only
├── README.md         # Domain documentation (AI-friendly)
└── {domain}.test.ts  # Co-located tests
```

### Mutation Pattern

```typescript
export const doThing = mutation({
  args: { sessionId: v.string(), /* other args */ },
  handler: async (ctx, args) => {
    // 1. Auth (ALWAYS FIRST)
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    
    // 2. Get person context (for org operations)
    const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
    
    // 3. Authority check
    await requireCircleLead(ctx, person._id, args.circleId);
    
    // 4. Validation (via rules.ts)
    validateInput(args);
    
    // 5. Write
    return ctx.db.insert("things", { 
      createdByPersonId: person._id,
      /* ... */ 
    });
  },
});
```

### Test Cases Required (per mutation)

| Case | Expected Error |
|------|----------------|
| Success path | Returns expected result |
| No auth | `AUTH_REQUIRED` |
| Wrong RBAC | `AUTHZ_INSUFFICIENT_RBAC` |
| Wrong authority | `AUTHZ_NOT_CIRCLE_LEAD` etc. |
| Invalid input | `VALIDATION_*` |
| Business rule violation | Domain-specific error |

---

## Critical Reminders

1. **Fetch ticket from Linear** — Never work from memory
2. **Load parent context** — Sub-tickets inherit constraints
3. **Check blockers** — Don't start blocked work
4. **Present plan first** — Wait for explicit confirmation
5. **Never assume** — When in doubt, ask
6. **Checkpoint often** — Run `npm run check` after each logical unit
7. **Self-check before done** — Verify all criteria met
8. **Domain language** — Circle, role, person (not team, job, member, user for org context)
9. **personId for org, userId for auth** — Never mix them up