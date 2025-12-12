# code-review

**Purpose**: Act as senior software engineer. Review code for patterns, architecture, quality, and suggest improvements before merge.

---

## When to Use

**Use `/code-review` when:**

- Code is ready for review (before merge)
- Want senior engineer perspective
- Need architecture validation
- Want quality check before shipping

**Workflow**: `/code-review [ticket-id]` → Review → Report → Suggest Improvements

---

## Command Usage

```text
/code-review [ticket-id] or [file paths]
```

**Examples:**

- `/code-review TICKET-123` - Review code from ticket
- `/code-review src/components/Button.tsx` - Review specific file
- `/code-review` - Review current changes (git diff)

---

## Code Review Workflow (MANDATORY)

**Order of operations** (MUST follow this sequence):

1. **Understand Changes** ⭐ **CRITICAL**
2. **Check Patterns** (follows existing patterns?)
3. **Validate Architecture** (modularity, coupling, boundaries)
3.5. **Check Separation of Concerns** (UI vs logic) ⭐ **CRITICAL**
3.6. **Check Component Structure** (file size, imports, duplication) ⭐ **CRITICAL**
4. **Check Code Quality** (standards, best practices)
5. **Validate Framework Code** ⭐ **MANDATORY** (framework-specific validation)
6. **Identify Issues** (bugs, regressions, improvements)
7. **Suggest Improvements** (better approaches, optimizations)
8. **Provide Summary** (overall assessment)

---

## 1. Understand Changes (MANDATORY)

**Purpose**: Understand what changed and why before reviewing.

**Workflow**:

1. **Read ticket/PR description**:
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
Ticket: TICKET-123 - Add image uploads to chat
Goal: Users can upload images in chat conversations
Changes: Added ImageUpload component, updated ChatWindow component
Approach: Cloud storage integration
```

---

## 2. Check Patterns (MANDATORY)

**Purpose**: Verify code follows existing patterns and conventions.

**Workflow**:

1. **Check relevant patterns**:
   - Component patterns
   - State management patterns
   - API integration patterns
   - Framework-specific patterns

2. **Pattern Lifecycle Violations** ⭐ **CRITICAL**

   Check for lifecycle violations:
   - ❌ **DEPRECATED pattern usage** → Suggest migration to ACCEPTED
   - ❌ **SUPERSEDED pattern usage** → Point to replacement pattern
   - ❌ **REJECTED pattern usage** → Explain why it's an anti-pattern
   - ⚠️ **PROPOSED pattern usage** → Document experimental status

   **Report Format**:

   ```
   ## Pattern Lifecycle Violations

   **DEPRECATED Patterns Found**:
   - State Management [STATUS: DEPRECATED]
     - Location: src/hooks/useState.ts
     - Replacement: Modern state management pattern
     - Migration: Use framework's recommended state management

   **Action**: Recommend migration before merge
   ```

3. **Verify compliance**:
   - Does code follow patterns?
   - Are patterns used correctly?
   - Any lifecycle violations? (document in report)
   - Any deviations? (document why)

**Why**: Consistency with existing codebase prevents technical debt. Lifecycle awareness ensures current patterns are used, deprecated patterns are migrated, and anti-patterns are avoided.

**Example**:

```
Pattern Check:
- ✅ Uses design system tokens (not hardcoded values)
- ✅ Uses hooks/composables pattern
- ✅ Uses framework conventions
- ⚠️ Deviation: Uses inline styles for dynamic colors (documented why)

