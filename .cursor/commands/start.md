# start

Begin work on a task. Read ticket from Linear, verify against architecture docs, confirm before coding.

---

## Foundational Principle: Docs Lead, Code Follows

**Architecture.md is the source of truth. The codebase may be outdated.**

When you find a gap between documentation and code:
- **DO NOT** assume the code is correct
- **DO NOT** silently follow the code pattern
- **DO** stop and report the gap
- **DO** ask whether to: (A) follow docs, (B) update docs first, (C) clarify intent

```markdown
> ⚠️ **Doc/Code Gap Detected:**
> 
> **Document says:** [quote from architecture.md]
> **Code shows:** [what you found]
> 
> **This could mean:**
> - A) Code is outdated → Follow docs
> - B) Docs need updating → Update docs first, then implement
> - C) Edge case not covered → Need clarification
> 
> **Waiting for guidance before proceeding.**
```

**Why this matters:** AI agents often treat existing code as authoritative. In SynergyOS, we're pre-production with active architecture evolution. Following outdated patterns propagates tech debt.

---

## Core Principle: Never Assume, Always Validate

**When uncertain about ANY of these, STOP and ask:**

- Scope ambiguity ("Should I also update X?")
- Architectural decisions ("Should this be a new file or extend existing?")
- Missing information ("Ticket doesn't specify error handling for Y")
- Conflicting constraints ("Doc says X, code does Y")
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

- [constraint description]
- [constraint description]

## Out of Scope (explicitly stated)

- [thing not to do]
- [thing deferred to later phase]
```

### Step 4: Read Architecture Docs

**Before touching any code, read the relevant architecture docs.**

| If ticket involves... | Read these docs |
|-----------------------|-----------------|
| Any backend work | `architecture.md` (always) |
| Core domain (circles, roles, people, etc.) | `architecture.md` — check FROZEN/STABLE status |
| UI components | `design-system.md` |
| Permissions/access | `convex/infrastructure/rbac/README.md` |
| Data integrity | `convex/admin/invariants/INVARIANTS.md` |
| Feature flags | `convex/infrastructure/featureFlags/README.md` |

**Check domain status before modifying core:**

| Status | Meaning | Process Required |
|--------|---------|------------------|
| **FROZEN** | Organizational truth — foundational | RFC ticket + 1 week cooling + migration plan |
| **STABLE** | Supporting infrastructure | Document reasoning in ticket |

FROZEN domains (require RFC): users, people, circles, roles, assignments, authority, history
STABLE domains (careful evolution): workspaces, proposals, policies

### Step 5: Read Current Code State

For each file in scope:

```bash
# Check if file exists
ls -la [file]

# Read current content
view [file]

# Note line count (guideline, not rule)
wc -l [file]
```

**While reading, actively compare against architecture.md:**

| Check | If Gap Found |
|-------|--------------|
| Identity pattern (sessionId → userId → personId) | Report gap |
| Auth helper usage (validateSessionAndGetUserId) | Report gap |
| Domain terminology (circle, role, person) | Report gap |
| Layer dependencies (infra ← core ← features) | Report gap |
| Export pattern (only via index.ts) | Report gap |

Document:
- Current patterns (do they match architecture.md?)
- Any gaps between docs and code (MUST REPORT)
- Related code that might be affected
- Whether file exists or needs creation

### Step 6: Identify Approach (Docs-First)

**Always derive approach from architecture.md, not from existing code patterns.**

| If working on... | Architecture.md says... |
|------------------|------------------------|
| New domain | 8-file structure: tables.ts, schema.ts, queries.ts, mutations.ts, rules.ts, index.ts, README.md, tests |
| New mutation | Auth (validateSessionAndGetUserId) → Get person context → Authority check → Validate → Write |
| New query | Pure read, no side effects, proper indexes |
| New rule | Pure function if possible, contextual if needs ctx |
| UI component | Thin, delegate to Convex, use recipes |
| Tests | Co-located, independent, cover required cases |
| Schema change | Update tables.ts, register in schema.ts, add indexes |
| RBAC work | Two scopes: systemRoles (userId) vs workspaceRoles (personId) |

### Step 7: Edge Case Check

Before presenting plan, consider:
- Bootstrap/first-record scenarios
- Empty state handling
- Circular dependencies
- Status transition edge cases
- Identity model edge cases (user in multiple workspaces)

If any found, include in "Open Questions" section.

### Step 8: Present Plan (Wait for Confirmation)

```markdown
## Task: SYOS-XXX — [Title]

