# svelte-validate

**Purpose**: Comprehensive Svelte validation workflow - validates `.svelte` files using svelte-check, ESLint, and Svelte MCP autofixer with iterative fixing until clean.

---

## 🚨 CRITICAL: Svelte MCP Prompt Pattern

**⚠️ MANDATORY**: Every time Svelte code is written, you **MUST**:

1. **Invoke `svelte-autofixer`** - Analyze code for issues
2. **Fix all issues** - Address every suggestion/error
3. **Iterate until clean** - Keep calling autofixer until no issues remain
4. **Only then return code** - Don't return code with known issues

**Why**: Ensures code follows latest Svelte 5 best practices, catches anti-patterns early, maintains consistency.

**Reference**: [Svelte MCP Prompts](https://svelte.dev/docs/mcp/prompts) - Official prompt pattern

---

## When to Use

**Use `/svelte-validate` when**:

- ✅ Validating `.svelte` files before commit
- ✅ Checking code quality after implementation
- ✅ Reviewing Svelte components for best practices
- ✅ Debugging Svelte-specific issues (reactivity, runes, etc.)
- ✅ Before integrating into `/go` or `/code-review` workflows

**Don't use for**:

- ❌ TypeScript-only files (use `svelte-check` directly)
- ❌ Non-Svelte code (use `/validate` instead)
- ❌ CI/CD pipelines (use npm scripts: `npm run check`, `npm run lint`)

---

## Workflow (MANDATORY)

**Order of operations** (MUST follow this sequence):

1. **Run svelte-check** (type checking)
2. **Run ESLint** (syntax rules)
3. **Run Svelte MCP autofixer** ⭐ **MANDATORY** (best practices)
4. **Iterate until clean** ⭐ **MANDATORY** (fix all issues)
5. **Check Context7** (if <95% confident)
6. **Match against INDEX.md** (existing patterns)

---

## Step 1: Run svelte-check (Type Checking)

**Purpose**: Catch TypeScript errors, type mismatches, unused CSS.

**Command**:

```bash
npm run check
# OR
svelte-check --tsconfig ./tsconfig.json
```

**What it catches**:

- TypeScript errors in `<script>` blocks
- Type mismatches in props
- Unused CSS selectors
- Missing imports

**If errors found**:

- Fix TypeScript errors first (blocks other validation)
- Document: "svelte-check: [error count] errors found → fixed"

**Example output**:

```
svelte-check found 2 errors:
- Component.svelte:10:5 - Type 'string' is not assignable to type 'number'
- Component.svelte:25:8 - Unused CSS selector '.old-class'
```

---

## Step 2: Run ESLint (Syntax Rules)

**Purpose**: Catch syntax violations, coding standards violations.

**Command**:

```bash
npm run lint
# OR
eslint . --ext .svelte,.ts
```

**What it catches**:

- Missing keys in `{#each}` blocks
- `goto()` without `resolveRoute()`
- Hardcoded values (should use design tokens)
- Unused variables/imports

**If errors found**:

- Fix ESLint errors (coding standards violations)
- Document: "ESLint: [error count] errors found → fixed"

**Example output**:

```
ESLint found 3 errors:
- Component.svelte:15:10 - Missing key in {#each} block
- Component.svelte:20:5 - goto() without resolveRoute()
- Component.svelte:30:8 - Hardcoded value 'px-4' (use design token)
```

---

## Step 3: Run Svelte MCP Autofixer ⭐ **MANDATORY**

**Purpose**: Catch Svelte 5 anti-patterns, best practice violations.

**⚠️ CRITICAL**: This step is **MANDATORY** - must run every time Svelte code is written.

**Workflow**:

1. **Invoke `svelte-autofixer`**:

   ```typescript
   const result =
   	(await mcp_svelte_svelte) -
   	autofixer({
   		code: fileContent,
   		filename: 'Component.svelte',
   		desired_svelte_version: 5, // From package.json
   		async: false // Check svelte.config.js for async component support
   	});
   ```

2. **Check for issues**:
   - If `result.suggestions.length > 0` → Fix issues
   - If `result.issues.length > 0` → Fix critical issues

3. **Fix all issues**:
   - Address every suggestion/error
   - Update code with fixes
   - Document: "Svelte MCP autofixer: [issue count] issues found → fixed"

4. **Iterate until clean** ⭐ **MANDATORY**:
   - Call `svelte-autofixer` again with updated code
   - Repeat until `result.suggestions.length === 0` AND `result.issues.length === 0`
   - Document: "Iteration [N]: [issue count] issues → fixed → clean"

**What it catches**:

- `$effect` vs `$derived` misuse
- Reactivity anti-patterns
- Svelte 5 best practice violations
- Component structure issues

**Example output**:

```
Svelte MCP autofixer found 2 issues:
- Line 12: Use $derived instead of $effect for computed values
- Line 25: Missing key in {#each} block (use item._id)

Iteration 1: 2 issues → fixed
Iteration 2: 0 issues → clean ✅
```

**Why mandatory**: Catches Svelte-specific issues that svelte-check and ESLint don't catch (e.g., `$effect` vs `$derived` misuse).

---

## Step 4: Check Context7 (If <95% Confident)

**Purpose**: Get up-to-date Svelte 5 documentation when confidence is low.

**When**: After autofixer, if still <95% confident about approach.

**Workflow**:

1. **Confidence check**:
   - If 95%+ confident → Skip Context7, proceed to step 5
   - If <95% confident → Use Context7

2. **Resolve library ID**:

   ```typescript
   const libraryId =
   	(await mcp_context7_resolve) -
   	library -
   	id({
   		libraryName: 'svelte'
   	});
   ```

3. **Get library docs**:

   ```typescript
   const docs =
   	(await mcp_context7_get) -
   	library -
   	docs({
   		context7CompatibleLibraryID: libraryId,
   		topic: 'runes reactivity' // Specific topic
   	});
   ```

4. **Use documentation**:
   - Verify approach against official docs
   - Update confidence level
   - Document: "Context7: Verified [topic] → [confidence]% confident"

**Why**: Context7 provides up-to-date, accurate Svelte 5 documentation with code examples.

---

## Step 5: Match Against INDEX.md (Existing Patterns)

**Purpose**: Check if issue matches existing documented patterns.

**Workflow**:

1. **Load pattern index**:

   ```typescript
   const patternIndex = read_file('dev-docs/2-areas/patterns/INDEX.md');
   ```

2. **Search for relevant patterns**:
   - Match validation findings to pattern symptoms
   - Example: "reactivity issue" → Check `svelte-reactivity.md` patterns

3. **If pattern found**:
   - Read pattern file (jump to line number from INDEX.md)
   - Document: "Pattern match: [file]:[line] - [pattern name]"
   - Use existing solution (don't reinvent)

4. **If no pattern found**:
   - Continue with fixes
   - Note: New pattern may be created during `/save` phase

**Why**: Prevents reinventing solutions, ensures consistency, leverages existing knowledge.

---

## Report Format

**Structure validation report as**:

### Critical Issues (Must Fix)

```
🔴 Critical Issues (2):
1. TypeScript error: Type 'string' is not assignable to type 'number'
   - File: Component.svelte:10
   - Fix: Change prop type from string to number

2. Missing key in {#each} block
   - File: Component.svelte:15
   - Fix: Add key: {#each items as item (item._id)}
```

### Suggestions (Best Practices)

```
🟡 Suggestions (3):
1. Use $derived instead of $effect for computed values
   - File: Component.svelte:12
   - Fix: Replace $effect(() => { doubled = count * 2; }) with let doubled = $derived(count * 2);

2. Hardcoded value 'px-4' should use design token
   - File: Component.svelte:30
   - Fix: Replace 'px-4' with 'px-md' (design token)

3. Missing accessibility label for icon-only button
   - File: Component.svelte:25
   - Fix: Add ariaLabel prop when iconOnly=true
```

### Pattern Matches (Existing Solutions)

```
🟢 Pattern Matches (1):
1. Reactivity issue matches pattern: svelte-reactivity.md#L10
   - Pattern: Use $state({}) + getters for component state
   - Applied: Updated component to use single $state object
```

---

## Examples

### Example 1: Validate Single File

```
User: /svelte-validate src/lib/components/atoms/Button.svelte

AI:
1. Running svelte-check... ✅ No errors
2. Running ESLint... ✅ No errors
3. Running Svelte MCP autofixer...
   - Iteration 1: 1 issue found → fixed
   - Iteration 2: 0 issues → clean ✅
4. Checking Context7... (95%+ confident, skipped)
5. Checking INDEX.md... No pattern matches

✅ Validation complete: Button.svelte is clean
```

### Example 2: Validate Multiple Files

```
User: /svelte-validate src/lib/components/atoms/*.svelte

AI:
1. Running svelte-check on 10 files...
   - Button.svelte: ✅ No errors
   - Card.svelte: ❌ 2 errors → fixed
   - Input.svelte: ✅ No errors
   ...

2. Running ESLint on 10 files...
   - Button.svelte: ✅ No errors
   - Card.svelte: ❌ 1 error → fixed
   ...

3. Running Svelte MCP autofixer on 10 files...
   - Button.svelte: Iteration 1 → clean ✅
   - Card.svelte: Iteration 1: 2 issues → fixed, Iteration 2 → clean ✅
   ...

✅ Validation complete: 10 files validated, 3 files fixed
```

### Example 3: Validation with Issues Found

```
User: /svelte-validate src/lib/components/MyComponent.svelte

AI:
1. Running svelte-check...
   ❌ Found 2 errors:
   - Line 10: Type 'string' is not assignable to type 'number'
   - Line 25: Unused CSS selector '.old-class'
   → Fixed: Updated prop type, removed unused CSS

2. Running ESLint...
   ❌ Found 1 error:
   - Line 15: Missing key in {#each} block
   → Fixed: Added key (item._id)

3. Running Svelte MCP autofixer...
   Iteration 1: Found 2 issues:
   - Line 12: Use $derived instead of $effect for computed values
   - Line 30: Hardcoded value 'px-4' should use design token
   → Fixed: Replaced $effect with $derived, replaced 'px-4' with 'px-md'
   Iteration 2: 0 issues → clean ✅

4. Checking Context7... (95%+ confident, skipped)

5. Checking INDEX.md...
   🟢 Pattern match: svelte-reactivity.md#L10 - Use $state({}) + getters
   → Applied pattern: Updated component state structure

✅ Validation complete: MyComponent.svelte fixed (5 issues resolved)
```

---

## Integration Points

### Integration with `/go` Command

**Future**: Add Svelte MCP validation step to `/go` workflow (SYOS-441).

**Pattern**:

```markdown
## Step N: Validate Svelte Files (if .svelte files created)

If any `.svelte` files were created/modified:

1. Run `/svelte-validate` on changed files
2. Fix all issues before proceeding
3. Document findings in implementation notes
```

### Integration with `/code-review` Command

**Future**: Add Svelte MCP validation to code review workflow (SYOS-442).

**Pattern**:

```markdown
## Svelte Code Review

For all changed `.svelte` files:

1. Run `/svelte-validate` on changed files
2. Include findings in review report
3. Mark critical issues as blocking
```

---

## Critical Rules

### Svelte MCP Prompt Pattern (MANDATORY)

**⚠️ ALWAYS invoke `svelte-autofixer` when writing Svelte code**:

- ❌ **WRONG**: Write code → Return to user → Issues found later
- ✅ **CORRECT**: Write code → Run autofixer → Fix issues → Iterate until clean → Return

**Why**: Ensures code follows latest Svelte 5 best practices, catches anti-patterns early.

### Iterative Fixing (MANDATORY)

**⚠️ ALWAYS iterate until clean**:

- ❌ **WRONG**: Run autofixer once → Return code with issues
- ✅ **CORRECT**: Run autofixer → Fix issues → Run again → Repeat until 0 issues

**Why**: Some fixes may introduce new issues or require multiple passes.

### Confidence Threshold

**95% confidence rule**:

- If 95%+ confident → Skip Context7, proceed
- If <95% confident → Use Context7, then proceed

**Why**: Prevents bugs from incorrect assumptions, ensures quality.

---

## Troubleshooting

### Svelte MCP Not Available

**Symptom**: `svelte-autofixer` tool not found or returns error.

**Fix**:

1. Check MCP configuration: `~/.cursor/mcp.json`
2. Verify Svelte MCP server is configured:

   ```json
   {
   	"svelte": {
   		"command": "npx",
   		"args": ["-y", "@sveltejs/mcp"]
   	}
   }
   ```

3. Restart Cursor to reload MCP configuration
4. If still failing, skip autofixer step and document: "Svelte MCP unavailable, skipped autofixer"

### Autofixer Returns No Issues But Code Has Problems

**Symptom**: Autofixer reports clean, but svelte-check or ESLint finds errors.

**Fix**:

1. Run all validation steps (svelte-check → ESLint → autofixer)
2. Fix errors in order (svelte-check first, then ESLint, then autofixer)
3. Document: "Autofixer clean, but svelte-check found [N] errors → fixed"

### Iteration Loop (Autofixer Keeps Finding Issues)

**Symptom**: Autofixer finds issues → Fix → Run again → Same issues found.

**Fix**:

1. Check if fixes were actually applied to code
2. Verify code changes are correct (read updated file)
3. If issues persist after 3 iterations, document and ask for help
4. May indicate deeper architectural issue

---

## Related Documentation

- **Svelte MCP**: [Svelte MCP Prompts](https://svelte.dev/docs/mcp/prompts) - Official prompt pattern
- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Critical rules
- **CI/CD**: `dev-docs/2-areas/patterns/ci-cd.md` - Quality gate patterns
- **Validate Command**: `.cursor/commands/validate.md` - General validation workflow

---

## Success Criteria

**Command is successful when**:

- ✅ All validation steps completed (svelte-check, ESLint, autofixer)
- ✅ All critical issues fixed
- ✅ Autofixer iteration completed (0 issues remaining)
- ✅ Report generated with clear format (critical vs suggestions)
- ✅ Pattern matches documented (if any)

**Command fails when**:

- ❌ Svelte MCP unavailable and critical issues found
- ❌ Iteration loop (autofixer keeps finding same issues after 3 iterations)
- ❌ TypeScript errors block validation (fix svelte-check errors first)

---

**Last Updated**: 2025-11-21  
**Purpose**: Comprehensive Svelte validation with Svelte MCP integration  
**Status**: Active workflow  
**Dependencies**: SYOS-439 ✅ (MCP Setup complete)
