# bug-fix

**Purpose**: Systematic bug fix workflow. Investigates bugs methodically, checks patterns, fixes root cause, and verifies the fix.

---

## When to Use

**Use `/bug-fix` when:**

- Something is broken or not working as expected
- Need systematic investigation before fixing
- Want to ensure fix follows existing patterns

**Workflow**: `/bug-fix SYOS-XXX` → Investigate → Fix → Test → `/validate` → `/save`

---

## Command Usage

```
/bug-fix [SYOS-XXX] or [description]
```

**Examples:**

- `/bug-fix SYOS-123` - Fix bug from Linear ticket
- `/bug-fix Organization switcher doesn't update URL` - Fix from description

---

## Bug Fix Workflow (MANDATORY)

**Order of operations** (MUST follow this sequence):

1. **Reproduce the Bug** ⭐ **CRITICAL**
2. **Trace the Code Path**
3. **Identify Root Cause**
4. **Check Patterns** (for similar fixes)
5. **Fix the Bug** (try standard fix first)
   5a. **Validate Svelte Code (MCP)** ⭐ **MANDATORY** (for `.svelte` files only) - After standard fix

**If standard fix fails or root cause is unclear:**

6. **Investigate with Logs** ⭐ **CRITICAL** - Add logging to understand what's happening
7. **Validate Root Cause** ⭐ **CRITICAL** - Check Context7 and/or existing patterns
8. **Validate Fix with Tiny Experiment** ⭐ **CRITICAL** - Make minimal change to confirm fix works
9. **Implement Production Fix** - Only after validation succeeds
10. **Validate Svelte Code (MCP)** ⭐ **MANDATORY** (for `.svelte` files only) - After production fix

**Final steps:**

11. **Test the Fix**
12. **Document the Fix**

**⚠️ CRITICAL RULE**: If standard fix (steps 1-5) doesn't work, never continue making changes. Stop and investigate with logs, validate root cause, and test with tiny experiment before implementing production fix.

---

## 1. Reproduce the Bug (MANDATORY)

**Purpose**: Understand exactly what's broken before fixing.

**Workflow**:

1. **Read ticket description**:
   - What should happen?
   - What actually happens?
   - When does it break? (steps to reproduce)

2. **Reproduce locally**:
   - Follow steps from ticket
   - Verify bug exists
   - Capture exact error/behavior

3. **Document reproduction**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages (if any)

**Why**: Can't fix what you can't reproduce. Understanding the bug is 50% of the fix.

**Example**:

```
Ticket: "Organization switcher doesn't update URL"
Steps to reproduce:
1. Navigate to /inbox
2. Click organization switcher
3. Select different organization
Expected: URL updates to /inbox?org=123
Actual: URL stays the same
```

---

## 2. Trace the Code Path

**Purpose**: Follow the code execution path to find where it breaks.

**Workflow**:

1. **Start at entry point**:
   - User action (click, form submit, etc.)
   - API endpoint
   - Component lifecycle

2. **Follow the flow**:
   - Use `codebase_search` for "How does X work?"
   - Read actual code files
   - Trace data flow (props → state → API calls)

3. **Identify break point**:
   - Where does expected behavior diverge?
   - What's missing or incorrect?
   - What code path is being taken vs should be taken?

**Key Principle**: **Read code, don't guess** - Trace actual execution path.

**Example**:

```
Entry point: OrganizationSwitcher.svelte (on:click)
→ Calls: switchOrganization(orgId)
→ Updates: useOrganizations composable
→ Should update: URL via router
→ Break point: Router not called after organization switch
```

---

## 3. Identify Root Cause

**Purpose**: Find WHY it's broken, not just WHERE.

**Workflow**:

1. **Check `/root-cause` command**:
   - Use systematic investigation if needed
   - Check patterns for similar issues

2. **Analyze root cause**:
   - Missing code? (function not called)
   - Wrong code? (incorrect logic)
   - Wrong data? (state not updated)
   - Wrong timing? (race condition)

3. **Document root cause**:
   - What's broken
   - Why it's broken
   - Impact (what else might be affected)

