# save

**Purpose**: Capture knowledge and commit work.

---

## For AI Assistants

**Tool usage strategy:**
1. **Batch parallel operations** - Read multiple files simultaneously when independent
2. **Use grep first** - Search patterns before reading full files
3. **Stage all files once** - Single `git add` for all changed files
4. **Commit with multi-line message** - Use `-m` multiple times for body paragraphs
5. **Ask before pushing** - Always prompt "Push to GitHub? (Y/N)" after commit

**Key workflow:**
- Step 2: Use `grep` to search INDEX.md and domain files in parallel
- Step 3: Use `search_replace` or `write` for updates
- Step 4: Stage → commit → show `git log -1 --stat` for confirmation
- Step 5: Prompt user, then push if Y

---

## Workflow

### 1. Analyze Session - Frame as User Story

**Think outcome-driven, not output-driven:**

- **WHO** benefits from this change? (user, developer, contributor, AI assistant)
- **WHAT VALUE** was delivered? (faster workflow, less errors, better UX)
- **WHAT SLICE** was completed? (thin, end-to-end functionality that provides value)

**User Story Format:**
```
As a [user type]
I can now [capability]
So that [outcome/value]
```

**Vertical Slice Thinking:**
- What end-to-end flow works now that didn't before?
- What pain point was removed?
- What new capability can users access?

**Pattern Learning:**
- What patterns emerged while building this slice?
- What mistakes were avoided (or made and fixed)?

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

Use **Conventional Commits** format with **user story** and **outcome focus**.

#### Format

```
type(scope): [what users can now do]

USER STORY:
As a [user type]
I can now [capability]
So that [outcome/value delivered]

SLICE COMPLETED:
[Describe the thin, end-to-end functionality that now works]

JOURNEY (if applicable):
- First approach: [what didn't work]
- Why it failed: [the learning moment]  
- Final solution: [what actually worked]

PATTERN (if applicable):
- Added/Updated: "Pattern Name" (#L[NUMBER])
- Documented in: dev-docs/patterns/[domain].md
- Severity: [🔴/🟡/🟢]

AI: [Optional - if Claude/Cursor suggested something worth noting]

Closes #[issue-number] (if applicable)
```

**📖 Teaching Note - User Stories:**
User stories follow the format "As a [who], I want [what], so that [why]". The "so that" is critical - it explains the **outcome/value**, not just the feature. This keeps us focused on user value over outputs.

**📖 Teaching Note - Vertical Slicing:**
A vertical slice is a thin, end-to-end piece of functionality that delivers value. Instead of building an entire layer (all UI, then all backend), you build one complete flow (e.g., "user can create a note") from UI to database. Each slice ships value.

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

**Pattern addition (outcome-focused):**
```
docs(patterns): developers can now avoid Svelte 5 reactivity gotchas

USER STORY:
As a developer new to Svelte 5
I can now use the correct $state pattern
So that my components update reactively without mysterious bugs

SLICE COMPLETED:
Documented the single $state object pattern after hitting (and fixing)
reactivity issues. Developers can now reference this pattern when
building composables, avoiding hours of debugging.

JOURNEY:
- First approach: Multiple $state variables
- Why it failed: Svelte 5 lost track of updates across variables
- Final solution: Single $state object with getters (works reliably)

PATTERN:
- Added: "Single $state Object Pattern" (#L780)
- Documented in: dev-docs/patterns/svelte-reactivity.md
- Severity: 🔴 (Critical - common gotcha that blocks work)
- Updated INDEX.md symptom table

AI: Claude suggested the getter pattern and caught edge cases.
```

**📖 What makes this outcome-driven:**
- Subject line: "developers can now avoid..." (capability unlocked)
- User story: Clear who, what, why
- Slice: End-to-end value delivered (pattern documented → developers unblocked)

**Bug fix (outcome-focused):**
```
fix(notes): users see correct note immediately when switching

USER STORY:
As a user browsing my notes
I can now switch between notes and see the correct content immediately
So that I don't get confused by stale data appearing briefly

SLICE COMPLETED:
Note switching now clears previous state before loading new content.
The jarring flash of old content is gone. Users experience smooth,
instant transitions between notes.

JOURNEY:
- First approach: Tried forcing re-render with key prop
- Why it failed: Race condition with async data still showed stale content
- Final solution: Explicit clear() call on note switch (predictable timing)

PATTERN:
- Updated: "Component State Management" (#L450)  
- Added edge case: clear() on reactive param change
- Documented in: dev-docs/patterns/svelte-reactivity.md
- Severity: 🟡 (Important - affects UX quality)

Caught while testing the Linear-style modal redesign.
```

