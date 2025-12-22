# UI Patterns

Patterns for bits-ui components, scroll areas, dropdowns, and visual effects.

---

## #L10: ScrollArea Initial Position (Bottom Instead of Top) [🔴 CRITICAL]

**Symptom**: When opening a dropdown/modal with ScrollArea, content appears at the bottom and user must scroll UP to see the top.

**Root Cause**: bits-ui ScrollArea may have internal flex behavior or the browser sets scroll position based on content. The scroll position needs to be explicitly reset when the container opens.

**Fix**: Bind viewport ref and reset scrollTop to 0 when container opens:

```svelte
<script lang="ts">
    let menuOpen = $state(false);
    let viewportRef = $state<HTMLDivElement | null>(null);
    
    // Reset scroll position when menu opens
    $effect(() => {
        if (menuOpen && viewportRef) {
            requestAnimationFrame(() => {
                viewportRef!.scrollTop = 0;
            });
        }
    });
</script>

<DropdownMenu.Root bind:open={menuOpen}>
    <DropdownMenu.Content>
        <ScrollArea.Root type="auto">
            <ScrollArea.Viewport bind:ref={viewportRef} style="max-height: 70vh;">
                <!-- Content -->
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
                <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    </DropdownMenu.Content>
</DropdownMenu.Root>
```

**Apply when**: 
- ScrollArea content appears at bottom on open
- Users complain they have to scroll up
- Long lists in dropdowns/modals

**Related**: #L60 (ScrollArea Max Height), `svelte-reactivity.md#L60` (Effect with requestAnimationFrame)

---

## #L60: ScrollArea Max Height (Content Overflow) [🟡 IMPORTANT]

**Keywords**: ScrollArea, height, max-height, viewport, overflow, scroll, dropdown, full-page, parent height, h-full, Tabs.Root, height constraint

**Symptom**: Dropdown content overflows outside the scroll container instead of being constrained and scrollable. OR: Full-page ScrollArea doesn't scroll (no scrollbar appears).

**Root Cause**: 
- **For dropdowns/modals**: ScrollArea.Viewport needs explicit `max-height` to constrain content. Without it, content expands and overflows.
- **For full-page scrolling**: ScrollArea.Root needs a height-constrained parent. If parent has no height (`h-full` resolves to `100%` of `undefined`), ScrollArea can't calculate scroll height.

**Fix**: 

### Example 1: Dropdown/Modal (max-height on Viewport)
```svelte
<!-- ✅ CORRECT: Explicit max-height constrains content -->
<ScrollArea.Root type="auto" scrollHideDelay={400}>
    <ScrollArea.Viewport style="max-height: 70vh;">
        <!-- Content is constrained and scrollable -->
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
    </ScrollArea.Scrollbar>
</ScrollArea.Root>
```

### Example 2: Full-Page Scrolling (height constraint on parent)
```svelte
<!-- ✅ CORRECT: Parent has height constraint -->
<!-- Layout provides: <div class="flex-1 overflow-hidden"> -->
<Tabs.Root bind:value={activeTab} class="h-full">
    <ScrollArea.Root type="auto" scrollHideDelay={400} class="h-full">
        <ScrollArea.Viewport class="h-full w-full">
            <!-- Full page content -->
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
    </ScrollArea.Root>
</Tabs.Root>
```

**Common values for dropdowns**:
- `70vh` - 70% of viewport height (good for dropdowns)
- `300px` - Fixed height (for predictable sizing)
- `calc(100vh - 200px)` - Viewport minus header/footer

**Height chain for full-page**:
- Layout: `flex-1 overflow-hidden` (provides constrained height)
- Parent wrapper (e.g., `Tabs.Root`): `h-full` (fills layout)
- ScrollArea.Root: `h-full` (fills parent)
- ScrollArea.Viewport: `h-full w-full` (fills ScrollArea.Root)

**Apply when**: 
- ScrollArea content overflows container
- Need to limit dropdown/modal height
- Long lists need to be scrollable
- Full-page ScrollArea doesn't scroll (no scrollbar appears)
- ScrollArea.Root has `h-full` but parent has no height constraint

