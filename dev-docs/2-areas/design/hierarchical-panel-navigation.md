# Hierarchical Panel Navigation Pattern

> **Purpose**: Reusable system for nested panel navigation with breadcrumbs, ESC key handling, and z-index stacking.

---

## What

**Hierarchical Panel Navigation** is a pattern for displaying nested content in sliding panels with visual breadcrumb navigation. Each panel can contain child panels, creating a stack of navigable layers.

**Use Cases:**
- Org chart navigation (Circle → Sub-Circle → Role)
- File browser (Folder → Subfolder → File)
- Nested settings (Settings → Section → Subsection)
- Document navigation (Document → Section → Subsection)

---

## When to Use

**Use this pattern when:**
- ✅ Content has hierarchical relationships (parent → child)
- ✅ Users need to navigate multiple levels deep
- ✅ Context preservation is important (breadcrumbs show path)
- ✅ Panels should stack visually (each layer slides over previous)

**Don't use when:**
- ❌ Flat navigation (use tabs or simple modals)
- ❌ Single-level content (use simple panel/modal)
- ❌ Mobile-first design (pattern optimized for desktop)

---

## How

### Components

**1. `StackedPanel.svelte`** - Generic panel wrapper
- Location: `src/lib/components/ui/StackedPanel.svelte`
- Handles: Backdrop, ESC key, breadcrumbs, z-index, panel width

**2. `PanelBreadcrumbs.svelte`** - Breadcrumb navigation bars
- Location: `src/lib/components/ui/PanelBreadcrumbs.svelte`
- Displays: Vertical bars showing previous layers

**3. `useNavigationStack.svelte.ts`** - Navigation state management
- Location: `src/lib/composables/useNavigationStack.svelte.ts`
- Manages: Layer stack, z-index calculation, breadcrumb state

### API Reference

#### `StackedPanel` Props

```typescript
interface StackedPanelProps {
  isOpen: boolean;                    // Whether panel is visible
  navigationStack: UseNavigationStack; // Navigation stack instance
  onClose: () => void;                // Called when panel should close
  onBreadcrumbClick: (index: number) => void; // Called when breadcrumb clicked
  isTopmost: () => boolean;           // Function to check if this panel is topmost
  children: Snippet;                 // Panel content
}
```

#### `useNavigationStack()` API

```typescript
const navStack = useNavigationStack();

// Push new layer
navStack.push({ type: 'circle', id: 'abc', name: 'Engineering' });

// Pop current layer
navStack.pop();

// Jump to specific layer
navStack.jumpTo(0); // Jump back to first layer

// Access state
navStack.currentLayer;    // Current layer or null
navStack.previousLayer;   // Previous layer or null
navStack.depth;           // Number of layers
navStack.stack;           // Full stack array
```

---

## Implementation Guide

### Step 1: Create Navigation Stack

```typescript
import { useNavigationStack } from '$lib/composables/useNavigationStack.svelte';

const navigationStack = useNavigationStack();
```

### Step 2: Implement Panel Component

```svelte
<script lang="ts">
  import StackedPanel from '$lib/components/ui/StackedPanel.svelte';
  
  const isOpen = $derived(/* your open state */);
  
  // Check if this panel is topmost (required for ESC key handling)
  const isTopmost = () => {
    const currentLayer = navigationStack.currentLayer;
    return currentLayer?.id === currentItemId;
  };
  
  function handleClose() {
    // Handle ESC/backdrop close
    const previousLayer = navigationStack.previousLayer;
    if (previousLayer) {
      navigationStack.pop();
      // Navigate to previous layer
    } else {
      navigationStack.clear();
      // Close everything
    }
  }
  
  function handleBreadcrumbClick(index: number) {
    const targetLayer = navigationStack.getLayer(index);
    if (!targetLayer) return;
    
    navigationStack.jumpTo(index);
    // Navigate to target layer
  }
</script>

<StackedPanel
  {isOpen}
  {navigationStack}
  onClose={handleClose}
  onBreadcrumbClick={handleBreadcrumbClick}
  {isTopmost}
>
  <!-- Your panel content -->
</StackedPanel>
```

