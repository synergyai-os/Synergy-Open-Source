<script lang="ts" module>
	/**
	 * Label Component
	 *
	 * Styled label component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/label.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Label from '$lib/components/atoms/Label.svelte';
	 * import { labelRootRecipe } from '$lib/design-system/recipes';
	 *
	 * <Label.Root for="input-id" class={labelRootRecipe()}>
	 *   Label text
	 * </Label.Root>
	 * ```
	 */

	import { Label as BitsLabel } from 'bits-ui';

	// Export Bits UI component
	export const Root = BitsLabel.Root;
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using this component.
	See usage example in the script comments above.
-->
