# Design System Validation Fixes

**Goal**: Fix validator false positives and document correct patterns - NOT fix all 1,636 hardcoded classes.

**Date**: 2025-11-29

**Estimated Time**: ~1 hour total

**Executor**: Composer 1

---

## 🎯 Philosophy

> "Test first, comply second" - App is in development, prototyping should be fast.

The 1,636 hardcoded classes are **pre-existing tech debt**, not regressions. The cascade works. This plan fixes the validation tooling, not the entire codebase.

---

## 📋 Task Checklist

### Task 1: Fix Validator False Positives (~30 min)

**Problem**: The validator flags valid design system utilities as hardcoded Tailwind.

**File**: `scripts/validate-design-tokens.js`

**False Positives to Whitelist**:

| Pattern                                                             | Count | Why It's Valid                                             |
| ------------------------------------------------------------------- | ----- | ---------------------------------------------------------- |
| `text-sm`, `text-xs`, `text-base`, `text-lg`, `text-xl`, `text-2xl` | 152+  | Generated typography utilities from `typography-utils.css` |
| `font-normal`, `font-medium`, `font-semibold`, `font-bold`          | 120+  | Standard font weights - layout primitives                  |
| `disabled:opacity-50`, `opacity-75`, `opacity-25`                   | 65+   | Acceptable opacity values                                  |
| `rounded-full`                                                      | 19    | Exception for avatar circles (SYOS-585)                    |

**Implementation Steps**:

1. Read `scripts/validate-design-tokens.js`
2. Find the regex patterns that flag these utilities
3. Add these patterns to the allowlist:

   ```javascript
   // Typography utilities (generated from design tokens)
   /\btext-(2xs|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/,

   // Font weight primitives
   /\bfont-(thin|light|normal|medium|semibold|bold|extrabold|black)\b/,

   // Opacity values
   /\b(disabled:)?opacity-\d+\b/,

   // Avatar circle exception
   /\brounded-full\b/,
   ```

4. Run `npm run validate:design-system` to verify reduced false positives
5. Document changes inline with comments

**Expected Result**: Validation count drops significantly (likely <500 real issues)

---

### Task 2: Document Z-Index Pattern (~10 min)

**Problem**: 53 z-index violations (`z-50`, `z-10`) flagged but no semantic utilities exist.

**Decision**: Z-index is a **layout/layering concern**, not a design token. Use CSS variables directly.

**Files to Update**:

1. **`ai-docs/tasks/missing-styles.md`** - Add to "Acceptable Exceptions" section:

```markdown
### Z-Index Values (`z-10`, `z-20`, `z-40`, `z-50`, etc.)

- **Location**: Throughout codebase (Dialog, Dropdown, Tooltip components)
- **Usage**: Layout/layering concerns, not design tokens
- **Status**: **ACCEPTABLE EXCEPTION** - Use CSS variables or Tailwind z-index directly
- **Pattern**: Z-index tokens exist in `design-tokens-base.json`:
  - `--zIndex-dropdown` (10)
  - `--zIndex-sticky` (20)
  - `--zIndex-modal` (40)
  - `--zIndex-tooltip` (50)
- **Usage Options**:
  1. Use Tailwind: `z-10`, `z-20`, `z-40`, `z-50` (acceptable for layering)
  2. Use CSS variables: `style="z-index: var(--zIndex-modal);"`
- **Note**: Z-index is structural, not stylistic. Not part of design token cascade.
```

2. **`dev-docs/master-docs/design-system.md`** - Add brief note in Section 10 (Common Mistakes):

````markdown
### 10.5 Z-Index Values

Z-index utilities (`z-10`, `z-50`) are **acceptable** - they're layout/layering concerns, not design tokens.

```svelte
<!-- ✅ ACCEPTABLE: Z-index for layering -->
<div class="z-50">Modal content</div>

<!-- ✅ ALSO ACCEPTABLE: CSS variable -->
<div style="z-index: var(--zIndex-modal);">Modal content</div>
```
````

````

---

### Task 3: Update Validator to Allow Z-Index (~5 min)

**File**: `scripts/validate-design-tokens.js`

**Add to allowlist**:
```javascript
// Z-index (layout/layering, not design tokens)
/\bz-\d+\b/,
````

---

### Task 4: Verify Cascade Integrity (~5 min)

**Run validation checks**:

```bash
# Build tokens
npm run tokens:build

# Validate (should show significantly fewer errors)
npm run validate:design-system

# Check cascade works
grep -E "^@utility" src/styles/utilities/*.css | wc -l
# Should be ~266 utilities
```

**Expected Final State**:

- Validator shows <500 real hardcoded classes (down from 1,636)
- Typography utilities (`text-sm`, etc.) NOT flagged
- Z-index values NOT flagged
- Font weights NOT flagged

---

## 📚 Reference Documentation

### Context7 Libraries (Use for implementation details)

| Library         | Context7 ID             | When to Use               |
| --------------- | ----------------------- | ------------------------- |
| SvelteKit       | `/sveltejs/kit`         | SvelteKit patterns        |
| Tailwind CSS v4 | `/websites/tailwindcss` | Tailwind utility patterns |
| CVA             | `/joe-bell/cva`         | Recipe system patterns    |

### Project Files

| File                                    | Purpose                               |
| --------------------------------------- | ------------------------------------- |
| `scripts/validate-design-tokens.js`     | **PRIMARY TARGET** - validation logic |
| `ai-docs/tasks/missing-styles.md`       | Document patterns and exceptions      |
| `dev-docs/master-docs/design-system.md` | Design system source of truth         |
| `src/styles/utilities/*.css`            | Generated utility classes             |

---

## 🚫 Out of Scope

**DO NOT** fix any of these in this task:

1. ❌ All 1,636 hardcoded classes (tech debt - separate ticket)
2. ❌ Component color utilities (`bg-component-*`) - CSS variable pattern is correct
3. ❌ Missing semantic tokens from `missing-styles.md` - lower priority follow-up
4. ❌ Recipe refactoring - already completed in compactness v2

---

## ✅ Success Criteria

After completing this plan:

1. `npm run validate:design-system` shows < 500 errors (down from 1,636)
2. Typography utilities (`text-sm`, `text-xs`, `text-base`, etc.) NOT flagged
3. Z-index values (`z-10`, `z-50`) NOT flagged as violations
4. Font weights (`font-normal`, `font-medium`) NOT flagged
5. Documentation updated to clarify acceptable patterns
6. Cascade still works: changing `design-tokens-base.json` → rebuild → UI updates

---

## 📝 Post-Completion

After this task is complete:

1. Run full validation: `npm run validate:design-system`
2. Commit changes with message: `fix(design-system): reduce validator false positives`
3. Create Linear ticket for remaining tech debt cleanup (optional future work)

---

**Last Updated**: 2025-11-29
