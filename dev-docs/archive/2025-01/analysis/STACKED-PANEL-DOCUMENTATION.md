# StackedPanel Component - Complete Documentation

## Overview

`StackedPanel.svelte` is a sophisticated organism-level component that provides a hierarchical, multi-layer panel navigation system. It's designed for complex navigation scenarios where users can drill down through multiple levels (e.g., Circle → SubCircle → Role) with visual breadcrumb navigation and proper z-index stacking.

**Location**: `src/lib/components/organisms/StackedPanel.svelte`

**Key Features**:

- Multi-layer navigation with breadcrumb support
- Responsive design (mobile vs tablet/desktop)
- Z-index management for proper layering
- ESC key and backdrop click handling
- Mobile back button support via context
- Prevents accidental closes from same-click events

---

## Component Architecture

### Props Interface

```typescript
interface StackedPanelProps {
	isOpen: boolean; // Controls panel visibility
	navigationStack: UseNavigationStack; // Navigation stack composable instance
	onClose: () => void; // Callback when panel should close
	onBreadcrumbClick: (index: number) => void; // Callback when breadcrumb clicked
	isTopmost: () => boolean; // Function to check if this panel is topmost
	iconRenderer?: (layerType: string) => IconType | null; // Optional icon renderer
	children: Snippet<[PanelContext]>; // Panel content (receives context)
}
```

### PanelContext Interface (Exported)

The component provides context to its children via the `children` snippet:

```typescript
export interface PanelContext {
	isMobile: boolean; // True when viewport < 640px
	canGoBack: boolean; // True when there are previous layers
	onBack: () => void; // Function to navigate back (for mobile back button)
}
```

---

## Core Dependencies

### 1. useNavigationStack Composable

**Location**: `src/lib/modules/core/composables/useNavigationStack.svelte.ts`

The navigation stack manages hierarchical layer state:

```typescript
type NavigationLayer = {
	type: NavigationLayerType; // e.g., 'circle', 'role', 'edit-circle'
	id: string; // Entity ID
	name: string; // Display name for breadcrumbs
	zIndex: number; // Calculated z-index (base 60 + depth * 10)
};

// API:
const navStack = useNavigationStack();
navStack.push({ type: 'circle', id: 'abc', name: 'Engineering' });
navStack.pop();
navStack.jumpTo(0); // Jump to specific layer
navStack.currentLayer; // Current layer or null
navStack.previousLayer; // Previous layer or null
navStack.depth; // Number of layers
```

**Z-Index Calculation**:

- Base: `60` (matches `--z-index-panel-base` design token)
- Increment: `10` per layer (matches `--z-index-panel-increment` token)
- Formula: `baseZIndex + (stack.length - 1) * zIndexIncrement`

### 2. PanelBreadcrumbs Component

**Location**: `src/lib/components/molecules/PanelBreadcrumbs.svelte`

Renders breadcrumb bars on the left side of the panel (tablet/desktop only):

- Each breadcrumb is a clickable button
- Positioned absolutely, stacked horizontally
- Z-index decreases for each breadcrumb (creates depth effect)
- Width: `--spacing-12` (48px) per breadcrumb

### 3. Design System Recipes

**Location**: `src/lib/design-system/recipes/stackedPanel.recipe.ts`

- `stackedPanelRecipe`: Main panel styling (fixed positioning, transitions)
- `stackedPanelBackdropRecipe`: Backdrop overlay styling
- `stackedPanelContentRecipe`: Content container styling

---

## Key Behaviors

### 1. Responsive Design

**Mobile (< 640px)**:

- Full-width panel
- No sidebar breadcrumbs (uses mobile back button instead)
- Panel context provides `isMobile: true` and `onBack()` function

**Tablet (640px+)**:

- Max width: `900px + breadcrumb width`
- Sidebar breadcrumbs visible on left
- Content padded left by total breadcrumb width

**Desktop (1024px+)**:

- Max width: `1200px + breadcrumb width`
- Same breadcrumb behavior as tablet

### 2. Z-Index Management