**📖 What makes this outcome-driven:**
- Subject line: "users see correct note immediately" (outcome, not "fixed state bug")
- User story: Clear pain point removed (confusion from stale data)
- Slice: End-to-end fix (switching → clear state → load new → display)

**Feature (outcome-focused):**
```
feat(inbox): power users can now process inbox 10x faster with keyboard

USER STORY:
As a power user processing dozens of inbox items daily
I can now navigate with J/K shortcuts (like Gmail, Linear)
So that I can quickly scan and process items without touching the mouse

SLICE COMPLETED:
Full keyboard navigation flow: J moves down, K moves up, automatically
handles edge cases (wraps at bottom/top), respects input focus context
(doesn't interfere when typing). Power users can now fly through inbox.

JOURNEY:
- First approach: Simple event listeners on component mount
- Why it failed: Fired even when typing in inputs, broke modals
- Final solution: Context-aware composable that checks focus state

PATTERN:
- Added: "Context-Aware Keyboard Shortcuts" (#L320)
- Documented in: dev-docs/patterns/ui-patterns.md
- Severity: 🟢 (Reference - best practice for keyboard UX)

AI: Claude suggested wrapping at list boundaries (top/bottom) instead
of stopping. Much better UX - users expect circular navigation.

Closes #67
```

**📖 What makes this outcome-driven:**
- Subject line: "power users can now process 10x faster" (measurable outcome)
- User story: Specific user type (power user), specific value (speed)
- Slice: Complete flow (up/down, edges, context) not just "added feature"

#### Anti-Patterns

**Technical-focused (not outcome-focused):**
- ❌ `fix(notes): clear state on switch` → ✅ `fix(notes): users see correct note immediately`
- ❌ `feat: added keyboard shortcuts` → ✅ `feat: power users process inbox 10x faster`
- ❌ `docs: updated patterns` → ✅ `docs: developers avoid Svelte 5 gotchas`

**Missing context:**
- ❌ `Fixed bug` - Which bug? What value did fixing it provide?
- ❌ `Updated files` - What capability did this enable?
- ❌ `WIP` - Don't commit work-in-progress to main
- ❌ Missing USER STORY when change impacts users
- ❌ Missing SLICE explanation (what end-to-end flow now works?)

**📖 Teaching Note:**
Output-driven thinking: "We shipped keyboard shortcuts"
Outcome-driven thinking: "Power users now process inbox 10x faster"

The outcome is what matters. Always ask: "What can users now do? What value was delivered?"

**Do NOT push yet** - proceed to step 5.

### 5. Push to GitHub

After successful commit, ask user:

**"Push to GitHub? (Y/N)"**

- **Y** → Run `git push` with network permissions
- **N** → Done. Commit stays local.

Keep response concise. Show push result or "Staying local" confirmation.

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
- [ ] Searched INDEX.md for existing patterns (grep tool)
- [ ] Decided: update existing or create new
- [ ] Updated domain file with pattern/enhancement (search_replace)
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

**After Commit:**
- [ ] Showed commit with `git log -1 --stat`
- [ ] Asked user: "Push to GitHub? (Y/N)"
- [ ] Executed user's choice (push or stay local)

---

## Anti-Patterns

- ❌ Don't duplicate patterns - search first
- ❌ Don't change line numbers - keep them stable
- ❌ Don't skip Context7 validation for library patterns
- ❌ Don't commit before capturing knowledge
- ❌ Don't add to Critical unless it breaks functionality
- ❌ Don't push without asking user first
- ❌ Don't use multiple git add commands - batch all files

---

## Quick AI Workflow

```
1. Analyze → Frame as user story
   - WHO benefits? WHAT VALUE delivered? WHAT SLICE completed?
   
2. grep INDEX.md → Check existing patterns

3. Update patterns → search_replace domain files + INDEX.md

4. Commit with outcome focus:
   Subject: "[what users can now do]"
   Body: USER STORY + SLICE + JOURNEY + PATTERN
   
5. Ask: "Push to GitHub? (Y/N)"
   → Y: git push (requires ['all'] permissions)
   → N: "✅ Committed locally. Not pushed."
```

**Commit message checklist:**
- [ ] Subject describes outcome, not output
- [ ] USER STORY answers: who, what capability, what value
- [ ] SLICE explains what end-to-end flow now works
- [ ] JOURNEY shows learning (if iteration 2+)
- [ ] PATTERN referenced (if applicable)

**End message format:**
- If pushed: "✅ Pushed to GitHub. [short status]"
- If not pushed: "✅ Committed locally. Not pushed."

Keep it short. User wants concise confirmations.
