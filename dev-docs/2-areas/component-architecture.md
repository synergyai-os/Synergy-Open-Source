# Component Architecture & Strategy

> **Philosophy**: Build components in layers—from semantic tokens to reusable utilities to documented patterns to composable components. Each layer builds on the previous, creating a consistent, maintainable design system.

> **See Also**: 
> - [Design Principles](design-principles.md) - Visual philosophy and UX principles that guide component design
> - [Design Tokens](design-tokens.md) - System reference for all available tokens

---

## The Four Layers

```
┌─────────────────────────────────────────────────────────────┐
│ COMPONENTS (Organisms)                                       │
│ Example: TableOfContents, InboxCard, Sidebar               │
│ Complex behavior + reusable UI                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ PATTERNS (Molecules)                                         │
│ Example: Scrollable Container, Header Border Alignment      │
│ Documented solutions to common problems                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ UTILITIES (Atoms - Behavioral)                               │
│ Example: .scrollable-outer, .scrollable-inner               │
│ Reusable classes enforcing patterns                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ TOKENS (Atoms - Values)                                      │
│ Example: --spacing-control-panel-padding: 12px              │
│ Semantic values (spacing, colors, typography)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Design Tokens

**What**: Semantic CSS variables for spacing, colors, typography  
**Where**: `src/app.css` (`@theme` block)  
**When**: ALWAYS (never hardcode values)

### Example

```css
/* In src/app.css */
@theme {
  --spacing-control-panel-padding: 0.75rem; /* 12px */
  --color-text-primary: oklch(20.8% 0.042 265.755);
}
```

### Usage

```svelte
<div style="padding: var(--spacing-control-panel-padding);">
  <!-- content -->
</div>
```

**See**: [Design Tokens Reference](design-tokens.md)

---

## Layer 2: Utility Classes

**What**: Reusable CSS classes that enforce patterns  
**Where**: `src/app.css` (`@utility` directive)  
**When**: Pattern repeats 3+ times, needs foolproof enforcement

### Example

```css
/* In src/app.css */
@utility scrollable-outer {
  padding: var(--spacing-control-panel-padding);
  /* NO overflow, NO max-height - let inner handle scroll */
}

@utility scrollable-inner {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 0.25rem;
  /* Scrollbar renders HERE - inside padding boundary */
}
```

### Usage

```svelte
<aside class="toc-panel scrollable-outer">
  <nav class="toc">
    <ul class="toc-list scrollable-inner">
      <!-- items -->
    </ul>
  </nav>
</aside>
```

**Why Utilities?**
- ✅ Self-documenting (class names explain behavior)
- ✅ Pattern enforcement (can't get it wrong)
- ✅ Consistency (same problem, same solution)
- ✅ Reusable (works in ANY component)

**When to Create a Utility:**
1. Pattern repeats 3+ times
2. Bug-prone if done manually (e.g., double overflow)
3. Clear, single responsibility
4. Not component-specific

**See**: [Design Tokens > Scrollable Container Pattern](design-tokens.md#scrollable-container-pattern)

---

## Layer 3: Patterns

**What**: Documented solutions to common problems  
**Where**: `dev-docs/2-areas/design-tokens.md` or `patterns/ui-patterns.md`  
**When**: Problem solved once, needs to be applied consistently

### Example: Scrollable Container Pattern

**Problem**: Nested overflow containers cause scrollbar misalignment  
**Solution**: Padding on outer, overflow on inner

```svelte
<!-- Outer container: padding, NO overflow -->
<div class="panel scrollable-outer">
  <!-- Inner list: overflow ONLY here -->
  <ul class="list scrollable-inner">
    <!-- items -->
  </ul>
