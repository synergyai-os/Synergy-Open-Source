<script lang="ts" module>
	/**
	 * RadioGroup Component
	 *
	 * Styled radio group component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/radioGroup.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as RadioGroup from '$lib/components/atoms/RadioGroup.svelte';
	 * import { radioGroupIndicatorRecipe, radioGroupDotRecipe } from '$lib/design-system/recipes';
	 *
	 * <RadioGroup.Root>
	 *   <RadioGroup.Item value="option1">
	 *     {#snippet children({ checked })}
	 *       <div class={radioGroupIndicatorRecipe({ checked, disabled })}>
	 *         {#if checked}
	 *           <div class={radioGroupDotRecipe()}></div>
	 *         {/if}
	 *       </div>
	 *     {/snippet}
	 *   </RadioGroup.Item>
	 * </RadioGroup.Root>
	 * ```
	 */

	import { RadioGroup as BitsRadioGroup } from 'bits-ui';

	// Export Bits UI components (compound component pattern)
	export const Root = BitsRadioGroup.Root;
	export const Item = BitsRadioGroup.Item;

	// Export recipes for styling
	export {
		radioGroupRootRecipe,
		radioGroupItemRecipe,
		radioGroupIndicatorRecipe,
		radioGroupDotRecipe
	} from '$lib/design-system/recipes';
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using these components.
	See usage example in the script comments above.
-->
