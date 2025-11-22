# code-review

**Purpose**: Act as senior software engineer. Review code for patterns, architecture, quality, and suggest improvements before merge.

---

## When to Use

**Use `/code-review` when:**

- Code is ready for review (before merge)
- Want senior engineer perspective
- Need architecture validation
- Want quality check before shipping

**Workflow**: `/code-review [SYOS-XXX]` → Review → Report → Suggest Improvements → `/validate`

---

## Command Usage

```text
/code-review [SYOS-XXX] or [file paths]
```

**Examples:**

- `/code-review SYOS-123` - Review code from Linear ticket
- `/code-review src/lib/components/Inbox.svelte` - Review specific file
- `/code-review` - Review current changes (git diff)

---

## Code Review Workflow (MANDATORY)

**Order of operations** (MUST follow this sequence):

1. **Understand Changes** ⭐ **CRITICAL**
2. **Check Patterns** (follows existing patterns?)
3. **Validate Architecture** (modularity, coupling, boundaries)
4. **Check Code Quality** (standards, best practices)
5. **Validate Svelte Code (MCP)** ⭐ **MANDATORY** (for `.svelte` files only)
6. **Identify Issues** (bugs, regressions, improvements)
7. **Suggest Improvements** (better approaches, optimizations)
8. **Provide Summary** (overall assessment)

---

## 1. Understand Changes (MANDATORY)

**Purpose**: Understand what changed and why before reviewing.

**Workflow**:

1. **Read ticket description**:
   - What was the goal?
   - What problem was being solved?
   - What approach was chosen?

2. **Review code changes**:
   - What files were modified?
   - What was added/removed?
   - What functionality was implemented?

3. **Understand context**:
   - Why was this change needed?
   - What's the user impact?
   - What dependencies exist?

### Why

Can't review code without understanding the goal.

**Example**:

```
Ticket: SYOS-123 - Add image uploads to chat
Goal: Users can upload images in chat conversations
Changes: Added ImageUpload.svelte, updated ChatWindow.svelte
Approach: Vercel Blob Storage (from task template)
```

---

## 2. Check Patterns (MANDATORY)

**Purpose**: Verify code follows existing patterns and conventions.

**Workflow**:

1. **Load pattern index**:

   ```typescript
   const patternIndex = read_file('dev-docs/2-areas/patterns/INDEX.md');
   ```

2. **Check relevant patterns**:
   - File upload patterns
   - Component patterns
   - State management patterns
   - API integration patterns

3. **Pattern Lifecycle Violations** ⭐ **NEW** ⭐ **CRITICAL**

   Check for lifecycle violations:
   - ❌ **DEPRECATED pattern usage** → Suggest migration to ACCEPTED
   - ❌ **SUPERSEDED pattern usage** → Point to replacement #LXXX
   - ❌ **REJECTED pattern usage** → Explain why it's an anti-pattern
   - ⚠️ **PROPOSED pattern usage** → Document experimental status

   **Example**:

   ```
   Code uses #L10 [STATUS: DEPRECATED] → Suggest migrating to #L50 [STATUS: ACCEPTED]
   Code uses #L20 [STATUS: SUPERSEDED] → Point to replacement #L30
   Code uses #L40 [STATUS: REJECTED] → Explain why it's an anti-pattern
   ```

   **Report Format**:

   ```
   ## Pattern Lifecycle Violations

   **DEPRECATED Patterns Found**:
   - #L10: State Management [STATUS: DEPRECATED]
     - Location: src/lib/composables/useState.svelte.ts
     - Replacement: #L50 [STATUS: ACCEPTED]
     - Migration: Use $state() runes instead of let state = 0

   **Action**: Recommend migration before merge
   ```

4. **Verify compliance**:
   - Does code follow patterns?
   - Are patterns used correctly?
   - Any lifecycle violations? (document in report)
   - Any deviations? (document why)

**Why**: Consistency with existing codebase prevents "AI code slop". Lifecycle awareness ensures current patterns are used, deprecated patterns are migrated, and anti-patterns are avoided.

**Reference**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup table with lifecycle states

