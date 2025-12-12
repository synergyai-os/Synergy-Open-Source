<script lang="ts" module>
	/**
	 * Tabs Component
	 *
	 * Styled tabs component with design tokens.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/tabs.recipe.ts
	 *
	 * Usage:
	 * ```svelte
	 * import * as Tabs from '$lib/components/atoms/Tabs.svelte';
	 * import { tabsListRecipe, tabsTriggerRecipe, tabsContentRecipe } from '$lib/design-system/recipes';
	 *
	 * <Tabs.Root bind:value={activeTab}>
	 *   <Tabs.List class={tabsListRecipe()}>
	 *     <Tabs.Trigger value="tab1" class={tabsTriggerRecipe({ active: activeTab === 'tab1' })}>
	 *       Tab 1
	 *     </Tabs.Trigger>
	 *   </Tabs.List>
	 *   <Tabs.Content value="tab1" class={tabsContentRecipe()}>
	 *     Content
	 *   </Tabs.Content>
	 * </Tabs.Root>
	 * ```
	 */

	import { Tabs as BitsTabs } from 'bits-ui';

	// Export Bits UI components (compound component pattern)
	export const Root = BitsTabs.Root;
	export const List = BitsTabs.List;
	export const Trigger = BitsTabs.Trigger;
	export const Content = BitsTabs.Content;

	// Export recipes for styling
	export {
		tabsRootRecipe,
		tabsListRecipe,
		tabsTriggerRecipe,
		tabsContentRecipe
	} from '$lib/design-system/recipes';
</script>

<!-- 
	Note: This component follows the compound component pattern.
	Recipes should be imported and applied when using these components.
	See usage example in the script comments above.
-->

<style>
	/* Smooth underline indicator for active tabs */
	/* Uses Bits UI data-state attribute for seamless transitions */
	:global(button[data-state='active'])::after,
	:global([role='tab'][data-state='active'])::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background-color: var(--color-accent-primary);
		transform: scaleX(1);
		transition:
			transform 200ms ease-out,
			opacity 200ms ease-out;
		opacity: 1;
	}

	/* Inactive tabs - hidden underline with smooth transition */
	:global(button[data-state='inactive'])::after,
	:global([role='tab'][data-state='inactive'])::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background-color: var(--color-accent-primary);
		transform: scaleX(0);
		transition:
			transform 200ms ease-out,
			opacity 200ms ease-out;
		opacity: 0;
	}
</style>