**Why**: Fixing symptoms vs root cause leads to recurring bugs.

**Example**:

```
Root Cause: switchOrganization() updates state but doesn't call router.push()
Why: Router integration missing from organization switch logic
Impact: URL doesn't reflect current organization, breaks deep linking
```

---

## 4. Check Patterns (MANDATORY)

**Purpose**: Use existing solutions instead of creating new fixes.

**Workflow**:

1. **Load pattern index**:

   ```typescript
   const patternIndex = read_file('dev-docs/2-areas/patterns/INDEX.md');
   ```

2. **Search for similar fixes**:
   - Match bug symptoms to pattern symptoms
   - Example: "URL not updating" → Check routing patterns

3. **Pattern Lifecycle Awareness** ⭐ **NEW**

   When checking patterns:
   - ✅ **Prefer ACCEPTED patterns** for fixes (current best practice)
   - ✅ **Skip SUPERSEDED patterns** (use replacement #LXXX instead)
   - ⚠️ **If bug caused by deprecated pattern** → recommend migration
   - ❌ **Never use REJECTED patterns** (anti-patterns)
   - ⚠️ **PROPOSED patterns** → document experimental status

   **Example**:

   ```
   Bug caused by #L10 [STATUS: DEPRECATED] → Recommend migrating to #L50 [STATUS: ACCEPTED]
   Found #L20 [STATUS: ACCEPTED] → Use this for fix ✅
   ```

4. **If pattern found**:
   - Read pattern file (jump to line number)
   - Check lifecycle status (ACCEPTED/DEPRECATED/SUPERSEDED/REJECTED/PROPOSED)
   - If ACCEPTED → Use existing solution
   - If SUPERSEDED → Use replacement pattern (#LXXX)
   - If DEPRECATED → Recommend migration, document if fix involves updating from deprecated to current
   - If REJECTED → Never use (anti-pattern)
   - If PROPOSED → Document experimental status
   - Document: "Using pattern from [file]:[line] [STATUS: X]"

5. **If no pattern found**:
   - Continue with fix
   - Note: New pattern may be created during `/save` phase

**Why**: Prevents reinventing solutions, ensures consistency, guides to current patterns, detects deprecated pattern usage.

**Reference**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup table with lifecycle states

---

## 5. Fix the Bug (Standard Approach)

**Purpose**: Try standard fix first - apply pattern solution or fix root cause directly.

**Workflow**:

1. **Follow coding standards**:
   - Read `dev-docs/2-areas/development/coding-standards.md` ⭐ **CRITICAL**
   - Use design tokens (never hardcode)
   - Follow existing patterns

2. **Use pattern solution** (if found in step 4):
   - Apply pattern fix from step 4
   - Don't deviate unless necessary

3. **Fix root cause**:
   - Fix the WHY, not just the WHERE
   - Ensure fix prevents recurrence

4. **Minimal change principle**:
   - Fix only what's broken
   - Don't refactor unrelated code
   - Keep changes focused

5. **Test the fix**:
   - Reproduce original bug
   - Verify fix works
   - If fix works → Proceed to step 5a (Validate Svelte Code), then step 11 (Test the Fix)
   - If fix fails → Proceed to step 6 (Investigate with Logs)

**Why**: Standard approach works for most bugs. Only investigate deeper if needed.

**Example**:

```
Fix: Add router.push() call after organization switch
Code:
  switchOrganization(orgId) {
    // Update state
    state.currentOrgId = orgId;
    // Update URL (was missing)
    router.push(`/inbox?org=${orgId}`);
  }
```

---

## 5a. Validate Svelte Code (MCP) - For .svelte Files Only ⭐ **MANDATORY**

**Purpose**: Ensure bug fixes in `.svelte` files follow latest Svelte 5 best practices automatically.

**When**: After fixing the bug in step 5, if fix modified `.svelte` or `.svelte.ts` files.

**Workflow**:

1. **Check if fix modified Svelte files**:
   - If fix modified `.svelte` or `.svelte.ts` files → Continue to step 2
   - If not writing Svelte files → Skip this step, proceed to step 11 (Test the Fix)

2. **Invoke Svelte MCP autofixer** ⭐ **MANDATORY**:

   ```typescript
   // ✅ CORRECT: Always invoke autofixer when fixing Svelte code
   const result = await mcp_svelte_svelte_autofixer({
   	code: fileContent,
   	filename: 'Component.svelte', // or 'composable.svelte.ts'
   	desired_svelte_version: 5,
   	async: false // Set true if component uses top-level await
   });
   ```

3. **Iterate until clean** ⭐ **MANDATORY**:

   ```typescript
   // MUST iterate until clean (some fixes require multiple passes)
   while (result.issues.length > 0 || result.suggestions.length > 0) {
   	// Fix all issues based on result.issues and result.suggestions
   	// Apply fixes to code

   	// Re-run autofixer to verify fixes
   	result = await mcp_svelte_svelte_autofixer({
   		code: fixedCode,
   		filename: 'Component.svelte',
   		desired_svelte_version: 5,
   		async: false
   	});
   }
   ```

4. **Document findings**:
   - What issues were found
   - What fixes were applied
   - Any patterns discovered
   - Note in bug fix notes: "Svelte MCP validation: [summary]"

**What it catches**:

- `$effect` vs `$derived` misuse (Svelte 5 anti-pattern)
- Reactivity anti-patterns (Map/Set mutations, stale values)
- Component structure issues (missing keys, wrong patterns)
- Svelte 5 best practice violations

**Why mandatory**: Catches Svelte-specific issues that svelte-check and ESLint don't catch (e.g., `$effect` vs `$derived` misuse, reactivity anti-patterns). Ensures bug fixes don't introduce new code quality issues.

**Common Mistakes**:

- ❌ **Run autofixer once**: Must iterate until clean (some fixes require multiple passes)
- ❌ **Skip autofixer**: Only running svelte-check + ESLint misses Svelte-specific issues
- ❌ **Return code with issues**: Must fix all issues before proceeding to test

**Reference**: `.cursor/commands/go.md` - See Step 3 (Svelte MCP validation pattern), `.cursor/commands/code-review.md` - See Step 5 (Svelte MCP validation pattern), `.cursor/commands/svelte-validate.md` - Complete Svelte validation workflow

**Example**:

```
Svelte MCP Validation (after bug fix):
- Component.svelte: ⚠️ 2 issues found → fixed
  - Line 12: Use $derived instead of $effect for computed values
  - Line 25: Missing key in {#each} block (use item._id)
- Iteration 1: 2 issues → fixed
- Iteration 2: 0 issues → clean ✅
```

---

## 7. Investigate with Logs (IF Standard Fix Fails)

**Purpose**: Add strategic logging to understand what's actually happening, not what we think is happening.

**Workflow**:

1. **Add logging at key points**:
   - Entry points (user actions, API calls)
   - State transitions (before/after state changes)
   - Conditional branches (which path is taken)
   - Async operations (when they start/complete)

2. **Log reactive values**:
   - What values are being read?
   - When do they change?
   - Are dependencies tracked correctly?

3. **Run and observe**:
   - Reproduce the bug
   - Check console logs
   - Document actual behavior vs expected

4. **Analyze logs**:
   - What path is actually being taken?
   - What values are actually present?
   - Where does expected diverge from actual?

**Why**: Logs reveal the truth. Guessing leads to wrong fixes.

**Example**:

```typescript
// Add logging to understand what's happening
$effect(() => {
	console.log('[Auto-select] Effect running', {
		isLoading: items.isLoading,
		itemsLength: items.filteredItems.length,
		selectedId: selected.selectedItemId
	});
	// ... rest of effect
});
```

---

## 8. Validate Root Cause (IF Standard Fix Fails)

**Purpose**: Confirm the root cause using Context7 and/or existing patterns before fixing.

**Workflow**:

1. **Check existing patterns**:
   - Load `dev-docs/2-areas/patterns/INDEX.md`
   - Search for similar symptoms
   - If pattern found → Read pattern, verify it matches

2. **Check Context7** (if pattern involves external library):
   - Use `mcp_context7_resolve-library-id` to find library
   - Use `mcp_context7_get-library-docs` with relevant topic
   - Verify approach matches official docs

3. **Check ai-docs** (if available):
   - Look in `ai-docs/tasks/` for similar issues
   - Check `ai-docs/reference/` for validated approaches

4. **Document validation**:
   - What pattern/docs confirm the root cause?
   - What confidence level? (must be 95%+)
   - What's the validated fix approach?

**Why**: Validating prevents reinventing solutions and ensures fixes follow best practices.

**Example**:

```
Root Cause Hypothesis: $effect not tracking getter dependencies
Validation:
- Pattern: svelte-reactivity.md#L910 (Access getters without optional chaining)
- Context7: Confirms $effect tracks property access
- Confidence: 95% - Pattern matches symptom
```

---

## 9. Validate Fix with Tiny Experiment (IF Standard Fix Fails)

**Purpose**: Make a minimal change to confirm the fix works before implementing production-ready code.

**Workflow**:

1. **Make smallest possible change**:
   - Add one line of code
   - Change one condition
   - Test one hypothesis

2. **Test the experiment**:
   - Reproduce bug
   - Verify fix works
   - Confirm no regressions

3. **If experiment succeeds**:
   - Proceed to production fix
   - Apply fix properly (following patterns)

4. **If experiment fails**:
   - Go back to investigation
   - Add more logs
   - Re-evaluate root cause

**Why**: Tiny experiments validate root cause before making larger changes. Prevents wasted effort.

**Example**:

```typescript
// Experiment: Add $derived wrapper to test dependency tracking
const testItems = $derived(items.filteredItems);
console.log('[Experiment] testItems length:', testItems.length);

// If this fixes it → Root cause confirmed: getter dependency tracking
// Then implement proper fix following pattern
```

---

## 10. Implement Production Fix (After Validation)

**Purpose**: Apply the validated fix following existing patterns and coding standards.

**Workflow**:

1. **Follow coding standards**:
   - Read `dev-docs/2-areas/development/coding-standards.md` ⭐ **CRITICAL**
   - Use design tokens (never hardcode)
   - Follow existing patterns

2. **Use validated solution**:
   - Apply pattern fix from step 4
   - Follow Context7 guidance if applicable
   - Don't deviate unless necessary

3. **Fix root cause**:
   - Fix the WHY, not just the WHERE
   - Ensure fix prevents recurrence

4. **Minimal change principle**:
   - Fix only what's broken
   - Don't refactor unrelated code
   - Keep changes focused

**Why**: Production fix should be clean, minimal, and follow established patterns.

**Example**:

```
Root Cause: switchOrganization() updates state but doesn't call router.push()
Why: Router integration missing from organization switch logic
Impact: URL doesn't reflect current organization, breaks deep linking
```

---

## 11. Validate Svelte Code (MCP) - For .svelte Files Only ⭐ **MANDATORY**

**Purpose**: Ensure production fixes in `.svelte` files follow latest Svelte 5 best practices automatically.

**When**: After implementing production fix in step 10, if fix modified `.svelte` or `.svelte.ts` files.

**Workflow**:

1. **Check if production fix modified Svelte files**:
   - If fix modified `.svelte` or `.svelte.ts` files → Continue to step 2
   - If not writing Svelte files → Skip this step, proceed to step 12 (Test the Fix)

2. **Invoke Svelte MCP autofixer** ⭐ **MANDATORY**:

   ```typescript
   // ✅ CORRECT: Always invoke autofixer when fixing Svelte code
   const result = await mcp_svelte_svelte_autofixer({
   	code: fileContent,
   	filename: 'Component.svelte', // or 'composable.svelte.ts'
   	desired_svelte_version: 5,
   	async: false // Set true if component uses top-level await
   });
   ```

3. **Iterate until clean** ⭐ **MANDATORY**:

   ```typescript
   // MUST iterate until clean (some fixes require multiple passes)
   while (result.issues.length > 0 || result.suggestions.length > 0) {
   	// Fix all issues based on result.issues and result.suggestions
   	// Apply fixes to code

   	// Re-run autofixer to verify fixes
   	result = await mcp_svelte_svelte_autofixer({
   		code: fixedCode,
   		filename: 'Component.svelte',
   		desired_svelte_version: 5,
   		async: false
   	});
   }
   ```

4. **Document findings**:
   - What issues were found
   - What fixes were applied
   - Any patterns discovered
   - Note in bug fix notes: "Svelte MCP validation: [summary]"

**What it catches**:

- `$effect` vs `$derived` misuse (Svelte 5 anti-pattern)
- Reactivity anti-patterns (Map/Set mutations, stale values)
- Component structure issues (missing keys, wrong patterns)
- Svelte 5 best practice violations

**Why mandatory**: Catches Svelte-specific issues that svelte-check and ESLint don't catch (e.g., `$effect` vs `$derived` misuse, reactivity anti-patterns). Ensures production fixes don't introduce new code quality issues.

**Common Mistakes**:

- ❌ **Run autofixer once**: Must iterate until clean (some fixes require multiple passes)
- ❌ **Skip autofixer**: Only running svelte-check + ESLint misses Svelte-specific issues
- ❌ **Return code with issues**: Must fix all issues before proceeding to test

**Reference**: `.cursor/commands/go.md` - See Step 3 (Svelte MCP validation pattern), `.cursor/commands/code-review.md` - See Step 5 (Svelte MCP validation pattern), `.cursor/commands/svelte-validate.md` - Complete Svelte validation workflow

**Example**:

```
Svelte MCP Validation (after production fix):
- Component.svelte: ⚠️ 1 issue found → fixed
  - Line 12: Use $derived instead of $effect for computed values
- Iteration 1: 1 issue → fixed
- Iteration 2: 0 issues → clean ✅
```

---

## 12. Test the Fix

**Purpose**: Verify fix works and doesn't break anything else.

**Workflow**:

1. **Reproduce original bug**:
   - Follow steps from step 1
   - Verify bug is fixed

2. **Test related functionality**:
   - Check if fix breaks anything else
   - Test edge cases
   - Verify no regressions

3. **Remove debug logs**:
   - Clean up console.log statements added during investigation
   - Keep code production-ready

4. **Manual testing** (if needed):
   - Use `/test-manual` command
   - Follow test steps
   - Report results

**Why**: Fixing one bug shouldn't create another. Clean code is maintainable code.

**Example**:

```
Test Steps:
1. Navigate to /inbox
2. Click organization switcher
3. Select different organization
✅ URL updates to /inbox?org=123
✅ Page reloads with correct organization
✅ No console errors
```

---

## 13. Document the Fix

**Purpose**: Capture knowledge for future similar bugs.

**Workflow**:

1. **Document in ticket**:
   - What was broken
   - Root cause
   - How it was fixed
   - Test results

2. **Consider pattern creation**:
   - If similar bug might occur → Use `/save` to create pattern
   - Document: "Bug fix pattern: [description]"

3. **Update ticket**:
   - Add comment with fix summary
   - Mark as ready for validation

**Why**: Helps with future similar bugs, documents decisions.

---

## Complete Workflow Example

### Scenario: Organization Switcher Bug

**Step 1: Reproduce**

```
AI: Reads ticket "Organization switcher doesn't update URL"
AI: Reproduces bug locally
AI: Documents: "URL stays same after organization switch"
```

**Step 2: Trace Code Path**

```
AI: Traces: OrganizationSwitcher.svelte → switchOrganization() → useOrganizations
AI: Finds: Router.push() not called after state update
AI: Documents: "Break point: Missing router integration"
```

**Step 3: Identify Root Cause**

```
AI: Root cause: switchOrganization() updates state but doesn't update URL
AI: Why: Router integration missing
AI: Impact: Breaks deep linking, URL doesn't reflect state
```

**Step 1: Reproduce**

```
AI: Reads ticket "Organization switcher doesn't update URL"
AI: Reproduces bug locally
AI: Documents: "URL stays same after organization switch"
```

**Step 2: Trace Code Path**

```
AI: Traces: OrganizationSwitcher.svelte → switchOrganization() → useOrganizations
AI: Finds: Router.push() not called after state update
AI: Documents: "Break point: Missing router integration"
```

**Step 3: Identify Root Cause**

```
AI: Root cause: switchOrganization() updates state but doesn't update URL
AI: Why: Router integration missing
AI: Impact: Breaks deep linking, URL doesn't reflect state
```

**Step 4: Check Patterns**

```
AI: Checks patterns/INDEX.md
AI: Finds: "URL routing" pattern in ui-patterns.md:45
AI: Uses: Existing router.push() pattern
```

**Step 5: Fix the Bug (Standard Approach)**

```
AI: Adds router.push() call after organization switch
AI: Uses existing routing pattern
AI: Tests: URL updates ✅
AI: Fix works! Proceeds to step 5a
```

**Step 5a: Validate Svelte Code (MCP)**

```
AI: Checks if fix modified .svelte files
AI: OrganizationSwitcher.svelte modified → Run autofixer
AI: Autofixer: 0 issues → clean ✅
AI: Documents: "Svelte MCP validation: No issues found"
AI: Proceeds to step 12
```

**Step 12: Test**

```
AI: Reproduces original bug → Fixed ✅
AI: Tests organization switching → Works ✅
AI: Tests URL updates → Works ✅
```

**Step 13: Document**

```
AI: Documents fix in ticket comment
AI: Uses /save to create pattern (if needed)
AI: Marks ticket ready for validation
```

### Alternative Scenario: Standard Fix Fails

**Step 5: Fix the Bug (Standard Approach)**

```
AI: Tries standard fix based on pattern
AI: Tests: Still doesn't work ❌
AI: Proceeds to investigation steps
```

**Step 7: Investigate with Logs**

```
AI: Adds console.log to switchOrganization()
AI: Logs: state before/after, router calls, URL changes
AI: Discovers: router.push() called but URL not updating
```

**Step 8: Validate Root Cause**

```
AI: Checks patterns/INDEX.md
AI: Finds: "URL routing" pattern in ui-patterns.md:45
AI: Validates with Context7: Confirms router.push() pattern
AI: Realizes: Need to check if router is initialized
AI: Confidence: 95% - Router not ready on first call
```

**Step 9: Validate Fix with Tiny Experiment**

```
AI: Adds guard: if (router.ready) router.push(...)
AI: Tests: URL updates ✅
AI: Confirms: Root cause validated, fix works
```

**Step 10: Implement Production Fix**

```
AI: Adds router readiness check before push
AI: Uses existing routing pattern
AI: Minimal change (only adds guard)
AI: Removes debug logs
```

**Step 11: Validate Svelte Code (MCP)**

```
AI: Checks if production fix modified .svelte files
AI: OrganizationSwitcher.svelte modified → Run autofixer
AI: Autofixer: 0 issues → clean ✅
AI: Documents: "Svelte MCP validation: No issues found"
AI: Proceeds to step 12
```

**Step 12: Test**

```
AI: Reproduces original bug → Fixed ✅
AI: Tests organization switching → Works ✅
AI: Tests URL updates → Works ✅
```

**Step 13: Document**

```
AI: Documents fix in ticket comment
AI: Uses /save to create pattern (if needed)
AI: Marks ticket ready for validation
```

---

## ⚠️ Critical Rules

### Reproduce First

**ALWAYS reproduce before fixing**:

- ❌ **WRONG**: Fix bug without reproducing
- ✅ **CORRECT**: Reproduce → Understand → Fix

**Why**: Can't fix what you can't reproduce. Understanding is 50% of the fix.

### Fix Root Cause

**Fix WHY, not just WHERE**:

- ❌ **WRONG**: Fix symptom, bug recurs
- ✅ **CORRECT**: Fix root cause, bug prevented

**Why**: Fixing symptoms leads to recurring bugs.

### Investigate Before Fixing

**ALWAYS investigate with logs before fixing**:

- ❌ **WRONG**: Guess root cause, make changes everywhere
- ✅ **CORRECT**: Add logs → Understand behavior → Validate root cause → Tiny experiment → Production fix

**Why**: Logs reveal truth. Guessing leads to wrong fixes and wasted time.

### Validate Root Cause

**ALWAYS validate root cause before fixing**:

- ❌ **WRONG**: Assume root cause, implement fix
- ✅ **CORRECT**: Check patterns → Validate with Context7 → Confirm 95%+ confidence → Then fix

**Why**: Validating prevents wrong fixes and ensures solutions follow best practices.

### Validate Fix with Experiment

**ALWAYS test fix with tiny experiment first**:

- ❌ **WRONG**: Implement full fix, hope it works
- ✅ **CORRECT**: Make minimal change → Test → Confirm works → Then implement properly

**Why**: Tiny experiments validate root cause before larger changes. Prevents wasted effort.

### Minimal Change

**Fix only what's broken**:

- ❌ **WRONG**: Refactor unrelated code while fixing bug
- ✅ **CORRECT**: Fix bug, keep changes focused

**Why**: Reduces risk of introducing new bugs.

---

## 📚 Related Documentation

- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Root Cause**: `.cursor/commands/root-cause.md` - Systematic investigation
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Critical rules
- **Save**: `.cursor/commands/save.md` - Pattern creation workflow
- **Svelte Validation**: `.cursor/commands/svelte-validate.md` - Complete Svelte validation workflow
- **Svelte MCP Pattern**: `.cursor/commands/go.md` - See Step 3 (Svelte MCP validation), `.cursor/commands/code-review.md` - See Step 5 (Svelte MCP validation)

---

## 🎯 Key Principles

1. **Reproduce First** - Can't fix what you can't reproduce ⭐
2. **Investigate with Logs** - Logs reveal truth, guessing wastes time ⭐
3. **Validate Root Cause** - Check patterns/Context7 before fixing ⭐
4. **Validate Fix with Experiment** - Tiny change confirms fix works ⭐
5. **Fix Root Cause** - Fix WHY, not just WHERE
6. **Test Thoroughly** - Verify fix works, no regressions
7. **Document** - Capture knowledge for future

---

## ⚠️ Critical Anti-Patterns (NEVER Do These)

### ❌ Making Changes Without Investigation

**WRONG**:

```
User: "Auto-selection doesn't work"
AI: *Immediately starts changing code everywhere*
AI: *Makes 5 different changes*
AI: *Still doesn't work*
```

**CORRECT**:

```
User: "Auto-selection doesn't work"
AI: *Adds strategic logs*
AI: *Observes actual behavior*
AI: *Validates root cause with patterns*
AI: *Makes tiny experiment*
AI: *Confirms fix works*
AI: *Implements production fix*
```

### ❌ Assuming Root Cause Without Validation

**WRONG**:

```
AI: "It's probably dependency tracking"
AI: *Implements fix based on assumption*
AI: *Doesn't work*
```

**CORRECT**:

```
AI: "Hypothesis: dependency tracking issue"
AI: *Adds logs to verify*
AI: *Checks patterns for similar issues*
AI: *Validates with Context7*
AI: *Confirms 95%+ confidence*
AI: *Then implements fix*
```

### ❌ Skipping Experiment Validation

**WRONG**:

```
AI: *Implements full production fix*
AI: *Hopes it works*
AI: *Doesn't work*
AI: *Tries different approach*
AI: *Wastes time*
```

**CORRECT**:

```
AI: *Makes tiny experimental change*
AI: *Tests: Works! ✅*
AI: *Confirms root cause*
AI: *Implements proper production fix*
AI: *Removes experiment code*
```

---

**Last Updated**: 2025-11-21  
**Purpose**: Systematic bug fix workflow following Brandon's template approach  
**Status**: Active workflow  
**Changes**: Added Svelte MCP validation to Step 5a (after standard fix) and Step 11 (after production fix) - SYOS-446