### Step 3: Push Layers on Navigation

```typescript
function handleItemClick(itemId: string) {
  const item = findItem(itemId);
  
  navigationStack.push({
    type: 'item',  // 'circle' | 'role' (or extend NavigationLayerType)
    id: item.id,
    name: item.name
  });
  
  // Update your state to show the item
}
```

---

## Example: Folder Browser

See `src/lib/components/examples/FolderBrowser.svelte` for a complete example demonstrating:
- Folder → Subfolder → File navigation
- Using `useNavigationStack` + `StackedPanel`
- Breadcrumb navigation
- ESC key handling

---

## Key Lessons

### 1. ESC Key Topmost Check

**Problem**: Multiple panels can be open simultaneously. ESC should only close the topmost panel.

**Solution**: Use `isTopmost()` function to check if current panel is topmost before handling ESC.

```typescript
const isTopmost = () => {
  const currentLayer = navigationStack.currentLayer;
  return currentLayer?.id === currentItemId;
};
```

**Why**: Prevents double-pop when multiple panels are open (e.g., Circle panel + Role panel).

### 2. Z-Index Stacking

**Problem**: Panels must stack above sidebar (z-50) and each other.

**Solution**: `useNavigationStack` automatically calculates z-index:
- Base: 60 (above sidebar)
- Increment: +10 per layer (60, 70, 80...)

**Why**: Ensures panels always appear above sidebar and previous layers.

### 3. Breadcrumb Positioning

**Problem**: Breadcrumb bars must align correctly as panels stack.

**Solution**: Each breadcrumb bar positioned at `left: index * 48px` (breadcrumb width).

**Why**: Creates visual stack effect - each layer shows previous layers as breadcrumbs.

### 4. Panel Width Calculation

**Problem**: Panel width must account for breadcrumb bars.

**Solution**: `StackedPanel` calculates width dynamically:
```typescript
width: calc(100% - ${totalBreadcrumbWidth}px);
max-width: calc(100vw - ${totalBreadcrumbWidth}px);
```

**Why**: Prevents panel from overlapping breadcrumbs or overflowing viewport.

---

## Design Tokens

All spacing and colors use semantic tokens (see `src/app.css`):

```css
--spacing-panel-breadcrumb-width: 3rem;      /* 48px */
--z-index-panel-base: 60;                     /* Base z-index */
--z-index-panel-increment: 10;               /* Per layer */
--color-panel-breadcrumb-bg: var(--color-bg-surface);
--color-panel-breadcrumb-text: var(--color-text-tertiary);
```

**Never hardcode values** - always use tokens for consistency and theme support.

---

## References

- **Pattern**: `dev-docs/2-areas/patterns/ui-patterns.md#L5` - Hierarchical Panel Stack Navigation
- **Example**: `src/lib/components/examples/FolderBrowser.svelte`
- **Components**: 
  - `src/lib/components/ui/StackedPanel.svelte`
  - `src/lib/components/ui/PanelBreadcrumbs.svelte`
- **Composable**: `src/lib/composables/useNavigationStack.svelte.ts`
- **Design Tokens**: `src/app.css` (Panel Stack Navigation Tokens)

---

## Migration from Org Chart

If you have existing panel code (like org chart), migrate to `StackedPanel`:

**Before:**
```svelte
<!-- Custom backdrop, ESC handler, breadcrumb logic -->
<aside class="panel-stack-base">
  <!-- Breadcrumbs -->
  <!-- Content -->
</aside>
```

**After:**
```svelte
<StackedPanel
  {isOpen}
  {navigationStack}
  onClose={handleClose}
  onBreadcrumbClick={handleBreadcrumbClick}
  {isTopmost}
>
  <!-- Just your content -->
</StackedPanel>
```

**Benefits:**
- ✅ Removes ~100 lines of duplicated code
- ✅ Consistent behavior across all panels
- ✅ Easier to maintain (fix once, works everywhere)

