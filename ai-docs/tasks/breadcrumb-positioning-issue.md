# Breadcrumb Positioning Issue - Root Cause Analysis

## Problem Statement

Breadcrumbs in the `StackedPanel` component are stacking on top of each other instead of aligning side-by-side, extending leftward from the panel content area.

## Expected Behavior

- Breadcrumbs should be positioned side-by-side, extending leftward from the content area
- Each breadcrumb should align with the same breadcrumb position across different panel layers
- Breadcrumb 1 (closest to content): 48px from content left edge
- Breadcrumb 2: 96px from content left edge
- Breadcrumb 3 (furthest): 144px from content left edge

## Current Behavior

All breadcrumbs appear to be positioned at the same location, overlapping each other vertically.

## HTML Output Analysis

From the rendered HTML, we can see:

```html
<!-- Breadcrumb 1 (furthest left) -->
<button
	style="--breadcrumb-position: 144px; left: calc(100vw - var(--base-width-sm) - var(--breadcrumb-position)); z-index: 87;"
>
	<!-- Breadcrumb 2 (middle) -->
	<button
		style="--breadcrumb-position: 96px; left: calc(100vw - var(--base-width-sm) - var(--breadcrumb-position)); z-index: 88;"
	>
		<!-- Breadcrumb 3 (closest to content) -->
		<button
			style="--breadcrumb-position: 48px; left: calc(100vw - var(--base-width-sm) - var(--breadcrumb-position)); z-index: 89;"
		></button>
	</button>
</button>
```

**Expected calculations:**

- Breadcrumb 1: `100vw - 900px - 144px = 100vw - 1044px`
- Breadcrumb 2: `100vw - 900px - 96px = 100vw - 996px`
- Breadcrumb 3: `100vw - 900px - 48px = 100vw - 948px`

These should result in different `left` positions, but visually they're stacking.

## What We've Tried

### Attempt 1: Initial Implementation

- **Approach**: Positioned breadcrumbs relative to panel's left edge
- **Calculation**: `calc(100vw - baseWidth - totalBreadcrumbWidth + breadcrumbPosition)`
- **Result**: Breadcrumbs overlapped content

### Attempt 2: Fixed Content Padding

- **Approach**: Added `padding-left` to content to push it right
- **Result**: Content no longer overlapped, but breadcrumbs still stacked

### Attempt 3: Position Relative to Content Edge

- **Approach**: Changed calculation to `calc(100vw - baseWidth - breadcrumbPosition)`
- **Calculation**: Position relative to fixed content left edge (`100vw - baseWidth`)
- **Result**: Still stacking on top of each other

## Current Code State

### PanelBreadcrumbs.svelte

- Breadcrumbs are `fixed` positioned
- Each breadcrumb sets `--breadcrumb-position` inline
- Uses `calc(100vw - var(--base-width-sm) - var(--breadcrumb-position))`
- Z-index decreases as breadcrumbs go left (87, 88, 89)

### StackedPanel.svelte

- Sets `--base-width-sm: 900px` and `--base-width-lg: 1200px` on `.stacked-panel-breadcrumbs` parent
- Media query override for desktop: `calc(100vw - var(--base-width-lg) - var(--breadcrumb-position))`
- Content has `padding-left: ${totalBreadcrumbWidth}px`

## Potential Root Causes

1. **CSS Custom Property Inheritance Issue**
   - `--base-width-sm` is set on parent `.stacked-panel-breadcrumbs` div
   - Buttons are `fixed` positioned (outside normal flow)
   - CSS custom properties inherit, but `fixed` positioning might break inheritance chain
   - **Hypothesis**: `var(--base-width-sm)` might not resolve correctly on `fixed` elements

2. **Media Query Override Conflict**
   - Desktop media query uses `!important` and different calculation
   - Might be overriding inline styles incorrectly
   - **Hypothesis**: Media query might be applying wrong values

3. **CSS Calc() Evaluation Issue**
   - Browser might not be evaluating `calc()` correctly with custom properties
   - **Hypothesis**: Custom properties in calc() might need explicit units or different syntax

4. **Z-index Stacking Context**
   - Different z-indexes (87, 88, 89) might be creating stacking contexts
   - **Hypothesis**: Z-index might be causing visual stacking even if positions differ

5. **Fixed Positioning Context**
   - `fixed` elements are positioned relative to viewport, not parent
   - Parent's CSS variables might not be accessible
   - **Hypothesis**: Need to set CSS variables on `:root` or use different approach

## Files to Review

1. `/Users/randyhereman/Coding/SynergyOS/src/lib/components/molecules/PanelBreadcrumbs.svelte`
2. `/Users/randyhereman/Coding/SynergyOS/src/lib/components/organisms/StackedPanel.svelte`
3. `/Users/randyhereman/Coding/SynergyOS/src/lib/design-system/recipes/panelBreadcrumbs.recipe.ts`

## Current Code Files

### PanelBreadcrumbs.svelte

