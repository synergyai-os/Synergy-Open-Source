<script lang="ts" module>
	/**
	 * Switch Component
	 *
	 * Styled switch/toggle component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/switch.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Switch from '$lib/components/atoms/Switch.svelte';
	 * import { switchRootRecipe, switchThumbRecipe } from '$lib/design-system/recipes';
	 *
	 * <Switch.Root class={switchRootRecipe({ checked, disabled })}>
	 *   <Switch.Thumb class={switchThumbRecipe()} />
	 * </Switch.Root>
	 * ```
	 */

	import { Switch as BitsSwitch } from 'bits-ui';

	// Export Bits UI components (compound component pattern)
	export const Root = BitsSwitch.Root;
	export const Thumb = BitsSwitch.Thumb;

	// Export recipes for styling
	export { switchRootRecipe, switchThumbRecipe } from '$lib/design-system/recipes';
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using these components.
	See usage example in the script comments above.
-->