**Example**:

```
Pattern Check:
- ✅ Uses design tokens (not hardcoded values)
- ✅ Uses composables pattern (.svelte.ts extension)
- ✅ Uses Convex patterns (sessionId parameter)
- ⚠️ Deviation: Uses inline styles for dynamic colors (documented why)

Pattern Lifecycle Violations:
- ❌ DEPRECATED: #L10 used in useState.svelte.ts → Recommend migrating to #L50
```

---

## 3. Validate Architecture (MANDATORY)

**Purpose**: Ensure code follows architectural principles.

**Workflow**:

1. **Check modularity**:
   - Is new module properly isolated?
   - Feature flag created? (if new module)
   - Per-org targeting? (if org-specific)

2. **Check coupling**:
   - No direct imports from other modules?
   - Uses shared utilities/APIs?
   - Loose coupling maintained?

3. **Check module boundaries**:
   - No cross-module dependencies?
   - Uses documented APIs?
   - Respects module boundaries?

**Reference**: `dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system`

**Example**:

```
Architecture Check:
- ✅ New module has feature flag
- ✅ Uses shared utilities (no direct imports)
- ✅ Loose coupling (no cross-module dependencies)
- ✅ Module boundaries respected
```

---

## 3.5. Check Separation of Concerns (Components) ⭐ **CRITICAL**

**Purpose**: Ensure components follow single responsibility principle (UI rendering only).