</div>
```

**Pattern Components:**
- Rule: Never nest `overflow-y: auto` containers
- Rule: Padding belongs on outer, overflow on inner
- Utilities: `.scrollable-outer`, `.scrollable-inner`
- Example: TableOfContents.svelte

**When to Document a Pattern:**
1. Solved a bug or design problem
2. Solution is non-obvious
3. Applies to multiple components
4. Prevents future mistakes

**See**: [UI Patterns Index](patterns/INDEX.md)

---

## Layer 4: Components

**What**: Composable UI building blocks with behavior  
**Where**: `src/lib/components/`  
**When**: Complex behavior + reusable UI

### Component Types

#### 1. **Atomic Components** (Single responsibility)
- `Button`, `Input`, `Badge`, `Icon`
- No internal state, pure presentation
- Use tokens/utilities directly

#### 2. **Feature Components** (Domain-specific)
- `InboxCard`, `FlashcardView`, `NoteEditor`
- Domain logic + composed atoms
- Use composables for state

#### 3. **Layout Components** (Structure)
- `Sidebar`, `DocLayout`, `TableOfContents`
- Composition patterns + layout logic
- Use patterns (e.g., scrollable containers)

### Component Checklist

**Before creating a component:**
- [ ] Can I use existing utilities instead?
- [ ] Does a pattern already exist?
- [ ] Is this truly reusable, or one-off?
- [ ] Does it have a single, clear responsibility?

**When creating a component:**
- [ ] Use design tokens (never hardcode)
- [ ] Use utility classes (don't reinvent patterns)
- [ ] Follow documented patterns
- [ ] Extract state to composables (`.svelte.ts`)
- [ ] Add TypeScript types

**See**: [Component Library](component-library/README.md) *(coming soon)*

---

## Decision Framework

### When to Use What

| Scenario | Solution | Example |
|----------|----------|---------|
| Need spacing value | **Token** | `var(--spacing-control-panel-padding)` |
| Need to prevent double overflow | **Utility** | `.scrollable-outer` + `.scrollable-inner` |
| Need to solve a common problem | **Pattern** | Scrollable Container Pattern |
| Need complex behavior + UI | **Component** | `TableOfContents.svelte` |

### Red Flags

**❌ Don't do this:**
- Hardcode values (`px-2`, `bg-gray-900`, `12px`)
- Create utilities for one-off cases
- Skip documenting patterns after solving bugs
- Build components without checking existing utilities

**✅ Do this:**
- Use semantic tokens (`px-nav-item`, `bg-elevated`)
- Create utilities for repeating patterns (3+ uses)
- Document patterns immediately after solving
- Compose utilities → patterns → components

---

## Atomic Design Mapping

Our architecture maps cleanly to Atomic Design:

| Atomic Design | Our Layer | Example |
|---------------|-----------|---------|
| **Atoms** | Tokens + Utilities | `--spacing-control-panel-padding`, `.scrollable-outer` |
| **Molecules** | Patterns | Scrollable Container, Header Border |
| **Organisms** | Components | `TableOfContents`, `InboxCard` |
| **Templates** | Page Layouts | `DocLayout`, Three-Column Layout |
| **Pages** | Routes | `/inbox/+page.svelte` |

**Key Difference**: We separate *values* (tokens) from *behavior* (utilities) at the atom level.

---

## Real-World Example: Scrollable Container

### Problem (Before)
TOC scrollbar appeared at far right edge (outside padding), wasting space.

### Root Cause
Double-nested `overflow-y: auto` (both panel AND list had overflow).

### Solution (4 Layers)

**1. Token** (semantic value):
```css
--spacing-control-panel-padding: 0.75rem; /* 12px */
```

**2. Utilities** (pattern enforcement):
```css
@utility scrollable-outer {
  padding: var(--spacing-control-panel-padding);
}

@utility scrollable-inner {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}
```

**3. Pattern** (documented solution):
- Rule: Padding on outer, overflow on inner
- Rule: Never nest `overflow-y: auto`
- Doc: `design-tokens.md` > Scrollable Container Pattern

**4. Component** (implementation):
```svelte
<aside class="toc-panel scrollable-outer">
  <ul class="toc-list scrollable-inner">
    <!-- items -->
  </ul>
</aside>
```

**Result**: Scrollbar positioned correctly, pattern reusable everywhere.

---

## Maintenance

### When to Update

**Tokens** → When design system changes (colors, spacing scale)  
**Utilities** → When pattern becomes bug-prone (3+ manual implementations)  
**Patterns** → When solving new problems or fixing bugs  
**Components** → When adding features or refactoring

### Deprecation

**Tokens**: Deprecate with warning comment, update docs  
**Utilities**: Add `/* @deprecated */`, provide migration path  
**Patterns**: Mark as "Superseded by X", keep for reference  
**Components**: Add deprecation notice, suggest alternative

### Review Cadence

- **Weekly**: New patterns from bugs/solutions
- **Monthly**: Utility usage (are they actually used?)
- **Quarterly**: Token audit (consolidate, remove unused)

---

## Anti-Patterns

### ❌ Don't

1. **Skip layers** - Don't jump straight to components without checking utilities
2. **Hardcode values** - Always use tokens
3. **Create utilities for everything** - Only for repeating patterns (3+ uses)
4. **Ignore documented patterns** - Check `patterns/INDEX.md` first
5. **Build components in isolation** - Compose utilities + patterns

### ✅ Do

1. **Start at bottom** - Token → Utility → Pattern → Component
2. **Document as you go** - Capture patterns when solving bugs
3. **Reuse over reinvent** - Check existing layers first
4. **Keep layers focused** - Single responsibility at each level
5. **Link documentation** - Cross-reference between layers

---

## Quick Reference

### Creating New Layers

| Layer | File | Syntax | When |
|-------|------|--------|------|
| Token | `src/app.css` | `@theme { --name: value; }` | Design system change |
| Utility | `src/app.css` | `@utility name { ... }` | Pattern repeats 3+ times |
| Pattern | `dev-docs/2-areas/` | Markdown doc | Bug fixed, solution reusable |
| Component | `src/lib/components/` | `.svelte` file | Complex behavior needed |

### Finding Existing Layers

1. **Tokens** → [design-tokens.md](design-tokens.md)
2. **Utilities** → Search `src/app.css` for `@utility`
3. **Patterns** → [patterns/INDEX.md](patterns/INDEX.md)
4. **Components** → Browse `src/lib/components/`

---

## Related

- **[Design Principles](design-principles.md)** - Visual philosophy and UX principles ⭐
- **[Design Tokens](design-tokens.md)** - All available tokens
- **[UI Patterns](patterns/ui-patterns.md)** - Solved design problems
- **[Pattern Index](patterns/INDEX.md)** - Quick symptom → solution lookup
- **[Component Library](component-library/README.md)** - Component catalog *(coming soon)*
- **[Composables Analysis](composables-analysis.md)** - State management patterns

---

**Last Updated**: November 8, 2025  
**Status**: 🟢 Active  
**Owner**: Randy (Founder)