Pattern Lifecycle Violations:
- ❌ DEPRECATED: Old state management pattern used → Recommend migrating to modern pattern
```

---

## 3. Validate Architecture (MANDATORY)

**Purpose**: Ensure code follows architectural principles.

**Workflow**:

1. **Check modularity**:
   - Is new module/feature properly isolated?
   - Feature flag created? (if new feature)
   - Proper boundaries maintained?

2. **Check coupling**:
   - No direct imports from other modules?
   - Uses shared utilities/APIs?
   - Loose coupling maintained?

3. **Check module boundaries**:
   - No cross-module dependencies?
   - Uses documented APIs?
   - Respects module boundaries?

**Example**:

```
Architecture Check:
- ✅ New feature properly isolated
- ✅ Uses shared utilities (no direct imports)
- ✅ Loose coupling (no cross-module dependencies)
- ✅ Module boundaries respected
```

---

## 3.5. Check Separation of Concerns ⭐ **CRITICAL**

**Purpose**: Ensure components follow single responsibility principle (UI rendering only).

**Framework Guidance**: Extract logic from components into hooks/composables/utilities. Components should focus on presentation, not business logic.

**Workflow**:

1. **Check component responsibilities**:
   - ❌ Component calls API directly? → Should use hook/composable
   - ❌ Component contains business logic/validation? → Should use hook/composable
   - ❌ Component has form state + mutations? → Should use hook/composable
   - ✅ Component focuses on UI rendering? → Good

2. **Verify hooks/composables exist**:
   - Data fetching logic → `useData` hook/composable
   - Form state/logic → `useForm` hook/composable
   - Business logic → Hook/composable or utility function

3. **Check existing patterns**:
   - Does code follow established patterns?
   - Are hooks/composables in correct location?
   - Do hooks/composables follow naming conventions?

**Why Critical**:

- Enables unit testing (hooks/composables testable independently)
- Enables component testing (components work with mocked hooks/composables)
- Improves maintainability (clear boundaries)
- Follows framework best practices (extract logic from components)

**Example**:

```
Separation of Concerns Check:
- ❌ VIOLATION: Component calls API directly (3 API calls in UserList component)
  → Should extract to useUsers hook/composable
- ❌ VIOLATION: Component contains form state + validation + mutations (150 lines)
  → Should extract to useUserForm hook/composable
- ✅ Component UserCard uses useUsers hook/composable (good pattern)

Recommendation: Extract data fetching and form logic to hooks/composables before merge
```

**Common Violations**:

```typescript
// ❌ WRONG: Component does everything
function UserList() {
  // Data fetching (directly in component)
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(setUsers);
  }, []);

  // Form state (directly in component)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Business logic (directly in component)
  async function handleSubmit() {
    if (!name) return; // validation
    await fetch('/api/users', { method: 'POST', body: JSON.stringify({ name, email }) }); // mutation
  }

  return <div>...</div>;
}

