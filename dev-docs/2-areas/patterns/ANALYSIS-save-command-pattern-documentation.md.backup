# Analysis: `/save` Command Pattern Documentation

**Date**: 2025-01-27 (Updated: 2025-01-27)  
**Purpose**: Optimize pattern documentation for AI-assisted development in Cursor  
**Primary Consumer**: AI assistants (Opus, Sonnet, GPT, Gemini, Grok) via grep-based retrieval

---

## Executive Summary

**The Core Problem**: Pattern entropy - patterns proliferate without consolidation, creating multiple outdated versions of the same concept. AI retrieves all versions and gets confused about which is correct.

**The Solution**: Enforce strict "merge before add" discipline, aggressive cleanup, and AI-optimized pattern structure.

---

## Problem Analysis

### The Real Issue: Pattern Entropy

**Observed Symptoms**:
1. 7 versions of one pattern exist, 4-5 are outdated
2. AI doesn't know which pattern is current
3. AI applies incorrect/outdated patterns
4. More time spent fixing than building
5. Maintenance burden grows exponentially

**Root Cause**: The current `/save` workflow allows adding new patterns without mandatory deduplication. Over time, similar patterns accumulate:

```
Session 1: "NavItem padding issue" → saves pattern about padding
Session 2: "Sidebar alignment" → saves similar pattern about spacing
Session 3: "Header alignment" → saves yet another spacing pattern
Session 4: "Button in sidebar" → another alignment pattern
...
Result: 7 patterns about "visual alignment" - all slightly different, most outdated
```

**Impact on AI Retrieval**:
```
Developer: "sidebar items aren't aligned"
AI grep: finds 7 patterns matching "sidebar" OR "alignment"
AI confusion: Which one is correct? Applies outdated pattern.
Developer: Wastes 30 min debugging
```

### What Works Today

