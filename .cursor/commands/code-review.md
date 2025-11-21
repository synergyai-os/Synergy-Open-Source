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
5. **Identify Issues** (bugs, regressions, improvements)
6. **Suggest Improvements** (better approaches, optimizations)
7. **Provide Summary** (overall assessment)

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

3. **Verify compliance**:
   - Does code follow patterns?
   - Are patterns used correctly?
   - Any deviations? (document why)

**Why**: Consistency with existing codebase prevents "AI code slop".

**Reference**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup table

**Example**:

```
Pattern Check:
- ✅ Uses design tokens (not hardcoded values)
- ✅ Uses composables pattern (.svelte.ts extension)
- ✅ Uses Convex patterns (sessionId parameter)
- ⚠️ Deviation: Uses inline styles for dynamic colors (documented why)
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

## 5. Identify Issues

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

## 6. Suggest Improvements

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

## 7. Provide Summary

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

**Step 4: Check Quality**

```
AI: Checks coding standards: Compliant ✅
AI: Checks best practices: Missing error handling ⚠️
AI: Checks common issues: No memory leaks ✅
```

**Step 5: Identify Issues**

```
AI: Finds: File size validation missing 🐛
AI: Finds: No loading state ⚠️
AI: Finds: Can use existing utility 💡
```

**Step 6: Suggest Improvements**

```
AI: Suggests: Use FileUpload utility
AI: Suggests: Add error handling
AI: Suggests: Add loading state
```

**Step 7: Summary**

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
- **Validate**: `.cursor/commands/validate.md` - Validation workflow

---

## 🎯 Key Principles

1. **Understand First** - Read ticket, understand goal ⭐
2. **Check Patterns** - Verify compliance with existing patterns
3. **Validate Architecture** - Ensure architectural compliance
4. **Check Quality** - Verify code meets standards
5. **Identify Issues** - Find bugs and improvements
6. **Suggest Improvements** - Provide actionable feedback
7. **Be Constructive** - Help improve, don't just criticize

---

**Last Updated**: 2025-11-20  
**Purpose**: Senior engineer code review workflow following Brandon's template approach  
**Status**: Active workflow
