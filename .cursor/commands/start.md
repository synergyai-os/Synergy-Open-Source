# start

Begin work on a task. Read ticket, understand constraints, confirm before coding.

---

## Workflow

### Step 1: Fetch Ticket using Linear MCP

```typescript
const ticket = await Linear.get_issue({ id: ticketId });
```

If no ticket ID provided:
> What ticket? (e.g., SYOS-123)

**Do not proceed without fetching from Linear.**

### Step 2: Parse Ticket

Extract from the ticket description:

```markdown
**Title:** [ticket title]
**Type:** [feature/bug/tech-debt from labels]

**Acceptance Criteria:**
- AC-1: [text]
- AC-2: [text]

**Files in Scope:**
- path/to/file1.ts
- path/to/file2.ts

**Constraints:**
- `constraint-id-1`: [description]
- `constraint-id-2`: [description]
```

If constraints section missing:
> ⚠️ Ticket missing constraints. Inferring from file scope...

Then apply constraint matrix:

| If files touch... | Apply |
|-------------------|-------|
| `convex/core/` | `core-complete`, `dep-layer-direction`, `test-core-coverage` |
| Any mutation | `cvx-auth-before-write`, `hygiene-handler-thin`, `err-code-format` |
| Any query | `cvx-queries-pure`, `hygiene-handler-thin` |
| Any Convex file | `cvx-no-classes`, `hygiene-file-size`, `lang-terminology` |
| `src/` components | `svelte-thin-components`, `svelte-delegate`, `svelte-runes` |
| Any test file | `test-colocated`, `test-independent` |

### Step 3: Read Current State

For each file in scope, read current state:

```bash
view [file]
wc -l [file]
```

Note:
- Current line counts (for `hygiene-file-size`)
- Existing patterns to follow
- Related code that might be affected

### Step 4: Identify Approach

Based on architecture.md principles:

| If working on... | Approach |
|------------------|----------|
| New mutation | Auth → RBAC → Authority → Write pattern |
| New query | Pure read, no side effects |
| New rule | Pure function if possible, contextual if needs ctx |
| UI component | Thin, delegate to Convex, use recipes |
| Tests | Co-located, independent, cover required cases |

### Step 5: Present Plan

```markdown
## Task: SYOS-XXX — [Title]

### What I'll Do
1. [Step with file:change]
2. [Step with file:change]
3. [Step with file:change]

### Files to Touch
| File | Current Lines | Action |
|------|---------------|--------|
| mutations.ts | 187 | Add `approve` (~25 lines) |
| rules.ts | 95 | Add `canApprove` (~15 lines) |
| circles.test.ts | 234 | Add 5 test cases (~60 lines) |

### Constraints I'll Follow
- `cvx-auth-before-write`: Will check auth on line 1 of handler
- `hygiene-handler-thin`: Will extract validation to rules.ts
- `hygiene-file-size`: mutations.ts will be ~212 lines (under 300)
- `test-colocated`: Tests go in circles.test.ts

### Acceptance Criteria Mapping
- AC-1 → Steps 1, 2
- AC-2 → Step 3

---

**Ready to proceed?** (or `/audit-plan` to verify approach)
```

Wait for confirmation.

### Step 6: Execute

After confirmation, implement the plan.

**During implementation, continuously verify:**
- [ ] Auth before writes (don't "check exists" first)
- [ ] Handler staying under 20 lines (extract if growing)
- [ ] Using domain language (circles not teams)
- [ ] Error format: `ERR_CODE: message`

### Step 7: Self-Check Before Calling Done

Before saying "done", run quick checks:

```bash
# File sizes
wc -l [touched files]

# No classes
grep -n "^class " [touched files]

# Terminology
grep -in '"team"\|"manager"\|"permission"' [touched files]

# Error format
grep -n "throw new Error" [touched files]
```

Report:
```markdown
## Self-Check

| Check | Result |
|-------|--------|
| File sizes ≤300 | ✅ mutations.ts: 212, rules.ts: 110 |
| No classes | ✅ 0 matches |
| Terminology | ✅ 0 violations |
| Error format | ✅ All use ERR_CODE: message |

Ready for `/validate SYOS-XXX`
```

---

## Architecture Quick Reference

**Read if needed:**
- Backend/domain: `dev-docs/master-docs/architecture.md`
- UI/styling: `dev-docs/master-docs/design-system.md`
- Auth: `dev-docs/master-docs/workos-convex-auth-architecture.md`
- RBAC: `dev-docs/master-docs/rbac/rbac-architecture.md`

**File locations:**
| Domain | Path |
|--------|------|
| Circles | `/convex/core/circles/` |
| Roles | `/convex/core/roles/` |
| Meetings | `/convex/features/meetings/` |
| Shared components | `/src/lib/components/` |
| Feature components | `/src/lib/modules/[module]/components/` |

**Mutation pattern:**
```typescript
export const doThing = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    // 1. Auth
    const user = await requireAuth(ctx);
    
    // 2. RBAC (if needed)
    await requireCapability(ctx, user, "capability.name");
    
    // 3. Authority
    await requireCircleLead(ctx, user._id, args.circleId);
    
    // 4. Validation (via rules.ts)
    validateThingInput(args);
    
    // 5. Write
    return ctx.db.insert("things", { ... });
  },
});
```

**Test cases required per mutation:**
- Success path
- No auth → `AUTH_REQUIRED`
- Wrong RBAC → `AUTHZ_INSUFFICIENT_RBAC`
- Wrong authority → `AUTHZ_NOT_*`
- Invalid input → `VALIDATION_*`
- Business rule violation → domain error

---

## Critical Reminders

1. **Fetch ticket first** — Don't work from memory
2. **Present plan** — Wait for confirmation
3. **Follow constraints** — They'll be checked by `/validate`
4. **Self-check** — Run quick checks before saying done
5. **Domain language** — Circle, role, person, consent, tension