- Panel z-index: `navigationStack.currentLayer?.zIndex ?? 60`
- Backdrop z-index: `currentZIndex - 1`
- Breadcrumb z-index: Decreases for each breadcrumb (`currentZIndex - 1 - index`)

### 3. Close Prevention Logic

**Same-Click Prevention**:

- Tracks `openedAt` timestamp when panel opens
- Ignores backdrop clicks within 100ms of opening
- Prevents accidental close from the same click that opened the panel

**Topmost Check**:

- ESC key handler checks `isTopmost()` before closing
- Prevents double-pop when multiple panels are open
- Each panel instance must provide its own `isTopmost()` function

### 4. Breadcrumb Width Calculation

- Reads `--spacing-12` CSS token (3rem = 48px)
- Calculates total width: `breadcrumbCount * breadcrumbWidth`
- Only applies on tablet/desktop (mobile has no sidebar breadcrumbs)
- Uses CSS custom property: `--breadcrumb-extra-width`

---

## Usage Patterns

### Basic Usage (Org Chart Example)

```svelte
<script lang="ts">
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import { useDetailPanelNavigation } from './useDetailPanelNavigation.svelte';

	let { orgChart }: { orgChart: UseOrgChart | null } = $props();

	const isOpen = $derived(orgChart?.selectedCircleId !== null);
	const navigation = useDetailPanelNavigation({
		orgChart: () => orgChart,
		isEditMode: () => isEditMode,
		isDirty: () => editCircle.isDirty,
		onShowDiscardDialog: () => {
			showDiscardDialog = true;
		},
		resetEditMode: () => {
			isEditMode = false;
			editCircle.reset();
		}
	});

	const isTopmost = () =>
		orgChart?.navigationStack.currentLayer?.type === 'circle' &&
		orgChart.navigationStack.currentLayer?.id === orgChart.selectedCircleId;

	const renderBreadcrumbIcon = (layerType: string): IconType | null =>
		layerType === 'circle' ? 'circle' : layerType === 'role' ? 'user' : null;
</script>

<StackedPanel
	{isOpen}
	navigationStack={orgChart.navigationStack}
	onClose={navigation.handleClose}
	onBreadcrumbClick={navigation.handleBreadcrumbClick}
	{isTopmost}
	iconRenderer={renderBreadcrumbIcon}
>
	{#snippet children(panelContext)}
		<!-- Panel content here -->
		<!-- Access panelContext.isMobile, panelContext.canGoBack, panelContext.onBack -->
		<DetailHeader
			onBack={panelContext.onBack}
			showBackButton={panelContext.isMobile && panelContext.canGoBack}
		/>
	{/snippet}
</StackedPanel>
```

### Navigation Stack Integration

The navigation stack is managed by the parent composable (e.g., `useOrgChart`):

```typescript
// When opening a circle panel:
orgChart.selectCircle(circleId);
// Internally calls:
navigationStack.push({
	type: 'circle',
	id: circleId,
	name: circleName
});

// When closing (via ESC or backdrop):
navigation.handleClose();
// Internally calls:
navigationStack.pop();
// Then navigates to previousLayer if it exists
```

### Breadcrumb Navigation

When a breadcrumb is clicked:

```typescript
// User clicks breadcrumb at index 1
onBreadcrumbClick(1);

// Handler (from useDetailPanelNavigation):
navigationStack.jumpTo(1); // Removes all layers above index 1
// Then re-opens the panel for that layer WITHOUT pushing (skipStackPush: true)
```

---

## Real-World Usage Examples

### 1. CircleDetailPanel

**Location**: `src/lib/modules/org-chart/components/CircleDetailPanel.svelte`

**Usage**:

- Displays circle details in a stacked panel
- Integrates with `useDetailPanelNavigation` for navigation handling
- Uses `panelContext` for mobile back button support
- Handles edit mode with unsaved changes protection

**Key Integration Points**:

```svelte
<StackedPanel
	{isOpen}
	navigationStack={orgChart.navigationStack}
	onClose={handleClose}
	onBreadcrumbClick={handleBreadcrumbClick}
	{isTopmost}
	iconRenderer={renderBreadcrumbIcon}
>
	{#snippet children(panelContext)}
		<DetailHeader
			onBack={panelContext.onBack}
			showBackButton={panelContext.isMobile && panelContext.canGoBack}
		/>
		<!-- Rest of panel content -->
	{/snippet}
</StackedPanel>
```

### 2. RoleDetailPanel

**Location**: `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`

**Usage**:

- Similar pattern to CircleDetailPanel
- Can be opened from CircleDetailPanel (creates nested navigation)
- Shares same navigation stack instance

### 3. ProposalDetailPanel

**Location**: `src/lib/modules/org-chart/components/proposals/ProposalDetailPanel.svelte`

**Usage**:

- Uses StackedPanel for proposal detail view
- Part of proposals module navigation flow

---

## Navigation Flow Example

### Scenario: User navigates Circle → SubCircle → Role

1. **User clicks Circle**:

   ```
   Stack: []
   → selectCircle('circle-1')
   → navigationStack.push({ type: 'circle', id: 'circle-1', name: 'Engineering', zIndex: 60 })
   Stack: [{ type: 'circle', id: 'circle-1', name: 'Engineering', zIndex: 60 }]
   ```

2. **User clicks SubCircle**:

   ```
   Stack: [{ type: 'circle', id: 'circle-1', ... }]
   → selectCircle('circle-2')
   → navigationStack.push({ type: 'circle', id: 'circle-2', name: 'Frontend', zIndex: 70 })
   Stack: [
     { type: 'circle', id: 'circle-1', name: 'Engineering', zIndex: 60 },
     { type: 'circle', id: 'circle-2', name: 'Frontend', zIndex: 70 }
   ]
   ```

3. **User clicks Role**:

   ```
   Stack: [{ circle-1, zIndex: 60 }, { circle-2, zIndex: 70 }]
   → selectRole('role-1')
   → navigationStack.push({ type: 'role', id: 'role-1', name: 'Lead Developer', zIndex: 80 })
   Stack: [
     { type: 'circle', id: 'circle-1', name: 'Engineering', zIndex: 60 },
     { type: 'circle', id: 'circle-2', name: 'Frontend', zIndex: 70 },
     { type: 'role', id: 'role-1', name: 'Lead Developer', zIndex: 80 }
   ]
   ```

4. **User clicks breadcrumb "Engineering"** (index 0):

   ```
   Stack: [{ circle-1, zIndex: 60 }, { circle-2, zIndex: 70 }, { role-1, zIndex: 80 }]
   → onBreadcrumbClick(0)
   → navigationStack.jumpTo(0)
   → Removes circle-2 and role-1
   Stack: [{ type: 'circle', id: 'circle-1', name: 'Engineering', zIndex: 60 }]
   → selectCircle('circle-1', { skipStackPush: true })
   ```

5. **User presses ESC**:
   ```
   Stack: [{ circle-1, zIndex: 60 }]
   → handleClose()
   → navigationStack.pop()
   → Stack: []
   → selectCircle(null)
   ```

---

## Design Tokens Used

- `--z-index-panel-base`: Base z-index (60)
- `--z-index-panel-increment`: Z-index increment per layer (10)
- `--spacing-12`: Breadcrumb width (3rem = 48px)
- `--color-component-overlay-backdrop`: Backdrop color
- `--animation-duration-slow`: Transition duration
- `--color-surface`: Panel background
- `--shadow-card`: Panel shadow

---

## Mobile vs Desktop Behavior

### Mobile (< 640px)

**Visual**:

- Full-width panel
- No sidebar breadcrumbs
- Back button in header (via `panelContext.onBack`)

**Navigation**:

- Back button calls `panelContext.onBack()` → `handleBack()` → `onBreadcrumbClick(breadcrumbCount - 1)`
- Same navigation logic, different UI

### Tablet/Desktop (640px+)

**Visual**:

- Responsive max-width (900px tablet, 1200px desktop)
- Sidebar breadcrumbs on left
- Content padded left by breadcrumb width

**Navigation**:

- Click breadcrumb → `onBreadcrumbClick(index)`
- Visual breadcrumb bars provide navigation

