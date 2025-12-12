<script lang="ts" module>
	/**
	 * Meter Component
	 *
	 * Styled meter component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/meter.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Meter from '$lib/components/atoms/Meter.svelte';
	 * import { meterRootRecipe, meterIndicatorRecipe } from '$lib/design-system/recipes';
	 *
	 * <Meter.Root value={50} min={0} max={100} class={meterRootRecipe()}>
	 *   <div class={meterIndicatorRecipe()} style="width: 50%"></div>
	 * </Meter.Root>
	 * ```
	 */

	import { Meter as BitsMeter } from 'bits-ui';

	// Export Bits UI component
	export const Root = BitsMeter.Root;
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using this component.
	See usage example in the script comments above.
-->
