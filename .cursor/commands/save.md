# save

**Purpose**: Capture knowledge and commit work.

---

## Workflow

### 1. Analyze Session
- What issues were fixed?
- What patterns emerged?
- What mistakes were avoided?

### 2. Audit Existing Patterns

**Search `dev-docs/patterns/INDEX.md`**:
1. Scan symptom tables for matches
2. Grep domain files for keywords
3. Check Related links in found patterns

**Decision**:
- **Exact match exists**: Update existing pattern (add edge case, enhance example)
- **Similar exists**: Add new pattern + link to related
- **Nothing found**: Create new pattern

### 3. Update Patterns ⭐ DO THIS FIRST

#### If Updating Existing Pattern:

1. Open domain file (svelte-reactivity.md, etc.)
2. Find pattern by line number (#L10, #L50, etc.)
3. Enhance:
   - Add edge case to Root Cause
   - Add example to Fix section
   - Update Related links
4. **Don't change line numbers** (keep L10, L50 stable)

#### If Adding New Pattern:

1. Choose domain file:
   - Svelte 5 reactivity → `svelte-reactivity.md`
   - Convex integration → `convex-integration.md`
   - UI/UX → `ui-patterns.md`
   - PostHog → `analytics.md`

2. Add pattern with **next line number** (gaps of 30-50):
   ```markdown
   ## #L[NUMBER]: Pattern Name [🔴/🟡/🟢 SEVERITY]

   **Symptom**: One-line description
   **Root Cause**: One-line cause
   **Fix**: 

   ```[language]
   // ❌ WRONG
   wrong code

   // ✅ CORRECT
   correct code
   ```

   **Apply when**: When to use
   **Related**: #L[OTHER] (Description)
   ```

3. **Validate with Context7** (if library-specific):
   - Svelte 5: `/sveltejs/svelte`
   - Convex: `/get-convex/convex-backend`

4. **Update INDEX.md**:
   - Add symptom → line number in appropriate severity table
   - Choose severity: 🔴 Critical (breaks functionality), 🟡 Important (common issue), 🟢 Reference (best practice)

### 4. Commit

```
[Area] Brief description

- What changed
- Why it changed
- Pattern: Added/Updated "Pattern Name" (#L[NUMBER])
```

**Do NOT push** - local commit only.

---

## Pattern Severity Guide

- **🔴 CRITICAL**: Causes errors, blocks work, breaks functionality
  - Example: State not updating, undefined Convex errors
  
- **🟡 IMPORTANT**: Common issues, significant UX impact
  - Example: Dropdowns broken, sessions expire, analytics missing
  
- **🟢 REFERENCE**: Best practices, optimizations, nice-to-have
  - Example: Card spacing, naming conventions, type patterns

---

## Checklist

- [ ] Searched INDEX.md for existing patterns
- [ ] Decided: update existing or create new
- [ ] Updated domain file with pattern/enhancement
- [ ] Validated with Context7 (if library-specific)
- [ ] Updated INDEX.md symptom table
- [ ] Chose correct severity (🔴🟡🟢)
- [ ] Committed with pattern reference

---

## Anti-Patterns

- ❌ Don't duplicate patterns - search first
- ❌ Don't change line numbers - keep them stable
- ❌ Don't skip Context7 validation for library patterns
- ❌ Don't commit before capturing knowledge
- ❌ Don't add to Critical unless it breaks functionality
