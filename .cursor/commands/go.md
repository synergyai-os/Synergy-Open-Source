# go

**Purpose**: Execute implementation after user confirmation. **Pattern-first approach** - Always check patterns before implementing.

---

# 🚨🚨🚨 CRITICAL: Linear Ticket Required 🚨🚨🚨

## ⛔ **DO NOT PROCEED WITHOUT LINEAR TICKET ID**

**BEFORE doing ANY work:**

### Step 1: Check for Linear Ticket ID

**Look in the conversation for:**

- "SYOS-123" or "SYOS-XXX" format
- "ticket SYOS-123"
- "Linear ticket"
- Any mention of a Linear issue ID

### Step 2: Decision

**IF NO TICKET ID FOUND:**

```
❌ STOP IMMEDIATELY - I cannot proceed without a Linear ticket ID.

Please provide:
- Linear ticket ID (e.g., SYOS-123)
- OR say "create new ticket" and I'll help you create one using /start

Once I have a ticket ID, I'll proceed with implementation.
```

**DO NOT:**

- ❌ Read documentation
- ❌ Call any tools
- ❌ Implement anything
- ❌ Do ANY work

**IF TICKET ID FOUND → Continue below**

---

## 🌿 Branch Verification (Before Implementation)

**Purpose**: Verify you're on the correct branch before starting implementation to prevent work loss.

**When**: After Linear ticket check, before checking patterns.

**Workflow**:

1. **Check current branch**:

   ```bash
   git branch --show-current
   ```

2. **Extract ticket ID from branch name** (if ticket-based branch):
   - Pattern: `feature/SYOS-XXX-description` or `fix/SYOS-XXX-description`
   - Extract: `SYOS-XXX` from branch name

3. **Compare ticket ID**:
   - If branch contains ticket ID → Compare with current ticket ID
   - If match → ✅ Continue with implementation
   - If mismatch → ⚠️ Warn user

4. **If branch doesn't match ticket**:

   ```
   ⚠️ Warning: You're on branch [branch-name] but implementing ticket SYOS-XXX

   Current branch: [branch-name]
   Ticket ID: SYOS-XXX

   This could cause work to be committed to the wrong branch.

   Options:
   1. Switch to correct branch: Use /branch command to create feature/SYOS-XXX-description
   2. Continue anyway: If this is intentional (e.g., project-based branch)

   Proceed? (yes/no)
   ```

5. **If branch matches or user confirms**:
   - Continue with implementation workflow
   - Note: Branch verification passed

**Why**: Prevents committing work to wrong branch, ensures work stays organized, reduces merge conflicts.

**See**: `/branch` command for branch creation workflow

---

## ✅ Implementation Workflow (MANDATORY)

**Order of operations** (MUST follow this sequence):

1. **Branch Verification** ⭐ **CRITICAL** (see above)
2. **Check Patterns First** ⭐ **CRITICAL**
3. **Design Token Validation** ⭐ **MANDATORY** (for UI/component work - BEFORE writing code)
4. **Validate Svelte Code (MCP)** ⭐ **MANDATORY** (for `.svelte` files only)
5. **Check Reference Code** (if available from `/start`)
6. **Use Context7** (if <95% confident)
7. **Implement Solution**
8. **IMMEDIATE ESLint Validation** ⭐ **MANDATORY** (run `npx eslint [file]` RIGHT after writing code, READ the output)

**⚠️ CRITICAL: Step 8 is NON-NEGOTIABLE**

- You CANNOT see red squiggles in real-time
- You MUST run ESLint explicitly after writing code
- You MUST READ the full error output (not just check exit code)
- You CANNOT claim "validation passed" without actually running ESLint
- You CANNOT proceed if ESLint shows errors

**Layered Enforcement (3 layers):**

- **Layer 1**: Cursor rule (auto-loads for .svelte files - guidance + examples)
- **Layer 2**: IMMEDIATE ESLint validation (Step 8 - catches violations during implementation) ⭐ **YOU MUST RUN THIS**
- **Layer 3**: Pre-commit hook (final safety net - blocks commits)