### Context
- **Parent:** SYOS-YYY — [parent title]
- **Phase:** X of Y
- **Domain Status:** [FROZEN/STABLE/Feature]
- **Key constraint from parent:** [e.g., "Use personId for org identity, userId for auth only"]

### Doc/Code Alignment Check

| Aspect | Architecture.md | Current Code | Status |
|--------|-----------------|--------------|--------|
| Identity chain | sessionId → userId → personId | [what code shows] | ✅ Aligned / ⚠️ Gap |
| Auth helper | validateSessionAndGetUserId | [what code uses] | ✅ Aligned / ⚠️ Gap |
| Layer imports | infra ← core ← features | [what imports show] | ✅ Aligned / ⚠️ Gap |

**If gaps found:**
> ⚠️ **Gaps require resolution before proceeding.** See details above.

### What I'll Do

1. **[Logical unit 1]**
   - Create `path/to/file.ts`
   - Implement [specific thing]
   - Pattern source: [architecture.md section]

2. **[Logical unit 2]**
   - Update `path/to/other.ts`
   - Add [specific thing]
   - Pattern source: [architecture.md section]

3. **[Logical unit 3]**
   - Add tests in `path/to/tests.ts`

### Files to Touch

| File | Exists? | Current Lines | Action | Est. Final |
|------|---------|---------------|--------|------------|
| tables.ts | No | 0 | Create | ~40 |
| queries.ts | No | 0 | Create | ~80 |
| mutations.ts | No | 0 | Create | ~120 |

*Note: Line counts are estimates. Per architecture.md Trade-off Guidance, domain cohesion takes priority over line limits.*

### Architecture Principles I'll Follow

| Principle # | Description | How I'll Apply |
|-------------|-------------|----------------|
| #9 | Mutations validate auth BEFORE writing | Auth first line of every handler |
| #11 | Zero classes | Functions only |
| #15-16 | Domain language | circle, role, person terminology |
| #26 | Handlers ≤20 lines | Extract to rules.ts if growing |

### Acceptance Criteria Mapping

| AC | Satisfied By |
|----|--------------|
| AC-1 | Step 1, Step 2 |
| AC-2 | Step 3 |
| AC-3 | Step 2 |

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| [e.g., Code uses deprecated pattern] | [Will follow architecture.md, not code] |
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

### Step 9: Execute with Checkpoints

After confirmation, implement the plan.

#### During Implementation

**Continuously verify against architecture.md (not existing code):**

- [ ] Auth before writes (validateSessionAndGetUserId first)
- [ ] Identity chain correct (sessionId → userId → personId)
- [ ] Handler staying under 20 lines (extract if growing)
- [ ] Using domain language (circles not teams, person not member)
- [ ] Error format: `ERR_CODE: message`
- [ ] No classes anywhere
- [ ] Exports only via index.ts

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

#### If You Find Code That Contradicts Architecture

```markdown
> ⚠️ **Found code contradicting architecture.md:**
> 
> **Location:** `convex/core/circles/mutations.ts:45`
> **Code pattern:** Uses `getAuthUserId(ctx)` 
> **Architecture.md says:** Use `validateSessionAndGetUserId(ctx, sessionId)`
> 
> **Options:**
> - A) Follow architecture.md (correct pattern, may require refactoring)
> - B) Follow existing code (propagates tech debt)
> - C) This is a known legacy pattern (add to tech debt doc)
> 
> **Pausing for guidance.**
```

### Step 10: Self-Check Before Completion

Before saying "done", verify against architecture.md:

```bash
# Type check
npm run check

# Lint
npm run lint

# Tests (if applicable)
npm run test:unit:server -- --filter=[domain]
```

**Manual verification checklist:**

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Identity chain | View mutations | sessionId → userId → personId |
| Auth pattern | View mutations | validateSessionAndGetUserId used |
| No classes | `grep -n "^class " [files]` | 0 matches |
| Domain language | Review code | No team/manager/permission |
| Error format | Review throws | All use ERR_CODE: message |
| Exports clean | View index.ts | Only public API exported |
| Handler size | Count lines | ≤20 lines (guideline) |

Report results:

```markdown
## Self-Check Complete

### Validation Commands

| Command | Result |
|---------|--------|
| `npm run check` | ✅ Pass |
| `npm run lint` | ✅ Pass / ⚠️ X warnings |
| Tests | ✅ Pass / ⚠️ X failures |

### Architecture Alignment

| Principle | Status | Evidence |
|-----------|--------|----------|
| #9 Auth before write | ✅ | All mutations auth first |
| #11 No classes | ✅ | 0 class declarations |
| #15-16 Terminology | ✅ | circle/role/person used |
| #26 Handler size | ✅ | All handlers ≤20 lines |

### Acceptance Criteria

- [x] AC-1: [evidence]
- [x] AC-2: [evidence]
- [x] AC-3: [evidence]

### Files Created/Modified

| File | Lines | Change |
|------|-------|--------|
| `core/people/tables.ts` | 42 | Created |
| `core/people/queries.ts` | 78 | Created |

---

**Ready for validation.** Run `/validate SYOS-XXX` to verify against ticket criteria.
```

