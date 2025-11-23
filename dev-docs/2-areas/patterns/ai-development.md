# AI Development Workflow Patterns

**Purpose**: Patterns for creating effective AI development workflows and commands.

---

## #L10: Task-Specific Templates Prevent "AI Code Slop" [🟡 IMPORTANT]

**Symptom**: AI creates sloppy code, doesn't follow systematic workflows, reinvents solutions instead of using existing patterns  
**Root Cause**: Generic workflows don't provide task-specific instructions, AI jumps to implementation without proper investigation  
**Fix**:

```markdown
# ❌ WRONG: Generic workflow for all tasks
/start SYOS-XXX
/go
# AI implements immediately, may create sloppy code

# ✅ CORRECT: Task-specific templates with systematic workflows
/bug-fix SYOS-XXX      # Reproduce → Trace → Fix → Test
/code-cleanup SYOS-XXX # Identify → Verify → Remove → Test
/code-review SYOS-XXX  # Review → Validate → Suggest
/task-template SYOS-XXX # Think → Analyze → Recommend → Implement
```

**Template Structure**:

Each task-specific template should include:

1. **Purpose** - What the template does
2. **When to Use** - When to use this template vs others
3. **Workflow (MANDATORY)** - Step-by-step process (reproduce → trace → fix → test)
4. **Critical Rules** - What to NEVER do, what to ALWAYS do
5. **Examples** - Complete workflow examples
6. **Related Documentation** - Links to patterns, rules, other commands

**Why**: Task-specific templates provide systematic workflows tailored to each task type, preventing AI from jumping to implementation and ensuring consistent, high-quality work.

**Apply when**: Creating new Cursor commands or improving AI development workflow  
**Related**: #L20 (Command Structure Pattern), `.cursor/rules/BUILDING-RULES.md` (Rule building process)

---

## #L50: Command Structure Pattern [🟢 REFERENCE]

**Symptom**: Commands lack structure, inconsistent format, hard to follow  
**Root Cause**: No standard structure for Cursor commands  
**Fix**:

```markdown
# [command-name]

**Purpose**: One-line description of what the command does.

---

## When to Use

**Use `/[command]` when:**
- Specific condition 1
- Specific condition 2
- Specific condition 3

**Workflow**: `/command SYOS-XXX` → Step 1 → Step 2 → Step 3

---

## Command Usage

```
/command [SYOS-XXX] or [description]
```

**Examples:**
- `/command SYOS-123` - Use from Linear ticket
- `/command Description of task` - Use from description

---

## Workflow (MANDATORY)

**Order of operations** (MUST follow this sequence):

1. **Step 1** ⭐ **CRITICAL**
2. **Step 2**
3. **Step 3**
...

---

## ⚠️ Critical Rules

### Rule 1

**ALWAYS do X**:
- ✅ **CORRECT**: Example
- ❌ **WRONG**: Anti-pattern

**Why**: Explanation

### Rule 2

**NEVER do Y**:
- ❌ **WRONG**: Anti-pattern
- ✅ **CORRECT**: Pattern

**Why**: Explanation

---

## Complete Workflow Example

### Scenario: [Example Name]

**Step 1: [Action]**
```
AI: [What AI does]
AI: [Result]
```

**Step 2: [Action]**
```
AI: [What AI does]
AI: [Result]
```

...

---

## 📚 Related Documentation

- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Rules**: `.cursor/rules/BUILDING-RULES.md` - Rule building process
- **Other Commands**: `.cursor/commands/README.md` - Command reference

---

## 🎯 Key Principles

1. **Principle 1** - Explanation ⭐
2. **Principle 2** - Explanation
3. **Principle 3** - Explanation

---

**Last Updated**: 2025-11-20  
**Purpose**: Standard structure for Cursor commands  
**Status**: Active pattern
```

**Why**: Consistent structure makes commands easier to follow, understand, and maintain. Standard format helps AI agents know what to expect.

