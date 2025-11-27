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

**Last Updated**: 2025-01-27