**Anti-Patterns**:
- ❌ `ScrollArea.Root` with `h-full` but parent has no height (e.g., `Tabs.Root` missing `h-full`)
- ❌ Using `flex-1` on ScrollArea.Viewport instead of `h-full` (for full-page scrolling)

**Related**: #L10 (ScrollArea Initial Position)

---

## #L110: ScrollArea with DropdownMenu (bits-ui) [🟢 REFERENCE]

**Symptom**: Need a scrollable dropdown menu that only shows scrollbar when needed.

**Root Cause**: bits-ui DropdownMenu.Content doesn't have built-in scroll. Need to wrap content with ScrollArea.

**Fix**: Complete pattern for scrollable dropdown:

```svelte
<script lang="ts">
    import { DropdownMenu, ScrollArea } from 'bits-ui';
    
    let menuOpen = $state(false);
    let viewportRef = $state<HTMLDivElement | null>(null);
    
    // Reset scroll position when menu opens
    $effect(() => {
        if (menuOpen && viewportRef) {
            requestAnimationFrame(() => {
                viewportRef!.scrollTop = 0;
            });
        }
    });
</script>

<DropdownMenu.Root bind:open={menuOpen}>
    <DropdownMenu.Trigger>
        <!-- Trigger content -->
    </DropdownMenu.Trigger>
    
    <DropdownMenu.Portal to="body">
        <DropdownMenu.Content
            class="border-base rounded-button border bg-elevated shadow-card"
            side="bottom"
            align="start"
        >
            <ScrollArea.Root type="auto" scrollHideDelay={400}>
                <ScrollArea.Viewport
                    bind:ref={viewportRef}
                    class="py-inset-xs"
                    style="max-height: 70vh;"
                >
                    <!-- Menu items -->
                    <DropdownMenu.Item>Item 1</DropdownMenu.Item>
                    <DropdownMenu.Item>Item 2</DropdownMenu.Item>
                    <!-- ... more items -->
                </ScrollArea.Viewport>
                
                <!-- Scrollbar styling with design tokens -->
                <ScrollArea.Scrollbar
                    orientation="vertical"
                    class="flex touch-none p-px transition-opacity duration-200 select-none"
                    style="width: 0.5rem;"
                >
                    <ScrollArea.Thumb
                        class="bg-tertiary relative flex-1 rounded-avatar"
                        style="opacity: var(--opacity-50);"
                    />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>
```

**Key props**:
- `type="auto"` - Scrollbar only shows when content exceeds max-height
- `type="always"` - Scrollbar always visible
- `type="hover"` - Scrollbar shows on hover (default)
- `scrollHideDelay={400}` - Delay before scrollbar hides (ms)

**Apply when**: 
- Building dropdown menus with potentially long content
- Need scrollable lists in popovers/modals
- Using bits-ui components

**Related**: #L10 (ScrollArea Initial Position), #L60 (ScrollArea Max Height)

---

## #L120: Bits UI Combobox Open State Management [🟡 IMPORTANT]

**Keywords**: Combobox, bits-ui, bind:open, dropdown, open state, click handler, focus handler

**Symptom**: Combobox dropdown doesn't open when clicking the input field or trigger button.

**Root Cause**: Bits UI Combobox requires explicit `bind:open` state management. The Input component doesn't automatically open the dropdown on click/focus - you need to add handlers.

**Fix**: Add open state and explicit handlers:

```svelte
<script lang="ts">
    import { Combobox as BitsCombobox } from 'bits-ui';
    
    let open = $state(false);
    let searchValue = $state('');
    
    // Handle input click/focus to open combobox
    function handleInputClick() {
        if (!open) {
            open = true;
        }
    }
    
    function handleInputFocus() {
        if (!open) {
            open = true;
        }
    }
    
    function handleInputChange(e: Event) {
        const target = e.currentTarget as HTMLInputElement;
        searchValue = target.value;
        // Open combobox when user starts typing
        if (!open) {
            open = true;
        }
    }
</script>

<BitsCombobox.Root bind:open>
    <BitsCombobox.Input
        bind:value={searchValue}
        oninput={handleInputChange}
        onclick={handleInputClick}
        onfocus={handleInputFocus}
    />
    <BitsCombobox.Trigger>
        <!-- Trigger content -->
    </BitsCombobox.Trigger>
    <BitsCombobox.Portal>
        <BitsCombobox.Content>
            <!-- Dropdown content -->
        </BitsCombobox.Content>
    </BitsCombobox.Portal>
</BitsCombobox.Root>
```