**Apply when**: Creating new Cursor commands or updating existing ones  
**Related**: #L10 (Task-Specific Templates), `.cursor/commands/README.md` (Command optimization guide)

---

## #L100: Svelte Validation Workflow with MCP Autofixer [🟡 IMPORTANT]

**Symptom**: Svelte code quality issues discovered late (during review/CI), AI agents write outdated Svelte 5 patterns, no real-time validation during code generation  
**Root Cause**: Validation happens after code is written, no Svelte-specific best practice validation, AI agents don't know latest Svelte 5 patterns  
**Fix**:

**Workflow Pattern** (MANDATORY for Svelte validation):

```markdown
# ✅ CORRECT: Comprehensive Svelte validation workflow

1. Run svelte-check (type checking)
2. Run ESLint (syntax rules)
3. Run Svelte MCP autofixer ⭐ MANDATORY (best practices)
4. Iterate until clean ⭐ MANDATORY (fix all issues)
5. Check Context7 (if <95% confident)
6. Match against INDEX.md (existing patterns)
```

**Svelte MCP Prompt Pattern** (MANDATORY):

```typescript
// ✅ CORRECT: Always invoke autofixer when writing Svelte code
let result = await mcp_svelte_svelte-autofixer({
  code: fileContent,
  filename: 'Component.svelte',
  desired_svelte_version: 5,
  async: false
});

// MUST iterate until clean (with max iterations to prevent infinite loops)
let iterations = 0;
const maxIterations = 10;
while (result.issues.length > 0 || result.suggestions.length > 0) {
  iterations++;
  
  // Clear failure path if max iterations reached
  if (iterations >= maxIterations) {
    throw new Error(`Autofixer failed to resolve all issues after ${maxIterations} iterations. Remaining issues: ${result.issues.length}, suggestions: ${result.suggestions.length}`);
  }
  
  // Fix all issues
  // Call autofixer again
  result = await mcp_svelte_svelte-autofixer({ ... });
}
```

**What it catches**:

- `$effect` vs `$derived` misuse (Svelte 5 anti-pattern)
- Reactivity anti-patterns (Map/Set mutations, stale values)
- Component structure issues (missing keys, wrong patterns)
- Svelte 5 best practice violations

**Why mandatory**: Catches Svelte-specific issues that svelte-check and ESLint don't catch (e.g., `$effect` vs `$derived` misuse, reactivity anti-patterns).

**Integration into `/go` Command** (MANDATORY):

When integrating into `/go` workflow, add validation step after pattern check, before implementation:

```markdown
## 3. Validate Svelte Code (MCP) - For .svelte Files Only ⭐ **MANDATORY**

**When**: After pattern check, before/during implementation (for `.svelte` and `.svelte.ts` files only).

**Workflow**:
1. Check if files being written are Svelte files (`.svelte`, `.svelte.ts`)
2. If yes → Invoke `mcp_svelte_svelte-autofixer` ⭐ MANDATORY
3. Iterate until clean: Fix issues → Re-run autofixer → Repeat
4. Document findings in implementation notes
```

**Integration into `/code-review` Command** (MANDATORY):

When integrating into `/code-review` workflow, add validation step after code quality check, before identifying issues:

```markdown
## 5. Validate Svelte Code (MCP) ⭐ **MANDATORY**

**When**: After code quality check, for all changed `.svelte` and `.svelte.ts` files.

**Workflow**:
1. Get changed `.svelte` files (from git diff or ticket context)
2. If no `.svelte` files changed → Skip this step
3. Run svelte-check (type checking)
4. Run ESLint (syntax rules)
5. Run Svelte MCP autofixer ⭐ MANDATORY
6. Iterate until clean: Fix issues → Re-run autofixer → Repeat
7. Document findings in review report: "Svelte MCP validation: [summary]"
```

