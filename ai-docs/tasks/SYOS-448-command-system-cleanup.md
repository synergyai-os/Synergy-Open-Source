# Command System Cleanup & Documentation Update

**Linear Ticket**: [SYOS-448](https://linear.app/younghumanclub/issue/SYOS-448)

**Goal**: Clean up obsolete commands, update command registry (README.md), and sync workflow documentation to reflect current command system.

---

## Problem Analysis

**Current State**: Command system has duplication and documentation drift.

**Pain Points**:

- 3 obsolete commands (1,428 lines): `/linear`, `/linear-subtickets`, `/start-new-project`
- README.md missing 5 commands: `/bug-fix`, `/code-cleanup`, `/code-review`, `/validate`, `/svelte-validate`
- Workflow doc references deleted commands (will reference `/linear` → should be `/create-tasks`)
- Unclear Svelte MCP integration status (workflow says "automatic", README says nothing)

**Impact**:

- Confusion about which commands to use
- Maintenance burden (duplicate Linear logic in 3 places)
- Documentation not trustworthy (README incomplete, workflow out of sync)

**Investigation**:

- ✅ Verified all commands exist in `.cursor/commands/` folder
- ✅ Identified duplication: `/create-tasks` (676 lines) replaces `/linear` (529) + `/linear-subtickets` (298)
- ✅ Identified obsolete: `/start-new-project` (601 lines) replaced by modern workflow
- ✅ Confirmed missing from README: 5 commands exist but not documented

---

## Approach Options

### Approach A: Manual Cleanup (File-by-File)

**How it works**: Delete files manually, update docs manually, verify manually.

**Pros**: Full control, can review each change
**Cons**: Time-consuming, error-prone, might miss references
**Complexity**: Low
**Dependencies**: None

### Approach B: Scripted Cleanup + Manual Verification

**How it works**: Script to delete files + update references, manual doc updates.

**Pros**: Faster, less error-prone for file operations
**Cons**: Need to write script, might miss edge cases in docs
**Complexity**: Medium
**Dependencies**: Bash/Node script

### Approach C: Manual Cleanup with Checklist (RECOMMENDED)

**How it works**: Systematic manual cleanup following detailed checklist, verify each step.

**Pros**: Thorough, catches all references, documents changes, no script needed
**Cons**: Takes time, must be careful
**Complexity**: Low-Medium
**Dependencies**: None

---

## Recommendation

**Selected**: Approach C (Manual Cleanup with Checklist)

**Reasoning**:

- Small number of files (3 deletions, 2 doc updates)
- Need to carefully update references in workflow doc
- Documentation changes require human judgment (not scriptable)
- Checklist ensures nothing missed

**Trade-offs accepted**: Takes more time than scripted approach, but safer and more thorough.

**Risk assessment**: Low - small changes, easy to verify, can test after each step.

---

## Current State

**Commands to delete:**

- `.cursor/commands/linear.md` (529 lines)
- `.cursor/commands/linear-subtickets.md` (298 lines)
- `.cursor/commands/start-new-project.md` (601 lines)

**Commands to add to README:**

- `/bug-fix` (946 lines)
- `/code-cleanup` (388 lines)
- `/code-review` (572 lines)
- `/validate` (54 lines)
- `/svelte-validate` (515 lines)

**Documentation to update:**

- `.cursor/commands/README.md` - Add missing commands, remove deleted commands
- `dev-docs/2-areas/development/ai-development-workflow-v2.md` - Update references

**Investigation findings:**

- Svelte MCP integration: Need to check `/go.md`, `/bug-fix.md`, `/code-review.md` for actual implementation
- All deleted commands have replacement: `/create-tasks` (confirmed by user)

---

## Technical Requirements

**File Operations**:

- Delete 3 command files (`.cursor/commands/*.md`)
- Update 2 documentation files (README.md, workflow doc)

**Documentation Updates**:

**README.md changes:**

1. Add 5 commands to "Optimization Results" table
2. Add 5 commands to "Command Organization" section
3. Update "Recent Enhancements" with creation dates
4. Remove entries for deleted commands (if any)
5. Update line count totals

**Workflow doc changes:**

1. Replace all `/linear` references → `/create-tasks`
2. Replace all `/linear-subtickets` references → `/create-tasks`
3. Remove `/start-new-project` references (or mark obsolete)
4. Verify Svelte MCP integration claims match reality
5. Update "Available Commands" section

**Search & Replace**:

- Search: `/linear` (workflow doc)
- Replace: `/create-tasks`
- Verify: Each replacement makes sense in context

---

## Success Criteria

**Functional**:

- ✅ 3 obsolete commands deleted
- ✅ README.md includes all 19 active commands
- ✅ Workflow doc references only active commands
- ✅ No broken references to deleted commands
- ✅ Svelte MCP integration status clarified

**Documentation Quality**:

- ✅ README.md is accurate command registry
- ✅ Workflow doc aligns with README
- ✅ Line counts accurate
- ✅ Command organization clear

**Verification**:

- ✅ `ls .cursor/commands/` shows 17 files (not 20)
- ✅ `grep -r "/linear" dev-docs/` returns 0 results (or only `/create-tasks`)
- ✅ README table complete (no missing commands)

---

## Implementation Checklist

### Phase 1: Verify Current State (5 min)

- [ ] List all commands in `.cursor/commands/` folder (count: 20)
- [ ] List commands in README.md (count: 15 - missing 5)
- [ ] Search workflow doc for `/linear` references (count: TBD)
- [ ] Search workflow doc for `/start-new-project` references (count: TBD)

### Phase 2: Delete Obsolete Commands (5 min)

- [ ] Delete `.cursor/commands/linear.md`
- [ ] Delete `.cursor/commands/linear-subtickets.md`
- [ ] Delete `.cursor/commands/start-new-project.md`
- [ ] Verify: `ls .cursor/commands/` shows 17 files

### Phase 3: Update README.md (15 min)

**Add to "Optimization Results" table:**

- [ ] `/bug-fix` - New | 946 lines | N/A | ✅ Systematic bug fix workflow
- [ ] `/code-cleanup` - New | 388 lines | N/A | ✅ Code cleanup workflow
- [ ] `/code-review` - New | 572 lines | N/A | ✅ Senior engineer review workflow
- [ ] `/validate` - New | 54 lines | N/A | ✅ Validation checklist
- [ ] `/svelte-validate` - New | 515 lines | N/A | ✅ Svelte MCP validation

**Update "Command Organization" section:**

- [ ] Add "Task-Specific Templates" subsection
- [ ] List: `/bug-fix`, `/code-cleanup`, `/code-review`, `/task-template`
- [ ] Add "Validation Commands" subsection
- [ ] List: `/validate`, `/svelte-validate`

**Remove deleted commands:**

- [ ] Remove `/start-new-project` entry (if exists)
- [ ] Update `/linear` entry to show "Replaced by `/create-tasks`" (or remove)
- [ ] Update `/linear-subtickets` entry to show "Replaced by `/create-tasks`" (or remove)

**Update line count totals:**

- [ ] Recalculate net change (+2,475 added, -1,428 removed = +1,047 total)

### Phase 4: Update Workflow Doc (20 min)

**Search & Replace:**

- [ ] Find all `/linear` references (excluding `/linear-subtickets`)
- [ ] Replace with `/create-tasks`
- [ ] Verify each replacement makes sense in context

**Update command lists:**

- [ ] Update "Available Commands" section
- [ ] Remove `/start-new-project` from examples
- [ ] Add `/create-tasks` to examples

**Clarify Svelte MCP integration:**

- [ ] Check `/go.md` for `mcp_svelte_svelte-autofixer` calls
- [ ] Check `/bug-fix.md` for `mcp_svelte_svelte-autofixer` calls
- [ ] Check `/code-review.md` for `mcp_svelte_svelte-autofixer` calls
- [ ] If found: Document in workflow (keep "automatic" claims)
- [ ] If not found: Update workflow to clarify "Available via `/svelte-validate`"

**Reduce repetition (optional - future work):**

- [ ] Mark sections for future consolidation (don't do now)
- [ ] Note: Can split into separate docs later (900 lines → 550 lines)

### Phase 5: Verify Changes (10 min)

**File system verification:**

- [ ] `ls .cursor/commands/` shows 17 files (not 20)
- [ ] Deleted files no longer exist

**Documentation verification:**

- [ ] README.md includes all 17 active commands
- [ ] README.md line counts accurate
- [ ] Workflow doc has no `/linear` references (only `/create-tasks`)
- [ ] Workflow doc has no `/start-new-project` references

**Reference verification:**

- [ ] `grep -r "/linear[^-]" .cursor/commands/` returns 0 results
- [ ] `grep -r "/start-new-project" dev-docs/` returns 0 results
- [ ] No broken links in documentation

### Phase 6: Test Commands (5 min)

- [ ] User can invoke `/create-tasks` successfully
- [ ] User can invoke `/bug-fix` successfully
- [ ] User can invoke `/svelte-validate` successfully
- [ ] No errors about missing commands

---

## Expected Results

**Before:**

- 20 commands (3 obsolete)
- README missing 5 commands
- Workflow doc references obsolete commands
- 1,428 lines of duplicate/obsolete code

**After:**

- 17 commands (all active)
- README complete (all 17 commands documented)
- Workflow doc references only active commands
- 1,428 lines removed (7% reduction)

**Net Impact:**

- -1,428 lines removed
- +50 lines added (README updates)
- = -1,378 lines total (cleaner codebase)

---

## Risk Assessment

**Low Risk:**

- Small number of changes (3 deletions, 2 doc updates)
- Easy to verify (file counts, grep searches)
- Easy to rollback (git revert if needed)

**Potential Issues:**

- Missed references to deleted commands → Mitigation: Grep search verification
- Broken workflow examples → Mitigation: Test each command after update
- README table formatting → Mitigation: Preview markdown before committing

---

## Notes

**User confirmed:**

- Delete `/linear` and `/linear-subtickets` → Replace with `/create-tasks`
- Delete `/start-new-project` → Modern workflow handles all project sizes

**Future work:**

- Split workflow doc into focused files (overview + examples + FAQ)
- Create deprecation process for commands
- Add validation script to check consistency

---

**Created**: 2025-11-21  
**Linear Ticket**: [SYOS-448](https://linear.app/younghumanclub/issue/SYOS-448)  
**Status**: Ready for implementation  
**Estimated Time**: 60 minutes (planning + execution + verification)
