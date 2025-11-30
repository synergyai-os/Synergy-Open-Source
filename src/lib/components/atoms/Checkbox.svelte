<script lang="ts" module>
	/**
	 * Checkbox Component
	 *
	 * Styled checkbox component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/checkbox.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Checkbox from '$lib/components/atoms/Checkbox.svelte';
	 * import { checkboxBoxRecipe, checkboxIconRecipe } from '$lib/design-system/recipes';
	 *
	 * <Checkbox.Root>
	 *   {#snippet children({ checked, indeterminate })}
	 *     <div class={checkboxBoxRecipe({ checked, disabled })}>
	 *       {#if checked}
	 *         <svg class={checkboxIconRecipe()}>...</svg>
	 *       {/if}
	 *     </div>
	 *   {/snippet}
	 * </Checkbox.Root>
	 * ```
	 */

	import { Checkbox as BitsCheckbox } from 'bits-ui';

	// Export Bits UI components (compound component pattern)
	export const Root = BitsCheckbox.Root;
	export const Group = BitsCheckbox.Group;
	export const GroupLabel = BitsCheckbox.GroupLabel;

	// Export recipes for styling
	export {
		checkboxRootRecipe,
		checkboxBoxRecipe,
		checkboxIconRecipe
	} from '$lib/design-system/recipes';
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using these components.
	See usage example in the script comments above.
-->
