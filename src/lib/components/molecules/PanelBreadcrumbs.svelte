<script lang="ts">
	import type { UseNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import {
		panelBreadcrumbBarRecipe,
		panelBreadcrumbTextRecipe,
		panelBreadcrumbIconRecipe
	} from '$lib/design-system/recipes';

	/**
	 * Icon mapping function - modules provide their own icon rendering logic
	 * @param layerType - The type of navigation layer (e.g., 'circle', 'role', 'meeting', etc.)
	 * @returns IconType for rendering the icon, or null if no icon
	 */
	type IconRenderer = (layerType: string) => IconType | null;

	let {
		navigationStack,
		onBreadcrumbClick,
		iconRenderer,
		currentZIndex = 60
	}: {
		navigationStack: UseNavigationStack;
		onBreadcrumbClick: (index: number) => void;
		iconRenderer?: IconRenderer;
		currentZIndex?: number; // Z-index of current panel (for breadcrumb layering)
	} = $props();

	// Get all layers except the current one (for breadcrumbs)
	const breadcrumbLayers = $derived(navigationStack.stack.slice(0, -1));

	// Breadcrumb width from spacing-12 token (48px)
	const BREADCRUMB_WIDTH = 'var(--spacing-12)';
</script>

{#each breadcrumbLayers as layer, index (layer.id)}
	{@const iconType = iconRenderer?.(layer.type)}
	{@const breadcrumbIndex = breadcrumbLayers.length - 1 - index}
	{@const breadcrumbZIndex = currentZIndex - 1 - breadcrumbIndex}
	{@const leftPosition = `calc(${index} * ${BREADCRUMB_WIDTH})`}
	<button
		type="button"
		class={panelBreadcrumbBarRecipe()}
		style={`left: ${leftPosition}; z-index: ${breadcrumbZIndex};`}
		onclick={() => onBreadcrumbClick(index)}
		aria-label="Go back to {layer.name}"
	>
		<span class={panelBreadcrumbTextRecipe()}>
			{#if iconType}
				<span class={panelBreadcrumbIconRecipe()}>
					<Icon type={iconType} size="sm" />
				</span>
			{/if}
			{layer.name}
		</span>
	</button>
{/each}