1. **Domain-based files** (svelte-reactivity.md, ui-patterns.md) - good organization
2. **Line number references** (#L10, #L60) - stable linking
3. **STATUS field** (ACCEPTED/DEPRECATED) - clear lifecycle
4. **Symptom → Fix structure** - actionable format

### What Needs Improvement

| Issue | Impact | Priority |
|-------|--------|----------|
| No mandatory deduplication | Patterns proliferate | 🔴 Critical |
| Outdated patterns not removed | AI applies wrong fixes | 🔴 Critical |
| No keyword aliases | AI misses relevant patterns | 🟡 High |
| Patterns too specific | Limited reusability | 🟢 Medium |

---

## Solution: Strict Pattern Management

### Core Principle: One Canonical Pattern Per Concept

**Never have multiple active patterns for the same underlying concept.**

When a pattern already exists, you MUST:
1. **Enhance** it (add edge case, update example)
2. **Supersede** it (mark old as SUPERSEDED, create improved version)
3. **Delete** it (if truly obsolete)

**Never** create a new pattern if an existing one covers the same concept.

### The "Merge Before Add" Rule

```
┌─────────────────────────────────────────────────────────────┐
│ BEFORE ADDING ANY PATTERN:                                  │
│                                                             │
│ 1. SEARCH: grep for related terms (3+ searches)             │
│ 2. EVALUATE: Do existing patterns cover this concept?       │
│    ├─ YES, but outdated → UPDATE existing pattern          │
│    ├─ YES, covers it → DON'T ADD (maybe enhance)           │
│    ├─ PARTIAL overlap → CONSOLIDATE into one pattern       │
│    └─ NO overlap → ADD new pattern                         │
│ 3. CLEANUP: Mark duplicates as SUPERSEDED or DELETE        │
└─────────────────────────────────────────────────────────────┘
```

### Pattern Consolidation Strategy

**When finding multiple related patterns:**

1. **Identify the canonical pattern** (most complete, most recent)
2. **Merge valuable content** from others into canonical
3. **Mark others as SUPERSEDED** with link to canonical
4. **Consider deletion** if truly redundant (reduces noise)

**Example Consolidation:**

Before:
```markdown
#L100: NavItem Recipe for Custom Buttons [ACCEPTED]
#L150: Sidebar Button Matching [ACCEPTED]  
#L200: Custom Nav Styling [ACCEPTED]
#L250: Match NavItem with CVA [DEPRECATED - but still there]
```

After:
```markdown
#L100: Matching Component Styles with CVA Recipes [ACCEPTED]
  (consolidated from #L100, #L150, #L200)
  (includes examples: NavItem, SidebarButton, Custom triggers)

#L150: [DELETED - merged into #L100]
#L200: [DELETED - merged into #L100]
#L250: [DELETED - was deprecated]
```

---

## AI-Optimized Pattern Format

### Pattern Structure (Version 2)

```markdown
## #L[NUMBER]: Pattern Name [🔴/🟡/🟢 SEVERITY] [STATUS: ACCEPTED]

**Keywords**: keyword1, keyword2, keyword3, keyword4
<!-- AI grep terms - include common variations and related concepts -->

**Principle**: One-line abstract principle (the generalizable lesson)

**Symptom**: What problem triggers this pattern

**Root Cause**: Why the problem occurs

**Pattern**: General solution approach (not element-specific)

**Implementation Examples**:
<!-- Specific contexts where pattern applies - include code -->

### Example 1: [Specific Context A]
```code
// Implementation for context A
```

### Example 2: [Specific Context B]
```code
// Implementation for context B
```

**When to Apply**: 
- General criteria (not element-specific)
- Multiple contexts where pattern is useful

**Anti-Patterns**: 
- What NOT to do (common mistakes)

**Related**: #L[OTHER] (link to related patterns)
```

### Key Changes from Current Format

| Current | New | Why |
|---------|-----|-----|
| No keywords field | **Keywords** field at top | Improves grep discoverability |
| Specific pattern names | **Abstract principle names** | Pattern applies to multiple contexts |
| Single example | **Multiple implementation examples** | Shows how same principle applies differently |
| No anti-patterns | **Anti-Patterns** section | Prevents common mistakes |
| Fix → Apply when | **Principle → Pattern → Examples** | Separates concept from implementation |

### Keywords Field Strategy

The **Keywords** field is critical for AI grep retrieval. Include:

1. **Direct terms**: The obvious search terms
2. **Synonyms**: Alternative words for same concept
3. **Related concepts**: Broader category terms
4. **Common mistakes**: What people search when hitting this issue
5. **Component names**: Specific components this applies to

**Example:**
```markdown
**Keywords**: visual alignment, padding, spacing, consistent styling, 
sidebar alignment, header alignment, NavItem, match styling, CVA recipe,
misaligned, not aligned, looks off, spacing issue, padding mismatch
```

---

## Updated `/save` Workflow

### Mandatory Deduplication Step

Add this **BEFORE** updating patterns:

```
### 2.5. Mandatory Deduplication (DO THIS FIRST)

**🚨 CRITICAL**: Before adding ANY pattern, you MUST search for existing patterns.

**Search Strategy** (use grep, run ALL searches):

1. **Search by symptom**: grep "misaligned" OR "not aligned" in patterns/
2. **Search by concept**: grep "alignment" OR "spacing" in patterns/
3. **Search by component**: grep "NavItem" OR "sidebar" in patterns/
4. **Search INDEX.md**: Look for related entries

**Decision Tree**:

Found existing pattern(s)?
├─ YES, one pattern covers this
│  └─ ENHANCE existing pattern (don't add new)
│
├─ YES, multiple patterns cover similar concept
│  └─ CONSOLIDATE:
│     1. Choose canonical pattern (most complete)
│     2. Merge content from others into canonical
│     3. Mark others as SUPERSEDED or DELETE
│     4. Update INDEX.md
│
├─ YES, but all are outdated
│  └─ UPDATE canonical pattern with current approach
│     (mark outdated versions as SUPERSEDED or DELETE)
│
└─ NO, nothing related found
   └─ ADD new pattern (with Keywords field)

**Consolidation Checklist**:
- [ ] Searched 3+ variations of terms
- [ ] Found ALL related patterns (not just first match)
- [ ] Chose ONE canonical pattern
- [ ] Merged valuable content into canonical
- [ ] Marked/deleted duplicates
- [ ] Updated INDEX.md
```

### Pattern Cleanup During Save

Add this to workflow:

```
### 2.6. Pattern Cleanup (Aggressive)

**While reviewing existing patterns, actively clean up:**

1. **Mark SUPERSEDED**: If pattern is replaced by better version
   - Add: `⚠️ SUPERSEDED: See #LXXX for current approach`
   - Link to replacement pattern

2. **Mark DEPRECATED**: If approach is discouraged but still works
   - Add migration path to current approach

3. **DELETE**: If pattern is:
   - Truly redundant (merged into another)
   - Completely obsolete (doesn't apply anymore)
   - Wrong (anti-pattern that was incorrectly documented)

**Deletion Criteria**:
- Pattern content is 100% covered by another pattern
- Pattern approach no longer works (API changed, etc.)
- Pattern was an anti-pattern (wrong fix)

**When in doubt**: Mark SUPERSEDED rather than delete (preserves history)
```

---

## INDEX.md Optimization

### Add Keyword-Based Lookup

Enhance INDEX.md with keyword search section:

```markdown
## Keyword Quick Reference

| Keywords | Pattern | File |
|----------|---------|------|
| alignment, spacing, padding, misaligned | Component Style Matching | design-system-patterns.md#L100 |
| CVA, recipe, match styling, NavItem | Component Style Matching | design-system-patterns.md#L100 |
| border, harsh, contrast, subtle | Border Contrast | design-system-patterns.md#L60 |
| scroll, bottom, position, viewport | ScrollArea Initial Position | ui-patterns.md#L10 |
| reactivity, props, stale, composable | Composable Reactivity Break | svelte-reactivity.md#L10 |
```

### Canonical Pattern Markers

Mark which pattern is THE source of truth for a concept:

```markdown
## 🔴 Critical (Breaks Functionality)

| Symptom | Pattern | File | Canonical |
|---------|---------|------|-----------|
| Props not updating | Composable Reactivity | svelte-reactivity.md#L10 | ✅ |
| Scroll at bottom | ScrollArea Position | ui-patterns.md#L10 | ✅ |
```

---

## Example: Refactored Pattern

### Before (Current - Too Specific)

```markdown
## #L100: NavItem Recipe for Custom Buttons [🟢 REFERENCE]

**Symptom**: Need a button in sidebar that looks identical to NavItem.
**Root Cause**: NavItem uses `navItemRecipe` from CVA. Custom buttons need same recipe.
**Fix**: [NavItem-specific code]
**Apply when**: Custom action buttons in sidebar
```

### After (Optimized for AI Retrieval)

```markdown
## #L100: Matching Component Styles with CVA Recipes [🟢 REFERENCE] [STATUS: ACCEPTED]

**Keywords**: CVA, recipe, match styling, same style, identical appearance, 
NavItem, sidebar button, custom button, consistent styling, style reuse,
navItemRecipe, buttonRecipe, cardRecipe

**Principle**: When components need identical visual styling, reuse CVA recipes 
instead of duplicating CSS classes.

**Symptom**: Custom component doesn't match existing component's appearance.

**Root Cause**: Each component uses a CVA recipe for styling. Duplicating 
Tailwind classes leads to drift and inconsistency.

**Pattern**: 
1. Identify the recipe used by the reference component
2. Import and apply the same recipe with appropriate props
3. Match prop values to achieve desired visual state

**Implementation Examples**:

### Example 1: Sidebar Button Matching NavItem
```svelte
<script lang="ts">
  import { navItemRecipe } from '$lib/design-system/recipes';
  
  // Match NavItem's default styling
  const buttonClasses = $derived(navItemRecipe({ 
    state: 'default', 
    collapsed: false 
  }));
</script>

<button type="button" class={buttonClasses}>
  <Icon type="delete" size="sm" />
  <Text variant="body" size="sm">Delete</Text>
</button>
```

### Example 2: Custom Card Matching Standard Card
```svelte
<script lang="ts">
  import { cardRecipe } from '$lib/design-system/recipes';
  
  const cardClasses = $derived(cardRecipe({ 
    variant: 'elevated', 
    padding: 'md' 
  }));
</script>

<div class={cardClasses}>Custom content</div>
```

**When to Apply**: 
- Custom component needs to match existing component's styling
- Building variations of existing components
- Maintaining visual consistency across related UI elements

**Anti-Patterns**:
- ❌ Copying Tailwind classes from one component to another
- ❌ Creating new recipes for existing patterns
- ❌ Hardcoding style values that exist in recipes

**Related**: #L60 (Border Contrast), #L150 (Consistent Header Heights)
```

---

## Implementation Checklist

### Phase 1: Fix Current State (One-Time Cleanup)

- [ ] Audit all patterns for duplicates
- [ ] Consolidate related patterns into canonical versions
- [ ] Delete or SUPERSEDE redundant patterns
- [ ] Add Keywords field to all patterns
- [ ] Update INDEX.md with keyword lookup

### Phase 2: Update /save Command

- [ ] Add mandatory deduplication step
- [ ] Add consolidation workflow
- [ ] Add cleanup guidance
- [ ] Update pattern template with Keywords field

### Phase 3: Ongoing Maintenance

- [ ] Every /save enforces deduplication
- [ ] Periodic audit (monthly?) to find drift
- [ ] Track pattern count - should stay stable or decrease

---

## Success Metrics

| Metric | Current State | Target |
|--------|---------------|--------|
| Patterns per concept | 3-7 duplicates | 1 canonical |
| AI finds correct pattern | ~50% | >90% |
| Time to apply pattern | Varies (debugging) | Immediate |
| Pattern maintenance effort | High | Zero (self-maintaining) |

---

## Key Decisions Made

1. **STATUS field is sufficient** - No need for ASSUMPTION/VALIDATED/PROVEN confidence tracking
2. **Hybrid abstraction** - Abstract principles with specific implementation examples
3. **Keywords field** - Critical for grep-based AI retrieval
4. **Aggressive cleanup** - Delete or SUPERSEDE duplicates (don't just mark deprecated)
5. **One canonical pattern** - Never have multiple active patterns for same concept
6. **Merge before add** - Mandatory deduplication before adding any pattern

---

## Conclusion

The pattern documentation system isn't broken because of abstraction level or lifecycle tracking.
It's broken because **patterns proliferate without consolidation**.

**The fix is discipline, not complexity:**

1. **Merge before add** - Always consolidate with existing
2. **One canonical pattern** - Never duplicate concepts  
3. **Aggressive cleanup** - Delete redundant patterns
4. **Keywords for discovery** - Help AI grep find the right pattern

This creates a self-maintaining system where the `/save` command itself enforces pattern hygiene.

---

**Last Updated**: 2025-01-27
