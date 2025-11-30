<script lang="ts" module>
	/**
	 * Tooltip Component
	 *
	 * Styled tooltip component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/tooltip.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Tooltip from '$lib/components/atoms/Tooltip.svelte';
	 * import { tooltipContentRecipe, tooltipArrowRecipe } from '$lib/design-system/recipes';
	 *
	 * <Tooltip.Provider>
	 *   <Tooltip.Root>
	 *     <Tooltip.Trigger>Hover me</Tooltip.Trigger>
	 *     <Tooltip.Portal>
	 *       <Tooltip.Content class={tooltipContentRecipe()}>
	 *         Tooltip content
	 *         <Tooltip.Arrow class={tooltipArrowRecipe()} />
	 *       </Tooltip.Content>
	 *     </Tooltip.Portal>
	 *   </Tooltip.Root>
	 * </Tooltip.Provider>
	 * ```
	 *
	 * NOTE: Tooltip.Root MUST be a descendant of Tooltip.Provider
	 */

	import { Tooltip as BitsTooltip } from 'bits-ui';

	// Export Bits UI components (compound component pattern)
	export const Provider = BitsTooltip.Provider;
	export const Root = BitsTooltip.Root;
	export const Trigger = BitsTooltip.Trigger;
	export const Portal = BitsTooltip.Portal;
	export const Content = BitsTooltip.Content;
	export const Arrow = BitsTooltip.Arrow;

	// Export recipes for styling
	export {
		tooltipProviderRecipe,
		tooltipRootRecipe,
		tooltipTriggerRecipe,
		tooltipContentRecipe,
		tooltipArrowRecipe
	} from '$lib/design-system/recipes';
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using these components.
	See usage example in the script comments above.
-->
