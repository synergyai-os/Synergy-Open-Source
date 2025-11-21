# code-cleanup

**Purpose**: Systematic code cleanup workflow. Identifies dead code, unused imports, and unused files. Removes safely and verifies no regressions.

---

## When to Use

**Use `/code-cleanup` when:**

- Tried multiple approaches, some code is unused
- Want to remove dead code
- Need to clean up unused imports/files
- Refactoring left unused code behind

**Workflow**: `/code-cleanup SYOS-XXX` → Identify → Verify → Remove → Test → `/validate` → `/save`

---

## Command Usage

```
/code-cleanup [SYOS-XXX] or [description]
```

**Examples:**

- `/code-cleanup SYOS-123` - Cleanup from Linear ticket
- `/code-cleanup Remove unused imports from inbox module` - Cleanup from description

---

## Code Cleanup Workflow (MANDATORY)

**Order of operations** (MUST follow this sequence):

1. **Identify Dead Code** ⭐ **CRITICAL**
2. **Verify Unused** (double-check before removing)
3. **Check Dependencies** (what depends on this?)
4. **Remove Safely** (one at a time, test after each)
5. **Verify No Regressions** (test functionality)
6. **Document Cleanup** (what was removed and why)

---

## 1. Identify Dead Code (MANDATORY)

**Purpose**: Find code that's no longer used.

**What to Look For**:

1. **Unused Imports**:
   - Imports that aren't referenced
   - Type-only imports that aren't used

2. **Unused Functions/Components**:
   - Functions never called
   - Components never rendered
   - Utils never imported

3. **Unused Files**:
   - Files not imported anywhere
   - Test files for removed features
   - Old migration files

4. **Dead Code Paths**:
   - Code behind `if (false)` conditions
   - Unreachable code
   - Commented-out code

**Workflow**:

1. **Search for unused imports**:

   ```typescript
   // Use grep to find imports
   // Check if imported symbols are used
   ```

2. **Search for unused functions**:

   ```typescript
   // Use grep to find function definitions
   // Check if functions are called anywhere
   ```

3. **Search for unused files**:
   ```typescript
   // List files in directory
   // Check if files are imported anywhere
   ```

**Tools**:

- `grep` - Search for usages
- `codebase_search` - Semantic search for references
- ESLint (if configured) - Can detect unused imports

**Example**:

```
Found dead code:
- src/lib/utils/oldHelper.ts - Not imported anywhere
- src/lib/components/OldButton.svelte - Not used in any component
- Unused imports in 5 files: useState, useEffect (Svelte 5 migration)
```

---

## 2. Verify Unused (Double-Check)

**Purpose**: Ensure code is truly unused before removing.

**Workflow**:

1. **Check all usages**:
   - Search codebase for function/component name
   - Check if used in tests
   - Check if used in comments/docs

2. **Check dynamic imports**:
   - Check if imported dynamically (`import()`)
   - Check if used in string-based references

3. **Check external references**:
   - Check if exported and used externally
   - Check if used in configuration files

**Why**: Removing used code breaks functionality. Double-check prevents mistakes.

**Example**:

```
Function: oldHelper()
- Searched codebase: No direct imports ✅
- Searched tests: Not used ✅
- Searched docs: Not referenced ✅
- Verified: Safe to remove ✅
```

---

## 3. Check Dependencies

**Purpose**: Understand what depends on code being removed.

**Workflow**:

1. **Check imports**:
   - What files import this?
   - Are those files also unused?

2. **Check exports**:
   - Is this exported from index files?
   - Are exports used elsewhere?

3. **Check dependencies**:
   - Does removing this break other code?
   - Are there circular dependencies?

**Why**: Removing code might break dependencies. Check first.

**Example**:

```
File: src/lib/utils/oldHelper.ts
- Exported from: src/lib/utils/index.ts
- Check: Is index.ts export used? No ✅
- Check: Any files import from index.ts? No ✅
- Safe to remove: Yes ✅
```

---

## 4. Remove Safely (One at a Time)

**Purpose**: Remove dead code without breaking functionality.

**Workflow**:

1. **Remove one item at a time**:
   - Don't remove everything at once
   - Remove → Test → Remove → Test

2. **Start with safest**:
   - Unused imports (safest)
   - Unused files (if no dependencies)
   - Unused functions (check dependencies first)

3. **Test after each removal**:
   - Run tests (if available)
   - Check for TypeScript errors
   - Verify functionality still works

