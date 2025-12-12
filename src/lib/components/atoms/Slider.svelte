<script lang="ts" module>
	/**
	 * Slider Component
	 *
	 * Styled slider component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/slider.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Slider from '$lib/components/atoms/Slider.svelte';
	 * import { sliderRootRecipe, sliderTrackRecipe, sliderRangeRecipe, sliderThumbRecipe } from '$lib/design-system/recipes';
	 *
	 * <Slider.Root class={sliderRootRecipe()}>
	 *   {#snippet children({ thumbItems })}
	 *     <span class={sliderTrackRecipe()}>
	 *       <Slider.Range class={sliderRangeRecipe()} />
	 *     </span>
	 *     {#each thumbItems as { index } (index)}
	 *       <Slider.Thumb {index} class={sliderThumbRecipe()} />
	 *     {/each}
	 *   {/snippet}
	 * </Slider.Root>
	 * ```
	 */

	import { Slider as BitsSlider } from 'bits-ui';

	// Export Bits UI components (compound component pattern)
	export const Root = BitsSlider.Root;
	export const Range = BitsSlider.Range;
	export const Thumb = BitsSlider.Thumb;
	export const Tick = BitsSlider.Tick;
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using these components.
	See usage example in the script comments above.
-->
