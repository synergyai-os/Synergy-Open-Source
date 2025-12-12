# create-tickets

Create Linear tickets from an audited plan. Keep tickets focused and actionable.

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

---

## Ticket Template

```markdown
**Parent:** [SYOS-XXX](link) <!-- if subtask -->

## Delivers

[One sentence: what's different when this is done]

## Files

| Current | Target | Action |
|---------|--------|--------|
| `path/from.ts` | `path/to.ts` | Move |
| — | `path/new.ts` | Create |
| `path/existing.ts` | — | Update |

## Acceptance Criteria

- [ ] Specific, testable outcome 1
- [ ] Specific, testable outcome 2
- [ ] `npm run check` passes

## Validation

```bash
# 1. Format and lint (scoped to affected files/folders)
npx prettier --write convex/core/circles/
npx eslint convex/core/circles/ --fix

# 2. Type check
npm run check

# 3. Verify specific outcomes
wc -l convex/schema.ts          # Expected: <100
ls convex/core/circles/tables.ts # Expected: exists

# 4. Run tests (if applicable, scoped)
npm run test -- convex/core/circles/
```

## Implementation Notes

- Gotcha or guidance 1
- Gotcha or guidance 2
```

---

## Execution

### Step 1: Extract from Audit

From `/audit-plan` output, identify:
- **Root cause** — why the change is needed
- **Files in scope** — what will be touched
- **Constraints** — which principles apply (embed in AC, not separate section)

If no audit exists:
> No audit found. Run `/audit-plan` first.

### Step 2: Design Vertical Slices

Each ticket/subtask should deliver testable value independently.

```
❌ WRONG (horizontal):
- "Add backend logic"
- "Add frontend"
- "Add tests"

✅ RIGHT (vertical):
- "Create tables.ts for circles domain with tests"
- "Move workspaces to core with updated imports"
```

### Step 3: Create Tickets

Use the template above. Key rules:

1. **Delivers** — One sentence, outcome-focused
2. **Files** — Table format, clear actions
3. **Acceptance Criteria** — Checkboxes, testable, include relevant constraints inline
4. **Validation** — Actual bash commands AI can run:
   - Always start with `npx prettier --write <scope>` 
   - Then `npx eslint <scope> --fix` (or `npm run lint` if full codebase)
   - Then `npm run check`
   - Then specific verification commands
   - Scope commands to affected files/folders to reduce noise
5. **Implementation Notes** — Gotchas, edge cases, guidance

### Step 4: Set Parent Links

For subtasks, always:
- Include `**Parent:** [SYOS-XXX](link)` at top
- Set `parentId` in Linear API call

### Step 5: Report

```markdown
## Tickets Created

**Parent:** SYOS-XXX — [Title]

| Subtask | Title | Scope |
|---------|-------|-------|
| SYOS-XXX | [Title] | [Files/domain] |
| SYOS-XXX | [Title] | [Files/domain] |

**Execution order:** 
1. SYOS-XXX (foundation)
2. SYOS-XXX (builds on 1)
3. SYOS-XXX (cleanup)

**Next:** Start new chat → `/validate SYOS-XXX` or `execute SYOS-XXX`
```

---

## Validation Command Patterns

Always scope validation to reduce noise:

```bash
# Format first (scoped)
npx prettier --write convex/core/circles/

# Lint (scoped)
npx eslint convex/core/circles/ --fix

# Type check (full, but run after scoped fixes)
npm run check

# Tests (scoped)
npm run test -- convex/core/circles/

# Specific checks
wc -l file.ts                    # File size
ls path/to/expected/file.ts      # File exists
grep "pattern" file.ts           # Content check
cat file.ts | head -5            # Inspect content
```

For multiple folders:
```bash
npx prettier --write convex/core/ convex/features/workspaces/
npx eslint convex/core/ convex/features/workspaces/ --fix
```

---

## Constraint Quick Reference

Embed these in Acceptance Criteria, not as separate section:

| Constraint | AC Phrasing |
|------------|-------------|
| `hygiene-file-size` | "File is ≤300 lines" or "schema.ts is <100 lines" |
| `hygiene-handler-thin` | "Handlers are ≤20 lines" |
| `cvx-auth-before-write` | "Auth check before any ctx.db write" |
| `cvx-no-classes` | "No classes (functions only)" |
| `dep-no-circular` | "No circular imports" |
| `test-colocated` | "Tests co-located with source" |
| `core-complete` | "Domain files co-located in core/{domain}/" |

---

## Critical Rules

1. **Audit first** — Don't create tickets from vague requests
2. **Vertical slices** — Each ticket delivers testable value
3. **Scoped validation** — Format/lint specific folders, not entire codebase
4. **Prettier before lint** — Always format first, then lint
5. **Actionable commands** — Validation section has actual bash commands AI can run