**Integration into `/bug-fix` Command** (MANDATORY):

When integrating into `/bug-fix` workflow, add validation step after fixing bugs (both standard fix and production fix):

```markdown
## 5a. Validate Svelte Code (MCP) - For .svelte Files Only ⭐ **MANDATORY**

**When**: After fixing the bug in step 5, if fix modified `.svelte` or `.svelte.ts` files.

**Workflow**:
1. Check if fix modified Svelte files (`.svelte`, `.svelte.ts`)
2. If yes → Invoke `mcp_svelte_svelte-autofixer` ⭐ MANDATORY
3. Iterate until clean: Fix issues → Re-run autofixer → Repeat
4. Document findings in bug fix notes: "Svelte MCP validation: [summary]"

## 11. Validate Svelte Code (MCP) - For .svelte Files Only ⭐ **MANDATORY**

**When**: After implementing production fix in step 10, if fix modified `.svelte` or `.svelte.ts` files.

**Workflow**: Same as step 5a (above)
```

**Key Integration Points**:

- ✅ **Position**: 
  - `/go`: After pattern check (step 2), before reference code check (step 4)
  - `/code-review`: After code quality check (step 4), before identifying issues (step 6)
  - `/bug-fix`: After standard fix (step 5a) and after production fix (step 11)
- ✅ **Conditional**: Only runs for `.svelte` and `.svelte.ts` files (skips otherwise)
- ✅ **Mandatory**: Must invoke autofixer for all Svelte files (per Svelte MCP prompt pattern)
- ✅ **Iterative**: Must iterate until clean (while loop until no issues)
- ✅ **Documentation**: 
  - `/go`: Document findings in "Implement Solution" section
  - `/code-review`: Include findings in review report
  - `/bug-fix`: Include findings in bug fix notes

**Example Integration**:

```markdown
## ✅ Implementation Workflow (MANDATORY)

**Order of operations**:
1. Branch Verification
2. Check Patterns First
3. Validate Svelte Code (MCP) ⭐ **MANDATORY** (for `.svelte` files only)
4. Check Reference Code
5. Use Context7
6. Implement Solution
```

```markdown
## Code Review Workflow (MANDATORY)

**Order of operations**:
1. Understand Changes
2. Check Patterns
3. Validate Architecture
4. Check Code Quality
5. Validate Svelte Code (MCP) ⭐ **MANDATORY** (for `.svelte` files only)
6. Identify Issues
7. Suggest Improvements
8. Provide Summary
```

```markdown
## Bug Fix Workflow (MANDATORY)

**Order of operations**:
1. Reproduce the Bug
2. Trace the Code Path
3. Identify Root Cause
4. Check Patterns
5. Fix the Bug (Standard Approach)
5a. Validate Svelte Code (MCP) ⭐ **MANDATORY** (if `.svelte` files modified)
6. Investigate with Logs (if standard fix fails)
7. Validate Root Cause (if standard fix fails)
8. Validate Fix with Tiny Experiment (if standard fix fails)
9. Implement Production Fix (after validation)
10. Test the Fix
11. Validate Svelte Code (MCP) ⭐ **MANDATORY** (if `.svelte` files modified)
12. Document the Fix
```

**Apply when**:

- Creating Svelte validation commands (`/svelte-validate`)
- Integrating validation into workflows (`/go`, `/code-review`, `/bug-fix`)
- Writing Svelte components (always run autofixer)
- Fixing bugs in Svelte files (validate after fix)
- Debugging Svelte-specific issues
- **Documenting workflow changes**: When new validation workflows are integrated, update `ai-development-workflow-v2.md` with:
  - New section explaining the workflow (what it does, how it works, benefits)
  - Updated examples showing the workflow in action
  - Updated "What's Automatic" and FAQ sections
  - References to pattern documentation

**Common Mistakes**:

- ❌ **Run autofixer once**: Must iterate until clean (some fixes require multiple passes)
- ❌ **Skip autofixer**: Only running svelte-check + ESLint misses Svelte-specific issues
- ❌ **Return code with issues**: Must fix all issues before returning code to user
- ❌ **Wrong position**: Placing validation after implementation (should be before/during)
- ❌ **No conditional check**: Running validation for all files (should only run for `.svelte` files)
- ❌ **Missing svelte-check/ESLint**: In `/code-review`, must run all three (svelte-check → ESLint → autofixer)
- ❌ **No findings in report**: In `/code-review`, must include validation findings in review report
- ❌ **Missing `/bug-fix` integration**: Bug fixes in `.svelte` files must be validated (step 5a and step 11)
- ❌ **Only validate once**: In `/bug-fix`, must validate after both standard fix (step 5a) and production fix (step 11)

**Related**: #L50 (Command Structure Pattern), ci-cd.md#L2399 (MCP Setup), svelte-reactivity.md (Svelte 5 patterns)

---

## #L200: Documentation Organization - CORE vs ARCHIVE Pattern [🟡 IMPORTANT]

**Symptom**: AI agents waste tokens loading outdated docs, reference outdated features (e.g., "teams" docs when app has 0 teams), developers struggle to find current documentation, root directory cluttered with 20+ markdown files  
**Root Cause**: No separation between active (CORE) and historical (ARCHIVE) documentation. AI agents can't distinguish current vs outdated docs, leading to confusion and token waste  
**Fix**:

```markdown
# ❌ WRONG: All docs mixed together
dev-docs/
  product-vision-and-plan.md  # Historical
  product-vision-2.0.md        # Current
  teams.md                     # Feature doesn't exist
  SYOS-123-summary.md         # Completed ticket
  architecture.md              # Current
  future-vision.md             # Historical assessment
# AI loads all files, wastes tokens, gets confused

# ✅ CORRECT: CORE vs ARCHIVE separation
dev-docs/
  CORE-DOCS.md                # Documents what's CORE
  2-areas/
    product/
      product-principles.md    # CORE
    architecture/
      system-architecture.md   # CORE
  4-archive/
    historical/
      product-vision-and-plan.md  # ARCHIVE
      future-vision.md            # ARCHIVE
    outdated-features/
      teams.md                     # ARCHIVE
    tickets/
      SYOS-123-summary.md         # ARCHIVE
.cursorignore                  # Hides archive from AI
```

**Implementation Steps**:

1. **Define CORE Documentation** (`dev-docs/CORE-DOCS.md`):
   - List ~50 essential docs organized by category
   - Criteria: Currently referenced, current/active, essential for development, maintained
   - Categories: Essential, Design, Patterns, Development, Architecture, Resources, Commands, Marketing, AI Docs

2. **Create Archive Structure** (`dev-docs/4-archive/`):
   - `tickets/` - Completed ticket docs
   - `audit-reports/` - Completed audits (keep latest only)
   - `historical/` - Historical vision/strategy
   - `outdated-features/` - Docs for features not in app
   - `old-workflows/` - Superseded workflows
   - `design-system/` - Redundant design docs
   - `architecture/` - Historical architecture docs
   - `tasks/` - Completed task documents

3. **Create `.cursorignore`**:
   ```
   # Archive - Historical/outdated docs hidden from AI
   dev-docs/4-archive/
   ```

4. **Move Files**:
   - Root-level files → archive (except README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, design-system.json)
   - Outdated dev-docs → archive (historical assessments, old audits)
   - Preserve file names (or rename if needed)

5. **Update Documentation**:
   - Update `dev-docs/README.md` with CORE vs ARCHIVE distinction
   - Document `.cursorignore` usage

**Why**: Clear separation prevents AI confusion, reduces token waste, and makes current documentation easy to find. Archive hidden from AI but still accessible to humans for historical reference.