```svelte
<script lang="ts">
	import type { UseNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';
	import {
		panelBreadcrumbBarRecipe,
		panelBreadcrumbTextRecipe,
		panelBreadcrumbIconRecipe
	} from '$lib/design-system/recipes';

	type IconRenderer = (layerType: string) => string | null;

	let {
		navigationStack,
		onBreadcrumbClick,
		iconRenderer,
		currentZIndex = 60
	}: {
		navigationStack: UseNavigationStack;
		onBreadcrumbClick: (index: number) => void;
		iconRenderer?: IconRenderer;
		currentZIndex?: number;
	} = $props();

	const breadcrumbLayers = $derived(navigationStack.stack.slice(0, -1));
	const BREADCRUMB_WIDTH = 48;
</script>

{#each breadcrumbLayers as layer, index (layer.id)}
	{@const iconHtml = iconRenderer?.(layer.type)}
	{@const breadcrumbIndex = breadcrumbLayers.length - 1 - index}
	{@const breadcrumbPosition = (breadcrumbIndex + 1) * BREADCRUMB_WIDTH}
	{@const breadcrumbZIndex = currentZIndex - 1 - breadcrumbIndex}
	<button
		type="button"
		class={panelBreadcrumbBarRecipe()}
		style="--breadcrumb-position: {breadcrumbPosition}px; left: calc(100vw - var(--base-width-sm) - var(--breadcrumb-position)); z-index: {breadcrumbZIndex};"
		onclick={() => onBreadcrumbClick(index)}
		aria-label="Go back to {layer.name}"
	>
		<span class={panelBreadcrumbTextRecipe()}>
			{#if iconHtml}
				<span class={panelBreadcrumbIconRecipe()}>
					{@html iconHtml}
				</span>
			{/if}
			{layer.name}
		</span>
	</button>
{/each}
```

### StackedPanel.svelte (relevant section)

```svelte
<!-- Breadcrumb Bars (all previous layers) - positioned to LEFT of panel content -->
{#if hasBreadcrumbs}
	<style>
		:global(.stacked-panel-breadcrumbs) {
			--base-width-sm: {BASE_PANEL_WIDTH_SM}px;
			--base-width-lg: {BASE_PANEL_WIDTH_LG}px;
		}
		@media (min-width: 1024px) {
			:global(.stacked-panel-breadcrumbs button) {
				left: calc(100vw - var(--base-width-lg) - var(--breadcrumb-position, 0px)) !important;
			}
		}
	</style>
	<div class="stacked-panel-breadcrumbs">
		<PanelBreadcrumbs {navigationStack} {onBreadcrumbClick} {iconRenderer} {currentZIndex} />
	</div>
{/if}
```

### panelBreadcrumbs.recipe.ts

```typescript
export const panelBreadcrumbBarRecipe = cva(
	'fixed top-0 bottom-0 w-[48px] flex items-center justify-center border-r border-subtle bg-surface transition-colors cursor-pointer hover:bg-subtle',
	{
		variants: {
			variant: {
				default: ''
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	);
```

## Key Technical Details

- **BASE_PANEL_WIDTH_SM**: 900px
- **BASE_PANEL_WIDTH_LG**: 1200px
- **BREADCRUMB_WIDTH**: 48px
- Breadcrumbs use `fixed` positioning (viewport-relative)
- CSS custom properties set on parent `.stacked-panel-breadcrumbs` div
- Media query override uses `!important` for desktop breakpoint

## Debugging Steps to Try

1. **Verify CSS Variable Resolution**
   - Check if `--base-width-sm` is actually resolving to `900px` on the buttons
   - Use browser DevTools to inspect computed styles
   - Check if `calc()` is evaluating correctly

2. **Test Direct Pixel Values**
   - Replace `var(--base-width-sm)` with `900px` directly
   - See if breadcrumbs position correctly
   - This would confirm if it's a CSS variable issue

3. **Check Media Query Behavior**
   - Verify if desktop breakpoint is active
   - Check if media query override is interfering
   - Test with media query disabled

4. **Verify Fixed Positioning**
   - Check if `fixed` positioning is causing issues
   - Try `absolute` positioning relative to panel
   - See if positioning context changes behavior

5. **Inspect Z-index Stacking**
   - Temporarily set all z-indexes to same value
   - See if breadcrumbs still stack
   - This would rule out z-index as cause

## Key Questions

1. Are CSS custom properties accessible on `fixed` positioned elements?
2. Is the `calc()` function evaluating correctly with custom properties?
3. Is the media query override interfering with inline styles?
4. Are the breadcrumbs actually positioned differently but visually overlapping due to z-index?
5. Should breadcrumbs be `absolute` relative to panel instead of `fixed` relative to viewport?

## Next Steps

1. Use browser DevTools to inspect actual computed `left` values
2. Verify CSS custom property inheritance with `fixed` positioning
3. Test with direct pixel values instead of CSS variables
4. Consider alternative positioning approach (absolute vs fixed)
5. Check if there's a CSS specificity or cascade issue
