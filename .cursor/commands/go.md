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
3. **Check Reference Code** (if available from `/start`)
4. **Use Context7** (if <95% confident)
5. **Implement Solution**

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

3. **If pattern found**:
   - Read pattern file (jump to line number from INDEX.md)
   - Use existing solution (don't reinvent)
   - Document: "Using pattern from [file]:[line]"

4. **If no pattern found**:
   - Continue to reference code check
   - Note: New pattern may be created during `/save` phase

**Why**: Prevents reinventing solutions, ensures consistency, leverages existing knowledge

**Reference**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup table

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

## 3. Use Context7 (If <95% Confident)

**Purpose**: Get up-to-date library documentation when confidence is low.

**When**: After pattern check and reference code check, if still <95% confident about approach.

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

## 4. Implement Solution

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

2. **Follow patterns** (if found):
   - Use pattern solution from step 1
   - Don't deviate unless necessary

3. **Adapt reference code** (if available):
   - Use reference patterns as inspiration
   - Adapt to our codebase structure
   - Document adaptations

4. **Validate architecture**:
   - Check modularity principles (if new module)
   - Verify feature flags (if new module)
   - Check loose coupling (no cross-module dependencies)

5. **Document changes**:
   - What was implemented
   - What patterns were used
   - What reference code was adapted (if any)
   - Any deviations from patterns and why

**Reference**: `/start` command - Coding Standards and Modularity Validation sections

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

**Step 2: Check Reference Code**

```
AI: Checks conversation history
    → Finds "Found reference project: vercel-ai-sdk-chat" from /start
    → Loads ai-docs/reference/vercel-ai-sdk-chat/README.md
    → Reads: "Demonstrates image uploads with Vercel AI SDK"
    → Loads ImageUpload.svelte from reference project
    → Analyzes: Uses FileReader, base64 encoding, preview
    → Documents: "Adapting image upload pattern from vercel-ai-sdk-chat"
```

**Step 3: Use Context7 (if needed)**

```
AI: Confidence check → 90% (not sure about Vercel AI SDK API)
    → Resolves library ID: '/vercel/ai'
    → Gets docs: "How to handle file uploads in chat"
    → Updates confidence: 95%+
    → Proceeds to implementation
```

**Step 4: Implement**

```
AI: Implements using:
    - File upload pattern from ui-patterns.md (our pattern)
    - Image preview approach from vercel-ai-sdk-chat (adapted)
    - Vercel AI SDK API from Context7 docs (verified)
    → Adapts to our codebase:
       - Uses our design tokens (not hardcoded styles)
       - Uses our composables pattern (.svelte.ts)
       - Uses our Convex backend (not Vercel's)
    → Documents: "Adapted image upload from reference, using our design tokens and Convex backend"
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
- **Reference Code**: `ai-docs/reference/README.md` - Reference code system
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Critical rules
- **Start Command**: `.cursor/commands/start.md` - Onboarding and reference code loading
- **Context7**: `/start` command - Library documentation workflow

---

## 🎯 Key Principles

1. **Pattern-First** - Always check patterns before implementing ⭐
2. **Reference Code** - Use working examples, adapt to our codebase
3. **Context7** - Use when <95% confident about approach
4. **Coding Standards** - Follow all rules from coding-standards.md
5. **Adapt, Don't Copy** - Reference code is inspiration, not template
6. **Document Changes** - What patterns/references were used

---

**Last Updated**: 2025-11-20  
**Purpose**: Execute implementation with pattern-first approach and reference code integration  
**Status**: Active workflow
