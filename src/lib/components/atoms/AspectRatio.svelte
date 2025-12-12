<script lang="ts" module>
	/**
	 * AspectRatio Component
	 *
	 * Styled aspect ratio container component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/aspectRatio.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as AspectRatio from '$lib/components/atoms/AspectRatio.svelte';
	 * import { aspectRatioRootRecipe } from '$lib/design-system/recipes';
	 *
	 * <AspectRatio.Root ratio={16/9} class={[aspectRatioRootRecipe(), 'rounded-card', 'bg-elevated']}>
	 *   <img src="..." alt="..." />
	 * </AspectRatio.Root>
	 * ```
	 */

	import { AspectRatio as BitsAspectRatio } from 'bits-ui';

	// Export Bits UI component
	export const Root = BitsAspectRatio.Root;
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using this component.
	Layout classes (rounded-card, bg-elevated) are applied at usage sites.
	See usage example in the script comments above.
-->