**Key points**:
- `bind:open` on Root is **required** - without it, dropdown won't open
- Add `onclick` and `onfocus` handlers to Input to open on interaction

---

## #L560: URL-Synced Tabs Without Full-Panel Flash (Keep Header Stable) [🟡 IMPORTANT]

**Keywords**: tabs, URL params, replaceState, shallow routing, white flash, loading gate, StackedPanel, TabbedPanel

**Symptom**: Clicking a tab briefly makes the whole panel go blank/white, then re-renders. Even though data is already loaded, the user perceives a “page reload”.

**Root Cause**: The panel template uses a whole-panel loading gate:

```svelte
{#if isLoading}
  <Loading />
{:else if entity}
  <!-- header + tabs + everything -->
{/if}
```

If `isLoading` toggles `true` even briefly (often happens when URL-driven state updates), Svelte replaces the entire panel content, causing a flash.

**Fix**:

- **Keep a stable “last loaded” entity** (per selected id) so the header and structure never disappear.
- **Scope loading UI to the tab content area**, not the entire panel.
- If loading jitters during tab changes, **only show the overlay on real entity changes**, not on tab changes.

**Implementation pattern (Svelte 5 runes)**:

```ts
// In the panel component
const entity = $derived(source?.selectedEntity ?? null);
const selectedId = $derived(source?.selectedEntityId ?? null);
const isLoading = $derived(source?.selectedEntityIsLoading ?? false);

const stable = $state({ entity: null as typeof entity, id: null as typeof selectedId });
const lastLoaded = $state({ id: null as string | null });

$effect(() => {
  // Reset stable entity when selection changes
  if (selectedId !== stable.id) {
    stable.id = selectedId;
    stable.entity = null;
  }
  // Update stable entity whenever real data arrives
  if (entity) stable.entity = entity;
});

const displayEntity = $derived(entity ?? stable.entity);

$effect(() => {
  if (displayEntity && selectedId) lastLoaded.id = selectedId as unknown as string;
});

const shouldShowContentOverlay = $derived(
  !!selectedId && isLoading && lastLoaded.id !== (selectedId as unknown as string)
);
```

```svelte
{#if !displayEntity && isLoading}
  <Loading message="Loading..." />
{:else if displayEntity}
  <DetailHeader entityName={displayEntity.name} />

  <div class="relative flex-1 overflow-y-auto">
    <TabbedPanel ... />

    {#if shouldShowContentOverlay}
      <div class="bg-surface/80 absolute inset-0 flex items-center justify-center">
        <Loading message="Loading..." />
      </div>
    {/if}
  </div>
{/if}
```

**Apply when**:
- Tabs are synced to URL query params (shareable links)
- Any “loading” boolean can briefly toggle due to URL/state changes
- You want **header + chrome to remain stable** during transient fetch/recompute

**Related**:
- `convex-integration.md#L250` (conditional `useQuery` must be wrapped in `$derived`)
- `stacked-navigation.md` (stack drives selection; URL sync is first-class)
- Open on `oninput` when user starts typing (better UX)
- Trigger button works automatically with `bind:open`

**Apply when**: 
- Building combobox components with Bits UI
- Dropdown doesn't open on click/focus
- Need programmatic control over dropdown visibility

**Related**: #L130 (Combobox Dropdown Sizing)

---

## #L130: Combobox Dropdown Max Height and Auto-Positioning [🟡 IMPORTANT]

**Keywords**: Combobox, max-height, overflow, scrolling, auto-positioning, collision detection, Floating UI

**Symptom**: Combobox dropdown is too large, extends beyond viewport, or doesn't flip when near screen edges.

**Root Cause**: 
- Dropdown content has no height constraint, grows to fit all items
- No auto-positioning configured, always opens in same direction

**Fix**: Add max-height with scrolling and auto-positioning:

