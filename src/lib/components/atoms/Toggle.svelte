<script lang="ts" module>
	/**
	 * Toggle Component
	 *
	 * Styled toggle button component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/toggle.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Toggle from '$lib/components/atoms/Toggle.svelte';
	 * import { toggleRootRecipe } from '$lib/design-system/recipes';
	 *
	 * <Toggle.Root pressed={isPressed} class={toggleRootRecipe({ pressed: isPressed })}>
	 *   Toggle
	 * </Toggle.Root>
	 * ```
	 */

	import { Toggle as BitsToggle } from 'bits-ui';

	// Export Bits UI component
	export const Root = BitsToggle.Root;
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using this component.
	See usage example in the script comments above.
-->