**Apply when**: 
- Project has 100+ markdown files
- Outdated docs mixed with current docs
- AI agents reference outdated features
- Root directory cluttered with documentation files

**Related**: #L10 (Task-Specific Templates), `dev-docs/CORE-DOCS.md` (CORE documentation list)

---

## #L250: Concrete Test Instructions - "Change X See Y Change" Format [🟡 IMPORTANT]

**Symptom**: Test instructions are vague ("Visual check: Inbox page"), missing specific values, file locations, or DevTools steps. User can't execute tests without guessing what to check  
**Root Cause**: Test instructions generated without concrete format requirements - no specific values, file paths, line numbers, or DevTools tab names  
**Fix**:

```markdown
# ❌ WRONG: Vague test instructions
## Test: Visual Regression Check
1. **Visual check: Inbox page** → Spacing matches previous appearance
2. **Visual check: Dark mode toggle** → Spacing unchanged in dark mode
# User doesn't know what to check or what values to verify

# ✅ CORRECT: Concrete "change X see Y change" format
## Test 1: Verify Cascade Behavior
1. **Edit `src/styles/tokens/spacing.css` line 19** → Change `--spacing-2: 0.5rem;` to `--spacing-2: 1rem;` → Save file
2. **Refresh page** → Nav items, buttons, cards should have **16px padding** (was 8px) → All elements using `var(--spacing-2)` increased
3. **Revert change** → Change back to `--spacing-2: 0.5rem;` → Refresh → Spacing returns to **8px**

## Test 2: Verify Token References in DevTools
1. **Open DevTools** → Elements tab → Select sidebar nav item → Check Styles panel
2. **Find `padding-left`** → Should show `var(--spacing-nav-item-x)` → Click to expand → Should resolve to `var(--spacing-2)` (not `0.5rem`)
```

**Format Requirements**:

1. **"Change X see Y change" pattern**: Every step must follow this format
   - For code changes: "Edit file X line Y: change Z → See W change"
   - For UI changes: "Change X → See Y change"
   - For DevTools: "Inspect element X → Check property Y → Should show value Z"

2. **Specific values**: Always include exact values
   - Pixel values: "**16px padding** (was 8px)"
   - CSS properties: "`var(--spacing-2)` (not `0.5rem`)"
   - File paths: "`src/styles/tokens/spacing.css` line 19"
   - Line numbers: "Change `--spacing-2: 0.5rem;` to `--spacing-2: 1rem;`"

3. **DevTools specifics**: Specify exact tabs and inspection steps
   - "Open DevTools → Elements tab → Select X → Check Styles panel → Find property Y → Should show value Z"
   - Never use "Inspect element" without specifying which tab

4. **File locations**: For code changes, include exact path and line number
   - "Edit `src/styles/tokens/spacing.css` line 19"
   - "Change `--spacing-2: 0.5rem;` to `--spacing-2: 1rem;`"

5. **Before/after values**: Use "was X, now Y" format
   - "**16px padding** (was 8px)"
   - "Spacing returns to **8px**"

6. **Maximum 3 tests**: Focus on critical paths only
7. **Maximum 5 steps per test**: Keep it actionable

**What to Include**:

✅ **DO Include:**
- Exact file paths and line numbers for code changes
- Specific pixel values or CSS properties to verify
- DevTools tab names and inspection steps
- Exact element selectors or text to find
- Before/after values ("was X, now Y")

❌ **DON'T Include:**
- Vague descriptions like "Visual check" or "Verify spacing"
- Abstract steps without specific values
- Explanations or context (just steps)
- More than 3 test scenarios
- More than 5 steps per test

**Why**: Concrete test instructions enable users to execute tests without guessing. Specific values, file locations, and DevTools steps make tests reproducible and actionable.

**Apply when**: Generating manual test instructions for tickets  
**Related**: #L50 (Command Structure Pattern), `.cursor/commands/test-manual.md` (Test instruction command)

---

