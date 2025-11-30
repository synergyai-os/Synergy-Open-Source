<script lang="ts" module>
	/**
	 * ToggleGroup Component
	 *
	 * Styled toggle group component with design tokens.
	 *
	 * **IMPORTANT**: This is a compound component pattern. Recipes must be imported and applied manually.
	 * This is a Svelte limitation - we can't auto-apply recipes while maintaining the compound API.
	 *
	 * Usage:
	 * ```svelte
	 * import { ToggleGroup } from '$lib/components/atoms';
	 * import { toggleGroupRootRecipe, toggleGroupItemRecipe } from '$lib/design-system/recipes';
	 *
	 * <ToggleGroup.Root type="multiple" bind:value={selected} class={toggleGroupRootRecipe()}>
	 *   <ToggleGroup.Item value="mon" class={toggleGroupItemRecipe()}>Mon</ToggleGroup.Item>
	 *   <ToggleGroup.Item value="tue" class={toggleGroupItemRecipe()}>Tue</ToggleGroup.Item>
	 * </ToggleGroup.Root>
	 * ```
	 *
	 * Why manual recipes?
	 * - Compound components (Root + Item) need explicit composition
	 * - Svelte module exports can't wrap components while maintaining the API
	 * - This pattern matches Bits UI's architecture (headless primitives)
	 *
	 * Alternative: Use Button component for single toggle buttons (auto-applies recipes)
	 */

	import { ToggleGroup as BitsToggleGroup } from 'bits-ui';

	// Export Bits UI components (compound component pattern)
	export const Root = BitsToggleGroup.Root;
	export const Item = BitsToggleGroup.Item;
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes must be imported and applied manually - this is a Svelte limitation.
	See usage example in the script comments above.
-->
