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

Use **Conventional Commits** format with context and learning journey.

#### Format

```
type(scope): imperative subject line under 50 chars

WHY: What problem this solved or what you were trying to achieve.

JOURNEY (if applicable):
- First approach: [what didn't work]
- Why it failed: [the learning moment]  
- Final solution: [what actually worked]

PATTERN:
- Added/Updated: "Pattern Name" (#L[NUMBER])
- Documented in: dev-docs/patterns/[domain].md
- Severity: [🔴/🟡/🟢]

AI: [Optional - if Claude/Cursor suggested something worth noting]

Closes #[issue-number] (if applicable)
```

#### Type & Scope

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix  
- `docs:` - Documentation/patterns only
- `refactor:` - Code improvement
- `style:` - Design tokens, UI polish
- `test:` - Test additions
- `chore:` - Maintenance

**Scopes:**
- `inbox`, `notes`, `flashcards`, `sync`, `auth`, `ui`, `composables`, `docs`

#### Examples

**Pattern addition:**
```
docs(patterns): add Svelte 5 composables pattern after learning it the hard way

WHY: Tried multiple approaches before finding what actually works with Svelte 5 reactivity.

JOURNEY:
- First approach: Multiple $state variables
- Why it failed: Caused reactivity issues and component updates failed
- Final solution: Single $state object with getters (cleaner + works)

PATTERN:
- Added: "Single $state Object Pattern" (#L780)
- Documented in: dev-docs/patterns/svelte-reactivity.md
- Severity: 🔴 (Critical - common gotcha)
- Updated INDEX.md with new symptom entry

AI: Claude suggested the getter pattern after seeing our reactivity issues.
```

**Bug fix with pattern:**
```
fix(notes): clear note detail state on switch to prevent stale data

WHY: Switching between notes showed old content briefly before updating.
NoteDetail component wasn't clearing state on note ID change.

JOURNEY:
- First approach: Tried forcing re-render with key prop
- Why it failed: Still had race condition with async data load
- Final solution: Added explicit clear() call on note switch

PATTERN:
- Updated: "Component State Management" (#L450)  
- Added edge case: clear() on reactive param change
- Documented in: dev-docs/patterns/svelte-reactivity.md
- Severity: 🟡 (Important - affects UX)

Caught while testing the Linear-style modal redesign.
```

**Feature with learning:**
```
feat(inbox): add J/K keyboard navigation

WHY: Users expect Gmail-style navigation. Makes inbox way faster to process.

JOURNEY:
- First approach: Event listeners on component mount
- Why it failed: Conflicts with input focus and modal shortcuts  
- Final solution: useKeyboardNavigation composable with context awareness

PATTERN:
- Added: "Context-Aware Keyboard Shortcuts" (#L320)
- Documented in: dev-docs/patterns/ui-patterns.md
- Severity: 🟢 (Reference - best practice)

AI: Claude suggested edge case handling for bottom of list (wraps to top now).

Closes #67
```

#### Anti-Patterns

- ❌ `[UI] Fixed stuff` - Not specific, missing context
- ❌ `Fixed bug` - Which bug? Why did it happen?
- ❌ `Updated files` - What changed and why?
- ❌ `WIP` - Don't commit work-in-progress to main
- ❌ Missing pattern reference when you just updated docs

**Do NOT push** - local commit only (user confirms before push).

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

**Before Committing:**
- [ ] Searched INDEX.md for existing patterns
- [ ] Decided: update existing or create new
- [ ] Updated domain file with pattern/enhancement
- [ ] Validated with Context7 (if library-specific)
- [ ] Updated INDEX.md symptom table
- [ ] Chose correct severity (🔴🟡🟢)

**Commit Message:**
- [ ] Used conventional commit format: `type(scope): subject`
- [ ] Explained WHY (problem solved, goal achieved)
- [ ] Included JOURNEY if this was iteration 2+ (what failed, why, final solution)
- [ ] Referenced pattern with line number and severity
- [ ] Credited AI collaboration if applicable
- [ ] Subject line under 50 chars, imperative mood
- [ ] Added issue reference if applicable (Closes #123)
- [ ] Local commit only (NOT pushed)

---

## Anti-Patterns

- ❌ Don't duplicate patterns - search first
- ❌ Don't change line numbers - keep them stable
- ❌ Don't skip Context7 validation for library patterns
- ❌ Don't commit before capturing knowledge
- ❌ Don't add to Critical unless it breaks functionality