## #L300: Testing Command & MCP Tool Integrations [🟡 IMPORTANT]

**Symptom**: Command integrations (e.g., `/svelte-validate` in `/go` workflow) not tested, MCP tool integrations break silently, regression testing missing after adding new validation tools, error handling not verified  
**Root Cause**: Testing focuses on individual commands but not integration points, MCP tools assumed to work without verification, no regression testing for existing tools after adding new ones  
**Fix**:

**Testing Workflow** (MANDATORY for command/MCP integrations):

```markdown
# ✅ CORRECT: Comprehensive integration testing workflow

1. Test command standalone (e.g., `/svelte-validate` on various file types)
   - Component files (.svelte)
   - Page files (+page.svelte)
   - Composable files (.svelte.ts)

2. Test workflow integration (e.g., `/go` with MCP validation)
   - Verify integration exists in command file
   - Verify correct workflow order (after pattern check, before implementation)
   - Verify conditional execution (only for .svelte files)

3. Test error handling (MCP unavailable, network issues)
   - Verify graceful degradation documented
   - Verify fallback to existing tools (svelte-check + ESLint)

4. Test regressions (existing validation tools still work)
   - Run existing tools (svelte-check, ESLint)
   - Verify no breaking changes introduced

5. Test real-world scenarios (actual codebase files)
   - Validate actual components/pages/composables
   - Verify end-to-end workflow works
```

**Test Checklist**:

```markdown
## Integration Testing Checklist

- [ ] Command tested on various file types (components, pages, composables)
- [ ] Workflow integration verified (integration exists, correct order, conditional execution)
- [ ] Error handling tested (graceful degradation, fallback documented)
- [ ] Regression testing passed (existing tools still work)
- [ ] Real-world test successful (actual codebase files validated)
```

**Example Test Execution**:

```typescript
// Test 1: Standalone command
// File: src/lib/components/atoms/Button.svelte
// Run: /svelte-validate Button.svelte
// Expected: svelte-check ✅, ESLint ✅, autofixer ✅ (0 issues)

// Test 2: Workflow integration
// Verify: .cursor/commands/go.md has Step 3 (Svelte MCP validation)
// Expected: Integration exists, correct position, conditional check

// Test 3: Error handling
// Verify: Command file documents graceful degradation
// Expected: Falls back to svelte-check + ESLint if MCP unavailable

// Test 4: Regression testing
// Run: npm run check && npm run lint
// Expected: Existing tools still work (no breaking changes)

// Test 5: Real-world test
// Files: Actual codebase components/pages/composables
// Expected: All files validate successfully
```

**What it catches**:

- Missing workflow integrations (command exists but not integrated)
- Incorrect integration order (validation after implementation instead of before)
- Missing error handling (MCP failures break workflows)
- Breaking changes (new tools break existing validation)
- Integration gaps (command works standalone but not in workflow)

**Why mandatory**: Ensures command integrations work end-to-end, prevents silent failures, validates error handling, catches regressions early.

**Apply when**:
- Testing command integrations (e.g., `/svelte-validate` in `/go`)
- Testing MCP tool integrations (e.g., Svelte MCP autofixer)
- Adding new validation tools (ensure no regressions)
- Verifying error handling for external tools (MCP, APIs)

**Common Mistakes**:

- ❌ **Only test standalone**: Must test both standalone and workflow integration
- ❌ **Skip error handling**: Must test graceful degradation for external tools
- ❌ **Skip regression testing**: Must verify existing tools still work
- ❌ **Skip real-world test**: Must validate with actual codebase files
- ❌ **Assume integration works**: Must verify integration exists and is correct

**Related**: #L100 (Svelte Validation Workflow), #L250 (Concrete Test Instructions), ci-cd.md#L2399 (MCP Setup)

---

**Last Updated**: 2025-11-21  
**Pattern Count**: 5  
**Format Version**: 2.0