```svelte
<script lang="ts">
    import { Combobox as BitsCombobox } from 'bits-ui';
    
    let maxHeight = '14rem'; // ~224px, shows ~4-5 items
    // Alternative: '20rem' (~320px, ~5-7 items) or '15rem' (~240px, ~4-5 items)
</script>

<BitsCombobox.Root bind:open>
    <BitsCombobox.Input />
    <BitsCombobox.Portal>
        <BitsCombobox.Content
            side="bottom"
            align="start"
            sideOffset={4}
            collisionPadding={8}
        >
            <BitsCombobox.Viewport
                style="max-height: {maxHeight}; overflow-y: auto;"
            >
                <!-- Items -->
            </BitsCombobox.Viewport>
        </BitsCombobox.Content>
    </BitsCombobox.Portal>
</BitsCombobox.Root>
```

**Key props**:
- `side="bottom"` - Default position (Floating UI auto-flips to "top" if needed)
- `collisionPadding={8}` - Edge detection padding (8px from viewport edges)
- `max-height` on Viewport - Constrains dropdown size (use `rem` units for consistency)
- `overflow-y: auto` - Enables scrolling when content exceeds max-height

**Recommended max-height values**:
- `14rem` (~224px) - Compact, shows ~4-5 items (default for combobox)
- `15rem` (~240px) - Slightly larger, ~4-5 items
- `20rem` (~320px) - Larger, ~5-7 items (for longer lists)

**Auto-positioning behavior**:
- Floating UI (used by Bits UI) automatically flips dropdown to "top" when near bottom of screen
- Works at top/bottom/left/right edges of viewport
- `collisionPadding` ensures dropdown stays within viewport bounds

**Apply when**: 
- Combobox dropdown is too large
- Dropdown extends beyond viewport
- Need dropdown to flip when near screen edges
- Long option lists need scrolling

**Anti-Patterns**:
- ❌ No max-height constraint (dropdown grows indefinitely)
- ❌ Using `vh` units for combobox (too large, use `rem` instead)
- ❌ Missing `collisionPadding` (dropdown can extend beyond viewport)

**Related**: #L60 (ScrollArea Max Height), #L120 (Combobox Open State)

---

## #L140: Combobox Input (Portal) — Autofocus + Cmd/Ctrl+A + Delete Behavior [🟡 IMPORTANT]

**Keywords**: Combobox, bits-ui, Portal, Input, focus, autofocus, keyboard, Cmd+A, Ctrl+A, select all, delete, backspace, stopPropagation, onOpenChangeComplete, tick, requestAnimationFrame

**Symptom**:
- User clicks a Combobox trigger and **can’t type immediately** (input inside the dropdown isn’t focused)
- **Cmd/Ctrl+A** selects “all options” (or does nothing) instead of selecting input text
- **Delete/Backspace after Cmd+A** doesn’t clear the input (or triggers combobox behaviors)

**Root Cause**:
- When the input is rendered inside `Combobox.Content` (often via `Combobox.Portal`), it may not exist yet at the moment you open the combobox (Portal timing + animations).
- Combobox root-level key handlers can treat Cmd/Ctrl+A / Delete as *combobox shortcuts* instead of native input editing.

**Pattern**:
- **Focus after open** using `tick()` + a few `requestAnimationFrame` retries (Portal-safe).
- On the input `keydown`:
  - Intercept **Cmd/Ctrl+A** → `input.select()` and `stopPropagation()`
  - For **Backspace/Delete**: if the input has value or selection, `stopPropagation()` so native editing wins.

**Implementation:**

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { tick } from 'svelte';

	let inputRef = $state<HTMLInputElement | null>(null);
	let open = $state(false);

	function tryFocus(): boolean {
		if (!inputRef) return false;
		inputRef.focus();
		inputRef.select();
		return true;
	}

	async function focusSoon() {
		if (!browser) return;
		await tick();
		let attempts = 0;
		const maxAttempts = 6;
		const step = () => {
			if (tryFocus()) return;
			attempts += 1;
			if (attempts < maxAttempts) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}

	function onOpenChangeComplete(isOpen: boolean) {
		if (!isOpen) return;
		void focusSoon();
	}

	function onInputKeyDown(event: KeyboardEvent) {
		// Cmd/Ctrl + A should select input text, not combobox items
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
			event.preventDefault();
			event.stopPropagation();
			(event.currentTarget as HTMLInputElement).select();
			return;
		}

		// Ensure Backspace/Delete edits the input when there is text/selection
		if (event.key === 'Backspace' || event.key === 'Delete') {
			const input = event.currentTarget as HTMLInputElement;
			const hasValue = input.value.length > 0;
			const hasSelection = input.selectionStart !== input.selectionEnd;
			if (hasValue || hasSelection) event.stopPropagation();
		}
	}
