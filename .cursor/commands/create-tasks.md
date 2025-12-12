# create-tasks

Create Linear tickets from an audited plan. Embeds constraints that `/validate` will check.

**Prerequisite:** Run `/audit-plan` first. This command uses the approved plan.

---

## Linear Configuration

```
Team ID: 08d684b7-986f-4781-8bc5-e4d9aead6935 (SYOS)
Default Assignee: c7c555a2-895a-48b6-ae24-d4147d44b1d5 (Randy Hereman)
```

### Labels (use IDs)

**Type (pick ONE):**
- `feature`: ba9cfc2b-a993-4265-80dc-07fd1c831029
- `bug`: 62008be5-0ff6-4aae-ba9b-c2887257acf8
- `tech-debt`: 7cec9e22-31d4-4166-ba92-61d8f8c18809
- `risk`: 99472a27-79b0-475b-bd4a-d4d66e3f2b81

**Scope (pick relevant):**
- `backend`: 7299ef53-982d-429d-b513-ccf190b28c16
- `frontend`: 70068764-575a-48a6-b4d1-3735a044230e
- `core`: 85984faf-d453-4241-932f-84b5b4be4d44
- `ui`: ace175ff-3cce-4416-bacc-529ee85e72a9

### Estimates (1-5)

1 = <2h, 2 = 2-4h, 3 = half-full day, 4 = 1-2 days, 5 = 2+ days

---

## Execution

### Step 1: Extract from Audit

From the `/audit-plan` output, extract:

```markdown
**Problem:** [Root cause identified]
**Solution:** [Proper fix from audit]
**Files:** [Affected files list]
**Constraints:** [Principle IDs that were ⚠️ or ❌, plus relevant ✅ ones]
```

If no audit exists in conversation, stop:
> No audit found. Run `/audit-plan` first.

### Step 2: Select Constraints

Pull constraint IDs from the audit. Use this matrix to ensure completeness:

| If files touch... | Always include |
|-------------------|----------------|
| `convex/core/` | `core-complete`, `dep-layer-direction`, `test-core-coverage` |
| Any mutation | `cvx-auth-before-write`, `hygiene-handler-thin`, `err-code-format` |
| Any query | `cvx-queries-pure`, `hygiene-handler-thin` |
| Any rules.ts | `hygiene-validation-rules`, `quality-pure-functions` |
| Any Convex file | `cvx-no-classes`, `hygiene-file-size`, `lang-terminology` |
| `src/lib/components/` | `svelte-thin-components`, `svelte-delegate`, `svelte-runes` |
| Any test file | `test-colocated`, `test-independent` |
| index.ts exports | `dep-explicit` |

Present selection:
> **Constraints for this task:** `cvx-auth-before-write`, `hygiene-handler-thin`, `hygiene-file-size`, `test-colocated`
> 
> Add/remove any?

### Step 3: Design Vertical Slices

**Vertical slice = Delivers testable value independently**

```
❌ WRONG (horizontal):
- "Add backend logic"
- "Add frontend"
- "Add tests"

✅ RIGHT (vertical):
- "Mutation with auth + validation + tests"
- "Query with access check + tests"  
- "UI component with loading states"
```

Plan 2-5 subtasks. Each subtask inherits parent constraints plus any specific to its scope.

### Step 4: Create Parent Ticket

**Template:**

```markdown
## Context
[From audit: root cause and why it matters]

## Problem
[Symptom observed → root cause identified]

## Solution
[Proper fix from audit]

## Acceptance Criteria
- [ ] AC-1: [Specific, testable]
- [ ] AC-2: [Specific, testable]

## Files in Scope
- `path/to/file1.ts`
- `path/to/file2.ts`

## Constraints
<!-- These will be checked by /validate -->
- [ ] `cvx-auth-before-write`: Auth check before any ctx.db write
- [ ] `hygiene-handler-thin`: Handlers ≤20 lines
- [ ] `hygiene-file-size`: Files ≤300 lines
- [ ] `test-colocated`: Tests next to source
- [ ] `err-code-format`: Errors use ERR_CODE: message

## Validation
Run `/validate SYOS-XXX` when complete.
```

### Step 5: Create Subtasks

**Template:**

```markdown
**Parent:** SYOS-XXX

## Delivers
[Specific testable outcome]

## Satisfies
- Parent AC-1
- Parent AC-2 (partial)

## Files
- [ ] `convex/core/circles/mutations.ts` — add `approve` mutation
- [ ] `convex/core/circles/rules.ts` — add `canApprove` rule
- [ ] `convex/core/circles/circles.test.ts` — add tests

## Constraints
<!-- Inherited from parent + subtask-specific -->
- [ ] `cvx-auth-before-write`
- [ ] `hygiene-handler-thin`
- [ ] `test-colocated`

## Done When
All boxes checked. `/validate SYOS-XXX-1` passes.
```

**Critical:** Set `projectId` explicitly on subtasks.

### Step 6: Verify Creation

After creating each ticket:

```typescript
const ticket = await Linear.get_issue({ id: ticketId });

// Verify structure
assert(ticket.description.includes("## Constraints"), "Missing constraints section");
assert(ticket.description.includes("## Acceptance Criteria"), "Missing AC section");

// For subtasks
if (isSubtask) {
  assert(ticket.parent?.id === parentId, "Missing parent link");
  assert(ticket.project?.id, "Missing projectId");
}
```

### Step 7: Report

```markdown
## Tickets Created

**Parent:** SYOS-XXX — [Title]
- Estimate: [X] points
- Constraints: `cvx-auth-before-write`, `hygiene-handler-thin`, ...

**Subtasks:**

| ID | Title | Est | Satisfies | Constraints |
|----|-------|-----|-----------|-------------|
| SYOS-XXX-1 | [Title] | 2 | AC-1 | inherited + `test-colocated` |
| SYOS-XXX-2 | [Title] | 3 | AC-2 | inherited |

**Total:** X points

---

**Next:** Start new chat → `execute SYOS-XXX-1`
```

---

## Constraint Quick Reference

| ID | Check | Pass |
|----|-------|------|
| `cvx-auth-before-write` | Auth before ctx.db write | Line numbers: auth < write |
| `cvx-queries-pure` | No side effects in queries | No mutations, no ctx.db writes |
| `cvx-no-classes` | `grep "^class "` | 0 matches |
| `hygiene-handler-thin` | Count handler lines | ≤20 |
| `hygiene-file-size` | `wc -l` | ≤300 |
| `hygiene-validation-rules` | Validation in rules.ts | Not inline in handler |
| `test-colocated` | Test file location | `{domain}.test.ts` next to source |
| `test-independent` | `grep "import.*\.test"` | 0 matches |
| `err-code-format` | Error string format | `ERR_CODE: message` |
| `lang-terminology` | `grep "team\|manager"` | 0 matches |
| `dep-layer-direction` | `grep "from.*features" core/` | 0 matches |
| `dep-explicit` | Exports via index.ts | No internal helpers exported |

---

## Critical Rules

1. **Audit first** — Don't create tasks from vague requests
2. **Embed constraints** — `/validate` parses these exact IDs
3. **Vertical slices** — Each subtask delivers testable value
4. **Set projectId** — Linear API doesn't inherit it
5. **Constraint checkboxes** — Use `- [ ]` format for tracking