# start

Begin work on a task. Fetch from Linear, verify against architecture, confirm before coding.

---

## Foundational Principle: Docs Lead, Code Follows

**`architecture.md` is the source of truth. The codebase may be outdated.**

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
> **Options:**
> - A) Code is outdated → Follow docs
> - B) Docs need updating → Update docs first, then implement
> - C) Edge case not covered → Need clarification
> 
> **Waiting for guidance before proceeding.**
```

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
const children = await Linear.list_issues({ parentId: ticket.id });
```

Understand:
- Execution order and dependencies
- Which sub-ticket to start with
- What each phase delivers

#### 2c: Check Blockers

If ticket has "Blocked By" references and blocker not complete:

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

## Files in Scope

- `path/to/file1.ts` — [what changes]
- `path/to/file2.ts` — [what changes]

## Key Constraints (from ticket + parent)

- [constraint]

## Out of Scope

- [thing not to do]
```

### Step 4a: Read Architecture Docs

**Before touching any code, read the relevant architecture docs.**

| If ticket involves... | Read these docs |
|-----------------------|-----------------|
| Any backend work | `architecture.md` (always) |
| Core domain (circles, roles, people, etc.) | `architecture.md` — check FROZEN/STABLE status |
| UI components, styling, tokens | `design-system.md` |
| Frontend reactive patterns, composables | `architecture.md` → Frontend Patterns section |
| Permissions/access (RBAC) | `convex/infrastructure/rbac/README.md` |
| Governance models, circle types | `governance-design.md` |
| Data integrity | `convex/admin/invariants/INVARIANTS.md` |
| Debugging, fixing issues | `dev-docs/2-areas/patterns/INDEX.md` |

**Domain Status (FROZEN requires RFC):**
- FROZEN: users, people, circles, roles, assignments, authority, history
- STABLE: workspaces, proposals, policies

### Step 4b: Check Existing Patterns

**Before implementing, check if a pattern exists.**
```bash
# Search INDEX.md for related patterns
grep -i "[symptom or concept]" dev-docs/2-areas/patterns/INDEX.md
```

If pattern found:
- Follow the documented solution
- Note any gaps to update pattern after

If no pattern but this seems reusable:
- Flag for `/save` after completion

### Step 5: Read Current Code State

For each file in scope:

```bash
view [file]
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

### Step 6: Identify Approach (Docs-First)

**Derive approach from architecture.md, not from existing code patterns.**

| If working on... | Architecture.md says... |
|------------------|------------------------|
| New domain | 8-file structure: tables.ts, schema.ts, queries.ts, mutations.ts, rules.ts, index.ts, README.md, tests |
| New mutation | Auth (validateSessionAndGetUserId) → Get person context → Authority check → Validate → Write |
| New query | Pure read, no side effects, proper indexes |
| UI component | Thin, delegate to Convex, use recipes |
| Schema change | Update tables.ts, register in schema.ts, add indexes |

### Step 7: Present Plan (Wait for Confirmation)

```markdown
## Task: SYOS-XXX — [Title]

### Context
- **Parent:** SYOS-YYY — [parent title]
- **Phase:** X of Y
- **Domain Status:** [FROZEN/STABLE/Feature]

### Doc/Code Alignment Check

| Aspect | Architecture.md | Current Code | Status |
|--------|-----------------|--------------|--------|
| Identity chain | sessionId → userId → personId | [what code shows] | ✅ / ⚠️ Gap |
| Auth helper | validateSessionAndGetUserId | [what code uses] | ✅ / ⚠️ Gap |
| Layer imports | infra ← core ← features | [what imports show] | ✅ / ⚠️ Gap |

### What I'll Do

1. **[Logical unit 1]**
   - Create/Update `path/to/file.ts`
   - Implement [specific thing]
   - Pattern source: [architecture.md section]

2. **[Logical unit 2]**
   - ...

### Files to Touch

| File | Exists? | Action | Est. Final Lines |
|------|---------|--------|------------------|
| tables.ts | No | Create | ~40 |
| queries.ts | No | Create | ~80 |

### Architecture Principles I'll Follow

| Principle # | Description | How I'll Apply |
|-------------|-------------|----------------|
| #9 | Mutations validate auth BEFORE writing | Auth first line of every handler |
| #11 | Zero classes | Functions only |

### Acceptance Criteria Mapping

| AC | Satisfied By |
|----|--------------|
| AC-1 | Step 1, Step 2 |

### Open Questions (if any)

> ❓ **Questions before I proceed:**
> 1. [question]

---

**Waiting for confirmation before starting.**

Reply with:
- ✅ "Go" to start
- 🔄 "Adjust [X]" to modify
- ❓ "[Question]" for clarification
```