</script>

<!-- Combobox root (bind:open recommended for controlled open) -->
<Combobox.Root bind:open onOpenChangeComplete={onOpenChangeComplete}>
	<Combobox.Portal>
		<Combobox.Content>
			<Combobox.Input bind:ref={inputRef} onkeydown={onInputKeyDown} />
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
```

**Anti-Patterns**:
- ❌ Focusing immediately on click (Portal input not mounted yet)
- ❌ `event.preventDefault()` for Delete/Backspace without checking selection/value (breaks native editing)
- ❌ Letting Cmd/Ctrl+A bubble to Combobox root (selects options / breaks UX)

**Related**: #L120 (Combobox Open State), #L130 (Combobox Dropdown Sizing), #L510 (External Trigger with `customAnchor`)

---

## #L350: Mobile-First Slide-Over Panel Pattern [🟢 REFERENCE]

**Keywords**: panel, modal, sheet, slide-over, mobile, responsive, breadcrumbs, back button, full-width, Credenza

**Symptom**: Need a slide-over panel that works on both mobile and desktop with different navigation patterns.

**Root Cause**: Desktop has space for sidebar breadcrumbs; mobile doesn't. Different UI patterns needed per viewport.

**Pattern**: Use mobile detection + conditional rendering:

```svelte
<script lang="ts">
    // Mobile detection (< 640px = sm breakpoint)
    const MOBILE_BREAKPOINT = 640;
    let isMobile = $state(false);
    
    $effect(() => {
        if (!browser) return;
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const onChange = () => {
            isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        };
        mql.addEventListener('change', onChange);
        isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        return () => mql.removeEventListener('change', onChange);
    });
    
    // Show sidebar breadcrumbs only on tablet+
    const showSidebarBreadcrumbs = $derived(hasBreadcrumbs && !isMobile);
</script>
```

**Mobile vs Desktop behavior:**
| Viewport | Panel Width | Breadcrumbs | Back Navigation |
|----------|-------------|-------------|-----------------|
| Mobile (< 640px) | `w-full` | Hidden | Back button in header |
| Tablet (640px+) | 900px + breadcrumbs | Sidebar | Via sidebar breadcrumbs |
| Desktop (1024px+) | 1200px + breadcrumbs | Sidebar | Via sidebar breadcrumbs |

**Pass context to children via snippet:**
```svelte
<!-- StackedPanel.svelte -->
export interface PanelContext {
    isMobile: boolean;
    canGoBack: boolean;
    onBack: () => void;
}

interface Props {
    children: import('svelte').Snippet<[PanelContext]>;
}

