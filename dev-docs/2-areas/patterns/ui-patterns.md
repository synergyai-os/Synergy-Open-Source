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

**Symptom**: Dropdown content overflows outside the scroll container instead of being constrained and scrollable.

**Root Cause**: ScrollArea.Viewport needs explicit `max-height` to constrain content. Without it, content expands and overflows.

**Fix**: Set `max-height` on ScrollArea.Viewport (inline style or class):

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

**Common values**:
- `70vh` - 70% of viewport height (good for dropdowns)
- `300px` - Fixed height (for predictable sizing)
- `calc(100vh - 200px)` - Viewport minus header/footer

**Apply when**: 
- ScrollArea content overflows container
- Need to limit dropdown/modal height
- Long lists need to be scrollable

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

**Last Updated**: 2025-11-26