---

## Edge Cases & Safety Features

### 1. Multiple Panels Open

- Each panel checks `isTopmost()` before handling ESC
- Prevents double-pop when multiple panels are open
- Only topmost panel responds to ESC key

### 2. Same-Click Prevention

- Tracks `openedAt` timestamp
- Ignores backdrop clicks within 100ms
- Prevents accidental close from opening click

### 3. SSR Safety

- All browser APIs wrapped in `if (!browser) return`
- Mobile detection uses `$effect` (not module-level)
- Safe for server-side rendering

### 4. Empty Stack Handling

- `breadcrumbCount` uses `Math.max(0, depth - 1)`
- Handles empty stack gracefully
- No breadcrumbs when `depth <= 1`

---

## Integration with Other Systems

### URL Synchronization

The navigation stack integrates with URL sync (`useOrgChartUrlSync`):

- Stack changes trigger URL updates
- Browser back/forward restores stack state
- Uses `pushState` for opening, `replaceState` for closing

### Edit Mode Protection

`useDetailPanelNavigation` protects against navigation during edit:

- Checks `isDirty()` before navigation
- Shows discard dialog if unsaved changes
- Resets edit mode before navigation

---

## Component Lifecycle

1. **Mount**: Component initializes mobile detection, breadcrumb width calculation
2. **Open**: Panel slides in from right, backdrop fades in, ESC handler attached
3. **Navigation**: Stack updates trigger reactive re-renders, breadcrumbs update
4. **Close**: Panel slides out, backdrop fades out, ESC handler removed

---

## Testing Considerations

When testing StackedPanel:

1. **Navigation Stack**: Mock `useNavigationStack` or use real instance
2. **Mobile Detection**: Test with different viewport widths
3. **Topmost Check**: Test with multiple panels open
4. **Same-Click Prevention**: Test rapid open/close
5. **Breadcrumb Navigation**: Test clicking different breadcrumb indices
6. **ESC Key**: Test with single and multiple panels
7. **Backdrop Click**: Test direct click vs bubbled events

---

## Common Patterns

### Pattern 1: Simple Panel (No Navigation)

```svelte
const navStack = useNavigationStack(); const isOpen = $state(false);

<StackedPanel
	{isOpen}
	navigationStack={navStack}
	onClose={() => {
		isOpen = false;
	}}
	onBreadcrumbClick={() => {}}
	isTopmost={() => true}
>
	{#snippet children(panelContext)}
		<!-- Content -->
	{/snippet}
</StackedPanel>
```

### Pattern 2: Hierarchical Navigation

```svelte
// Use with useDetailPanelNavigation composable
const navigation = useDetailPanelNavigation({
  orgChart: () => orgChart,
  isEditMode: () => isEditMode,
  isDirty: () => isDirty,
  onShowDiscardDialog: () => { showDialog = true; },
  resetEditMode: () => { isEditMode = false; }
});

<StackedPanel
  {isOpen}
  navigationStack={orgChart.navigationStack}
  onClose={navigation.handleClose}
  onBreadcrumbClick={navigation.handleBreadcrumbClick}
  {isTopmost}
>
  {#snippet children(panelContext)}
    <!-- Content with mobile back button support -->
  {/snippet}
</StackedPanel>
```

---

## Summary

`StackedPanel` is a powerful, reusable component for hierarchical navigation scenarios. It handles:

- ✅ Multi-layer navigation with breadcrumbs
- ✅ Responsive design (mobile vs desktop)
- ✅ Z-index management
- ✅ Keyboard and mouse interactions
- ✅ Mobile back button support
- ✅ Safety features (same-click prevention, topmost checks)

**Key Integration Points**:

1. Navigation stack (`useNavigationStack`)
2. Navigation handlers (`useDetailPanelNavigation`)
3. Panel context for mobile support
4. Design system recipes for styling

**Primary Use Cases**:

- Org chart detail panels (Circle, Role)
- Proposal detail panels
- Any hierarchical drill-down navigation

This component is designed to be reusable across different modules while maintaining consistent behavior and UX patterns.