// ✅ CORRECT: Component uses hooks/composables
function UserList() {
  const { users } = useUsers();
  const { form, handleSubmit } = useUserForm();

  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

---

## 3.6. Check Component Structure ⭐ **CRITICAL**

**Purpose**: Ensure components aren't god components and follow single responsibility principle at the component level.

**When**: After checking separation of concerns (Step 3.5), for all component files.

**Workflow**:

1. **Check file size**:
   - Count total lines in component file (including script, template, style)
   - ❌ File > 500 lines? → Flag as god component, suggest breakdown
   - ⚠️ File > 300 lines with multiple responsibilities? → Suggest extracting components
   - ✅ File < 300 lines with single responsibility? → Good

2. **Check import count**:
   - Count all imports (components, hooks/composables, utilities, types)
   - ❌ > 20 imports? → Too many dependencies, suggest extracting components
   - ⚠️ > 15 imports with mixed concerns? → Suggest refactoring
   - ✅ < 15 imports with focused concerns? → Good

3. **Check code duplication**:
   - Look for desktop/mobile view duplication (same UI rendered twice)
   - Look for repeated UI patterns (same markup in multiple places)
   - Look for duplicate logic blocks
   - ❌ Desktop/mobile duplication found? → Extract shared component
   - ❌ Repeated UI patterns? → Extract reusable component
   - ✅ No duplication? → Good

4. **Check component structure**:
   - Does component handle multiple views (list + detail)? → Extract separate components
   - Does component mix layout + content? → Extract layout component
   - Does component handle multiple responsibilities? → Extract focused components
   - ✅ Component has single responsibility? → Good

5. **Check missing abstractions**:
   - Should shared components exist? (e.g., `UserList` for desktop/mobile reuse)
   - Should layout components exist? (e.g., `UserDetailPanel` for detail view)
   - Should feature components exist? (e.g., `UserActions` for user-specific logic)
   - ❌ Missing abstraction identified? → Suggest extracting component
   - ✅ Abstractions exist? → Good

**Why Critical**:

- Prevents god components (hard to maintain, test, and understand)
- Reduces code duplication (single source of truth, easier updates)
- Improves testability (smaller components easier to test in isolation)
- Enables reusability (extracted components can be reused elsewhere)
- Improves maintainability (changes isolated to specific components)

**Example**:

```
Component Structure Check:
- ❌ VIOLATION: File is 730 lines (god component)
  → Should be broken down into UserList, UserDetailPanel, UserActions
- ❌ VIOLATION: 29 imports (too many dependencies)
  → Extract components to reduce import count
- ❌ VIOLATION: Desktop/mobile duplication (~150 lines duplicated)
  → Extract shared UserList component
- ❌ VIOLATION: Missing abstraction (should UserList exist for reuse)
  → Extract UserList component
- ❌ VIOLATION: Component handles multiple views (list + detail + actions)
  → Extract UserDetailPanel and UserActions components

Recommendation: Refactor component structure before merge
```

**Common Violations**:

```typescript
// ❌ WRONG: God component (730 lines, 29 imports, multiple responsibilities)
function UserPage() {
  // 5 hooks/composables
  // User management logic
  // Desktop + mobile views (duplicated)
  // Multiple detail view types
  return (
    <>
      {!isMobile ? (
        <div>{/* Desktop view (200 lines) */}</div>
      ) : (
        <div>{/* Mobile view (200 lines - duplicated) */}</div>
      )}
    </>
  );
}

// ✅ CORRECT: Focused components
function UserPage() {
  const { users, selectedUser } = useUserPage();
  return (
    <>
      <UserList users={users} onSelect={selectedUser} />
      <UserDetailPanel user={selectedUser} />
    </>
  );
}
```

**Thresholds** (guidelines, not hard rules):

- **File size**: > 500 lines = god component, > 300 lines with multiple responsibilities = consider breakdown
- **Import count**: > 20 imports = too many dependencies, > 15 with mixed concerns = consider refactor
- **Duplication**: Any desktop/mobile duplication = extract shared component
- **Responsibilities**: Component handles > 2 distinct UI areas = extract components

---

## 4. Check Code Quality

**Purpose**: Verify code meets quality standards.

**Workflow**:

1. **Check coding standards**:
   - No `any` types (TypeScript projects)
   - Proper error handling
   - Consistent naming conventions
   - Follows framework conventions

2. **Check best practices**:
   - Proper error handling
   - TypeScript types (if TypeScript project)
   - Accessibility (if UI)
   - Performance considerations

3. **Check for common issues**:
   - Memory leaks
   - Race conditions
   - Security issues
   - Performance bottlenecks

**Example**:

```text
Code Quality Check:
- ✅ No `any` types
- ✅ Proper error handling
- ✅ Follows framework conventions
- ⚠️ Missing error handling for API failure
- ⚠️ No loading state during async operation
```

---

## 5. Validate Framework Code ⭐ **MANDATORY**

**Purpose**: Ensure code follows latest framework best practices automatically.

**When**: After code quality check, for framework-specific files.

**Workflow**:

1. **Detect framework**:
   - Identify framework from file extensions and imports
   - React: `.tsx`, `.jsx` files
   - Vue: `.vue` files
   - Svelte: `.svelte`, `.svelte.ts` files
   - Angular: `.ts` files with Angular decorators

2. **Run framework-specific validation**:
   - **React**: Check hooks rules, component patterns, React best practices
   - **Vue**: Check composition API patterns, Vue best practices
   - **Svelte**: Use Svelte MCP autofixer for Svelte 5 validation
   - **Angular**: Check component patterns, Angular best practices

3. **Document findings**:
   - Report framework-specific issues
   - Suggest framework-specific improvements

**Report Format**:

```
Framework Validation (3 files):
- Button.tsx: ✅ Clean (no issues)
- Card.tsx: ⚠️ 2 issues found
  - Line 12: Use useMemo for expensive calculations
  - Line 25: Missing key prop in map
- Input.tsx: ✅ Clean (no issues)
```

**For Svelte projects**: Use Svelte MCP autofixer to validate Svelte 5 patterns automatically.

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
- 💡 Improvement: Can use existing utility instead of custom component
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
1. Use existing utility function instead of custom implementation
2. Add error handling for API failures (show user-friendly error)
3. Add loading state during async operation (better UX)
4. Add input validation (max file size 10MB)
5. Use design system tokens for styling (not hardcoded values)
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
- Use existing utility function
- Add error handling
- Add loading state
- Use design system tokens

**Recommendation**: Fix critical issue, then approve ✅
```

---

## Complete Workflow Example

### Scenario: Review Image Upload Feature

**Step 1: Understand**

```text
AI: Reads ticket TICKET-123
AI: Understands: Adding image uploads to chat
AI: Reviews: ImageUpload component, ChatWindow component changes
```

**Step 2: Check Patterns**

```
AI: Checks patterns
AI: Verifies: Uses file upload pattern ✅
AI: Verifies: Uses design system tokens ✅
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
AI: Checks component responsibilities: Component calls API directly ❌
AI: Finds violation: 3 API calls + form state + validation in component
AI: Recommendation: Extract to useImageUpload + useImageForm hooks/composables
```

**Step 3.6: Check Component Structure**

```
AI: Checks file size: 730 lines ❌ (god component)
AI: Checks import count: 29 imports ❌ (too many dependencies)
AI: Checks duplication: Desktop/mobile duplication found (~150 lines) ❌
AI: Checks structure: Component handles list + detail + actions ❌
AI: Checks abstractions: Missing ImageList component ❌
AI: Recommendation: Extract ImageList, ImageDetailPanel, ImageActions components
```

**Step 4: Check Quality**

```
AI: Checks coding standards: Compliant ✅
AI: Checks best practices: Missing error handling ⚠️
AI: Checks common issues: No memory leaks ✅
```

**Step 5: Validate Framework Code**

```
AI: Detects React components (.tsx files)
AI: Running React validation...
  - ImageUpload.tsx: Iteration 1 → clean ✅
  - ChatWindow.tsx: Iteration 1: 1 issue → fixed, Iteration 2 → clean ✅
AI: Findings: Fixed hooks dependency array issue in ChatWindow.tsx
```

**Step 6: Identify Issues**

```
AI: Finds: File size validation missing 🐛
AI: Finds: No loading state ⚠️
AI: Finds: Can use existing utility 💡
```

**Step 7: Suggest Improvements**

```
AI: Suggests: Use existing utility function
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

- ❌ **WRONG**: Review code without reading ticket/PR
- ✅ **CORRECT**: Read ticket/PR → Understand goal → Review code

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
- ✅ **CORRECT**: "Use existing utility function instead - see src/utils/fileUpload.ts"

**Why**: Helps improve code, not just criticize.

---

## 🎯 Key Principles

1. **Understand First** - Read ticket/PR, understand goal ⭐
2. **Check Patterns** - Verify compliance with existing patterns
3. **Validate Architecture** - Ensure architectural compliance
4. **Check Separation of Concerns** - Components render UI only, hooks/composables handle data/logic ⭐ **CRITICAL**
5. **Check Component Structure** - Prevent god components, check file size/imports/duplication ⭐ **CRITICAL**
6. **Check Quality** - Verify code meets standards
7. **Validate Framework Code** - Run framework-specific validation ⭐ **MANDATORY**
8. **Identify Issues** - Find bugs and improvements
9. **Suggest Improvements** - Provide actionable feedback
10. **Be Constructive** - Help improve, don't just criticize

---

**Last Updated**: 2025-11-24  
**Purpose**: Senior engineer code review workflow with separation of concerns and component structure validation  
**Status**: Active workflow  
**Framework Support**: React, Vue, Svelte, Angular (framework-specific validation)