{@render children(panelContext)}
```

```svelte
<!-- Usage in consumer -->
<StackedPanel ...>
    {#snippet children(panelContext)}
        <Header
            showBackButton={panelContext.isMobile && panelContext.canGoBack}
            onBack={panelContext.onBack}
        />
    {/snippet}
</StackedPanel>
```

**Apply when**: 
- Building slide-over panels/modals with nested navigation
- Need different UX on mobile vs desktop
- Desktop has breadcrumb sidebar, mobile needs back button

**Related**: #L400 (Dynamic Responsive Widths)

---

## #L400: Dynamic Responsive Widths with CSS Variables [🔴 CRITICAL]

**Keywords**: Tailwind, JIT, dynamic class, responsive, width, CSS variable, calc, style block, interpolation

**Symptom**: Dynamic Tailwind classes like `sm:w-[${width}px]` don't apply any styles.

**Root Cause**: 
1. **Tailwind JIT only compiles static classes** - Classes generated at runtime aren't in the CSS
2. **Svelte `<style>` blocks don't support template interpolation** - `{variable}` is treated as literal CSS

**WRONG approaches:**
```svelte
<!-- ❌ WRONG: Dynamic Tailwind class - won't be compiled -->
<div class="sm:w-[{width}px]">

<!-- ❌ WRONG: Template interpolation in <style> block - won't work -->
<style>
    .panel { width: {BASE_WIDTH}px; }  /* Outputs literal "{BASE_WIDTH}px" */
</style>
```

**Fix**: Use inline CSS custom property + static `<style>` block with `calc()`:

```svelte
<script lang="ts">
    const extraWidth = $derived(breadcrumbCount * 48);
</script>

<!-- Set CSS variable via inline style (interpolation WORKS here) -->
<div
    class="panel-width"
    style="--extra-width: {extraWidth}px;"
>

<style>
    /* Static <style> block with calc() - no interpolation needed */
    :global(.panel-width) {
        width: 100%; /* Mobile: full width */
    }
    
    @media (min-width: 640px) {
        :global(.panel-width) {
            width: calc(900px + var(--extra-width, 0px));
        }
    }
    
    @media (min-width: 1024px) {
        :global(.panel-width) {
            width: calc(1200px + var(--extra-width, 0px));
        }
    }
</style>
```

**Key principles:**
1. **Inline `style` attribute**: Supports Svelte interpolation `{variable}`
2. **CSS custom properties**: Bridge between JS and CSS
3. **Static `<style>` block**: Use `var()` and `calc()` - no interpolation
4. **Default values**: `var(--extra-width, 0px)` provides fallback

**Apply when**: 
- Need dynamic values in responsive CSS
- Tailwind dynamic classes aren't working
- Need to pass JS values to CSS media queries

**Anti-patterns:**
- ❌ Dynamic Tailwind class names: `sm:w-[${width}px]`
- ❌ Template interpolation in `<style>`: `width: {width}px`
- ❌ Using `!important` in inline styles to override

**Related**: #L350 (Mobile-First Panel Pattern)

---

## #L450: Fixed vs Absolute Positioning for Panel Children [🟡 IMPORTANT]

**Keywords**: fixed, absolute, positioning, panel, breadcrumb, viewport, parent, containing block

**Symptom**: Elements positioned with `fixed` inside a panel don't align to the panel - they use viewport coordinates.

**Root Cause**: 
- `fixed` positioning is relative to the **viewport**, not the parent element
- CSS custom properties DO inherit to fixed elements, but position calculations use viewport
- Complex viewport math is fragile and breaks at different screen sizes

**Fix**: Use `absolute` positioning for elements that should be relative to their panel:

```svelte
<!-- Panel container (already fixed or relative) -->
<aside class="fixed right-0 top-0 h-full">
    <!-- Breadcrumbs positioned relative to panel, not viewport -->
    <button class="absolute top-0 bottom-0 left-0 w-[48px]">
        <!-- At panel's left edge -->
    </button>
    <button class="absolute top-0 bottom-0 left-[48px] w-[48px]">
        <!-- 48px from panel's left edge -->
    </button>
</aside>
```

**When to use which:**
| Position | Relative To | Use For |
|----------|-------------|---------|
| `fixed` | Viewport | Modals, panels that stick to screen edge |
| `absolute` | Nearest positioned ancestor | Elements inside panels/modals |

**Key insight**: An `absolute` child inside a `fixed` parent is positioned relative to the `fixed` parent (since `fixed` creates a containing block).

**Apply when**: 
- Panel children need to align to panel edges, not viewport
- Viewport-relative calculations are too complex
- Elements should move with the panel

**Related**: #L350 (Mobile-First Panel Pattern)

---

## #L460: StackedPanel Close Handler Must Check for Previous Layer [🔴 CRITICAL]

**Keywords**: StackedPanel, closePanel, navigationStack, previousLayer, modal stuck, ESC key, backdrop click, can't close, app frozen

**Symptom**: Panel/modal cannot be closed - ESC key, backdrop click, and close button don't work. User must reload page to escape.

**Root Cause**: `closePanel()` function assumes there's always a previous layer (e.g., detail panel) to return to. When panel is opened directly (no previous layer), calling `selectCircle()` or similar doesn't properly close the panel, leaving it stuck.

**Wrong approach:**
```svelte
function closePanel() {
    if (!orgChart) return;
    orgChart.navigationStack.pop();
    // ❌ WRONG: Assumes previous layer always exists
    orgChart.selectCircle(circleId, { skipStackPush: true });
}
```

**Fix**: Always check for `previousLayer` before navigating:

```svelte
function closePanel() {
    if (!orgChart) return;
    const previousLayer = orgChart.navigationStack.previousLayer;
    
    // Pop current layer first
    orgChart.navigationStack.pop();
    
    if (previousLayer) {
        // Navigate to previous layer WITHOUT pushing (we're already there after pop)
        if (previousLayer.type === 'circle') {
            orgChart.selectCircle(previousLayer.id as Id<'circles'>, { skipStackPush: true });
        } else if (previousLayer.type === 'role') {
            orgChart.selectRole(previousLayer.id as Id<'circleRoles'>, 'circle-panel', {
                skipStackPush: true
            });
        }
    } else {
        // No previous layer - close everything
        orgChart.selectCircle(null);
    }
}
```

**Key principles:**
1. **Always check `previousLayer`** - Don't assume it exists
2. **Pop first, then navigate** - Navigation stack state must be updated before navigation
3. **Handle null case** - When no previous layer, explicitly close by setting selection to `null`
4. **Use `skipStackPush: true`** - When navigating to previous layer, don't push again (already there after pop)

**Pattern used in:**
- `EditCirclePanel.closePanel()` - Fixed in SYOS-676
- `CircleDetailPanel.handleClose()` - Already correct
- `RoleDetailPanel.handleClose()` - Already correct

**Apply when**: 
- Building panels/modals with navigation stack
- Panel can be opened directly (not always from another panel)
- ESC/backdrop/close button handlers call `closePanel()`
- Panel gets stuck and can't be closed

**Anti-patterns:**
- ❌ Assuming previous layer always exists
- ❌ Calling `selectCircle()` without checking `previousLayer`
- ❌ Not handling the case when navigation stack is empty

**Related**: #L350 (Mobile-First Panel Pattern), `useNavigationStack` composable

---

## #L500: Stacked Navigation Cross-Module Reuse (Reusing Module Panels in Different Contexts) [🟢 REFERENCE]

**Keywords**: stacked navigation, module panels, cross-module reuse, composable, CircleDetailPanel, RoleDetailPanel, useOrgChart, activation page

**Symptom**: Need to open circle/role edit panels from a different context (e.g., activation page) without duplicating UI code or navigating away from the current page.

**Root Cause**: Panels are tightly coupled to their original module context. Need a way to reuse existing panel components and their composables in new contexts.

**Fix**: Initialize the module's composable (`useOrgChart`) in the new context and reuse existing panel components:

```svelte
<!-- ✅ CORRECT: Reuse existing panels with their composable -->
<script lang="ts">
  import { useOrgChart } from '$lib/modules/org-chart/composables/useOrgChart.svelte';
  import CircleDetailPanel from '$lib/modules/org-chart/components/CircleDetailPanel.svelte';
  import RoleDetailPanel from '$lib/modules/org-chart/components/RoleDetailPanel.svelte';
  
  // Initialize composable (provides required context)
  const orgChart = browser
    ? useOrgChart({
        sessionId: () => data.sessionId,
        workspaceId: () => data.workspaceId
      })
    : null;
    
  // Open panels via composable methods
  function handleFixIssue(issue) {
    if (issue.circleId) {
      orgChart.selectCircle(issue.circleId);
    } else if (issue.roleId) {
      orgChart.selectRole(issue.roleId);
    }
  }
</script>

<!-- Panels render automatically when selection changes -->
{#if orgChart}
  <CircleDetailPanel {orgChart} />
  <RoleDetailPanel {orgChart} />
{/if}
```

**Benefits**:
- ✅ Consistent UI/UX across contexts (same edit experience)
- ✅ No code duplication
- ✅ Automatic features (edit protection, breadcrumbs, mobile support)
- ✅ URL sync works (shareable deep links)

**Trade-offs**:
- Adds dependency on module composable
- Loads full panel features (may be heavier than needed)

**When to create standalone panels instead**:
- Need simplified behavior (fewer features)
- Performance critical (minimize bundle size)
- Significantly different UX requirements

**Apply when**: 
- Need to reuse module panels in different contexts
- Want consistent edit experience across pages
- Need to avoid code duplication

**Architecture Reference**: See `stacked-navigation.md` Pattern 2 (consuming navigation) and Pattern 3 (checking visibility).

**Related**: #L350 (Mobile-First Panel Pattern), #L460 (StackedPanel Close Handler)

---

## #L510: Combobox External Trigger with customAnchor [🔴 CRITICAL]

**Keywords**: Combobox, external trigger, customAnchor, positioning, dropdown, portal, icon button, invisible dropdown, off-screen

**Symptom**: Combobox with external trigger (controlled by parent) doesn't show dropdown, or dropdown appears off-screen/invisible even though content is rendering.

**Root Cause**: When using `triggerStyle="external"` pattern (parent controls open state via `bind:open`), the Combobox.Content has no positioning reference. Bits UI's Portal needs to know WHERE to position the dropdown via the `customAnchor` prop.

**Wrong approach:**
```svelte
<!-- ❌ WRONG: No anchor reference passed -->
<script>
  let open = $state(false);
</script>

<Button onclick={() => open = true}>Add Person</Button>

<Combobox.Root bind:open>
  <Combobox.Portal>
    <!-- Content renders but positioned at (0,0) or off-screen -->
    <Combobox.Content>
      <Combobox.Input />
      <!-- ... -->
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
```

**Fix**: Capture trigger element reference and pass to `customAnchor`:

```svelte
<script lang="ts">
  import { Combobox } from 'bits-ui';
  
  let open = $state(false);
  let triggerRef = $state<HTMLElement | null>(null);
</script>

<!-- Capture trigger element reference -->
<div bind:this={triggerRef}>
  <Button onclick={() => open = true}>Add Person</Button>
</div>

<Combobox.Root bind:open>
  <Combobox.Portal>
    <!-- Pass trigger reference to anchor dropdown -->
    <Combobox.Content
      customAnchor={triggerRef}
      side="bottom"
      align="start"
      sideOffset={4}
    >
      <Combobox.Input />
      <!-- ... -->
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
```

**Component API Pattern** (for reusable components):

```svelte
<!-- PersonSelector.svelte (external mode) -->
<script lang="ts">
  type Props = {
    triggerStyle?: 'default' | 'external';
    open?: boolean; // Bindable for external mode
    anchorElement?: HTMLElement | null; // Required for external mode
    // ... other props
  };
  
  let {
    triggerStyle = 'default',
    open: externalOpen = $bindable(undefined),
    anchorElement = null
  } = $props();
</script>

<Combobox.Root bind:open={externalOpen}>
  {#if triggerStyle === 'default'}
    <!-- Built-in trigger -->
    <Combobox.Trigger>...</Combobox.Trigger>
  {/if}
  
  <Combobox.Portal>
    <Combobox.Content
      customAnchor={triggerStyle === 'external' ? anchorElement : undefined}
    >
      <!-- ... -->
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
```

**Usage:**
```svelte
<script>
  let selectorOpen = $state(false);
  let buttonRef = $state(null);
</script>

<div bind:this={buttonRef}>
  <Button onclick={() => selectorOpen = true}>Add</Button>
</div>

<PersonSelector
  triggerStyle="external"
  bind:open={selectorOpen}
  anchorElement={buttonRef}
/>
```

**Key points**:
- **Always** capture the trigger element reference with `bind:this`
- Pass the reference to `customAnchor` prop on `Combobox.Content`
- Without `customAnchor`, Portal has no positioning context
- The anchor element should wrap or be the actual trigger button

**Why this happens**:
- Bits UI Portal renders content in `document.body` (not at DOM location)
- Floating UI (positioning library) needs anchor reference to calculate position
- Default mode: Combobox.Trigger provides automatic anchor reference
- External mode: No built-in trigger, so parent must provide anchor

**Apply when**: 
- Building combobox with external/icon trigger
- Parent component controls open state
- Dropdown exists but is invisible/off-screen
- Using icon buttons or custom triggers

**Anti-patterns:**
- ❌ Hidden `sr-only` div as anchor (has no position)
- ❌ Passing `customAnchor={undefined}` in external mode
- ❌ Conditional rendering without proper anchor reference

**Related**: #L120 (Combobox Open State), #L130 (Combobox Dropdown Sizing)

---

**Last Updated**: 2025-12-20

