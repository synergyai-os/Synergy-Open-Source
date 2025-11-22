# Atomic Design + Svelte Components

**Status**: 🟢 Active  
**Last Updated**: 2025-01-XX

---

## Overview

SynergyOS uses **Atomic Design** principles with Svelte components, organized in four layers: **Tokens → Utilities → Patterns → Components**. This creates a maintainable, scalable design system where each layer builds on the previous.

**See Also**:
- [Component Architecture](../design/component-architecture.md) - Complete design system guide
- [Design Tokens](../design/design-tokens.md) - All available tokens
- [Pattern Index](../patterns/INDEX.md) - Solved design problems

---

## Atomic Design Mapping

### Visual Hierarchy

```mermaid
graph TD
    subgraph "ATOMS - Foundation"
        Tokens[Design Tokens<br/>Semantic CSS Variables<br/>src/app.css @theme]
        Utilities[Utility Classes<br/>Pattern Enforcement<br/>src/app.css @utility]
    end
    
    subgraph "MOLECULES - Patterns"
        Patterns[Documented Patterns<br/>Solved Problems<br/>dev-docs/2-areas/patterns/]
    end
    
    subgraph "ORGANISMS - Components"
        Atomic[Atomic Components<br/>Single Responsibility<br/>src/lib/components/atoms/]
        Feature[Feature Components<br/>Domain Logic<br/>src/lib/modules/inbox/components/]
        Layout[Layout Components<br/>Structure<br/>src/lib/modules/core/components/]
    end
    
    subgraph "TEMPLATES - Page Layouts"
        PageLayouts[Layout Components<br/>+layout.svelte<br/>src/routes/]
    end
    
    subgraph "PAGES - Routes"
        Routes[Page Components<br/>+page.svelte<br/>src/routes/]
    end
    
    Tokens --> Utilities
    Utilities --> Patterns
    Patterns --> Atomic
    Patterns --> Feature
    Patterns --> Layout
    Atomic --> PageLayouts
    Feature --> PageLayouts
    Layout --> PageLayouts
    PageLayouts --> Routes
    
    style Tokens fill:#e1f5ff
    style Utilities fill:#e1f5ff
    style Patterns fill:#fff4e1
    style Atomic fill:#e8f5e9
    style Feature fill:#e8f5e9
    style Layout fill:#e8f5e9
    style PageLayouts fill:#f3e5f5
    style Routes fill:#fce4ec
```

### Layer Mapping Table

| Atomic Design | Our Layer | Location | Example | When to Use |
|--------------|-----------|----------|---------|-------------|
| **Atoms** | Tokens | `src/app.css` `@theme` | `--spacing-nav-item` | Design system values |
| **Atoms** | Utilities | `src/app.css` `@utility` | `.scrollable-outer` | Pattern repeats 3+ times |
| **Molecules** | Patterns | `dev-docs/2-areas/patterns/` | Scrollable Container | Problem solved, reusable |
| **Organisms** | Atomic Components | `src/lib/components/atoms/` | `Button`, `Badge`, `Icon` | Single responsibility |
| **Organisms** | Atomic Components | `src/lib/components/molecules/` | `DatePicker`, `Combobox` | Composed atoms |
| **Organisms** | Atomic Components | `src/lib/components/organisms/` | `Dialog`, `Calendar` | Complex interactions |
| **Organisms** | Feature Components | `src/lib/modules/inbox/components/` | `InboxCard` | Domain-specific logic |
| **Organisms** | Layout Components | `src/lib/modules/core/components/` | `Sidebar`, `AppTopBar` | Structure and composition |
| **Templates** | Page Layouts | `src/routes/` `+layout.svelte` | `DocLayout` wrapper | Page structure |
| **Pages** | Routes | `src/routes/` `+page.svelte` | `/inbox`, `/meetings` | Complete pages |

**Key Difference**: We separate _values_ (tokens) from _behavior_ (utilities) at the atom level.

---

## Layer 1: Design Tokens (Atoms - Values)