### Step 8: Execute with Checkpoints

After confirmation, implement the plan.

**After each logical unit:**

```bash
npm run check
```

If checkpoint fails:
```markdown
> ⚠️ **Checkpoint failed after [step X]:**
> ```
> [error message]
> ```
> **Fixing before proceeding...**
```

**If you find code that contradicts architecture:**
```markdown
> ⚠️ **Found code contradicting architecture.md:**
> 
> **Location:** `convex/core/circles/mutations.ts:45`
> **Code pattern:** [what you found]
> **Architecture.md says:** [correct pattern]
> 
> **Pausing for guidance.**
```

### Step 9: Self-Check Before Completion

```bash
npm run check
npm run lint
npm run test:unit:server -- --filter=[domain]  # if applicable
```

**Architecture alignment checklist:**

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Identity chain | View mutations | sessionId → userId → personId |
| Auth pattern | View mutations | validateSessionAndGetUserId used |
| No classes | `grep -n "^class " [files]` | 0 matches |
| Domain language | Review code | No team/manager/permission |
| Error format | Review throws | All use ERR_CODE: message |

Report results:

```markdown
## Self-Check Complete

### Validation Commands

| Command | Result |
|---------|--------|
| `npm run check` | ✅ Pass |
| `npm run lint` | ✅ Pass / ⚠️ X warnings |

### Acceptance Criteria

- [x] AC-1: [evidence]
- [x] AC-2: [evidence]

### Files Created/Modified

| File | Lines | Change |
|------|-------|--------|
| `core/people/tables.ts` | 42 | Created |

---

**Ready for validation.** Run `/validate SYOS-XXX` to verify.
```

---

## Architecture Quick Reference

### Identity Model (Critical)

```
sessionId → userId → personId → workspaceId

sessionId   = Browser session (temporary)
userId      = Auth identity (global, 1 per human)
personId    = Org identity (scoped, 1 per workspace per user)
workspaceId = Tenant boundary
```

| Context | Use This |
|---------|----------|
| Authentication | `userId` |
| Workspace operations | `personId` |
| Audit fields | `personId` |
| System RBAC | `userId` |
| Workspace RBAC | `personId` |

### Auth Flow (Every Mutation)

```typescript
export const doThing = mutation({
  args: { sessionId: v.string(), workspaceId: v.id('workspaces'), /* ... */ },
  handler: async (ctx, args) => {
    // 1. Session → User
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    
    // 2. User → Person
    const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
    
    // 3. Authority check (if needed)
    await requireCircleLead(ctx, person._id, args.circleId);
    
    // 4. Validation
    validateInput(args);
    
    // 5. Write (using personId for audit)
    return ctx.db.insert("things", { 
      createdByPersonId: person._id,
      /* ... */ 
    });
  },
});
```

### Terminology (Always)

| ✅ Correct | ❌ Never Use |
|-----------|-------------|
| Circle | Team |
| Role | Job, Position |
| Person | Member, User (in workspace context) |
| Authority | Permission |
| Workspace | Organization |

### Function Naming

| Prefix | Returns | Use When |
|--------|---------|----------|
| `find___` | `T \| null` | May return nothing |
| `get___` | `T` (throws) | Must succeed |
| `list___` | `T[]` | Return collection |
| `create___` | `Id` | Create entity |
| `update___` | `void` or `T` | Modify entity |
| `require___` | `T` (throws) | Fetch-or-throw |

---

## Critical Reminders

1. **Docs lead, code follows** — architecture.md is truth
2. **Fetch ticket from Linear** — Never work from memory
3. **Check domain status** — FROZEN domains require RFC
4. **Load parent context** — Sub-tickets inherit constraints
5. **Present plan first** — Wait for confirmation
6. **Never assume** — When in doubt, ask
7. **Checkpoint often** — Run `npm run check` after each unit
8. **Identity chain** — sessionId → userId → personId
9. **Audit fields** — Always use `personId`, never `userId`
10. **Domain language** — Circle, role, person (not team, job, member)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2025-12-19 | Complete rewrite aligned with architecture.md v4.1. Removed patterns-and-lessons.md references. Streamlined for AI execution. |