# save

**Purpose**: Capture knowledge locally by updating patterns. **NO COMMIT** - Files saved locally only (saves time/tokens).

---

# 🚨🚨🚨 CRITICAL: Linear Ticket Required 🚨🚨🚨

## ⛔ **DO NOT PROCEED WITHOUT LINEAR TICKET ID**

**BEFORE doing ANYTHING (analyzing, updating patterns):**

### Step 1: Check for Linear Ticket ID

**Look in the conversation for:**

- "SYOS-123" or "SYOS-XXX" format
- "ticket SYOS-123"
- "Linear ticket"
- Any mention of a Linear issue ID

### Step 2: Decision

**IF NO TICKET ID FOUND:**

**If user says "create new ticket" or "we have no ticket yet":**

→ **Refer to `/start` command** - Ticket creation workflow is handled there

**If user doesn't say "create new ticket":**

```
❌ STOP IMMEDIATELY - I cannot save work without a Linear ticket ID.

Please provide:
- Linear ticket ID (e.g., SYOS-123)
- OR say "create new ticket" and I'll help you create one using /start

Once I have a ticket ID, I'll proceed with saving.
```

**IF TICKET ID FOUND:**

1. **Get ticket details** using `mcp_Linear_get_issue({ id: 'SYOS-123' })`
2. **Check project ID** (REQUIRED unless user explicitly says "no"):
   - If missing → Ask user: "Ticket SYOS-123 has no project ID. Which project should this belong to? (Say 'no project' to skip)"
   - If user says "no project" → Continue (only exception)
   - If user provides project → Get/create project → Update ticket with `projectId`
   - If project ID exists → Continue
3. **Check assignee** (ALWAYS set to Randy):
   - If missing or not Randy → Update ticket with `assignee: 'c7c555a2-895a-48b6-ae24-d4147d44b1d5'`
   - **Note**: Use `assignee` (not `assigneeId`) for `update_issue`
4. **Check estimate** (ALWAYS numeric):
   - If missing or label (like "m") → Convert to numeric (m=3, s=2, l=4, etc.) and update ticket
   - Use `estimate: 0-5` (numeric, not label)
   - Default to `2` (s) if cannot determine

**DO NOT:**

- ❌ Analyze work (until ticket validated)
- ❌ Update patterns (until ticket validated)
- ❌ Do ANY work (until ticket validated)

**ONLY AFTER ticket validated → Continue below**

---

## ✅ Workflow

### 0. 🚨 Validate Linear Ticket (DO THIS FIRST)

**Before analyzing, validate the Linear ticket:**

1. **Get ticket details** → Check project ID, assignee, estimate (see above)
2. **Note**: We're saving locally only (no commit), so we won't update Linear ticket with commit info

**See**: `/start` command for Linear constants and ticket update workflow

---

### 1. Analyze Session - Frame as User Story + Flow Metrics

**Think outcome-driven, not output-driven:**

- **WHO** benefits from this change? (user, developer, contributor, AI assistant)
- **WHAT VALUE** was delivered? (faster workflow, less errors, better UX)
- **WHAT SLICE** was completed? (thin, end-to-end functionality that provides value)

**Flow Distribution - Categorize the work:**

- **🎯 [FEATURE]** - New capability for users
- **🐛 [BUGFIX]** - Fix broken functionality
- **🔧 [TECH-DEBT]** - Code quality, refactoring, architecture
- **📚 [DOCS]** - Documentation, patterns, guides
- **🔒 [RISK]** - Security, critical hotfixes, data integrity

**Flow Metrics Capture:**

- **Type**: feature | bugfix | tech-debt | docs | refactor
- **Scope**: inbox | notes | flashcards | sync | auth | ui | composables | docs | commands
- **Size**: small (<4h) | medium (4-16h) | large (>16h)
- **Flow Days**: Total days from start to done
- **Active Hours**: Actual coding/thinking time
- **Blocked Hours**: Time waiting for something
- **Files Changed**: Count from git stat
- **Impact**: high | medium | low (value/risk assessment)

**See**: `/start` command for complete Linear constants and workflow

---

### 2. Audit Existing Patterns

**🔍 Search Strategy (use grep tool in parallel):**

