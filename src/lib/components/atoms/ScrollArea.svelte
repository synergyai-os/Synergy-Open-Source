<script lang="ts" module>
	/**
	 * ScrollArea Component
	 *
	 * Styled scrollable container with custom scrollbars.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/scrollArea.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as ScrollArea from '$lib/components/atoms/ScrollArea.svelte';
	 * import { scrollAreaRootRecipe, scrollAreaViewportRecipe, scrollAreaScrollbarRecipe, scrollAreaThumbRecipe } from '$lib/design-system/recipes';
	 *
	 * <ScrollArea.Root type="auto" scrollHideDelay={400} class={scrollAreaRootRecipe() + ' h-full'}>
	 *   <ScrollArea.Viewport class={scrollAreaViewportRecipe() + ' h-full w-full'}>
	 *     <!-- Content -->
	 *   </ScrollArea.Viewport>
	 *   <ScrollArea.Scrollbar
	 *     orientation="vertical"
	 *     class={scrollAreaScrollbarRecipe({ orientation: 'vertical' })}
	 *     style="width: 0.5rem;"
	 *   >
	 *     <ScrollArea.Thumb
	 *       class={scrollAreaThumbRecipe()}
	 *       style="opacity: var(--opacity-50);"
	 *     />
	 *   </ScrollArea.Scrollbar>
	 * </ScrollArea.Root>
	 * ```
	 *
	 * Note: ScrollArea is a compound component, so recipes are applied at usage sites.
	 * The component exports Bits UI primitives + recipes for styling.
	 */

	import { ScrollArea as BitsScrollArea } from 'bits-ui';

	// Export Bits UI components (compound component pattern)
	export const Root = BitsScrollArea.Root;
	export const Viewport = BitsScrollArea.Viewport;
	export const Scrollbar = BitsScrollArea.Scrollbar;
	export const Thumb = BitsScrollArea.Thumb;
	export const Corner = BitsScrollArea.Corner;
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using these components.
	See usage example in the script comments above.
-->