---

## 1. Check Patterns First (MANDATORY)

**⚠️ ALWAYS check patterns BEFORE implementing**

**Workflow**:

1. **Load pattern index**:

   ```typescript
   // Read dev-docs/2-areas/patterns/INDEX.md
   const patternIndex = read_file('dev-docs/2-areas/patterns/INDEX.md');
   ```

2. **Search for relevant patterns**:
   - Match ticket keywords to pattern symptoms
   - Check if existing solution exists
   - Example: "Svelte reactivity issue" → Check `svelte-reactivity.md` patterns

3. **Pattern Lifecycle Awareness** ⭐ **NEW**

   When checking patterns:
   - ✅ **Prefer ACCEPTED patterns** (current best practice)
   - ✅ **Skip SUPERSEDED patterns** (use replacement #LXXX instead)
   - ⚠️ **If only DEPRECATED found** → warn user, suggest migration path
   - ❌ **Never use REJECTED patterns** (anti-patterns)
   - ⚠️ **PROPOSED patterns** → document experimental status

   **Example**:

   ```
   Found #L10 [STATUS: SUPERSEDED] → Use #L50 instead
   Found #L20 [STATUS: DEPRECATED] → Warn user, show migration path
   Found #L30 [STATUS: ACCEPTED] → Use this ✅
   ```

4. **If pattern found**:
   - Read pattern file (jump to line number from INDEX.md)
   - Check lifecycle status (ACCEPTED/DEPRECATED/SUPERSEDED/REJECTED/PROPOSED)
   - If ACCEPTED → Use existing solution (don't reinvent)
   - If SUPERSEDED → Use replacement pattern (#LXXX)
   - If DEPRECATED → Warn user, show migration path, use if necessary
   - If REJECTED → Never use (anti-pattern)
   - If PROPOSED → Document experimental status
   - Document: "Using pattern from [file]:[line] [STATUS: X]"

5. **If no pattern found**:
   - Continue to reference code check
   - Note: New pattern may be created during `/save` phase

**Why**: Prevents reinventing solutions, ensures consistency, leverages existing knowledge, guides to current patterns

**Reference**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup table with lifecycle states

---

### 📖 Quick Reference: Storybook Story Organization

**If task involves creating Storybook stories:**

**File Location:**

- Co-locate with component (same folder)
- Example: `ActionItemsList.svelte` → `ActionItemsList.stories.svelte`

**Title Hierarchy:**

```typescript
// Design System (shared UI - used by multiple modules)
'Design System/Atoms/ComponentName'; // Single elements
'Design System/Molecules/ComponentName'; // 2-3 atoms composed
'Design System/Organisms/ComponentName'; // Complex sections

// Modules (feature-specific - single module only)
'Modules/ModuleName/ComponentName'; // e.g., 'Modules/Meetings/ActionItemsList'
```

**Classification Decision Tree:**

```
Q: Is component used by multiple modules?
→ Yes: Design System (classify as Atom/Molecule/Organism)
→ No: Module-specific (`'Modules/ModuleName/ComponentName'`)

Examples:
- Button (used everywhere) → `'Design System/Atoms/Button'`
- ActionItemsList (only Meetings) → `'Modules/Meetings/ActionItemsList'`
- MeetingCard (only Meetings) → `'Modules/Meetings/MeetingCard'`
- InboxCard (only Inbox) → `'Modules/Inbox/InboxCard'`
```

**Why this approach:**

- ✅ Co-location preserves module ownership
- ✅ Hierarchical titles organize Storybook nav
- ✅ Aligns with atomic design + modular architecture
- ✅ Scalable (add modules without navigation chaos)

**Context7 Validated:** Standard Storybook pattern for component organization

---

## 2. Check Reference Code (If Available)

**Purpose**: Use working code examples from reference projects (loaded during `/start`).

**When**: After pattern check, if reference code was loaded during `/start` session.

**Workflow**:

1. **Check conversation history**:
   - Look for "Found reference project: [project-name]" from `/start`
   - If found → Load reference project files

2. **Load reference project**:

   ```typescript
   // Read reference project README
   const refReadme = read_file(`ai-docs/reference/${projectName}/README.md`);

   // Read key implementation files
   const refFiles = list_dir(`ai-docs/reference/${projectName}`);
   // Load relevant source files
   ```

3. **Analyze reference implementation**:
   - Understand how reference project solves the problem
   - Identify patterns/approaches used
   - Note: Adapt, don't copy (different codebase, different context)

4. **Adapt to our codebase**:
   - Use reference patterns as inspiration
   - Adapt to our tech stack (Svelte 5, Convex, TypeScript)
   - Follow our coding standards (design tokens, composables, etc.)
   - Document: "Adapted from reference project: [project-name] - [what was adapted]"

**Key Principle**: **Adapt, don't copy**

- Reference code shows HOW to solve the problem
- Adapt patterns to our codebase structure
- Use our design tokens, composables, Convex patterns
- Don't copy code verbatim (different context)

**Reference**: `ai-docs/reference/README.md` - Reference code system documentation

---

## 3. Validate Svelte Code (MCP) - For .svelte Files Only ⭐ **MANDATORY**

**Purpose**: Ensure Svelte code follows latest Svelte 5 best practices automatically.

**When**: After pattern check, before/during implementation (for `.svelte` and `.svelte.ts` files only).

**Workflow**:

1. **Check if files being written are Svelte files**:
   - If writing `.svelte` or `.svelte.ts` files → Continue to step 2
   - If not writing Svelte files → Skip this step, proceed to reference code check

2. **Invoke Svelte MCP autofixer** ⭐ **MANDATORY**:

   ```typescript
   // ✅ CORRECT: Always invoke autofixer when writing Svelte code
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
   - Note in implementation notes: "Svelte MCP validation: [summary]"

**Why mandatory**: Catches Svelte-specific issues that svelte-check and ESLint don't catch (e.g., `$effect` vs `$derived` misuse, reactivity anti-patterns).

**Common Mistakes**:

- ❌ **Run autofixer once**: Must iterate until clean (some fixes require multiple passes)
- ❌ **Skip autofixer**: Only running svelte-check + ESLint misses Svelte-specific issues
- ❌ **Return code with issues**: Must fix all issues before returning code to user

**See**: `.cursor/commands/svelte-validate.md` for the full validation workflow (svelte-check, ESLint, MCP autofixer, iteration patterns, troubleshooting).

---

## 4. Use Context7 (If <95% Confident)

**Purpose**: Get up-to-date library documentation when confidence is low.

**When**: After pattern check, Svelte validation (if applicable), and reference code check, if still <95% confident about approach.

**Workflow**:

1. **Confidence check**:
   - If 95%+ confident → Skip Context7, proceed to implementation
   - If <95% confident → Use Context7

2. **Resolve library ID**:

   ```typescript
   // Example: Need Svelte 5 documentation
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
   - Proceed to implementation

**Why**: Context7 provides up-to-date, accurate library documentation with code examples

**Reference**: `/start` command - Library Documentation section

---

## 5. Implement Solution

**Purpose**: Write code following our standards and patterns.

**Workflow**:

1. **Follow coding standards**:
   - Read `dev-docs/2-areas/development/coding-standards.md` ⭐ **CRITICAL**
   - No `any` types (use proper types or `unknown` + type guards)
   - All `{#each}` blocks have keys `(item._id)`
   - All `goto()` use `resolveRoute()`
   - Use design tokens (never hardcode values)
   - Use `.svelte.ts` for composables
   - Use `useQuery()` for Convex data

2. **For Svelte files** (`.svelte`, `.svelte.ts`):
   - **MUST** run Svelte MCP validation (step 3) before finalizing code
   - Fix all issues found by autofixer
   - Iterate until autofixer returns no issues
   - Document validation findings

3. **Follow patterns** (if found):
   - Use pattern solution from step 1
   - Don't deviate unless necessary

4. **Adapt reference code** (if available):
   - Use reference patterns as inspiration
   - Adapt to our codebase structure
   - Document adaptations

5. **Validate architecture**:
   - Check modularity principles (if new module)
   - Verify feature flags (if new module)
   - Check loose coupling (no cross-module dependencies)

6. **Document changes**:
   - What was implemented
   - What patterns were used
   - What reference code was adapted (if any)
   - Svelte MCP validation findings (if applicable)
   - Any deviations from patterns and why

**Reference**: `/start` command - Coding Standards and Modularity Validation sections

---

## 5.4. Recipe Validation (If Creating/Modifying Recipes)

**Purpose**: Validate CVA recipe classes exist in design system utilities

**When**: If you created or modified a `.recipe.ts` file

**Workflow**:

1. **Run recipe validation**:

   ```bash
   npm run recipes:validate
   ```

2. **Check results**:
   - ✅ **If clean** → Continue to ESLint validation
   - ❌ **If violations found** → READ suggestions, fix immediately

3. **If violations found**:

   ```
   ✗ src/lib/design-system/recipes/loading.recipe.ts
     Line 17: Class 'icon-sm' not found
     → Did you mean: 'size-iconsm'

     Line 18: Class 'icon-md' not found
     → Did you mean: 'size-iconmd'
   ```

   - READ the suggestions carefully
   - Update recipe to use correct utility class names
   - Re-run `npm run recipes:validate`
   - Repeat until all recipes pass

4. **Common mistakes caught**:
   - Wrong utility names: `icon-sm` → `size-iconsm`
   - Typos: `size-icon-sm` → `size-iconsm`
   - Non-existent classes: `custom-size` → (doesn't exist in CSS)

**Why mandatory**: Prevents recipes from referencing classes that don't exist, which would fail silently at runtime.

---

## 5.5. IMMEDIATE ESLint Validation (MANDATORY - Layer 2 Enforcement)

**⚠️ CRITICAL: Run ESLint validation IMMEDIATELY after implementation, BEFORE showing user**

**⚠️ YOU CANNOT SEE RED SQUIGGLES IN REAL-TIME - You MUST run ESLint explicitly to see violations**

**Purpose**: Catch design token violations DURING implementation (early quality control)

**When**: RIGHT after writing code, BEFORE user reviews

**Workflow**:

1. **Run ESLint on the file you just edited**:

   ```bash
   npx eslint src/lib/components/atoms/YourComponent.svelte
   ```

   **OR run full lint check**:

   ```bash
   npm run lint
   ```

2. **READ THE FULL OUTPUT** (don't just check exit code):
   - ⚠️ **CRITICAL**: You must READ the actual error messages, not just "passed/failed"
   - ⚠️ Look for: `synergyos/no-hardcoded-design-values` errors
   - ⚠️ Each error shows: file, line, column, and violation type

3. **Check results**:
   - ✅ **If clean** (0 errors, "✨ Congratulations!") → Continue to document changes
   - ❌ **If violations found** → STOP, READ THE ERRORS, fix immediately, re-run

4. **If violations found** (you WILL see them in output):

   ```
   /path/to/Component.svelte
     22:46  error  Hardcoded pixel value 16 detected in "dimensions" ...
     22:67  error  Hardcoded pixel value 48 detected in "dimensions" ...
     22:72  error  Hardcoded pixel value 32 detected in "dimensions" ...

   ✖ 3 problems (3 errors, 0 warnings)
   ```

   - **READ each error line carefully**
   - Identify ALL hardcoded values (pixel numbers, rem strings, hex colors, etc.)
   - Fix ALL violations (no "I'll fix later", no "it matches tokens so it's fine")
   - Re-run ESLint on the file
   - Repeat until you see: "✨ Congratulations! Your files look great."

5. **Common violations caught**:
   - Hardcoded pixel numbers: `16`, `48`, `32` (even if they "match" token values!)
   - Hardcoded rem/px strings: `'1rem'`, `'32px'`, `'2rem'`
   - Raw Tailwind utilities: `px-4`, `py-2`, `gap-2`
   - Hex colors: `'#3b82f6'`, `bg-blue-600`
   - Decimal opacity: `0.5`, `opacity-50`

**Example workflow:**

```bash
# After writing Loading.svelte
npx eslint src/lib/components/atoms/Loading.svelte

# Output shows violations:
/Users/.../Loading.svelte
  22:46  error  Hardcoded pixel value 16 detected in "dimensions"
  22:67  error  Hardcoded pixel value 48 detected in "dimensions"
  22:72  error  Hardcoded pixel value 32 detected in "dimensions"

✖ 3 problems (3 errors, 0 warnings)

# READ THE ERRORS - They're telling you exactly what's wrong!
# Fix: Replace const dimensions = $derived(size === 'sm' ? 16 : 48 : 32)
# With: const sizeClasses = $derived(size === 'sm' ? 'w-icon-sm h-icon-sm' : ...)

# Re-run ESLint
npx eslint src/lib/components/atoms/Loading.svelte

# Output:
✨ Congratulations! Your files look great.
```

**Why MANDATORY**:

- **You can't see red squiggles** - ESLint errors aren't visible to you in real-time
- Catches violations DURING implementation (not at commit time)
- Forces fix IMMEDIATELY while context is fresh
- Prevents "I'll refactor later" (later never happens)
- Quality built-in early (not tacked on at end)

**NO EXCEPTIONS**:

- ❌ Can't skip ("I'll fix in next commit")
- ❌ Can't bypass ("This is a special case")
- ❌ Can't claim "validation passed" without running ESLint
- ❌ Can't rationalize ("values match tokens so it's fine")
- ✅ Must be clean before showing user
- ✅ Must READ the actual error output (not just check exit code)

**⚠️ CRITICAL REMINDER:**

- "Matching token values" = STILL HARDCODING
- `const size = 16` (matches --size-icon-sm) = HARDCODED (ESLint will catch it)
- `class="w-icon-sm"` (references --size-icon-sm) = CORRECT

**This is Layer 2 of 3-layer enforcement - quality control at the RIGHT time.**

---

## 📋 Complete Workflow Example

### Scenario: Implement Chat Feature with Image Uploads

**Step 1: Check Patterns**

```
AI: Checks dev-docs/2-areas/patterns/INDEX.md
    → Finds "file upload" pattern in ui-patterns.md:45
    → Reads pattern: "Use FileReader API with preview"
    → Documents: "Using file upload pattern from ui-patterns.md:45"
```

**Step 2: Validate Svelte Code (MCP)**

```
AI: Detects writing ImageUpload.svelte file
    → Invokes mcp_svelte_svelte_autofixer
    → Finds issue: "Using $effect for computed value, should use $derived"
    → Fixes: Changes $effect to $derived
    → Re-runs autofixer → No issues found
    → Documents: "Svelte MCP validation: Fixed $effect vs $derived misuse"
```

**Step 3: Check Reference Code**

```
AI: Checks conversation history
    → Finds "Found reference project: vercel-ai-sdk-chat" from /start
    → Loads ai-docs/reference/vercel-ai-sdk-chat/README.md
    → Reads: "Demonstrates image uploads with Vercel AI SDK"
    → Loads ImageUpload.svelte from reference project
    → Analyzes: Uses FileReader, base64 encoding, preview
    → Documents: "Adapting image upload pattern from vercel-ai-sdk-chat"
```

**Step 4: Use Context7 (if needed)**

```
AI: Confidence check → 90% (not sure about Vercel AI SDK API)
    → Resolves library ID: '/vercel/ai'
    → Gets docs: "How to handle file uploads in chat"
    → Updates confidence: 95%+
    → Proceeds to implementation
```

**Step 5: Implement**

```
AI: Implements using:
    - File upload pattern from ui-patterns.md (our pattern)
    - Image preview approach from vercel-ai-sdk-chat (adapted)
    - Vercel AI SDK API from Context7 docs (verified)
    → Adapts to our codebase:
       - Uses our design tokens (not hardcoded styles)
       - Uses our composables pattern (.svelte.ts)
       - Uses our Convex backend (not Vercel's)
    → Svelte MCP validation already completed (step 2)
    → Documents: "Adapted image upload from reference, using our design tokens and Convex backend. Svelte MCP validation: Fixed $effect vs $derived misuse"
```

---

## ⚠️ Critical Rules

### Pattern-First Principle

**ALWAYS check patterns BEFORE implementing**:

- ❌ **WRONG**: Implement → Find pattern later → Refactor
- ✅ **CORRECT**: Check patterns → Use existing solution → Implement

**Why**: Prevents reinventing solutions, ensures consistency, saves time

### Reference Code Adaptation

**Adapt, don't copy**:

- ❌ **WRONG**: Copy code verbatim from reference project
- ✅ **CORRECT**: Understand approach → Adapt to our codebase → Use our patterns

**Why**: Reference code is from different codebase, different context. We have our own patterns, design tokens, architecture.

### Confidence Threshold

**95% confidence rule**:

- If 95%+ confident → Implement directly
- If <95% confident → Use Context7, then implement

**Why**: Prevents bugs from incorrect assumptions, ensures quality

---

## 📚 Related Documentation

- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Svelte MCP Validation**: `dev-docs/2-areas/patterns/ai-development.md#L100` - Svelte Validation Workflow with MCP Autofixer
- **Reference Code**: `ai-docs/reference/README.md` - Reference code system
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Critical rules
- **Start Command**: `.cursor/commands/start.md` - Onboarding and reference code loading
- **Context7**: `/start` command - Library documentation workflow

---

## 🎯 Key Principles

1. **Pattern-First** - Always check patterns before implementing ⭐
2. **Layered Enforcement** - 3-layer design token enforcement (cursor rule + IMMEDIATE ESLint + pre-commit) ⭐ **NEW**
3. **Token Validation BEFORE Code** - Validate plan uses design tokens BEFORE writing (Step 3) ⭐ **NEW**
4. **IMMEDIATE ESLint AFTER Code** - Run `npx eslint [file]` RIGHT after writing, READ output (Step 8) ⭐ **NEW** **MANDATORY**
5. **You Can't See Red Squiggles** - ESLint errors aren't visible in real-time; you MUST run command ⭐ **CRITICAL**
6. **Svelte MCP Validation** - Always validate `.svelte` files with autofixer ⭐ **MANDATORY**
7. **Reference Code** - Use working examples, adapt to our codebase
8. **Context7** - Use when <95% confident about approach
9. **Coding Standards** - Follow all rules from coding-standards.md
10. **Adapt, Don't Copy** - Reference code is inspiration, not template
11. **Document Changes** - What patterns/references were used

**Quality control at THREE enforcement points**:

- **Cursor rule** (guidance + examples)
- **IMMEDIATE ESLint** (during work - YOU MUST RUN THIS EXPLICITLY)
- **Pre-commit hook** (final safety net)

**= Zero violations IF you follow Step 8**

---

**Last Updated**: 2025-11-22 (Strengthened Step 8: MUST run ESLint explicitly after writing code - AI can't see red squiggles in real-time)
**Purpose**: Execute implementation with pattern-first approach, design token enforcement (3 layers with EXPLICIT ESLint validation), Svelte MCP validation, and reference code integration  
**Status**: Active workflow - **Step 8 is MANDATORY and NON-NEGOTIABLE**