1. **Search INDEX**: `grep` in `dev-docs/2-areas/patterns/INDEX.md` for symptom keywords
2. **Search domain files**: `grep` in `dev-docs/2-areas/patterns/*.md` for related patterns
3. **Check line numbers**: Found patterns reference exact line numbers (e.g., #L810)

**Decision tree:**

- **Exact match exists** → Update existing pattern (add edge case, enhance example)
- **Similar pattern exists** → Add new pattern + link to related (#L references)
- **Nothing found** → Create new pattern in appropriate domain file

**⚠️ DON'T read `patterns-and-lessons.md`** - it's just a redirect file. Go directly to domain files.

---

### 3. Update Patterns ⭐ DO THIS FIRST

**⚠️ CRITICAL**: Always update patterns to capture knowledge!

#### If Updating Existing Pattern:

1. Open domain file (svelte-reactivity.md, etc.)
2. Find pattern by line number (#L10, #L50, etc.)
3. Enhance: Add edge case to Root Cause, add example to Fix section, update Related links
4. **Don't change line numbers** (keep L10, L50 stable)

#### If Adding New Pattern:

1. Choose domain file:
   - Svelte 5 reactivity → `dev-docs/2-areas/patterns/svelte-reactivity.md`
   - Convex integration → `dev-docs/2-areas/patterns/convex-integration.md`
   - UI/UX → `dev-docs/2-areas/patterns/ui-patterns.md`
   - PostHog → `dev-docs/2-areas/patterns/analytics.md`

2. Add pattern with **next line number** (gaps of 30-50):

   ```markdown
   ## #L[NUMBER]: Pattern Name [🔴/🟡/🟢 SEVERITY]

   **Symptom**: One-line description
   **Root Cause**: One-line cause
   **Fix**: [code example]

   **Apply when**: When to use
   **Related**: #L[OTHER] (Description)
   ```

3. **Validate with Context7** (if library-specific)

4. **Update `dev-docs/2-areas/patterns/INDEX.md`**:
   - Add symptom → line number in appropriate severity table
   - Choose severity: 🔴 Critical (breaks functionality), 🟡 Important (common issue), 🟢 Reference (best practice)

---

### 4. Save Locally ✅

**Files are saved locally** - No commit step (saves time/tokens).

**What's saved:**

- Pattern updates in domain files
- INDEX.md updates
- All file changes remain in working directory

**No git operations** - Files are ready for you to review and commit when ready.

---

## Checklist

**Before Saving:**

- [ ] **🚨 Linear ticket ID present** in conversation (SYOS-XXX format)
- [ ] **Got ticket details** → Validated project ID, assignee (Randy), numeric estimate
- [ ] Searched `dev-docs/2-areas/patterns/INDEX.md` for existing patterns (grep tool)
- [ ] Searched domain files in parallel
- [ ] Updated domain file with pattern/enhancement (search_replace)
- [ ] Updated `dev-docs/2-areas/patterns/INDEX.md` symptom table with line number reference
- [ ] Chose correct severity (🔴 Critical | 🟡 Important | 🟢 Reference)

**After Saving:**

- [ ] Files saved locally (no commit)
- [ ] Reported status: "✅ Patterns updated locally. Files ready for review."

---

## Quick AI Workflow

```
0. 🚨 Check for Linear ticket ID (STOP if missing)
   → If missing and user says "create new ticket" → Refer to /start

1. Validate Linear ticket FIRST:
   - Get ticket details → Check project ID, assignee, estimate
   - Note: No Linear update needed (saving locally only)

2. Analyze → Frame as user story + flow metrics + distribution
   - WHO benefits? WHAT VALUE? WHAT SLICE?
   - Category: FEATURE | BUGFIX | TECH-DEBT | DOCS | RISK

3. Search patterns (use grep, batch parallel reads):
   - INDEX: dev-docs/2-areas/patterns/INDEX.md
   - Domain files: svelte-reactivity.md, convex-integration.md, etc.
   - ⚠️ DON'T read patterns-and-lessons.md (redirect)

4. Update patterns:
   - Add/update domain file with search_replace
   - Update INDEX.md symptom table
   - Use line numbers for references (#L810)

5. Save locally (NO COMMIT):
   → Files saved in working directory
   → Ready for review and commit when you're ready

6. Report status:
   → Confirm: "✅ Patterns updated locally. Files saved. Ready for review."
```

---

## Related

- **Linear Workflow**: `/start` command - Complete Linear constants and workflow
- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Ticket Creation**: `/start` command - Handles ticket creation workflow

---

**Last Updated**: 2025-11-13  
**Purpose**: Local knowledge capture (no commit) - saves time/tokens