**What**: Semantic CSS variables for spacing, colors, typography  
**Where**: `src/app.css` (`@theme` block)  
**When**: ALWAYS (never hardcode values)

### Token Structure

```css
/* src/app.css */
@theme {
  /* Spacing tokens */
  --spacing-nav-item: 0.5rem;
  --spacing-control-panel-padding: 0.75rem;
  
  /* Color tokens */
  --color-surface: light-dark(white, #1a1a1a);
  --color-primary: light-dark(#1a1a1a, #f5f5f5);
  
  /* Typography tokens */
  --font-size-label: 0.75rem;
}
```

### Usage

```svelte
<!-- ✅ CORRECT: Use tokens -->
<div style="padding: var(--spacing-control-panel-padding);">
  <span style="color: var(--color-primary);">Text</span>
</div>

<!-- ❌ WRONG: Hardcoded values -->
<div style="padding: 12px;">
  <span style="color: #1a1a1a;">Text</span>
</div>
```

**Why Tokens Matter**:
- ✅ Automatically adapt to light/dark mode
- ✅ Change once, updates everywhere
- ✅ Semantic meaning (not arbitrary values)

**See**: [Design Tokens Reference](../design/design-tokens.md)

---

## Layer 2: Utility Classes (Atoms - Behavior)

**What**: Reusable CSS classes that enforce patterns  
**Where**: `src/app.css` (`@utility` directive)  
**When**: Pattern repeats 3+ times, needs foolproof enforcement

### Utility Structure

```css
/* src/app.css */
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
<!-- ✅ CORRECT: Use utilities -->
<aside class="toc-panel scrollable-outer">
  <ul class="toc-list scrollable-inner">
    <!-- items -->
  </ul>
</aside>

<!-- ❌ WRONG: Manual pattern (error-prone) -->
<aside class="toc-panel" style="padding: 0.75rem; overflow-y: auto;">
  <ul class="toc-list" style="max-height: calc(100vh - 200px);">
    <!-- items -->
  </ul>
</aside>
```

**When to Create a Utility**:
1. Pattern repeats 3+ times
2. Bug-prone if done manually (e.g., double overflow)
3. Clear, single responsibility
4. Not component-specific