**Why**: Removing multiple things at once makes it hard to identify what broke.

**Example**:

```
Step 1: Remove unused imports from FileA.svelte
→ Test: No errors ✅
Step 2: Remove unused function from FileB.ts
→ Test: No errors ✅
Step 3: Remove unused file oldHelper.ts
→ Test: No errors ✅
```

---

## 5. Verify No Regressions

**Purpose**: Ensure cleanup didn't break anything.

**Workflow**:

1. **Run tests** (if available):
   - Unit tests
   - Integration tests
   - E2E tests

2. **Check TypeScript**:
   - Run `npm run check` or `tsc --noEmit`
   - Fix any type errors

3. **Manual testing** (if needed):
   - Use `/test-manual` command
   - Test affected functionality
   - Verify no broken features

**Why**: Cleanup shouldn't break functionality.

**Example**:

```
After cleanup:
- ✅ TypeScript check passes
- ✅ Tests pass
- ✅ Manual test: Feature still works
- ✅ No regressions
```

---

## 6. Document Cleanup

**Purpose**: Capture what was removed and why.

**Workflow**:

1. **Document in ticket**:
   - What was removed
   - Why it was removed
   - Verification results

2. **Update patterns** (if needed):
   - If cleanup revealed pattern → Use `/save`
   - Document: "Code cleanup pattern: [description]"

3. **Update ticket**:
   - Add comment with cleanup summary
   - Mark as ready for validation

**Why**: Documents decisions, helps with future cleanup.

---

## Complete Workflow Example

### Scenario: Remove Unused Code After Refactoring

**Step 1: Identify**

```
AI: Searches for unused imports
AI: Finds: 5 files with unused useState, useEffect imports
AI: Finds: oldHelper.ts file not imported anywhere
AI: Documents: "Found 5 unused imports + 1 unused file"
```

**Step 2: Verify**

```
AI: Checks if oldHelper.ts is used anywhere
AI: Searches codebase: No imports ✅
AI: Searches tests: Not used ✅
AI: Verified: Safe to remove ✅
```

**Step 3: Check Dependencies**

```
AI: Checks if oldHelper.ts is exported
AI: Checks if exports are used: No ✅
AI: Safe to remove file ✅
```

**Step 4: Remove**

```
AI: Removes unused imports from FileA.svelte
AI: Tests: No errors ✅
AI: Removes unused imports from FileB.svelte
AI: Tests: No errors ✅
AI: Removes oldHelper.ts file
AI: Tests: No errors ✅
```

**Step 5: Verify**

```
AI: Runs TypeScript check: Passes ✅
AI: Runs tests: Pass ✅
AI: Manual test: Feature works ✅
```

**Step 6: Document**

```
AI: Documents cleanup in ticket
AI: "Removed 5 unused imports (Svelte 5 migration) + 1 unused file"
AI: Marks ticket ready for validation
```

---

## ⚠️ Critical Rules

### Verify Before Removing

**ALWAYS verify code is unused**:

- ❌ **WRONG**: Remove code without checking
- ✅ **CORRECT**: Verify unused → Remove → Test

**Why**: Removing used code breaks functionality.

### Remove One at a Time

**Remove incrementally**:

- ❌ **WRONG**: Remove everything at once
- ✅ **CORRECT**: Remove → Test → Remove → Test

**Why**: Makes it easier to identify what broke.

### Check Dependencies

**Understand what depends on code**:

- ❌ **WRONG**: Remove without checking dependencies
- ✅ **CORRECT**: Check dependencies → Remove safely

**Why**: Removing code might break dependencies.

### Test After Removal

**Verify no regressions**:

- ❌ **WRONG**: Remove code, don't test
- ✅ **CORRECT**: Remove → Test → Verify

**Why**: Cleanup shouldn't break functionality.

---

## 📚 Related Documentation

- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Critical rules
- **Save**: `.cursor/commands/save.md` - Pattern creation workflow

---

## 🎯 Key Principles

1. **Identify First** - Find dead code systematically ⭐
2. **Verify Unused** - Double-check before removing
3. **Check Dependencies** - Understand what depends on code
4. **Remove Safely** - One at a time, test after each
5. **Verify No Regressions** - Test functionality after cleanup
6. **Document** - Capture what was removed and why

---

**Last Updated**: 2025-11-20  
**Purpose**: Systematic code cleanup workflow following Brandon's template approach  
**Status**: Active workflow
