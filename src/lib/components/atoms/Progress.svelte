<script lang="ts" module>
	/**
	 * Progress Component
	 *
	 * Styled progress bar component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/progress.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Progress from '$lib/components/atoms/Progress.svelte';
	 * import { progressRootRecipe, progressIndicatorRecipe } from '$lib/design-system/recipes';
	 *
	 * <Progress.Root value={50} class={progressRootRecipe()}>
	 *   <div class={progressIndicatorRecipe()} style="width: 50%"></div>
	 * </Progress.Root>
	 * ```
	 */

	import { Progress as BitsProgress } from 'bits-ui';

	// Export Bits UI component
	export const Root = BitsProgress.Root;
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using this component.
	See usage example in the script comments above.
-->