**See**: [Component Architecture](../design/component-architecture.md#layer-2-utility-classes)

---

## Layer 3: Patterns (Molecules)

**What**: Documented solutions to common problems  
**Where**: `dev-docs/2-areas/patterns/`  
**When**: Problem solved once, needs to be applied consistently

### Pattern Structure

**Example: Scrollable Container Pattern**

**Problem**: Nested overflow containers cause scrollbar misalignment

**Solution**: Padding on outer, overflow on inner

```svelte
<!-- Pattern: Scrollable Container -->
<aside class="panel scrollable-outer">
  <ul class="list scrollable-inner">
    <!-- items -->
  </ul>
</aside>
```

**Pattern Components**:
- Rule: Never nest `overflow-y: auto` containers
- Rule: Padding belongs on outer, overflow on inner
- Utilities: `.scrollable-outer`, `.scrollable-inner`
- Example: `TableOfContents.svelte`

**When to Document a Pattern**:
1. Solved a bug or design problem
2. Solution is non-obvious
3. Applies to multiple components
4. Prevents future mistakes

**See**: [Pattern Index](../patterns/INDEX.md)

---

## Layer 4: Components (Organisms)

**What**: Composable UI building blocks with behavior  
**Where**: `src/lib/components/`  
**When**: Complex behavior + reusable UI

### Component Types

#### 1. Atomic Components (`src/lib/components/atoms/`, `/molecules/`, `/organisms/`)

**Single responsibility, no domain logic**

**Atoms** (Simple, single-purpose):
- `Button.svelte` - Button with variants
- `Badge.svelte` - Status badges
- `Icon.svelte` - Icon wrapper
- `FormInput.svelte` - Text input with label

**Molecules** (Composed atoms):
- `DatePicker.svelte` - Date selection
- `Combobox.svelte` - Searchable dropdown
- `MetadataBar.svelte` - Horizontal metadata container

**Organisms** (Complex interactions):
- `Dialog.svelte` - Modal dialogs
- `Calendar.svelte` - Calendar component
- `Command.svelte` - Command palette

**Structure**:
```svelte
<script lang="ts">
  type Props = {
    status: 'backlog' | 'todo' | 'in_progress' | 'done';
    onChange?: (status: Props['status']) => void;
  };
  
  let { status, onChange }: Props = $props();
</script>

<button onclick={() => onChange?.(status)}>
  <!-- UI -->
</button>
```

**See**: [UI Components](../design/component-library/) _(coming soon)_

#### 2. Feature Components (`src/lib/modules/{module}/components/`)

**Domain-specific logic + composed atoms**

Examples:
- `InboxCard.svelte` - Inbox item display (inbox module)
- `FlashcardView.svelte` - Flashcard display (flashcards module)
- `MeetingCard.svelte` - Meeting display (meetings module)
- `OrgChart.svelte` - Organizational structure (org-chart module)

**Structure**:
```svelte
<script lang="ts">
  import { useInboxItems } from '$lib/composables/useInboxItems.svelte.ts';
  import StatusPill from '$lib/components/ui/StatusPill.svelte';
  
  // Use composable for state
  const { filteredItems } = useInboxItems();
</script>

{#each filteredItems() as item}
  <InboxCard {item} />
{/each}
```

**See**: [Composables Analysis](../development/composables-analysis.md)

#### 3. Layout Components (`src/lib/modules/core/components/`)

**Structure and composition**

Examples:
- `Sidebar.svelte` - Navigation sidebar
- `AppTopBar.svelte` - Application header
- `QuickCreateModal.svelte` - Global creation modal

**Structure**:
```svelte
<script lang="ts">
  import { usePattern } from '$lib/utils/patterns';
</script>

<aside class="scrollable-outer">
  <nav class="scrollable-inner">
    <!-- Uses scrollable container pattern -->
  </nav>
</aside>
```

### Component Checklist

**Before creating a component**:
- [ ] Can I use existing utilities instead?
- [ ] Does a pattern already exist?
- [ ] Is this truly reusable, or one-off?
- [ ] Does it have a single, clear responsibility?

**When creating a component**:
- [ ] Use design tokens (never hardcode)
- [ ] Use utility classes (don't reinvent patterns)
- [ ] Follow documented patterns
- [ ] Extract state to composables (`.svelte.ts`)
- [ ] Add TypeScript types

---

## Svelte Component Structure

### File Organization

```
src/lib/components/
├── atoms/                 # Simple, single-purpose
│   ├── Button.svelte
│   ├── Badge.svelte
│   ├── Icon.svelte
│   ├── FormInput.svelte
│   └── index.ts           # Barrel exports
├── molecules/             # Composed atoms
│   ├── DatePicker.svelte
│   ├── Combobox.svelte
│   ├── MetadataBar.svelte
│   └── index.ts
├── organisms/             # Complex interactions
│   ├── Dialog.svelte
│   ├── Calendar.svelte
│   ├── Command.svelte
│   └── index.ts
└── types.ts               # Shared component types

src/lib/modules/
├── core/
│   └── components/        # Global layout components
│       ├── Sidebar.svelte
│       ├── AppTopBar.svelte
│       └── QuickCreateModal.svelte
├── inbox/
│   └── components/        # Inbox feature components
│       ├── InboxCard.svelte
│       └── InboxHeader.svelte
├── meetings/
│   └── components/        # Meetings feature components
│       └── MeetingCard.svelte
└── flashcards/
    └── components/        # Flashcards feature components
        └── FlashcardView.svelte
```

### Component Patterns

#### Pattern 1: Props Interface

```svelte
<script lang="ts">
  type Props = {
    title: string;
    status?: 'active' | 'inactive';
    onClick?: () => void;
  };
  
  let { title, status = 'active', onClick }: Props = $props();
</script>
```

#### Pattern 2: Composables for State

```svelte
<script lang="ts">
  import { useInboxItems } from '$lib/composables/useInboxItems.svelte.ts';
  
  // Composables handle state logic
  const { filteredItems, isLoading } = useInboxItems();
</script>
```

**See**: [Svelte Reactivity Patterns](../patterns/svelte-reactivity.md)

#### Pattern 3: Error Boundaries

```svelte
<script lang="ts">
  import ErrorBoundary from '$lib/components/organisms/ErrorBoundary.svelte';
</script>

<ErrorBoundary fallback={ErrorFallback}>
  <FeatureComponent />
</ErrorBoundary>
```

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

## Component Registry

### Current Components Inventory

**Atomic Components** (`src/lib/components/`):

**Atoms**:
- `Button` - Button with variants
- `Badge` - Status badges
- `Icon` - Icon wrapper
- `FormInput` - Text input
- `FormTextarea` - Textarea
- `StatusPill` - Status display
- `KeyboardShortcut` - Keyboard shortcut display

**Molecules**:
- `DatePicker` - Date selection
- `Combobox` - Searchable dropdown
- `PrioritySelector` - Priority levels
- `AssigneeSelector` - User assignment
- `ProjectSelector` - Project selection
- `MetadataBar` - Horizontal container for metadata

**Organisms**:
- `Dialog` - Modal dialogs
- `Calendar` - Calendar component
- `Command` - Command palette
- `ErrorBoundary` - Error handling

**Feature Components** (`src/lib/modules/{module}/components/`):
- `InboxCard` - Inbox item display
- `TagSelector` - Tag selection (core module)
- `MeetingCard` - Meeting display
- `OrgChart` - Organizational structure
- `FlashcardView` - Flashcard display

**Layout Components** (`src/lib/modules/core/components/`):
- `Sidebar` - Navigation sidebar
- `AppTopBar` - Application header
- `QuickCreateModal` - Global creation modal

**See**: [Component Library](../design/component-library/) _(coming soon)_

---

## Decision Framework

### When to Use What

| Scenario | Solution | Example |
|---------|----------|---------|
| Need spacing value | **Token** | `var(--spacing-control-panel-padding)` |
| Need to prevent double overflow | **Utility** | `.scrollable-outer` + `.scrollable-inner` |
| Need to solve a common problem | **Pattern** | Scrollable Container Pattern |
| Need complex behavior + UI | **Component** | `TableOfContents.svelte` |

### Red Flags

**❌ Don't do this**:
- Hardcode values (`px-2`, `bg-gray-900`, `12px`)
- Create utilities for one-off cases
- Skip documenting patterns after solving bugs
- Build components without checking existing utilities

**✅ Do this**:
- Use semantic tokens (`px-nav-item`, `bg-elevated`)
- Create utilities for repeating patterns (3+ uses)
- Document patterns immediately after solving
- Compose utilities → patterns → components

---

## Quick Reference

### Creating New Layers

| Layer | File | Syntax | When |
|-------|------|--------|------|
| Token | `src/app.css` | `@theme { --name: value; }` | Design system change |
| Utility | `src/app.css` | `@utility name { ... }` | Pattern repeats 3+ times |
| Pattern | `dev-docs/2-areas/patterns/` | Markdown doc | Bug fixed, solution reusable |
| Component | `src/lib/components/` | `.svelte` file | Complex behavior needed |

### Finding Existing Layers

1. **Tokens** → [design-tokens.md](../design/design-tokens.md)
2. **Utilities** → Search `src/app.css` for `@utility`
3. **Patterns** → [patterns/INDEX.md](../patterns/INDEX.md)
4. **Components** → Browse `src/lib/components/`

---

## Related

- **[Component Architecture](../design/component-architecture.md)** - Complete design system guide ⭐
- **[Design Tokens](../design/design-tokens.md)** - All available tokens
- **[Pattern Index](../patterns/INDEX.md)** - Quick symptom → solution lookup
- **[Svelte Reactivity](../patterns/svelte-reactivity.md)** - Svelte 5 patterns
- **[Composables Analysis](../development/composables-analysis.md)** - State management patterns

---

**Last Updated**: 2025-01-XX  
**Status**: 🟢 Active  
**Owner**: Design System Team