**Svelte 5 Guidance**: "When extracting logic, it's better to take advantage of runes' universal reactivity: You can use runes outside the top level of components and even place them into JavaScript or TypeScript files (using a `.svelte.js` or `.svelte.ts` file ending)" — [Svelte 5 Docs](https://svelte.dev/docs/svelte/svelte-js-files)

**Workflow**:

1. **Check component responsibilities**:
   - ❌ Component calls `useQuery` directly? → Should use composable
   - ❌ Component contains business logic/validation? → Should use composable
   - ❌ Component has form state + mutations? → Should use composable
   - ✅ Component focuses on UI rendering? → Good

2. **Verify composables exist**:
   - Data fetching logic → `useData.svelte.ts` composable
   - Form state/logic → `useForm.svelte.ts` composable
   - Business logic → Composable or utility function

3. **Check existing patterns**:
   - Does code follow `useMeetings`, `useAgendaNotes` patterns?
   - Are composables in correct location? (`src/lib/modules/{module}/composables/`)
   - Do composables use `.svelte.ts` extension?

**Why Critical**:

- Enables unit testing (composables testable independently)
- Enables Storybook (components work with mocked composables)
- Improves maintainability (clear boundaries)
- Follows Svelte 5 best practices (extract logic to .svelte.ts)

**Reference**: `dev-docs/2-areas/design/component-architecture.md#separation-of-concerns-mandatory`

**Example**:

```
Separation of Concerns Check:
- ❌ VIOLATION: Component calls useQuery directly (3 queries in ActionItemsList.svelte)
  → Should extract to useActionItems.svelte.ts composable
- ❌ VIOLATION: Component contains form state + validation + mutations (150 lines)
  → Should extract to useActionItemsForm.svelte.ts composable
- ✅ Component InboxCard.svelte uses useInboxItems composable (good pattern)

Recommendation: Extract data fetching and form logic to composables before merge
```

**Common Violations**:

```typescript
// ❌ WRONG: Component does everything
<script>
  // Data fetching (directly in component)
  const query = useQuery(api.items.list, ...);

  // Form state (directly in component)
  const state = $state({ name: '', email: '' });

  // Business logic (directly in component)
  async function handleSubmit() {
    if (!state.name) return; // validation
    await convexClient.mutation(...); // mutation
  }
</script>

// ✅ CORRECT: Component uses composables
<script>
  import { useItems } from './composables/useItems.svelte';
  import { useItemForm } from './composables/useItemForm.svelte';

  const data = useItems();
  const form = useItemForm();
</script>

{#each data.items as item}
  <ItemCard {item} />
{/each}
```

---

## 4. Check Code Quality

**Purpose**: Verify code meets quality standards.

**Workflow**:

1. **Check coding standards**:
   - No `any` types
   - All `{#each}` blocks have keys
   - All `goto()` use `resolveRoute()`
   - Uses design tokens (not hardcoded)

2. **Check best practices**:
   - Proper error handling
   - TypeScript types
   - Accessibility (if UI)
   - Performance considerations

3. **Check for common issues**:
   - Memory leaks
   - Race conditions
   - Security issues
   - Performance bottlenecks

**Reference**: `dev-docs/2-areas/development/coding-standards.md`

**Example**:

```text
Code Quality Check:
- ✅ No `any` types
- ✅ All `{#each}` blocks have keys
- ✅ Uses design tokens
- ⚠️ Missing error handling for file upload failure
- ⚠️ No loading state during upload
```

---

## 5. Validate Svelte Code (MCP) ⭐ **MANDATORY**

**Purpose**: Ensure Svelte code follows latest Svelte 5 best practices automatically.

**When**: After code quality check, for all changed `.svelte` and `.svelte.ts` files.

**Workflow**:

1. **Get changed `.svelte` files**:
   - If reviewing ticket → Get files from git diff or ticket context
   - If reviewing specific files → Filter for `.svelte` and `.svelte.ts` files
   - If no `.svelte` files changed → Skip this step, proceed to step 6

2. **Run svelte-check** (type checking):

   ```bash
   npm run check
   # OR
   svelte-check --tsconfig ./tsconfig.json
   ```

   - Fix TypeScript errors first (blocks other validation)
   - Document: "svelte-check: [error count] errors found → fixed"

3. **Run ESLint** (syntax rules):

   ```bash
   npm run lint
   # OR
   eslint . --ext .svelte,.ts
   ```

   - Fix ESLint errors (coding standards violations)
   - Document: "ESLint: [error count] errors found → fixed"

4. **Run Svelte MCP autofixer** ⭐ **MANDATORY**:

   ```typescript
   // ✅ CORRECT: Always invoke autofixer for Svelte files
   const result =
   	(await mcp_svelte_svelte) -
   	autofixer({
   		code: fileContent,
   		filename: 'Component.svelte', // or 'composable.svelte.ts'
   		desired_svelte_version: 5, // From package.json
   		async: false // Check svelte.config.js for async component support
   	});
   ```

5. **Iterate until clean** ⭐ **MANDATORY**:

   ```typescript
   // MUST iterate until clean (some fixes require multiple passes)
   while (result.issues.length > 0 || result.suggestions.length > 0) {
   	// Fix all issues based on result.issues and result.suggestions
   	// Apply fixes to code

   	// Re-run autofixer to verify fixes
   	result =
   		(await mcp_svelte_svelte) -
   		autofixer({
   			code: fixedCode,
   			filename: 'Component.svelte',
   			desired_svelte_version: 5,
   			async: false
   		});
   }
   ```

6. **Document findings**:
   - What issues were found
   - What fixes were applied
   - Any patterns discovered
   - Include in review report: "Svelte MCP validation: [summary]"

**What it catches**:

- `$effect` vs `$derived` misuse (Svelte 5 anti-pattern)
- Reactivity anti-patterns (Map/Set mutations, stale values)
- Component structure issues (missing keys, wrong patterns)
- Svelte 5 best practice violations

**Why mandatory**: Catches Svelte-specific issues that svelte-check and ESLint don't catch (e.g., `$effect` vs `$derived` misuse, reactivity anti-patterns).

**Common Mistakes**:

- ❌ **Run autofixer once**: Must iterate until clean (some fixes require multiple passes)
- ❌ **Skip autofixer**: Only running svelte-check + ESLint misses Svelte-specific issues
- ❌ **Return code with issues**: Must fix all issues before approving

**Report Format**:

```
Svelte MCP Validation (3 files):
- Button.svelte: ✅ Clean (no issues)
- Card.svelte: ⚠️ 2 issues found → fixed
  - Line 12: Use $derived instead of $effect for computed values
  - Line 25: Missing key in {#each} block (use item._id)
- Input.svelte: ✅ Clean (no issues)
```

**Reference**: `.cursor/commands/svelte-validate.md` - Complete Svelte validation workflow

**Example**:

```
Svelte MCP Validation:
- Running svelte-check on 3 changed .svelte files... ✅ No errors
- Running ESLint on 3 files... ✅ No errors
- Running Svelte MCP autofixer on 3 files...
  - Button.svelte: Iteration 1 → clean ✅
  - Card.svelte: Iteration 1: 2 issues → fixed, Iteration 2 → clean ✅
  - Input.svelte: Iteration 1 → clean ✅
- Findings: Fixed $effect vs $derived misuse in Card.svelte
```

---

## 6. Identify Issues

**Purpose**: Find bugs, regressions, and potential problems.

**Workflow**:

1. **Check for bugs**:
   - Logic errors
   - Edge cases not handled
   - Type errors
   - Runtime errors

2. **Check for regressions**:
   - Does this break existing functionality?
   - Are there side effects?
   - Does this affect other modules?

3. **Check for improvements**:
   - Can this be simplified?
   - Is there a better approach?
   - Are there performance optimizations?

**Why**: Catch issues before merge, prevent bugs in production.

**Example**:

```
Issues Found:
- 🐛 Bug: File size validation missing (allows 100MB files)
- ⚠️ Regression: Image preview breaks on mobile (needs responsive fix)
- 💡 Improvement: Can use existing FileUpload utility instead of custom component
```

---

## 7. Suggest Improvements

**Purpose**: Provide actionable suggestions for better code.

**Workflow**:

1. **Suggest better approaches**:
   - Use existing patterns/components
   - Simplify complex logic
   - Optimize performance

2. **Suggest code improvements**:
   - Better error handling
   - Better type safety
   - Better accessibility

3. **Suggest architectural improvements**:
   - Better module boundaries
   - Better separation of concerns
   - Better testability

**Why**: Helps improve code quality and maintainability.

**Example**:

```text
Suggestions:
1. Use existing FileUpload utility (src/lib/utils/fileUpload.ts) instead of custom component
2. Add error handling for upload failures (show user-friendly error)
3. Add loading state during upload (better UX)
4. Add file size validation (max 10MB)
5. Use design tokens for image preview border (not hardcoded)
```

---

## 8. Provide Summary

**Purpose**: Give overall assessment and next steps.

**Workflow**:

1. **Overall assessment**:
   - Code quality (Good/Fair/Needs Work)
   - Architecture compliance (Compliant/Issues Found)
   - Pattern compliance (Compliant/Deviations)

2. **Critical issues**:
   - Must fix before merge
   - Blocks shipping

3. **Nice-to-have improvements**:
   - Can be fixed later
   - Doesn't block merge

4. **Next steps**:
   - What needs to be fixed
   - What can be improved
   - Approval status

**Why**: Clear summary helps decide if code is ready to merge.

**Example**:

```
## Code Review Summary

**Overall Assessment**: Good ✅
- Code quality: Good (minor improvements suggested)
- Architecture: Compliant ✅
- Patterns: Compliant ✅

**Critical Issues**: 1
- 🐛 File size validation missing (must fix)

**Improvements Suggested**: 4
- Use existing FileUpload utility
- Add error handling
- Add loading state
- Use design tokens

**Recommendation**: Fix critical issue, then approve ✅
```

---

## Complete Workflow Example

### Scenario: Review Image Upload Feature

**Step 1: Understand**

```text
AI: Reads ticket SYOS-123
AI: Understands: Adding image uploads to chat
AI: Reviews: ImageUpload.svelte, ChatWindow.svelte changes
```

**Step 2: Check Patterns**

```
AI: Checks patterns/INDEX.md
AI: Verifies: Uses file upload pattern ✅
AI: Verifies: Uses design tokens ✅
AI: Finds deviation: Inline styles for dynamic colors (documented)
```

**Step 3: Validate Architecture**

```
AI: Checks modularity: No new module ✅
AI: Checks coupling: Uses shared utilities ✅
AI: Checks boundaries: No cross-module dependencies ✅
```

**Step 3.5: Check Separation of Concerns**

```
AI: Checks component responsibilities: Component calls useQuery ❌
AI: Finds violation: 3 useQuery calls + form state + validation in component
AI: Recommendation: Extract to useActionItems + useActionItemsForm composables
AI: References existing patterns: useMeetings, useAgendaNotes ✅
```

**Step 4: Check Quality**

```
AI: Checks coding standards: Compliant ✅
AI: Checks best practices: Missing error handling ⚠️
AI: Checks common issues: No memory leaks ✅
```

**Step 5: Validate Svelte Code (MCP)**

```
AI: Detects 2 changed .svelte files (ImageUpload.svelte, ChatWindow.svelte)
AI: Running svelte-check... ✅ No errors
AI: Running ESLint... ✅ No errors
AI: Running Svelte MCP autofixer...
  - ImageUpload.svelte: Iteration 1 → clean ✅
  - ChatWindow.svelte: Iteration 1: 1 issue → fixed, Iteration 2 → clean ✅
AI: Findings: Fixed $effect vs $derived misuse in ChatWindow.svelte
```

**Step 6: Identify Issues**

```
AI: Finds: File size validation missing 🐛
AI: Finds: No loading state ⚠️
AI: Finds: Can use existing utility 💡
```

**Step 7: Suggest Improvements**

```
AI: Suggests: Use FileUpload utility
AI: Suggests: Add error handling
AI: Suggests: Add loading state
```

**Step 8: Summary**

```
AI: Overall: Good ✅
AI: Critical: 1 issue (file size validation)
AI: Recommendation: Fix critical issue, then approve
```

---

## ⚠️ Critical Rules

### Understand First

**ALWAYS understand changes before reviewing**:

- ❌ **WRONG**: Review code without reading ticket
- ✅ **CORRECT**: Read ticket → Understand goal → Review code

**Why**: Can't review code without understanding the goal.

### Check Patterns

**ALWAYS check patterns**:

- ❌ **WRONG**: Review without checking patterns
- ✅ **CORRECT**: Check patterns → Verify compliance → Review

**Why**: Ensures consistency with existing codebase.

### Validate Architecture

**ALWAYS validate architecture**:

- ❌ **WRONG**: Review code without checking architecture
- ✅ **CORRECT**: Check modularity → Check coupling → Review

**Why**: Prevents architectural violations.

### Be Constructive

**Provide actionable feedback**:

- ❌ **WRONG**: "This is wrong" (not helpful)
- ✅ **CORRECT**: "Use FileUpload utility instead - see src/lib/utils/fileUpload.ts"

**Why**: Helps improve code, not just criticize.

---

## 📚 Related Documentation

- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Architecture**: `dev-docs/2-areas/architecture/system-architecture.md` - Modularity principles
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Critical rules
- **Svelte Validation**: `.cursor/commands/svelte-validate.md` - Complete Svelte validation workflow
- **Svelte MCP Pattern**: `dev-docs/2-areas/patterns/ai-development.md#L100` - Svelte Validation Workflow with MCP Autofixer
- **Validate**: `.cursor/commands/validate.md` - Validation workflow

---

## 🎯 Key Principles

1. **Understand First** - Read ticket, understand goal ⭐
2. **Check Patterns** - Verify compliance with existing patterns
3. **Validate Architecture** - Ensure architectural compliance
4. **Check Separation of Concerns** - Components render UI only, composables handle data/logic ⭐ **CRITICAL**
5. **Check Quality** - Verify code meets standards
6. **Validate Svelte Code (MCP)** - Run autofixer on `.svelte` files ⭐ **MANDATORY**
7. **Identify Issues** - Find bugs and improvements
8. **Suggest Improvements** - Provide actionable feedback
9. **Be Constructive** - Help improve, don't just criticize

---

**Last Updated**: 2025-11-22  
**Purpose**: Senior engineer code review workflow with separation of concerns validation  
**Status**: Active workflow  
**Dependencies**:

- SYOS-440 ✅ (Svelte validation command complete)
- SYOS-223 ✅ (Separation of concerns pattern documented)