---

## Architecture Quick Reference

### Identity Model (Critical — Memorize This)

```
sessionId → userId → personId → workspaceId

sessionId   = "Which browser session?" (temporary, rotates on logout)
userId      = "Which human logged in?" (global, exactly 1 per human)
personId    = "Who in THIS workspace?" (scoped, 1 per workspace per user)
workspaceId = "Which organization?" (tenant boundary)
```

| Context | Use This | Why |
|---------|----------|-----|
| Authentication | `userId` | Global identity |
| Workspace operations | `personId` | Workspace-scoped identity |
| Audit fields (createdBy, etc.) | `personId` | Maintains workspace isolation |
| System RBAC | `userId` | Platform-wide access |
| Workspace RBAC | `personId` | Org-specific permissions |

**The Invariant (XDOM-01):** No `userId` in core domain tables except `users` and `people`. All audit fields use `personId`.

### Auth Flow (Every Mutation)

```typescript
export const doThing = mutation({
  args: { sessionId: v.string(), workspaceId: v.id('workspaces'), /* ... */ },
  handler: async (ctx, args) => {
    // 1. Session → User (auth layer)
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    
    // 2. User → Person (workspace layer)
    const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
    const personId = person._id;
    
    // 3. Authority check (if needed)
    await requireCircleLead(ctx, personId, args.circleId);
    
    // 4. Validation (via rules.ts)
    validateInput(args);
    
    // 5. Write (using personId for audit)
    return ctx.db.insert("things", { 
      workspaceId: args.workspaceId,
      createdByPersonId: personId,
      /* ... */ 
    });
  },
});
```

### RBAC Two-Scope Model

| Scope | Table | Identifier | Use Case |
|-------|-------|------------|----------|
| **System** | `systemRoles` | `userId` | Platform ops: admin console, developer access |
| **Workspace** | `workspaceRoles` | `personId` | Org ops: billing admin, workspace settings |

### Domain File Structure

```
convex/core/{domain}/
├── tables.ts         # Table definitions (REQUIRED)
├── schema.ts         # Types/aliases (OPTIONAL)
├── queries.ts        # Read operations
├── mutations.ts      # Write operations  
├── rules.ts          # Business rules
├── index.ts          # Public exports ONLY
├── README.md         # Domain documentation
└── {domain}.test.ts  # Co-located tests
```

### Layer Dependencies

```
Application (src/) → Features (convex/features/) → Core (convex/core/) → Infrastructure (convex/infrastructure/)
```

**Never reversed.** Features cannot import from Application. Core cannot import from Features.

### Trade-off Guidance (When Principles Conflict)

| Prioritize This... | Even Over... |
|-------------------|--------------|
| Domain cohesion | File line limits |
| Explicit boundaries | DRY across domains |
| Working code | Perfect structure |
| Readability | Clever abstractions |

### Terminology (Always)

| ✅ Correct | ❌ Never Use |
|-----------|-------------|
| Circle | Team |
| Role | Job, Position |
| Person | Member, User (in workspace context) |
| Authority | Permission |
| Workspace | Organization |

**Exception:** "user" is valid in auth context (users domain, userId for auth).

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

1. **Docs lead, code follows** — Architecture.md is truth, codebase may be outdated
2. **Report gaps** — Don't silently follow outdated code patterns
3. **Fetch ticket from Linear** — Never work from memory
4. **Check domain status** — FROZEN domains require RFC process
5. **Load parent context** — Sub-tickets inherit constraints
6. **Check blockers** — Don't start blocked work
7. **Present plan first** — Wait for explicit confirmation
8. **Never assume** — When in doubt, ask
9. **Checkpoint often** — Run `npm run check` after each logical unit
10. **Identity chain** — sessionId → userId → personId (in that order)
11. **Audit fields** — Always use `personId`, never `userId`
12. **Domain language** — Circle, role, person (not team, job, member)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-14 | Aligned with architecture.md v3.5. Added docs-first principle, gap detection, identity chain fix, RBAC scopes, trade-off guidance. |
| 1.0 | 2025-12-07 | Original version |